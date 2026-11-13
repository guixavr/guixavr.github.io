// Monta o HTML estático da prévia e da proposta (publicados em public/preview/<slug>/).
import { formatPhone, isMobile, waLink } from './phone.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const PALETTES = {
  saude:       { accent: '#0e7c86', soft: '#e3f4f5', ink: '#0f2a2e', display: 'Fraunces' },
  beleza:      { accent: '#b0466b', soft: '#fbe9ef', ink: '#2e1620', display: 'Playfair Display' },
  masculino:   { accent: '#a87a32', soft: '#f2ece2', ink: '#151412', display: 'Playfair Display' },
  servicos:    { accent: '#2f5bd3', soft: '#e8eefc', ink: '#141c33', display: 'Manrope' },
  alimentacao: { accent: '#c2410c', soft: '#fdeee4', ink: '#2b160b', display: 'Fraunces' },
  juridico:    { accent: '#8a6a2f', soft: '#f5efe3', ink: '#1c1a16', display: 'Playfair Display' },
  educacao:    { accent: '#6d3fd1', soft: '#efe9fb', ink: '#1d1433', display: 'Manrope' },
  pet:         { accent: '#2f8f4e', soft: '#e7f5ec', ink: '#13291b', display: 'Fraunces' },
  fitness:     { accent: '#e0482b', soft: '#fdeae6', ink: '#1a1a1a', display: 'Manrope' },
  automotivo:  { accent: '#d97706', soft: '#fdf1e1', ink: '#16181c', display: 'Manrope' },
  casa:        { accent: '#3b6e8f', soft: '#e6eff5', ink: '#152330', display: 'Manrope' },
};

const ICON_WA = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg>';

function baseHead({ title, palette, description }) {
  const fontParam = palette.display.replace(/ /g, '+');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fontParam}:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:${palette.accent};--soft:${palette.soft};--ink:${palette.ink};--muted:#5b6270;--bg:#fff;--line:#e7e8ec;--display:'${palette.display}',Georgia,serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font:16px/1.6 Inter,system-ui,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
