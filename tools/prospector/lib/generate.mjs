// Gera o texto da prévia e as mensagens de WhatsApp.
// Com ANTHROPIC_API_KEY usa o Claude; sem chave, usa textos-modelo por segmento.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import * as z from 'zod/v4';

export const THEMES = ['saude', 'beleza', 'masculino', 'servicos', 'alimentacao', 'juridico', 'educacao', 'pet', 'fitness', 'automotivo', 'casa'];

const Content = z.object({
  theme: z.enum(THEMES).describe('Segmento visual mais próximo do negócio. "beleza" é para salões e estética com público feminino; "masculino" é para barbearias e negócios de público masculino'),
  headline: z.string().describe('Título principal, até 8 palavras, focado no benefício para o cliente final'),
  subheadline: z.string().describe('Uma ou duas frases que completam o título, citando a cidade/bairro'),
  ctaLabel: z.string().describe('Texto do botão principal, ex.: "Agendar pelo WhatsApp"'),
  aboutTitle: z.string(),
  about: z.string().describe('Parágrafo de 2 a 4 frases sobre o negócio, sem inventar fatos'),
  services: z.array(z.object({ title: z.string(), description: z.string() })).describe('4 a 6 serviços típicos do segmento'),
  differentials: z.array(z.string()).describe('3 ou 4 diferenciais curtos, baseados nas avaliações quando houver'),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).describe('3 perguntas frequentes com respostas genéricas e seguras'),
  closingTitle: z.string(),
  closingText: z.string(),
  whatsappMessage: z.string().describe('Primeira mensagem para o dono do negócio, oferecendo a landing page'),
  followUpMessage: z.string().describe('Lembrete curto para mandar se não houver resposta em alguns dias'),
  proposalMessage: z.string().describe('Mensagem para mandar junto com o link da proposta, quando o cliente responder com interesse'),
});

const SYSTEM = `Você escreve textos de landing pages para pequenos negócios brasileiros e as mensagens de WhatsApp que um desenvolvedor freelancer usa para oferecer o site.

Regras para a landing page:
- Português do Brasil, tom profissional e caloroso, frases curtas.
- Nunca invente fatos verificáveis: preços, anos de mercado, número de clientes, prêmios, certificações, nomes de profissionais, convênios. Se não souber, escreva de forma genérica.
- Use as avaliações reais (quando houver) para escolher os diferenciais, sem copiá-las.
- Os serviços devem ser os típicos do segmento; o dono vai ajustar depois.

Regras para as mensagens de WhatsApp (escritas em nome do freelancer, na primeira pessoa):
- Curtas (no máximo 5 linhas), naturais, sem cara de spam, sem emojis em excesso (no máximo 1).
- A primeira mensagem cumprimenta, diz em uma frase por que escolheu aquele negócio (ex.: nota alta no Google e sem site), apresenta a prévia com o marcador {{PREVIEW_URL}} exatamente assim, e termina com uma pergunta simples.
- A primeira mensagem termina com uma linha dizendo que, se não tiver interesse, é só avisar que ele não manda mais mensagens.
- A mensagem de proposta usa o marcador {{PROPOSAL_URL}} exatamente assim.
- Não cite valores nas mensagens; eles ficam na página de proposta.
- Não invente nada sobre o freelancer (cidade onde mora, anos de experiência, clientes). Use só o nome e a marca informados.
- Assine com o primeiro nome do freelancer.`;

let client;
function anthropic() {
  client ??= new Anthropic();
  return client;
}

export const hasAI = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

