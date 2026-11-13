// Busca gratuita pelo OpenStreetMap: Nominatim (acha a cidade) + Overpass (lista os negócios).
// Sem chave e sem custo. Tem menos negócios que o Google e não tem nota/avaliações.
// Regras de uso: https://operations.osmfoundation.org/policies/nominatim/
import { normalizePhone } from './phone.mjs';
import { classifyWebsite, scoreLead } from './score.mjs';

const USER_AGENT = 'prospector-local/1.0';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

// Nicho (como aparece no painel) -> filtros de tags do OSM. `name` filtra pelo nome quando a tag é genérica.
const NICHE_TAGS = {
  'clínica odontológica': [['amenity', 'dentist'], ['healthcare', 'dentist']],
  'dentista': [['amenity', 'dentist'], ['healthcare', 'dentist']],
  'clínica de estética': [['shop', 'beauty']],
  'salão de beleza': [['shop', 'hairdresser'], ['shop', 'beauty']],
  'barbearia': [['shop', 'hairdresser', 'barb']],
  'manicure': [['shop', 'beauty', 'unha|nail|manicure|esmalt']],
  'designer de sobrancelhas': [['shop', 'beauty', 'sobrancelha|brow|cílio|cilio']],
  'fisioterapia': [['healthcare', 'physiotherapist'], ['amenity', 'clinic', 'fisio']],
  'psicólogo': [['healthcare', 'psychotherapist'], ['office', 'psychologist']],
  'nutricionista': [['healthcare', 'nutrition_counselling'], ['amenity', 'clinic', 'nutri']],
  'clínica veterinária': [['amenity', 'veterinary']],
  'pet shop': [['shop', 'pet'], ['shop', 'pet_grooming']],
  'academia': [['leisure', 'fitness_centre']],
  'personal trainer': [['leisure', 'fitness_centre', 'personal']],
  'estúdio de pilates': [['leisure', 'fitness_centre', 'pilates'], ['sport', 'pilates']],
  'advogado': [['office', 'lawyer']],
  'contabilidade': [['office', 'accountant'], ['office', 'tax_advisor']],
  'imobiliária': [['office', 'estate_agent']],
  'corretor de imóveis': [['office', 'estate_agent']],
  'auto escola': [['amenity', 'driving_school']],
  'oficina mecânica': [['shop', 'car_repair']],
  'funilaria': [['shop', 'car_repair', 'funilaria|lanternagem|pintura'], ['craft', 'car_painter']],
  'lava rápido': [['amenity', 'car_wash']],
  'vidraçaria': [['craft', 'glaziery'], ['shop', 'glaziery']],
  'serralheria': [['craft', 'metal_construction'], ['craft', 'blacksmith']],
  'eletricista': [['craft', 'electrician']],
  'encanador': [['craft', 'plumber']],
  'marcenaria': [['craft', 'carpenter'], ['craft', 'joiner']],
  'dedetizadora': [['craft', 'pest_control'], ['shop', 'pest_control']],
  'buffet infantil': [['amenity', 'events_venue'], ['amenity', 'restaurant', 'buffet']],
  'fotógrafo': [['craft', 'photographer'], ['shop', 'photo']],
  'escola de idiomas': [['amenity', 'language_school']],
  'reforço escolar': [['amenity', 'prep_school'], ['amenity', 'school', 'reforço|reforco']],
  'restaurante': [['amenity', 'restaurant']],
  'pizzaria': [['amenity', 'restaurant', 'pizz'], ['amenity', 'fast_food', 'pizz']],
  'hamburgueria': [['amenity', 'fast_food', 'burg|lanche'], ['amenity', 'restaurant', 'burg']],
  'confeitaria': [['shop', 'confectionery'], ['shop', 'pastry'], ['shop', 'bakery']],
  'floricultura': [['shop', 'florist']],
  'ótica': [['shop', 'optician']],
  'loja de móveis planejados': [['shop', 'furniture'], ['shop', 'kitchen']],
};

const geoCache = new Map();

async function geocodeCity(city) {
  if (geoCache.has(city)) return geoCache.get(city);
  const url = `${NOMINATIM}?${new URLSearchParams({ q: city, format: 'jsonv2', limit: '5', countrycodes: 'br' })}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pt-BR' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Nominatim ${res.status}: não consegui localizar a cidade.`);
  const results = await res.json();
  // Prefere o limite administrativo do município, que tem o retângulo da cidade inteira.
  const best = results.find((r) => r.osm_type === 'relation' && ['boundary', 'place'].includes(r.category)) ?? results[0];
  if (!best) throw new Error(`Cidade não encontrada: "${city}". Tente "Cidade, UF".`);
  let [south, north, west, east] = best.boundingbox.map(Number);
  // Ponto sem limite (cidade pequena): usa um retângulo de ~15 km ao redor.
  if (north - south < 0.01) {
    const lat = Number(best.lat), lon = Number(best.lon);
    [south, north, west, east] = [lat - 0.13, lat + 0.13, lon - 0.13, lon + 0.13];
  }
  const geo = { label: best.display_name, bbox: [south, west, north, east] };
  geoCache.set(city, geo);
  return geo;
}

