// Busca de negócios pela Google Places API (New) — API oficial, com cota gratuita mensal.
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
import { normalizePhone } from './phone.mjs';
import { classifyWebsite, scoreLead } from './score.mjs';

const BASE = 'https://places.googleapis.com/v1';

// Nichos que costumam ter muitas avaliações e pouco site próprio.
export const SUGGESTED_NICHES = [
  'clínica odontológica', 'dentista', 'clínica de estética', 'salão de beleza', 'barbearia',
  'manicure', 'designer de sobrancelhas', 'fisioterapia', 'psicólogo', 'nutricionista',
  'clínica veterinária', 'pet shop', 'academia', 'personal trainer', 'estúdio de pilates',
  'advogado', 'contabilidade', 'imobiliária', 'corretor de imóveis', 'auto escola',
  'oficina mecânica', 'funilaria', 'lava rápido', 'vidraçaria', 'serralheria',
  'eletricista', 'encanador', 'marcenaria', 'dedetizadora', 'buffet infantil',
  'fotógrafo', 'escola de idiomas', 'reforço escolar', 'restaurante', 'pizzaria',
  'hamburgueria', 'confeitaria', 'floricultura', 'ótica', 'loja de móveis planejados',
];

function key() {
  const k = process.env.GOOGLE_PLACES_API_KEY;
  if (!k) throw new Error('Configure GOOGLE_PLACES_API_KEY no arquivo .env (veja o README).');
  return k;
}

async function call(url, { method = 'GET', body, fieldMask } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key(),
      ...(fieldMask ? { 'X-Goog-FieldMask': fieldMask } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google Places ${res.status}: ${json.error?.message ?? res.statusText}`);
  return json;
}

const SEARCH_FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.shortFormattedAddress',
  'places.nationalPhoneNumber', 'places.internationalPhoneNumber', 'places.websiteUri',
  'places.rating', 'places.userRatingCount', 'places.primaryTypeDisplayName', 'places.types',
  'places.googleMapsUri', 'places.businessStatus', 'nextPageToken',
].join(',');

// Busca uma consulta ("dentista em Campinas") e devolve até `maxPages` x 20 resultados.
export async function searchText(query, { maxPages = 1 } = {}) {
  const out = [];
  let pageToken;
  for (let page = 0; page < maxPages; page++) {
    const json = await call(`${BASE}/places:searchText`, {
      method: 'POST',
      fieldMask: SEARCH_FIELDS,
      body: { textQuery: query, languageCode: 'pt-BR', regionCode: 'BR', pageSize: 20, ...(pageToken ? { pageToken } : {}) },
    });
    out.push(...(json.places ?? []).map((p) => toLead(p, query)));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

function toLead(p, query) {
  const phone = normalizePhone(p.internationalPhoneNumber ?? p.nationalPhoneNumber);
  const lead = {
    id: p.id,
    name: p.displayName?.text ?? 'Sem nome',
    category: p.primaryTypeDisplayName?.text ?? '',
    types: p.types ?? [],
    address: p.formattedAddress ?? '',
    shortAddress: p.shortFormattedAddress ?? p.formattedAddress ?? '',
    phone,
    phoneRaw: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? '',
    website: p.websiteUri ?? '',
    websiteKind: classifyWebsite(p.websiteUri),
    rating: p.rating ?? null,
    reviewCount: p.userRatingCount ?? 0,
    mapsUrl: p.googleMapsUri ?? '',
    businessStatus: p.businessStatus ?? 'OPERATIONAL',
    query,
    source: 'google',
    status: 'novo',
    firstSeenAt: new Date().toISOString(),
  };
  Object.assign(lead, scoreLead(lead));
  return lead;
}

const DETAIL_FIELDS = [
  'id', 'displayName', 'editorialSummary', 'reviews', 'photos', 'regularOpeningHours', 'primaryTypeDisplayName',
].join(',');

// Detalhes usados para escrever a prévia: avaliações, horário, fotos (com atribuição).
export async function placeDetails(placeId) {
  const p = await call(`${BASE}/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`, { fieldMask: DETAIL_FIELDS });
  const reviews = (p.reviews ?? [])
    .filter((r) => (r.rating ?? 0) >= 4 && (r.text?.text || r.originalText?.text))
    .slice(0, 5)
    .map((r) => ({ author: r.authorAttribution?.displayName ?? 'Cliente', rating: r.rating, text: r.text?.text ?? r.originalText?.text }));

  const photos = [];
  for (const ph of (p.photos ?? []).slice(0, 4)) {
    try {
      // skipHttpRedirect devolve um photoUri público, sem expor a chave de API na prévia.
      const media = await call(`${BASE}/${ph.name}/media?maxWidthPx=1600&skipHttpRedirect=true`);
      if (media.photoUri) {
        photos.push({ url: media.photoUri, author: ph.authorAttributions?.[0]?.displayName ?? 'Google Maps' });
      }
    } catch { /* foto é opcional */ }
  }

  return {
    summary: p.editorialSummary?.text ?? '',
    hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
    reviews,
    photos,
  };
}