h1,h2,h3{font-family:var(--display);line-height:1.15;margin:0 0 .5em;letter-spacing:-.01em}
h1{font-size:clamp(2.1rem,5.5vw,3.6rem)}h2{font-size:clamp(1.6rem,3.6vw,2.4rem)}h3{font-size:1.15rem}
p{margin:0 0 1em}.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;gap:.55em;padding:.9em 1.4em;border-radius:999px;background:var(--accent);color:#fff;text-decoration:none;font-weight:600;border:0;cursor:pointer;transition:transform .15s,box-shadow .15s}
.btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px -8px var(--accent)}
.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}
section{padding:72px 0}
.eyebrow{display:inline-block;font-size:.8rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:.8em}
</style>`;
}

export function renderPreview(lead, content, settings, { proposalPath } = {}) {
  const palette = PALETTES[content.theme] ?? PALETTES.servicos;
  const mobile = isMobile(lead.phone);
  const ctaHref = mobile
    ? waLink(lead.phone, `Olá! Vim pelo site da ${lead.name} e gostaria de mais informações.`)
    : lead.phone ? `tel:+${lead.phone}` : '#contato';
  const hero = content.photos?.[0];
  const gallery = (content.photos ?? []).slice(1, 4);
  const reviews = (content.reviews ?? []).slice(0, 3);
  const freelancerWa = waLink(settings.whatsapp, `Oi, ${settings.name.split(' ')[0]}! Vi a prévia do site da ${lead.name} e quero saber mais.`);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(`${lead.name}, ${lead.address}`)}&output=embed`;

  return `${baseHead({ title: lead.name, palette, description: content.subheadline })}
<style>
.top{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.logo{font-family:var(--display);font-weight:700;font-size:1.2rem;text-decoration:none}
.top nav{display:flex;gap:22px;font-size:.95rem}.top nav a{text-decoration:none;color:var(--muted)}
@media(max-width:760px){.top nav{display:none}}
.hero{position:relative;padding:96px 0 88px;background:var(--soft);overflow:hidden}
.hero.has-photo{color:#fff;background:#111}
.hero.has-photo::before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,rgba(0,0,0,.78),rgba(0,0,0,.35)),var(--photo) center/cover}
.hero .wrap{position:relative}.hero p.lead{font-size:1.2rem;max-width:36ch;opacity:.9}
.hero .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.hero.has-photo .btn.ghost{color:#fff;border-color:rgba(255,255,255,.5)}
.rating{display:inline-flex;align-items:center;gap:.5em;margin-top:26px;font-size:.95rem;opacity:.9}
.stars{color:#f5b301;letter-spacing:2px}
.grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.card{border:1px solid var(--line);border-radius:18px;padding:24px;background:#fff}
.card .dot{width:38px;height:38px;border-radius:12px;background:var(--soft);display:grid;place-items:center;color:var(--accent);font-weight:700;margin-bottom:14px}
.about{display:grid;gap:40px;grid-template-columns:1.1fr .9fr;align-items:center}
@media(max-width:860px){.about{grid-template-columns:1fr}}
.diffs{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.diffs li{display:flex;gap:12px;align-items:flex-start;padding:16px 18px;border-radius:14px;background:var(--soft)}
.diffs li::before{content:"✓";color:var(--accent);font-weight:700}
.gallery{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.gallery figure{margin:0}.gallery img{aspect-ratio:4/3;object-fit:cover;border-radius:14px;width:100%}
.gallery figcaption{font-size:.75rem;color:var(--muted);margin-top:4px}
.quote{font-size:1.02rem}.quote footer{margin-top:10px;font-weight:600;font-size:.9rem}
details{border-bottom:1px solid var(--line);padding:18px 0}summary{cursor:pointer;font-weight:600;list-style:none}summary::-webkit-details-marker{display:none}
details p{margin:10px 0 0;color:var(--muted)}
.contact{display:grid;gap:28px;grid-template-columns:1fr 1fr}@media(max-width:860px){.contact{grid-template-columns:1fr}}
.contact iframe{width:100%;min-height:320px;border:0;border-radius:18px}
.closing{background:var(--ink);color:#fff;border-radius:28px;padding:56px 32px;text-align:center}
.closing p{opacity:.8}
footer.site{padding:40px 0 120px;color:var(--muted);font-size:.9rem;border-top:1px solid var(--line)}
.float{position:fixed;right:18px;bottom:86px;z-index:30;width:56px;height:56px;border-radius:50%;background:#25d366;color:#fff;display:grid;place-items:center;box-shadow:0 10px 30px -10px rgba(0,0,0,.4)}
.float svg{width:28px;height:28px}
.preview-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:40;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px 12px 18px;border-radius:16px;background:#111827;color:#fff;font-size:.9rem;box-shadow:0 12px 40px -12px rgba(0,0,0,.5);max-width:760px;margin:0 auto}
.preview-bar b{color:#fff}.preview-bar .btn{padding:.6em 1em;font-size:.88rem;background:#25d366;white-space:nowrap}
@media(max-width:560px){.preview-bar{flex-direction:column;align-items:stretch;text-align:center}}
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <a class="logo" href="#">${esc(lead.name)}</a>
  <nav><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a>${reviews.length ? '<a href="#avaliacoes">Avaliações</a>' : ''}<a href="#contato">Contato</a></nav>
  <a class="btn" href="${esc(ctaHref)}" target="_blank" rel="noopener">${mobile ? ICON_WA : ''}<span>${mobile ? 'WhatsApp' : 'Ligar'}</span></a>
</div></header>

<section class="hero${hero ? ' has-photo' : ''}"${hero ? ` style="--photo:url('${esc(hero.url)}')"` : ''}><div class="wrap">
  <span class="eyebrow"${hero ? ' style="color:#fff;opacity:.85"' : ''}>${esc(lead.category || 'Bem-vindo')}</span>
  <h1>${esc(content.headline)}</h1>
  <p class="lead">${esc(content.subheadline)}</p>
  <div class="actions">
    <a class="btn" href="${esc(ctaHref)}" target="_blank" rel="noopener">${mobile ? ICON_WA : ''}${esc(content.ctaLabel)}</a>
    <a class="btn ghost" href="#servicos">Ver serviços</a>
  </div>
  ${lead.rating ? `<div class="rating"><span class="stars">${'★'.repeat(Math.round(lead.rating))}</span> ${esc(String(lead.rating).replace('.', ','))} no Google${lead.reviewCount ? ` · ${lead.reviewCount} avaliações` : ''}</div>` : ''}
</div></section>

<section id="servicos"><div class="wrap">
  <span class="eyebrow">Serviços</span><h2>O que fazemos</h2>
  <div class="grid" style="margin-top:28px">
    ${content.services.map((s, i) => `<div class="card"><div class="dot">${i + 1}</div><h3>${esc(s.title)}</h3><p class="muted" style="margin:0">${esc(s.description)}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section id="sobre" style="background:#fafafa"><div class="wrap about">
  <div><span class="eyebrow">Sobre</span><h2>${esc(content.aboutTitle)}</h2><p class="muted" style="font-size:1.08rem">${esc(content.about)}</p></div>
  <ul class="diffs">${content.differentials.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
</div></section>

${gallery.length ? `<section><div class="wrap"><div class="gallery">
  ${gallery.map((p) => `<figure><img src="${esc(p.url)}" alt="${esc(lead.name)}" loading="lazy"><figcaption>Foto: ${esc(p.author)} / Google Maps</figcaption></figure>`).join('\n  ')}
</div></div></section>` : ''}

${reviews.length ? `<section id="avaliacoes"><div class="wrap">
  <span class="eyebrow">Avaliações do Google</span><h2>Quem já foi atendido recomenda</h2>
  <div class="grid" style="margin-top:28px">
    ${reviews.map((r) => `<blockquote class="card quote" style="margin:0"><div class="stars">${'★'.repeat(r.rating)}</div><p style="margin:10px 0 0">${esc(r.text.length > 280 ? r.text.slice(0, 277) + '…' : r.text)}</p><footer>${esc(r.author)}</footer></blockquote>`).join('\n    ')}
  </div>
</div></section>` : ''}

<section style="padding-top:24px"><div class="wrap" style="max-width:760px">
  <span class="eyebrow">Dúvidas</span><h2>Perguntas frequentes</h2>
  ${content.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
</div></section>

<section id="contato"><div class="wrap contact">
  <div>
    <span class="eyebrow">Contato</span><h2>Onde estamos</h2>
    <p class="muted">${esc(lead.address)}</p>
    ${lead.phone ? `<p><b>Telefone:</b> ${esc(formatPhone(lead.phone))}</p>` : ''}
    ${content.hours?.length ? `<p style="margin-bottom:.4em"><b>Horários</b></p><ul class="muted" style="padding-left:18px;margin-top:0">${content.hours.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
    <a class="btn" href="${esc(ctaHref)}" target="_blank" rel="noopener">${mobile ? ICON_WA : ''}${esc(content.ctaLabel)}</a>
  </div>
  <iframe src="${esc(mapSrc)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa"></iframe>
</div></section>

<section style="padding-top:0"><div class="wrap"><div class="closing">
  <h2>${esc(content.closingTitle)}</h2><p>${esc(content.closingText)}</p>
  <a class="btn" href="${esc(ctaHref)}" target="_blank" rel="noopener" style="margin-top:12px">${mobile ? ICON_WA : ''}${esc(content.ctaLabel)}</a>
</div></div></section>

<footer class="site"><div class="wrap">© ${new Date().getFullYear()} ${esc(lead.name)}. Todos os direitos reservados.</div></footer>

${mobile ? `<a class="float" href="${esc(ctaHref)}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON_WA}</a>` : ''}
<div class="preview-bar">
  <span>Esta é uma <b>prévia</b> criada por ${esc(settings.brand)} para a ${esc(lead.name)}.${proposalPath ? ` <a href="${esc(proposalPath)}" style="color:#9be7b4">Ver valores</a>` : ''}</span>
  <a class="btn" href="${esc(freelancerWa)}" target="_blank" rel="noopener">${ICON_WA}Quero este site</a>
</div>
</body>
</html>
`;
}

export function renderProposal(lead, content, settings, { previewPath }) {
  const palette = PALETTES[content.theme] ?? PALETTES.servicos;
  const first = settings.name.split(' ')[0];
  const wa = (pkg) => waLink(settings.whatsapp, `Oi, ${first}! Quero fechar o pacote ${pkg} para o site da ${lead.name}.`);
  const valid = new Date(Date.now() + 15 * 864e5).toLocaleDateString('pt-BR');

  return `${baseHead({ title: `Proposta: site da ${lead.name}`, palette, description: `Proposta de landing page para ${lead.name}` })}
<style>
body{background:#f6f7f9}
.head{padding:64px 0 40px}
.plans{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.plan{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;display:flex;flex-direction:column}
.plan.hl{border:2px solid var(--accent);box-shadow:0 20px 50px -30px var(--accent)}
.plan .price{font-family:var(--display);font-size:2.2rem;font-weight:700;margin:.2em 0 .6em}
.plan ul{padding:0;margin:0 0 24px;list-style:none;display:grid;gap:10px;flex:1}
.plan li{display:flex;gap:10px}.plan li::before{content:"✓";color:var(--accent);font-weight:700}
.tag{display:inline-block;background:var(--accent);color:#fff;border-radius:999px;padding:.2em .8em;font-size:.75rem;font-weight:600;margin-bottom:10px;align-self:flex-start}
.box{background:#fff;border:1px solid var(--line);border-radius:22px;padding:28px;margin-top:18px}
.steps{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));counter-reset:s}
.steps div{counter-increment:s}.steps div::before{content:counter(s);display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--soft);color:var(--accent);font-weight:700;margin-bottom:8px}
</style>
</head>
<body>
<div class="wrap" style="max-width:960px;padding-bottom:64px">
  <div class="head">
    <span class="eyebrow">Proposta · ${esc(settings.brand)}</span>
    <h1 style="font-size:clamp(1.9rem,4.5vw,2.8rem)">Site para a ${esc(lead.name)}</h1>
    <p class="muted" style="font-size:1.1rem;max-width:58ch">Uma landing page profissional para transformar quem encontra vocês no Google em clientes no WhatsApp. A prévia já está pronta e pode ser ajustada do jeito de vocês.</p>
    <a class="btn ghost" href="${esc(previewPath)}">Ver a prévia de novo</a>
  </div>

  <div class="plans">
    ${settings.packages.map((p) => `<div class="plan${p.highlight ? ' hl' : ''}">
      ${p.highlight ? '<span class="tag">Mais escolhido</span>' : ''}
      <h3>${esc(p.name)}</h3><div class="price">${esc(p.price)}</div>
      <ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      <a class="btn" href="${esc(wa(p.name))}" target="_blank" rel="noopener">${ICON_WA}Quero o ${esc(p.name)}</a>
    </div>`).join('\n    ')}
  </div>

  ${settings.monthly ? `<div class="box">
    <h3>${esc(settings.monthly.name)} · <span style="color:var(--accent)">${esc(settings.monthly.price)}</span></h3>
    <p class="muted" style="margin:0">${settings.monthly.items.map(esc).join(' · ')}</p>
  </div>` : ''}

  <div class="box">
    <h3>Como funciona</h3>
    <div class="steps" style="margin-top:16px">
      <div><b>Conversa</b><p class="muted" style="margin:0">Você me conta o que quer mudar na prévia.</p></div>
      <div><b>Ajustes</b><p class="muted" style="margin:0">Coloco textos, fotos e serviços reais de vocês.</p></div>
      <div><b>No ar</b><p class="muted" style="margin:0">Publico o site e configuro o domínio.</p></div>
    </div>
  </div>

  <div class="box">
    <h3>Pagamento</h3>
    <p class="muted" style="margin:0">${esc(settings.paymentTerms)} Proposta válida até ${valid}.</p>
  </div>

  <p class="muted" style="margin-top:28px;font-size:.9rem">${esc(settings.name)} · <a href="${esc(settings.siteUrl)}">${esc(settings.siteUrl.replace(/^https?:\/\//, ''))}</a> · WhatsApp ${esc(formatPhone(settings.whatsapp))}</p>
</div>
</body>
</html>
`;
}
