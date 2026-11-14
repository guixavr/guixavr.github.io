import assert from 'node:assert/strict';
import test from 'node:test';
import { assertPreviewPublished } from '../lib/send-guard.mjs';

test('rejects a message when the preview has not been published', () => {
  assert.throws(
    () => assertPreviewPublished({ slug: 'cafe-aurora', publishedAt: null }),
    { message: 'Publique a prévia antes de abrir o WhatsApp.' },
  );
});

test('allows a message after the preview was published', () => {
  assert.doesNotThrow(() => assertPreviewPublished({ slug: 'cafe-aurora', publishedAt: '2026-11-13T12:00:00.000Z' }));
});
