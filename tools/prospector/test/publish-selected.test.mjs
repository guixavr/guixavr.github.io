import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const [server, ui, publish] = await Promise.all([
  readFile(new URL('server.mjs', root), 'utf8'),
  readFile(new URL('ui/index.html', root), 'utf8'),
  readFile(new URL('lib/publish.mjs', root), 'utf8'),
]);

test('supports publishing only the selected lead preview', () => {
  assert.match(publish, /export async function publishPreview\(slug\)/);
  assert.ok(server.includes("route('POST', /^\\/api\\/leads\\/([^/]+)\\/publish$"));
  assert.match(server, /publishPreview\(lead\.slug\)/);
  assert.match(ui, /data-act="publish-preview"/);
  assert.match(ui, /\/api\/leads\/\$\{encodeURIComponent\(id\)\}\/publish/);
});