const escapeRe = (s) => s.replace(/["\\]/g, '\\$&');
const GENERIC_KEYS = ['shop', 'amenity', 'office', 'craft', 'healthcare', 'leisure'];

// Cada regra: { key, value?, name? } -> vira filtro do Overpass e também serve para classificar o resultado.
function rulesFor(niche) {
  const known = NICHE_TAGS[niche.toLowerCase()];
  if (known) return known.map(([key, value, name]) => ({ key, value, name }));
  return GENERIC_KEYS.map((key) => ({ key, name: niche.trim() }));
}

const toFilter = (r) => `["${r.key}"${r.value ? `="${r.value}"` : ''}]${r.name ? `["name"~"${escapeRe(r.name)}",i]` : ''}`;

function matches(rule, tags) {
  if (!(rule.key in tags)) return false;
  if (rule.value && tags[rule.key] !== rule.value) return false;
  if (rule.name && !new RegExp(rule.name, 'i').test(tags.name ?? '')) return false;
  return true;
}

async function overpass(query) {
  let lastErr;
  for (const endpoint of OVERPASS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(100000),
      });
      if (res.ok) return await res.json();
      lastErr = new Error(`Overpass ${res.status}${res.status === 429 ? ': muitas buscas seguidas, espere um minuto.' : ''}`);
    } catch (e) {
      lastErr = e.name === 'TimeoutError' ? new Error('O servidor do OpenStreetMap demorou demais. Tente de novo em instantes ou com menos nichos.') : e;
    }
    console.warn(`Overpass falhou em ${endpoint}: ${lastErr.message}`);
  }
  throw lastErr;
}

// Uma única consulta para todos os nichos marcados (os servidores públicos são lentos).
// Cada resultado é atribuído ao primeiro nicho cuja regra ele satisfaz.
export async function searchOSM(niches, city) {
  const geo = await geocodeCity(city);
  const groups = niches.map((niche) => ({ niche, rules: rulesFor(niche) }));
  const filters = [...new Set(groups.flatMap((g) => g.rules.map(toFilter)))];
  const query = [
    `[out:json][timeout:90][bbox:${geo.bbox.join(',')}];`,
    '(',
    ...filters.map((f) => `  nwr${f};`),
    ');',
    'out center tags 2000;',
  ].join('\n');
  const json = await overpass(query);
  const leads = [];
  for (const el of json.elements ?? []) {
    if (!el.tags?.name) continue;
    const group = groups.find((g) => g.rules.some((r) => matches(r, el.tags)));
    if (group) leads.push(toLead(el, group.niche, city));
  }
  return leads;
}

function toLead(el, niche, city) {
  const t = el.tags;
  const phoneRaw = t['contact:whatsapp'] ?? t['contact:mobile'] ?? t.mobile ?? t.phone ?? t['contact:phone'] ?? '';
  // Pode haver vários números separados por ";": fica com o primeiro celular, se houver.
  const phones = phoneRaw.split(/[;,/]/).map((p) => normalizePhone(p)).filter(Boolean);
  const phone = phones.find((p) => p.length === 13 && p[4] === '9') ?? phones[0] ?? null;
  const website = t.website ?? t['contact:website'] ?? t.url ?? t['contact:instagram'] ?? t['contact:facebook'] ?? '';
  const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', ');
  const cityName = t['addr:city'] ?? city.split(',')[0].trim();
  const address = [street, t['addr:suburb'], [cityName, t['addr:state']].filter(Boolean).join(' - ')].filter(Boolean).join(', ');
  const category = niche[0].toUpperCase() + niche.slice(1);

  const lead = {
    id: `osm-${el.type}-${el.id}`,
    name: t.name,
    category,
    types: [t.shop, t.amenity, t.office, t.craft, t.healthcare, t.leisure].filter(Boolean),
    address,
    shortAddress: address,
    phone,
    phoneRaw,
    website,
    websiteKind: classifyWebsite(website),
    rating: null,
    reviewCount: 0,
    // Link de busca no Google Maps, para você conferir nota e avaliações antes de abordar.
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name} ${cityName}`)}`,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    hours: t.opening_hours ?? '',
    businessStatus: 'OPERATIONAL',
    query: `${niche} em ${city}`,
    source: 'osm',
    status: 'novo',
    firstSeenAt: new Date().toISOString(),
  };
  Object.assign(lead, scoreLead(lead));
  return lead;
}
