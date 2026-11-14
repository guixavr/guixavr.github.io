// Gerador de contrato de prestação de serviços — só código, sem IA.
// As cláusulas entram ou saem conforme o pacote e as opções escolhidas.
// É um modelo de partida: revise com um advogado antes do primeiro uso.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- valores ----------

// "R$ 1.697" -> 1697 ; "R$ 79/mês" -> 79 ; "1.697,50" -> 1697.5
export function parseBRL(text) {
  const m = String(text ?? '').replace(/\s/g, '').match(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?/);
  if (!m) return 0;
  return Number(m[1].replace(/\./g, '')) + (m[2] ? Number(m[2].padEnd(2, '0')) / 100 : 0);
}

export const formatBRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const UNITS = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function below1000(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const parts = [];
  const h = Math.floor(n / 100), r = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (r < 20) { if (r) parts.push(UNITS[r]); }
  else { parts.push(TENS[Math.floor(r / 10)] + (r % 10 ? ` e ${UNITS[r % 10]}` : '')); }
  return parts.join(' e ');
}

function intToWords(n) {
  if (n === 0) return 'zero';
  const millions = Math.floor(n / 1e6), thousands = Math.floor((n % 1e6) / 1000), rest = n % 1000;
  const parts = [];
  if (millions) parts.push(millions === 1 ? 'um milhão' : `${below1000(millions)} milhões`);
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${below1000(thousands)} mil`);
  if (rest) parts.push(below1000(rest));
  // "e" antes da última parte quando ela é < 100 ou centena redonda (ex.: mil e cem, dois mil e cinquenta)
  if (parts.length > 1 && (rest < 100 || rest % 100 === 0) && rest) {
    const last = parts.pop();
    return `${parts.join(' ')} e ${last}`;
  }
  return parts.join(' ');
}

// 1697.5 -> "mil seiscentos e noventa e sete reais e cinquenta centavos"
export function moneyInWords(value) {
  const reais = Math.floor(value + 1e-9);
  const cents = Math.round((value - reais) * 100);
  const r = reais ? `${intToWords(reais)} ${reais === 1 ? 'real' : 'reais'}` : '';
  const c = cents ? `${intToWords(cents)} ${cents === 1 ? 'centavo' : 'centavos'}` : '';
  return [r, c].filter(Boolean).join(' e ') || 'zero reais';
}

const money = (n) => `${formatBRL(n)} (${moneyInWords(n)})`;

// ---------- opções padrão a partir do pacote ----------

const has = (items, re) => (items ?? []).some((i) => re.test(i));

// Lê os itens do pacote e sugere quais cláusulas ligar. O usuário pode mudar tudo no painel.
export function defaultOptions(lead, settings, packageId) {
  const packages = settings.packages ?? [];
  const pkg = packages.find((p) => p.id === packageId) ?? packages.find((p) => p.highlight) ?? packages[0];
  // "Tudo do Essencial": herda os itens dos pacotes anteriores.
  const idx = packages.indexOf(pkg);
  const items = has(pkg?.items, /^tudo do/i) ? packages.slice(0, idx + 1).flatMap((p) => p.items) : pkg?.items ?? [];
  const deadline = items.join(' ').match(/(\d+)\s*dias/);
  const revisions = items.join(' ').match(/(\d+)\s*rodadas?/);

  return {
    packageId: pkg?.id ?? 'personalizado',
    serviceName: pkg ? `Landing page — pacote ${pkg.name}` : 'Landing page',
    // Prazo e rodadas já viram cláusulas próprias, então saem da lista do escopo.
    scopeItems: items.filter((i) => !/^tudo do/i.test(i) && !/\d+\s*dias|\d+\s*rodadas?/i.test(i)),
    price: parseBRL(pkg?.price),
    entryPercent: 50,
    paymentMethods: 'Pix, transferência bancária ou cartão de crédito',
    deadlineDays: deadline ? Number(deadline[1]) : 15,
    contentDays: 5,
    revisions: revisions ? Number(revisions[1]) : 1,
    extraHourRate: 80,
    domain: has(items, /domínio|dominio/i),
    seo: has(items, /seo|google/i),
    forms: has(items, /formulário|formulario|analytics/i),
    includeMonthly: Boolean(settings.monthly),
    monthlyPrice: parseBRL(settings.monthly?.price),
    monthlyItems: settings.monthly?.items ?? [],
    monthlyNoticeDays: 30,
    portfolioRights: true,
    startDate: new Date().toISOString().slice(0, 10),
    city: settings.contractCity || '',
    client: {
      name: lead.legalName || lead.name || '',
      doc: '',
      address: lead.address || '',
      representative: '',
      email: '',
      phone: lead.phone ? `+${lead.phone}` : '',
    },
  };
}

// ---------- contrato ----------

const dateBR = (iso) => {
  if (!iso) return '____/____/______';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const dateLong = (iso) => new Date(`${iso || new Date().toISOString().slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const blank = (v, size = 30) => (v && String(v).trim() ? esc(v) : '_'.repeat(size));

export function renderContract(o, settings) {
  const provider = {
    name: settings.providerName || settings.name,
    doc: settings.providerDoc,
    address: settings.providerAddress,
    email: settings.providerEmail,
  };
  const c = o.client ?? {};
  const entry = Math.round(o.price * (o.entryPercent / 100) * 100) / 100;
  const balance = Math.round((o.price - entry) * 100) / 100;

  // Cada cláusula: [título, parágrafos[]]. As condicionais entram só quando a opção está ligada.
  const clauses = [];
  const add = (title, ...paras) => clauses.push([title, paras.flat().filter(Boolean)]);

  add('Do objeto',
    `O presente contrato tem por objeto a prestação, pela CONTRATADA, do serviço de <b>${esc(o.serviceName)}</b> para a CONTRATANTE, compreendendo:`,
    `<ul>${o.scopeItems.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`,
    'Qualquer serviço não listado acima não faz parte deste contrato e, se solicitado, será orçado à parte.');

  add('Das obrigações da CONTRATADA',
    'Executar os serviços com qualidade técnica, dentro do prazo e do escopo combinados.',
    'Manter a CONTRATANTE informada sobre o andamento do projeto e apresentar a versão para aprovação antes da publicação.',
    'Entregar a página funcionando em computadores e celulares nos navegadores atuais.');

  add('Das obrigações da CONTRATANTE',
    `Fornecer textos, fotos, logotipo, informações de contato e demais conteúdos em até <b>${o.contentDays} dias</b> após a assinatura. Na falta do conteúdo, a CONTRATADA poderá usar textos e imagens provisórios, que poderão ser substituídos depois dentro das rodadas de ajustes.`,
    'Garantir que possui os direitos de uso de todo o material que fornecer, respondendo por ele perante terceiros.',
    'Efetuar os pagamentos nas datas combinadas e responder às solicitações de aprovação em tempo razoável.');

  add('Do prazo',
    `O prazo de entrega é de <b>${o.deadlineDays} dias corridos</b>, contados a partir do recebimento do pagamento de entrada e de todo o conteúdo previsto na cláusula anterior, o que ocorrer por último.`,
    'Atrasos causados pela CONTRATANTE (envio de conteúdo, aprovações ou pagamentos) prorrogam o prazo pelo mesmo período.');

  add('Do preço e da forma de pagamento',
    `Pelos serviços descritos na cláusula primeira, a CONTRATANTE pagará à CONTRATADA o valor total de <b>${money(o.price)}</b>.`,
    o.entryPercent >= 100
      ? 'O valor será pago integralmente na assinatura deste contrato.'
      : o.entryPercent <= 0
        ? 'O valor será pago integralmente na entrega do projeto, antes da publicação.'
        : `O pagamento será feito em duas partes: <b>${money(entry)}</b> (${o.entryPercent}%) na assinatura deste contrato, como entrada, e <b>${money(balance)}</b> (${100 - o.entryPercent}%) na entrega do projeto, antes da publicação.`,
    `Formas de pagamento aceitas: ${esc(o.paymentMethods)}.`,
    'O atraso no pagamento sujeita a CONTRATANTE a multa de 2% (dois por cento) e juros de 1% (um por cento) ao mês sobre o valor devido, e permite à CONTRATADA suspender a publicação até a regularização.');

  add('Dos ajustes e alterações',
    `Estão incluídas <b>${o.revisions} ${o.revisions === 1 ? 'rodada' : 'rodadas'} de ajustes</b> sobre a versão apresentada. Uma rodada é uma lista única de alterações enviada de uma só vez.`,
    `Ajustes além do incluído, mudanças de escopo ou novas funcionalidades serão cobrados à parte, a ${money(o.extraHourRate)} por hora, mediante orçamento aprovado antes da execução.`);

  if (o.domain) {
    add('Do domínio',
      'A CONTRATADA fará o registro ou a configuração do domínio escolhido pela CONTRATANTE. O domínio será registrado em nome e com o documento da CONTRATANTE, que será sua titular.',
      'As taxas de registro e renovação do domínio cobradas pela entidade registradora (como o Registro.br) são de responsabilidade da CONTRATANTE, salvo se incluídas expressamente no valor deste contrato.');
  }

  if (o.seo) {
    add('Da otimização para buscadores (SEO)',
      'A CONTRATADA aplicará boas práticas de otimização para buscadores na página (títulos, descrições, velocidade e dados de localização).',
      'A posição da página nos resultados do Google e de outros buscadores depende de fatores fora do controle da CONTRATADA, razão pela qual não há garantia de posição ou de volume de visitas.');
  }

  if (o.forms) {
    add('Da proteção de dados pessoais',
      'Os dados pessoais que visitantes enviarem pelos formulários da página pertencem à CONTRATANTE, que atua como controladora nos termos da Lei nº 13.709/2018 (LGPD), cabendo a ela a política de privacidade e o atendimento aos titulares.',
      'A CONTRATADA tratará esses dados apenas para viabilizar o funcionamento técnico do formulário, sem usá-los para nenhuma outra finalidade.');
  }

  if (o.includeMonthly) {
    add('Da hospedagem e manutenção mensal',
      `Após a publicação, a CONTRATADA prestará o serviço mensal de hospedagem e manutenção pelo valor de <b>${money(o.monthlyPrice)}</b> por mês, com vencimento todo dia ${new Date(`${o.startDate || new Date().toISOString().slice(0, 10)}T12:00:00`).getDate()} de cada mês, compreendendo:`,
      `<ul>${o.monthlyItems.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`,
      'Alterações que não sejam pequenas mudanças de texto ou imagem serão orçadas à parte.',
      'O valor mensal será reajustado anualmente pelo IPCA/IBGE, ou pelo índice que vier a substituí-lo.',
      `O serviço mensal vigora por prazo indeterminado e pode ser cancelado por qualquer das partes com aviso prévio de ${o.monthlyNoticeDays} dias. Com o cancelamento, a CONTRATADA entregará os arquivos da página à CONTRATANTE, desde que não haja valores em aberto.`);
  } else {
    add('Da hospedagem',
      'A hospedagem da página após a entrega não está incluída neste contrato. A CONTRATADA entregará os arquivos e as orientações para publicação no serviço de hospedagem escolhido pela CONTRATANTE.');
  }

  add('Da propriedade intelectual',
    'Com a quitação integral do valor previsto neste contrato, a CONTRATANTE passa a ter o direito de uso da página e de seu conteúdo personalizado.',
    'Ferramentas, bibliotecas e trechos de código genéricos usados pela CONTRATADA continuam sendo dela ou de seus autores, e podem ser reutilizados em outros projetos.',
    o.portfolioRights ? 'A CONTRATADA poderá exibir o projeto em seu portfólio e em suas redes, salvo pedido contrário da CONTRATANTE por escrito.' : '');

  add('Da rescisão',
    'Este contrato pode ser rescindido por qualquer das partes mediante aviso por escrito, inclusive por WhatsApp ou e-mail.',
    `Se a CONTRATANTE desistir após o início dos trabalhos, a entrada não será devolvida, por remunerar o trabalho já realizado. Se a rescisão ocorrer após a entrega da versão para aprovação, será devido também o saldo restante.`,
    'Se a CONTRATADA não entregar o serviço por motivo exclusivamente seu, devolverá os valores recebidos.');

  add('Da confidencialidade',
    'As partes manterão em sigilo as informações não públicas a que tiverem acesso em razão deste contrato.');

  add('Do foro',
    `As partes elegem o foro da comarca de ${blank(o.city, 20)} para resolver qualquer questão oriunda deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`);

  const ordinal = ['PRIMEIRA', 'SEGUNDA', 'TERCEIRA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÉTIMA', 'OITAVA', 'NONA', 'DÉCIMA', 'DÉCIMA PRIMEIRA', 'DÉCIMA SEGUNDA', 'DÉCIMA TERCEIRA', 'DÉCIMA QUARTA', 'DÉCIMA QUINTA', 'DÉCIMA SEXTA'];

  const body = clauses.map(([title, paras], i) => {
    const n = i + 1;
    // Numera os parágrafos (1.1, 1.2...) quando a cláusula tem mais de um; listas não contam.
    const numbered = paras.filter((p) => !p.startsWith('<ul>')).length > 1;
    let k = 0;
    const content = paras.map((p) => (p.startsWith('<ul>') ? p : `<p>${numbered ? `<b>${n}.${++k}.</b> ` : ''}${p}</p>`)).join('\n');
    return `<h2>CLÁUSULA ${ordinal[i] ?? n} — ${title.toUpperCase()}</h2>\n${content}`;
  }).join('\n\n');

  return `<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO WEB</h1>

<p>Pelo presente instrumento particular, as partes abaixo identificadas:</p>

<p><b>CONTRATANTE:</b> ${blank(c.name)}, inscrita no CPF/CNPJ sob o nº ${blank(c.doc, 20)}, com endereço em ${blank(c.address, 40)}${c.representative ? `, neste ato representada por ${esc(c.representative)}` : ''}${c.email ? `, e-mail ${esc(c.email)}` : ''}${c.phone ? `, telefone ${esc(c.phone)}` : ''}.</p>

<p><b>CONTRATADA:</b> ${blank(provider.name)}, inscrita no CPF/CNPJ sob o nº ${blank(provider.doc, 20)}, com endereço em ${blank(provider.address, 40)}${provider.email ? `, e-mail ${esc(provider.email)}` : ''}.</p>

<p>têm entre si justo e contratado o seguinte, que se obrigam a cumprir:</p>

${body}

<p>E, por estarem de acordo, as partes assinam este contrato em duas vias de igual teor, ou eletronicamente, com a mesma validade.</p>

<p style="text-align:right">${blank(o.city, 20)}, ${dateLong(o.startDate)}.</p>

<table class="signatures"><tr>
<td>______________________________<br><b>CONTRATANTE</b><br>${blank(c.name, 24)}</td>
<td>______________________________<br><b>CONTRATADA</b><br>${blank(provider.name, 24)}</td>
</tr></table>

<p class="note">Data de início: ${dateBR(o.startDate)}</p>`;
}

// Estilo usado no editor, na impressão (PDF) e no arquivo .doc
export const CONTRACT_CSS = `
.contract{font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.55;color:#111;background:#fff}
.contract h1{font-size:14pt;text-align:center;margin:0 0 18pt;letter-spacing:.02em}
.contract h2{font-size:11.5pt;margin:16pt 0 6pt}
.contract p{margin:0 0 8pt;text-align:justify}
.contract ul{margin:0 0 8pt 18pt;padding:0}
.contract li{margin:0 0 3pt}
.contract .signatures{width:100%;margin-top:36pt;border-collapse:collapse}
.contract .signatures td{width:50%;text-align:center;padding:0 10pt;vertical-align:top;font-size:11pt}
.contract .note{font-size:9pt;color:#666;margin-top:24pt}
`;
