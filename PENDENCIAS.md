# Pendências do portfólio

## Imagens
- [ ] **T7 Plus:** print do painel web e/ou do totem, sem dados reais do cliente (capa do card em destaque)
- [x] **Capuano Festas:** print do site (capuanofestas.com.br)
- [x] **Escola Ruah:** print do site (escolaruah.com.br)
- [ ] **Suite IT Digital:** print de algum app (se puder ser divulgado)
- [x] **Logos dos clientes:** T7 Adesivos, Capuano Festas e Escola Ruah
- [ ] **Logo da Suite IT Digital**, se houver permissão de uso
- [ ] **Foto profissional** (opcional, para a seção Sobre)
- [ ] **Logo pessoal** (opcional; hoje o site usa o texto `>_ xavr.dev`)
- [ ] **Imagem de compartilhamento (Open Graph)** para o link aparecer com imagem no WhatsApp/LinkedIn

Onde colocar: prints em `public/projects/`, logos em `public/clients/`. Depois, referenciar em `src/data/site.ts` (`image` no projeto, `logo` no cliente).

## Conteúdo para revisar
- [ ] Tecnologias do **Escalleo** (hoje o card mostra plataformas e recursos: Android, PWA, Google Play Billing, Offline, Push; faltam as tecnologias usadas, ex.: Flutter, backend, banco)
- [ ] Descrição e tecnologias do card **Suite IT Digital** (hoje: mobile, Flutter, Dart, Firebase, APIs)
- [ ] Tecnologias dos sites **Capuano Festas** e **Escola Ruah** (hoje só "Responsive UI" e "SEO")
- [ ] Confirmar tecnologias do **NoteNow** (hoje: Flutter, Dart, AdMob) e se ele já está na App Store
- [ ] **Gemla:** link da Google Play quando publicar, tecnologias usadas (hoje: Firebase, Google Sign-In, AdMob) e um print
- [ ] Confirmar a lista de tecnologias da seção **Sobre**
- [ ] Confirmar a frase "Respondo em até 1 dia útil" na seção de contato
- [ ] Depoimentos de clientes (opcional, nova seção)
- [ ] Links dos repositórios da T7 Plus: decidir se entram (hoje não aparecem)

## Infra
- [ ] Domínio próprio (ex.: xavr.dev). Ao comprar, configurar em Settings → Pages e trocar o endereço em `SITE_URL` (`astro.config.mjs`) e em `public/robots.txt`
