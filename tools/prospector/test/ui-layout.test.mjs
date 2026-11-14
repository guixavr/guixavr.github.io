import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ui = await readFile(new URL('../ui/index.html', import.meta.url), 'utf8');

test('lead cards keep all actions in a compact popup menu', () => {
  assert.doesNotMatch(ui, /main\.workspace\{max-width:1280px/);
  assert.match(ui, /class="lead-notes"/);
  assert.match(ui, /class="lead-action-menu"/);
  assert.match(ui, />Ações<\/summary>/);
  assert.doesNotMatch(ui, /class="lead-more"/);
  assert.doesNotMatch(ui, /class="[^"]*action-group/);
});
