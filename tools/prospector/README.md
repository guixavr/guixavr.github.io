# Prospector

Ferramenta local para achar negócios que precisam de landing page, gerar uma prévia personalizada e abordar pelo WhatsApp.

Roda só no seu computador: as chaves de API e a lista de leads (`data/db.json`) não vão para o GitHub. Só as prévias são publicadas, em `public/preview/<negocio>/` do portfólio.

## Como funciona

1. **Buscar**: você escolhe a cidade e os nichos. A ferramenta consulta o OpenStreetMap (grátis, sem chave) ou, se você configurar a chave, a Google Places API. Cada negócio recebe uma nota de 0 a 100:
   - pontua mais quem não tem site ou só tem Instagram/Linktree;
   - pontua mais nota alta e muitas avaliações (negócio ativo);
   - pontua mais quem tem celular (provável WhatsApp).
2. **Gerar prévia**: o Claude escreve os textos com base nos dados públicos do Google (avaliações e horários). Saem duas páginas:
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

### Fonte da busca

- **Sem chave do Google (padrão)**: usa o OpenStreetMap, gratuito e sem cadastro.
  - Traz nome, telefone, endereço, horário e se o negócio tem site.
  - Tem menos negócios que o Google e não tem nota nem avaliações. Use o link "conferir no Google" de cada lead para ver a reputação antes de abordar.
  - Os servidores são públicos e voluntários: a ferramenta faz uma busca por nicho, com pausa entre elas. Evite buscar dezenas de nichos várias vezes seguidas.
- **Com chave do Google**: a busca passa a usar a Google Places API automaticamente, com notas e avaliações.

### Chaves

- **Google Places API (opcional)**:
  1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a **Places API (New)**.
  2. Crie uma chave em *APIs e serviços → Credenciais* e restrinja a chave a essa API.
  3. A busca pede telefone e site, que ficam na faixa de preço mais alta da API. Confira a cota gratuita mensal na página de preços do Google e coloque um limite de orçamento no projeto.
  4. No Brasil, contas novas podem precisar de um pré-pagamento, que vira crédito.
- **Claude (Anthropic API)**:
  1. Crie a chave em [platform.claude.com](https://platform.claude.com/).
  2. Cada prévia custa poucos centavos.
  3. Sem chave, a prévia usa textos-modelo.

## Configurações

No botão **Configurações** do painel:

- **Seu nome, marca e WhatsApp**: aparecem nas mensagens, na barra da prévia e na proposta.
- **Endereço do site**: o domínio onde as prévias ficam publicadas. Quando você tiver um domínio próprio, troque aqui e clique em "Refazer prévia" nos leads que ainda não foram contatados.
- **Pacotes, mensalidade e condições de pagamento**: o que aparece na página de proposta.
- **Seus dados nos contratos**: nome ou razão social, CPF/CNPJ, endereço, e-mail e a cidade do foro.

## Contratos

Em **Ações → Criar contrato** de cada lead. O contrato é montado pelo próprio código, sem IA:

1. Escolha o pacote que o cliente fechou. Escopo, valor, prazo, rodadas de ajustes e cláusulas vêm dos itens do pacote:
   - domínio no pacote → cláusula do domínio;
   - SEO → cláusula de SEO, sem garantia de posição no Google;
   - formulário → cláusula de LGPD;
   - mensalidade ligada → cláusula de hospedagem e manutenção; desligada → cláusula dizendo que a hospedagem não está incluída.
2. Ajuste as opções (entrada, prazos, hora extra) e preencha os dados do cliente. Clique em **Gerar a partir das opções**.
3. Clique no texto para editar o que quiser. As edições são salvas sozinhas.
4. Exporte em **Imprimir / PDF** ou **Baixar Word (.doc)**.

O pacote "Personalizado" serve para sistemas e apps: você escreve o escopo e o valor.

Os contratos ficam em `data/db.json`, junto com os leads, e não vão para o GitHub. É um modelo de partida: revise com um advogado antes de usar pela primeira vez.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `server.mjs` | Servidor local e rotas da API |
| `ui/index.html` | Painel |
| `lib/osm.mjs` | Busca gratuita no OpenStreetMap |
| `lib/places.mjs` | Busca no Google Places |
| `lib/score.mjs` | Classificação do site atual e nota do lead |
| `lib/generate.mjs` | Textos da prévia e mensagens, com Claude ou textos-modelo |
| `lib/render.mjs` | HTML da prévia e da proposta |
| `lib/publish.mjs` | Gravação em `public/preview/` e git push |
| `lib/contract.mjs` | Modelo de contrato, cláusulas por opção e valor por extenso |
| `data/db.json` | Seus leads (não vai para o GitHub) |
