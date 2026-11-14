import assert from 'node:assert/strict';
import test from 'node:test';
import { fallbackContent } from '../lib/generate.mjs';
import { renderPreview } from '../lib/render.mjs';

const lead = {
  id: 'manual-cafe', name: 'Café Aurora', category: 'Cafeteria', types: [],
  address: 'Centro, Campinas - SP', phone: '5511999999999', rating: 4.8, reviewCount: 82,
};
const settings = { name: 'Guilherme Xavier', brand: 'xavr.dev', whatsapp: '5511940098765' };

test('fallback content gives a factual commercial structure without invented credentials', () => {
  const content = fallbackContent(lead, settings);

  assert.equal(content.highlights.length, 3);
  assert.ok(content.highlights.every((item) => item.length > 4));
  assert.match(content.trustLine, /4.8|4,8/);
  assert.doesNotMatch(JSON.stringify(content), /equipe experiente|profissionais dedicados/i);
});

test('preview omits external illustrations and never publishes supplied Google photo URLs', () => {
  const content = {
    ...fallbackContent(lead, settings),
    illustrations: { hero: { url: 'https://cdn.example/hero.jpg', title: 'Coffee', attribution: 'Coffee is CC0.', sourceUrl: 'https://source.example/coffee' }, gallery: [] },
    reviews: [], hours: [],
  };
  const html = renderPreview(lead, content, settings, { proposalPath: '/preview/cafe/proposta/' });

  assert.match(html, /Por que escolher/);
  assert.doesNotMatch(html, /cdn\.example/);
  assert.doesNotMatch(html, /Coffee is CC0/);
  assert.doesNotMatch(html, /googleusercontent\.com/);
});
