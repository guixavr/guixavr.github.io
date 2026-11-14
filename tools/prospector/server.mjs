// Servidor local do Prospector: painel em http://localhost:4400
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, STATUSES, store } from './lib/store.mjs';
import { clearPreviewData } from './lib/preview-state.mjs';
import { SUGGESTED_NICHES, placeDetails, searchText } from './lib/places.mjs';
import { searchOSM } from './lib/osm.mjs';
import { normalizePhone } from './lib/phone.mjs';
import { classifyWebsite, scoreLead } from './lib/score.mjs';
import { generateContent, hasAI } from './lib/generate.mjs';
import { renderPreview, renderProposal } from './lib/render.mjs';
import { assertPreviewPublished } from './lib/send-guard.mjs';
import { CONTRACT_CSS, defaultOptions, renderContract } from './lib/contract.mjs';
import { PREVIEW_DIR, pendingPreviewChanges, publishPreview, publishPreviews, removePreviewFiles, slugify, writePreviewFiles } from './lib/publish.mjs';

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

  // Com chave do Google usa o Places; sem chave, o OpenStreetMap (grátis).
  const useGoogle = hasPlaces();
  let found = 0, added = 0;
  const errors = [];
  const addAll = (results) => {
    for (const lead of results) {
      found++;
      if (store.upsertFound(lead).isNew) added++;
    }
  };
  if (useGoogle) {
    for (const niche of niches) {
      try {
        addAll(await searchText(`${niche} em ${city}`, { maxPages: pages }));
      } catch (e) {
        errors.push(`${niche}: ${e.message}`);
        if (/GOOGLE_PLACES_API_KEY|403|401/.test(e.message)) break;
      }
    }
  } else {
    // OpenStreetMap: uma única consulta com todos os nichos.
    try { addAll(await searchOSM(niches, city)); } catch (e) { errors.push(e.message); }
  }
  store.save();
  return { found, added, errors, source: useGoogle ? 'google' : 'osm' };
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

route('DELETE', /^\/api\/leads\/([^/]+)\/preview$/, async ([, id]) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  if (!lead.slug) throw httpError(400, 'Este lead não tem prévia para excluir.');
  removePreviewFiles(lead.slug);
  return store.replace(lead.id, clearPreviewData(lead));
});

route('POST', /^\/api\/leads\/([^/]+)\/generate$/, async ([, id]) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  if (lead.status === 'nao_contatar') throw httpError(400, 'Este negócio pediu para não ser contatado.');

  let details = { summary: '', hours: [], reviews: [], photos: [] };
  if (lead.source === 'google' && hasPlaces()) {
    try { details = await placeDetails(lead.id); } catch (e) { console.warn('Detalhes indisponíveis:', e.message); }
  } else if (lead.hours) {
    details.hours = osmHoursToText(lead.hours);
  }
  const settings = store.settings();
  const generated = await generateContent(lead, details, settings);
  const content = { ...generated, reviews: details.reviews, hours: details.hours };

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
  assertPreviewPublished(lead);
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

route('POST', /^\/api\/leads\/([^/]+)\/publish$/, async ([, id]) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  if (!lead.slug) throw httpError(400, 'Gere a prévia antes de publicar.');
  const result = await publishPreview(lead.slug);
  if (result.published) store.update(lead.id, { publishedAt: new Date().toISOString() });
  return result;
});

// ---------- Contrato (gerado por código, fica só em data/db.json) ----------

route('GET', /^\/api\/leads\/([^/]+)\/contract$/, async ([, id]) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  const settings = store.settings();
  return {
    options: lead.contract?.options ?? defaultOptions(lead, settings),
    html: lead.contract?.html ?? null,
    edited: Boolean(lead.contract?.edited),
    updatedAt: lead.contract?.updatedAt ?? null,
    css: CONTRACT_CSS,
  };
});

// Opções padrão de um pacote (o painel chama ao trocar o pacote).
route('POST', /^\/api\/leads\/([^/]+)\/contract\/defaults$/, async ([, id], body) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  const fresh = defaultOptions(lead, store.settings(), body.packageId);
  // Mantém os dados do cliente já preenchidos.
  return { ...fresh, client: { ...fresh.client, ...(body.client ?? {}) }, city: body.city || fresh.city };
});

