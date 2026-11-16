# guixavr.github.io

Páginas públicas dos apps de Guilherme Xavier: políticas de privacidade, exclusão de conta e verificação do AdMob. O portfólio mudou para o site da [Ribee Studio](https://ribee-studio.pages.dev/).

Site estático, sem build: tudo o que está em `public/` é publicado como está.

## Páginas dos apps (não mudar os endereços)

Os endereços estão cadastrados na Google Play e no AdMob.

| Endereço | Arquivo |
| --- | --- |
| `/` | `public/index.html` (lista dos apps e links) |
| `/app-ads.txt` | `public/app-ads.txt` (verificação do AdMob) |
| `/notenow/privacy/` | `public/notenow/privacy/index.html` |
| `/gemla/privacy/` | `public/gemla/privacy/index.html` |
| `/gemla/delete-account/` | `public/gemla/delete-account/index.html` |

Para um app novo: crie `public/<app>/privacy/index.html` (e `delete-account/` se o app tiver conta) e adicione os links em `public/index.html`.

## Prévias de sites

`public/preview/` guarda prévias de sites enviadas a possíveis clientes (`/preview/<nome>/` e `/preview/<nome>/proposta/`). Os links podem estar em e-mails já enviados, então não apague sem antes conferir.

## Deploy

Automático: cada push na branch `main` publica `public/` em https://guixavr.github.io pelo GitHub Actions (`.github/workflows/deploy.yml`). Em **Settings → Pages → Source** deve estar **GitHub Actions**.