export async function generateContent(lead, details, settings) {
  if (!hasAI()) return fallbackContent(lead, settings);

  const facts = {
    nome: lead.name,
    categoria: lead.category,
    tiposGoogle: lead.types?.slice(0, 5),
    endereco: lead.address,
    nota: lead.rating,
    avaliacoes: lead.reviewCount,
    siteAtual: lead.website || 'nenhum',
    resumoGoogle: details?.summary || '',
    horarios: details?.hours ?? [],
    avaliacoesReais: (details?.reviews ?? []).map((r) => `${r.rating}★ ${r.text}`),
    notasDoFreelancer: lead.notes || '',
  };

  const response = await anthropic().beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(Content) },
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Freelancer: ${settings.name} (${settings.brand}).\n\nDados públicos do negócio no Google:\n${JSON.stringify(facts, null, 2)}\n\nEscreva o conteúdo da prévia e as mensagens.`,
    }],
  });

  if (response.stop_reason === 'refusal') throw new Error('O Claude recusou gerar este conteúdo.');
  if (!response.parsed_output) throw new Error(`Resposta do Claude incompleta (stop_reason: ${response.stop_reason}).`);
  return { ...response.parsed_output, generatedBy: response.model };
}

// ---------- Sem IA: textos-modelo ----------

const THEME_HINTS = [
  ['saude', /dent|odonto|clínic|clinic|fisio|psic|nutri|médic|medic|saúde|saude|doctor|dentist|physio/i],
  ['masculino', /barbe/i],
  ['beleza', /beleza|salão|salao|estética|estetica|manicure|sobrancelha|cabel|beauty|hair|nail|spa/i],
  ['pet', /pet|veterin|vet|animal/i],
  ['fitness', /academia|pilates|personal|crossfit|gym|fitness|yoga/i],
  ['alimentacao', /restaurant|pizza|hamburg|lanch|confeit|padaria|bakery|food|café|cafe|bar|doce|bolo/i],
  ['juridico', /advoga|jurídic|juridic|lawyer|contab|account/i],
  ['educacao', /escola|idioma|curso|reforço|reforco|school|aula|auto escola/i],
  ['automotivo', /mecân|mecan|funilaria|lava|auto|car|pneu|oficina/i],
  ['casa', /vidra|serralh|eletric|encana|marcen|dedetiz|móve|move|reforma|pintor|imobili|corretor|real estate/i],
];

export function guessTheme(lead) {
  const text = `${lead.category} ${lead.types?.join(' ')} ${lead.name} ${lead.query ?? ''}`;
  return THEME_HINTS.find(([, re]) => re.test(text))?.[0] ?? 'servicos';
}

function cityOf(lead) {
  const parts = (lead.address || '').split(',').map((s) => s.trim());
  const cityPart = parts.find((p) => / - [A-Z]{2}$/.test(p));
  return cityPart ? cityPart.replace(/ - [A-Z]{2}$/, '') : parts.at(-3) ?? '';
}

export function fallbackContent(lead, settings) {
  const theme = guessTheme(lead);
  const city = cityOf(lead);
  const first = settings.name.split(' ')[0];
  const cat = (lead.category || 'seu negócio').toLowerCase();
  const reason = lead.rating ? `vi que vocês têm nota ${String(lead.rating).replace('.', ',')} no Google${lead.reviewCount ? ` com ${lead.reviewCount} avaliações` : ''}, mas ainda não têm um site próprio` : 'vi o perfil de vocês no Google e notei que ainda não têm um site próprio';
  return {
    theme,
    headline: `${lead.name}: atendimento de confiança${city ? ` em ${city}` : ''}`,
    subheadline: `Conheça nossos serviços e fale com a gente direto pelo WhatsApp.${city ? ` Estamos em ${city}.` : ''}`,
    ctaLabel: 'Falar pelo WhatsApp',
    aboutTitle: `Sobre a ${lead.name}`,
    about: `A ${lead.name} atende com cuidado e atenção a cada cliente. ${lead.rating ? `A nota ${lead.rating} no Google mostra a confiança de quem já foi atendido.` : ''} Entre em contato para tirar dúvidas e agendar.`,
    services: [
      { title: 'Atendimento personalizado', description: 'Cada cliente recebe atenção individual, do primeiro contato até o resultado.' },
      { title: 'Orçamento sem compromisso', description: 'Explique o que você precisa e receba uma proposta clara.' },
      { title: 'Agendamento fácil', description: 'Marque seu horário em poucos minutos pelo WhatsApp.' },
      { title: 'Equipe experiente', description: `Profissionais dedicados a ${cat}.` },
    ],
    differentials: ['Bem avaliado no Google', 'Atendimento rápido pelo WhatsApp', 'Localização de fácil acesso'],
    faq: [
      { q: 'Como faço para agendar?', a: 'É só clicar no botão de WhatsApp e mandar uma mensagem. Respondemos o quanto antes.' },
      { q: 'Onde vocês ficam?', a: lead.address || 'Veja o mapa abaixo.' },
      { q: 'Qual o horário de atendimento?', a: 'Consulte nossos horários abaixo ou fale com a gente pelo WhatsApp.' },
    ],
    closingTitle: 'Vamos conversar?',
    closingText: 'Mande uma mensagem e tire suas dúvidas sem compromisso.',
    whatsappMessage: `Oi, tudo bem? Aqui é o ${first}, desenvolvedor de sites. ${reason[0].toUpperCase() + reason.slice(1)}.\n\nFiz uma prévia de como poderia ficar o site da ${lead.name}: {{PREVIEW_URL}}\n\nO que achou?\n\nSe não tiver interesse, é só me avisar que não mando mais mensagens.`,
    followUpMessage: `Oi! Passando só para saber se conseguiu ver a prévia do site da ${lead.name}: {{PREVIEW_URL}}\nSe quiser, ajusto do jeito de vocês.`,
    proposalMessage: `Que bom que gostou! Aqui estão os pacotes, prazos e valores: {{PROPOSAL_URL}}\nQualquer dúvida, é só me chamar.`,
    generatedBy: 'modelo-padrao',
  };
}
