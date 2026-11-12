# guixavr.github.io: site de Guilherme Xavier

Landing page de portfólio feita com [Astro](https://astro.build) e [Tailwind CSS](https://tailwindcss.com). Gera um site estático, em português (`/`) e inglês (`/en/`).

## Rodando localmente

Requer Node.js 22.12 ou superior.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # gera o site em dist/
npm run preview   # serve o build localmente
```

## Editando o conteúdo

| O que | Onde |
| --- | --- |
| Contato, links, clientes, projetos e stack | `src/data/site.ts` |
| Todos os textos (PT e EN) | `src/i18n/ui.ts` |
| Cores e fontes | `src/styles/global.css` (bloco `@theme`) |
| Seções da página | `src/components/` |

- **Logos de clientes:** coloque o arquivo em `public/clients/` e adicione `logo: '/clients/nome.svg'` ao cliente em `site.ts`.
- **Imagens de projetos:** coloque em `public/projects/` e adicione `image: '/projects/nome.webp'` ao projeto. Sem imagem, o card mostra uma capa gerada.
- **Projeto em destaque:** `featured: true` exibe o projeto como card grand## Páginas dos apps (não mudar os endereços)

Estes arquivos ficam em `public/` e são publicados exatamente como estão. Os endereços são usados nas lojas de apps e no AdMob:

| Endereço | Arquivo |
| --- | --- |
| `/app-ads.txt` | `public/app-ads.txt` (verificação do AdMob) |
| `/notenow/privacy/` | `public/notenow/privacy/index.html` |
| `/gemla/privacy/` | `public/gemla/privacy/index.html` |
| `/gemla/delete-account/` | `public/gemla/delete-account/index.html` |

Para uma política nova, crie `public/<app>/privacy/index.html` e adicione o link no rodapé (`src/components/Footer.astro`).

## Deploy

Automático: cada push na branch `main` gera o site e publica em https://guixavr.github.io pelo GitHub Actions (`.github/workflows/deploy.yml`).

Requisito único: em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.

Para usar domínio próprio, configure em Settings → Pages e troque o endereço em `SITE_URL` (`astro.config.mjs`) e em `public/robots.txt`.
