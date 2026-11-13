// Classifica o site atual do negócio e dá uma nota de 0 a 100 de "chance de precisar de landing page".
import { isMobile } from './phone.mjs';

const SOCIAL = /(instagram\.com|facebook\.com|fb\.com|linktr\.ee|linktree|wa\.me|whatsapp\.com|api\.whatsapp|tiktok\.com|bio\.link|beacons\.ai|taplink|youtube\.com|ifood\.com|goo\.gl|g\.page|business\.site|sites\.google\.com|wixsite\.com|negocio\.site)/i;

export function classifyWebsite(url) {
  if (!url) return 'sem_site';
  if (SOCIAL.test(url)) return 'so_rede_social';
  return 'tem_site';
}

export const WEBSITE_LABEL = {
  sem_site: 'Sem site',
  so_rede_social: 'Só rede social / link',
  tem_site: 'Tem site',
};

export function scoreLead(lead) {
  let score = 0;
  const reasons = [];

  if (lead.websiteKind === 'sem_site') { score += 45; reasons.push('não tem site'); }
  else if (lead.websiteKind === 'so_rede_social') { score += 35; reasons.push('usa só rede social como site'); }

  const rating = lead.rating ?? 0;
  const count = lead.reviewCount ?? 0;
  if (rating >= 4.5) { score += 12; reasons.push(`nota ${rating}`); }
  else if (rating >= 4.0) score += 8;

  // Muitas avaliações = negócio ativo, com clientes e dinheiro para investir.
  const volume = Math.min(25, Math.round(Math.log10(count + 1) * 10));
  score += volume;
  if (count >= 50) reasons.push(`${count} avaliações`);

  if (isMobile(lead.phone)) { score += 15; reasons.push('celular (provável WhatsApp)'); }
  else if (lead.phone) score += 3;

  if (lead.businessStatus && lead.businessStatus !== 'OPERATIONAL') score = 0;

  return { score: Math.min(100, score), reasons };
}