route('POST', /^\/api\/leads\/([^/]+)\/contract\/generate$/, async ([, id], body) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead) throw httpError(404, 'Lead não encontrado.');
  const options = normalizeContractOptions(body.options ?? {});
  const html = renderContract(options, store.settings());
  const now = new Date().toISOString();
  store.update(lead.id, { contract: { options, html, edited: false, generatedAt: now, updatedAt: now } });
  return { options, html, edited: false, updatedAt: now };
});

route('PUT', /^\/api\/leads\/([^/]+)\/contract$/, async ([, id], body) => {
  const lead = store.get(decodeURIComponent(id));
  if (!lead?.contract) throw httpError(404, 'Gere o contrato antes de salvar edições.');
  if (typeof body.html !== 'string' || !body.html.trim()) throw httpError(400, 'Contrato vazio.');
  const now = new Date().toISOString();
  store.update(lead.id, { contract: { ...lead.contract, html: body.html, edited: true, updatedAt: now } });
  return { ok: true, updatedAt: now };
});

function normalizeContractOptions(o) {
  const num = (v, d) => (Number.isFinite(Number(v)) && String(v).trim() !== '' ? Number(v) : d);
  const lines = (v) => (Array.isArray(v) ? v : String(v ?? '').split('\n')).map((s) => String(s).trim()).filter(Boolean);
  return {
    packageId: String(o.packageId ?? ''),
    serviceName: String(o.serviceName ?? 'Landing page').trim(),
    scopeItems: lines(o.scopeItems),
    price: Math.max(0, num(o.price, 0)),
    entryPercent: Math.min(100, Math.max(0, num(o.entryPercent, 50))),
    paymentMethods: String(o.paymentMethods ?? '').trim() || 'Pix',
    deadlineDays: Math.max(1, num(o.deadlineDays, 15)),
    contentDays: Math.max(1, num(o.contentDays, 5)),
    revisions: Math.max(0, num(o.revisions, 1)),
    extraHourRate: Math.max(0, num(o.extraHourRate, 80)),
    domain: Boolean(o.domain),
    seo: Boolean(o.seo),
    forms: Boolean(o.forms),
    includeMonthly: Boolean(o.includeMonthly),
    monthlyPrice: Math.max(0, num(o.monthlyPrice, 0)),
    monthlyItems: lines(o.monthlyItems),
    monthlyNoticeDays: Math.max(0, num(o.monthlyNoticeDays, 30)),
    portfolioRights: Boolean(o.portfolioRights),
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(o.startDate ?? '') ? o.startDate : new Date().toISOString().slice(0, 10),
    city: String(o.city ?? '').trim(),
    client: Object.fromEntries(['name', 'doc', 'address', 'representative', 'email', 'phone'].map((k) => [k, String(o.client?.[k] ?? '').trim()])),
  };
}

// "Mo-Fr 09:00-18:00; Sa 09:00-13:00" -> ["Seg a Sex: 09:00-18:00", "Sáb: 09:00-13:00"]
function osmHoursToText(raw) {
  const days = { Mo: 'Seg', Tu: 'Ter', We: 'Qua', Th: 'Qui', Fr: 'Sex', Sa: 'Sáb', Su: 'Dom', PH: 'Feriados' };
  if (String(raw).trim() === '24/7') return ['Todos os dias: 24 horas'];
  return String(raw).split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    if (/^\d/.test(part)) return `Todos os dias: ${part.replace(/,/g, ', ')}`;
    const m = part.match(/^([A-Za-z,\- ]+?)\s+(.+)$/);
    if (!m || !/^(Mo|Tu|We|Th|Fr|Sa|Su|PH)/.test(m[1])) return part;
    const label = m[1].replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, (d) => days[d]).replace(/-/g, ' a ').replace(/,/g, ', ');
    return `${label}: ${m[2].replace(/\boff\b/, 'fechado').replace(/,/g, ', ')}`;
  });
}

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
