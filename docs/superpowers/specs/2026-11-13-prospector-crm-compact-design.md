# Refinamento visual do Prospector — CRM compacto

## Intenção

Tornar o painel de prospecção mais rápido de ler e operar durante uma rotina diária: identificar leads prioritários, gerar uma prévia, publicar e abrir o WhatsApp, sem mudar a lógica de busca, CRM ou publicação.

## Objetivos

- Dar destaque imediato a métricas, filtros ativos e tarefas pendentes de follow-up.
- Separar visualmente a busca de novos negócios da gestão dos leads já encontrados.
- Tornar cada lead escaneável: pontuação, nome, contexto, status e ação recomendada.
- Organizar ações por prioridade, reduzindo a aparência de uma coluna de botões.
- Preservar o funcionamento responsivo e todos os controles existentes.

## Fora de escopo

- Alterar rotas, armazenamento, regras de pontuação ou automação de mensagens.
- Transformar a lista em tabela ou quadro Kanban.
- Adicionar imagens a prévias ou ao painel.

## Abordagens consideradas

1. CRM compacto: cards de métricas, barra de filtros e cards de leads orientados à próxima ação. Escolhida por manter a lista e funcionar bem em desktop e celular.
2. Tabela operacional: mais densa para muitos registros, mas pior para dados longos, ações e mobile.
3. Kanban: bom para etapas, mas exigiria mudar a navegação atual centrada em filtro e busca.

## Desenho escolhido

### Estrutura da tela

O cabeçalho recebe uma identidade visual curta e um bloco de indicadores de integração. A busca fica em um card destacado, com a seleção de nichos mais organizada. A área de leads ganha uma barra de gestão que reúne as métricas clicáveis, filtros e contagem de resultados.

### Cards de lead

Cada lead terá um cabeçalho com a pontuação, nome, status e sinais de prioridade. O conteúdo será separado em identidade/contexto, contatos e anotações. As ações principais (gerar/ver prévia e enviar) ficam evidentes; ações secundárias entram em uma área compacta e a exclusão permanece visualmente perigosa.

### Visual

Manter o modo escuro do produto, mas introduzir superfícies com profundidade, melhor espaçamento, tipografia hierárquica e estados de foco/hover claros. Não serão usadas dependências externas nem imagens.

### Responsividade e acessibilidade

Em telas menores, filtros e ações se empilham, botões conservam área de toque confortável e o conteúdo de cada lead tem ordem linear. Contraste, foco visível e rótulos permanecem explícitos.

## Arquivo afetado

- `tools/prospector/ui/index.html`: estrutura, estilos e marcação gerada dos cards de lead.

## Decisões assumidas

- O escopo é visual e de organização de interface; a API existente não será alterada.
- A linguagem continuará em português do Brasil e o painel continuará sem dependências de framework.
