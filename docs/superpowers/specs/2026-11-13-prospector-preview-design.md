# Prévia comercial e visual do Prospector

## Intenção

Transformar cada prévia em uma demonstração comercial convincente, com identidade visual e conteúdo adequados ao nicho do lead. A prévia continuará sendo uma landing page curta, sem fingir ser um site final nem inventar dados do negócio.

## Objetivos

- Gerar textos mais específicos, orientados ao próximo contato e fundamentados nos dados públicos recebidos.
- Criar uma prévia comercial completa sem depender de imagens externas; não publicar fotos do Google Places.
- Variar estrutura, benefícios e chamadas conforme o tema do negócio.
- Impedir que o painel registre uma mensagem como enviada antes de a prévia estar publicada.

## Fora de escopo

- Criar um site final completo ou editar fotos reais do cliente.
- Gerar imagens novas por lead em tempo de execução.
- Rastreamento de abertura/cliques ou envio automático de WhatsApp.
- Resolver todos os problemas de busca e CRM identificados na auditoria.

## Abordagens consideradas

1. Usar fotos do Google Places: já existe, mas não oferece licença adequada nem disponibilidade estável para páginas publicadas. Rejeitada.
2. Buscar imagens externas por API (Unsplash/Pexels): dá variedade, mas acrescenta chave, disponibilidade externa e requisitos de atribuição. Rejeitada nesta etapa.
3. Prévia sem imagens: escolhida posteriormente pelo usuário para eliminar dependências externas e falhas de geração. A hierarquia visual será obtida com tipografia, paleta, destaques, avaliações e CTAs.

## Desenho escolhido

### Conteúdo

Expandir o contrato de geração para incluir direção visual e módulos de venda: benefício principal, três razões para escolher o negócio, prova social factual quando houver e uma faixa de ação final. O prompt instrui o modelo a usar dados públicos apenas como evidência, marcar incertezas de forma genérica e nunca criar preços, credenciais, equipe, resultados ou depoimentos.

O fallback sem IA passa a seguir a mesma estrutura e remove afirmações não comprovadas.

### Visual

Usar as paletas existentes por tema, hierarquia tipográfica, cartões de destaques, avaliações e CTAs para construir a prévia. Fotos do Google e imagens de fontes externas não são usadas nem publicadas.

Cada tema terá pequenos tratamentos de layout já suportados pelo renderer: paleta, fotografia, ícones, blocos de benefícios e CTA. A estrutura permanece responsiva e curta.

### Proteção operacional

O botão de abertura do WhatsApp ficará indisponível enquanto a prévia não estiver publicada. A API também recusará o registro de envio nesse estado para que uma alteração futura no painel não contorne a regra.

### Testes e verificação

Criar testes com `node:test` para o conteúdo de fallback, seleção de imagens/renderização e bloqueio de envio sem publicação. Executar os testes e uma verificação de sintaxe antes da entrega.

## Arquivos previstos

- `tools/prospector/lib/generate.mjs`: contrato, prompt e fallback.
- `tools/prospector/lib/render.mjs`: blocos comerciais e imagens locais.
- `tools/prospector/server.mjs` e `ui/index.html`: proteção de envio/publicação.
- `tools/prospector/test/`: cobertura automatizada.

## Decisões assumidas

- As imagens são decorativas e temáticas, não fotos do estabelecimento.
- A primeira entrega usa o conjunto de temas existente sem dependência de provedores de imagens.
