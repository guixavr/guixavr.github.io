// Servidor local do Prospector: painel em http://localhost:4400
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, STATUSES, store } from './lib/store.mjs';
import { SUGGESTED_NICHES, placeDetails, searchText } from './lib/places.mjs';
import { normalizePhone } from './lib/phone.mjs';
import { classifyWebsite, scoreLead } from './lib/score.mjs';
import { generateContent, hasAI } from './lib/generate.mjs';
import { renderPreview, renderProposal } from './lib/render.mjs';
import { PREVIEW_DIR, pendingPreviewChanges, publishPreviews, removePreviewFiles, slugify, writePreviewFiles } from './lib/publish.mjs';

try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* .env é opcional */ }

const PORT = Number(process.env.PORT ?? 4400);
const hasPlaces = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

route('GET', /^\/api\/state$/, async () => ({
  settings: store.settings(),
  leads: store.leads(),
  statuses: STATUSES,
  niches: SUGGESTED_NICHES,
  hasAI: hasAI(),
  hasPlaces: hasPlaces(),
  pendingPublish: Boolean(await pendingPreviewChanges()),
}));

route('POST', /^\/api\/search$/, async (_m, body) => {
  const niches = (body.niches ?? []).map((n) => String(n).trim()).filter(Boolean);
  const city = String(body.city ?? '').trim();
  const pages = Math.min(3, Math.max(1, Number(body.pages) || 1));
  if (!niches.length || !city) throw httpError(400, 'Informe pelo menos um nicho e a cidade.');

  let found = 0, added = 0;
  const errors = [];
  for (const niche of niches) {
    try {
      const results = await searchText(`${niche} em ${city}`, { maxPages: pages });
      for (const lead of results) {
        found++;
        if (store.upsertFound(lead).isNew) added++;
      }
    } catch (e) {
      errors.push(`${niche}: ${e.message}`);
      if (/GOOGLE_PLACES_API_KEY|403|401/.test(e.message)) break;
    }
  }
  store.save();
  return { found, added, errors };
});

route('POST', /^\/api\/leads$/, async (_m, body) => {
  const name = String(body.name ?? '').trim();
  if (!name) throw httpError(400, 'Informe o nome do negócio.');
  const phone = normalizePhone(body.phone);
  const lead = {
    id: `manual-${Date.now().toString(36)}`,
    name,
    category: String(body.category ?? '').trim(),
    types: [],
    address: String(body.address ?? '').trim(),
    shortAddress: String(body.address ?? '').trim(),
    phone,
    phoneRaw: body.phone ?? '',
    website: String(body.website ?? '').trim(),
    websiteKind: classifyWebsite(String(body.website ?? '').trim()),
    rating: body.rating ? Number(String(body.rating).replace(',', '.')) : null,
    reviewCount: Number(body.reviewCount) || 0,
    mapsUrl: '',
    businessStatus: 'OPERATIONAL',
    notes: String(body.notes ?? ''),
    source: 'manual',
    status: 'novo',
    firstSeenAt: new Date().toISOString(),
  };
  Object.assign(lead, scoreLead(lead));
  store.upsertFound(lead);
  store.save();
  return lead;
});

route('PATCH', /^\/api\/leads\/([^/]+)$/, async ([, id], body) => {
  const allowed = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) throw httpError(400, 'Status inválido.');
    allowed.status = body.status;
  }
  if (body.notes !== undefined) allowed.notes = String(body.notes);
  const lead = store.update(decodeURIComponent(id), allowed);
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  return lead;
});

route('DELETE', /^\/api\/leads\/([^/]+)$/, async ([, id]) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  removePreviewFiles(lead.slug);
  store.remove(lead.id);
  return { ok: true };
});

route('POST', /^\/api\/leads\/([^/]+)\/generate$/, async ([, id]) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  if (lead.status === 'nao_contatar') throw httpError(400, 'Este negócio pediu para não ser contatado.');

  let details = { summary: '', hours: [], reviews: [], photos: [] };
  if (lead.source === 'google' && hasPlaces()) {
    try { details = await placeDetails(lead.id); } catch (e) { console.warn('Detalhes indisponíveis:', e.message); }
  }
  const settings = store.settings();
  const content = { ...(await generateContent(lead, details, settings)), photos: details.photos, reviews: details.reviews, hours: details.hours };

  const slug = lead.slug ?? slugify(lead.name, lead.id);
  const previewPath = `/preview/${slug}/`;
  const proposalPath = `/preview/${slug}/proposta/`;
  writePreviewFiles(
    slug,
    renderPreview(lead, content, settings, { proposalPath }),
    renderProposal(lead, content, settings, { previewPath }),
  );

  return store.update(lead.id, {
    slug,
    content,
    message: content.whatsappMessage,
    followUpMessage: content.followUpMessage,
    proposalMessage: content.proposalMessage,
    previewAt: new Date().toISOString(),
    publishedAt: null,
    status: lead.status === 'novo' ? 'pronto' : lead.status,
  });
});

// Registra que você abriu o WhatsApp para mandar uma das mensagens.
route('POST', /^\/api\/leads\/([^/]+)\/sent$/, async ([, id], body) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  const now = new Date();
  const days = store.settings().followUpDays ?? 3;
  const history = [...(lead.history ?? []), { kind: body.kind, at: now.toISOString() }];
  const patch = { history };
  if (body.kind === 'first') {
    Object.assign(patch, { sentAt: now.toISOString(), followUpAt: new Date(+now + days * 864e5).toISOString(), status: 'enviado' });
  } else if (body.kind === 'followup') {
    patch.followUpAt = null;
  } else if (body.kind === 'proposal') {
    Object.assign(patch, { proposalSentAt: now.toISOString(), status: 'proposta', followUpAt: null });
  }
  return store.update(lead.id, patch);
});

route('POST', /^\/api\/settings$/, async (_m, body) => store.updateSettings(body));

route('POST', /^\/api\/publish$/, async () => {
  const result = await publishPreviews();
  if (result.published) {
    const at = new Date().toISOString();
    for (const l of store.leads()) if (l.slug && !l.publishedAt) store.update(l.id, { publishedAt: at });
  }
  return result;
});

// ---------- HTTP ----------

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };

function serveFile(res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw httpError(400, 'JSON inválido.'); }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    const r = routes.find((x) => x.method === req.method && x.pattern.test(url.pathname));
    try {
      if (!r) throw httpError(404, 'Rota não encontrada.');
      const data = await r.handler(url.pathname.match(r.pattern), await readBody(req));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (e) {
      if (!e.status) console.error(e);
      res.writeHead(e.status ?? 500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Prévias servidas localmente, para conferir antes de publicar.
  if (url.pathname.startsWith('/preview/')) {
    const rel = decodeURIComponent(url.pathname.slice('/preview/'.length));
    const file = path.resolve(PREVIEW_DIR, rel, rel.endsWith('/') || !path.extname(rel) ? 'index.html' : '');
    if (!file.startsWith(PREVIEW_DIR)) { res.writeHead(403); return res.end(); }
    return serveFile(res, file);
  }

  serveFile(res, path.join(ROOT, 'ui', 'index.html'));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Prospector rodando em http://localhost:${PORT}`);
  console.log(`Google Places: ${hasPlaces() ? 'ok' : 'sem chave (só cadastro manual)'} · Claude: ${hasAI() ? 'ok' : 'sem chave (textos-modelo)'}`);
});
