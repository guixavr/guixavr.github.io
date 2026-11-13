// Telefones brasileiros: normaliza para 55 + DDD + número e diz se parece celular.

export function normalizePhone(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  if (!d.startsWith('55') || (d.length !== 12 && d.length !== 13)) return null;
  return d;
}

// Celular no Brasil: 55 + DDD (2) + 9 dígitos começando com 9.
export function isMobile(normalized) {
  return Boolean(normalized) && normalized.length === 13 && normalized[4] === '9';
}

export function formatPhone(normalized) {
  if (!normalized) return '';
  const ddd = normalized.slice(2, 4);
  const n = normalized.slice(4);
  return n.length === 9 ? `(${ddd}) ${n.slice(0, 5)}-${n.slice(5)}` : `(${ddd}) ${n.slice(0, 4)}-${n.slice(4)}`;
}

export function waLink(normalized, text) {
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
