# Prospector

Ferramenta local para achar negócios que precisam de landing page, gerar uma prévia personalizada e abordar pelo WhatsApp.

Roda só no seu computador: as chaves de API e a lista de leads (`data/db.json`) não vão para o GitHub. Só as prévias são publicadas, em `public/preview/<negocio>/` do portfólio.

## Como funciona

1. **Buscar**: você escolhe a cidade e os nichos. A ferramenta consulta a Google Places API e dá uma nota de 0 a 100 para cada negócio:
   - pontua mais quem não tem site ou só tem Instagram/Linktree;
   - pontua mais nota alta e muitas avaliações (negócio ativo);
   - pontua mais quem tem celular (provável WhatsApp).
2. **Gerar prévia**: o Claude escreve os textos com base nos dados públicos do Google (avaliações, horários, fotos). Saem duas páginas:
   - `/preview/<slug>/`: a landing page, com uma barra "Quero este site" que leva para o seu WhatsApp;
   - `/preview/<slug>/proposta/`: pacotes, valores e forma de pagamento.
3. **Publicar prévias**: faz commit e push só de `public/preview/`. O GitHub Pages atualiza em 1 a 2 minutos.
4. **Enviar**: abre o WhatsApp com a mensagem pronta. Você revisa e aperta enviar.
5. **Acompanhar**: os status vão de novo → prévia pronta → enviado → respondeu → proposta → fechado. Um aviso de follow-up aparece depois de 3 dias sem resposta.

## Por que o envio não é automático

Mandar mensagem automática para quem nunca falou com você viola as regras do WhatsApp, e o número é banido rápido. Também entra a LGPD: a primeira mensagem já diz que a pessoa pode pedir para não receber mais. Quando alguém pedir, marque o status **Não contatar**. Esse negócio não volta em buscas futuras.

Uma boa rotina: de 15 a 30 mensagens por dia, sempre com a prévia personalizada.

## Instalação

```bash
cd tools/prospector
npm install
cp .env.example .env   # e preencha as chaves
npm start              # abre em http://localhost:4400
```

### Chaves

- **Google Places API**:
  1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a **Places API (New)**.
  2. Crie uma chave em *APIs e serviços → Credenciais* e restrinja a chave a essa API.
  3. A busca pede telefone e site, que ficam na faixa de preço mais alta da API. Confira a cota gratuita mensal na página de preços do Google e coloque um limite de orçamento no projeto.
  4. Sem essa chave, dá para usar só o cadastro manual.
- **Claude (Anthropic API)**:
  1. Crie a chave em [platform.claude.com](https://platform.claude.com/).
  2. Cada prévia custa poucos centavos.
  3. Sem chave, a prévia usa textos-modelo.

## Configurações

No botão **Configurações** do painel:

- **Seu nome, marca e WhatsApp**: aparecem nas mensagens, na barra da prévia e na proposta.
- **Endereço do site**: o domínio onde as prévias ficam publicadas. Quando você tiver um domínio próprio, troque aqui e clique em "Refazer prévia" nos leads que ainda não foram contatados.
- **Pacotes, mensalidade e condições de pagamento**: o que aparece na página de proposta.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `server.mjs` | Servidor local e rotas da API |
| `ui/index.html` | Painel |
| `lib/places.mjs` | Busca no Google Places |
| `lib/score.mjs` | Classificação do site atual e nota do lead |
| `lib/generate.mjs` | Textos da prévia e mensagens, com Claude ou textos-modelo |
| `lib/render.mjs` | HTML da prévia e da proposta |
| `lib/publish.mjs` | Gravação em `public/preview/` e git push |
| `data/db.json` | Seus leads (não vai para o GitHub) |
