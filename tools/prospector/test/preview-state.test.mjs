import assert from 'node:assert/strict';
import test from 'node:test';
import { clearPreviewData } from '../lib/preview-state.mjs';

test('clears generated preview data while preserving the lead and its workflow status', () => {
  const lead = {
    id: 'lead-1', name: 'Café Aurora', status: 'pronto', notes: 'Prioridade',
    slug: 'cafe-aurora', content: { headline: 'Olá' }, previewAt: '2026-11-13T12:00:00.000Z',
    publishedAt: '2026-11-13T12:10:00.000Z', message: 'Veja {{PREVIEW_URL}}',
    followUpMessage: 'Olá', proposalMessage: 'Proposta', sentAt: null,
  };

  const result = clearPreviewData(lead);

  assert.deepEqual(result, { id: 'lead-1', name: 'Café Aurora', status: 'pronto', notes: 'Prioridade', sentAt: null });
});
