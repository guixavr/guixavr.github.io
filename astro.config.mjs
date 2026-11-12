// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Endereço público do site. Ao usar domínio próprio, troque aqui e em public/robots.txt
export const SITE_URL = 'https://guixavr.github.io';

export default defineConfig({
  site: SITE_URL,
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en-US' } },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
