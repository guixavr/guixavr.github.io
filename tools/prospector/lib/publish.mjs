// Grava as prévias em public/preview/ do portfólio e publica via git push (GitHub Pages).
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT } from './store.mjs';

const run = promisify(execFile);

export const REPO_ROOT = path.resolve(ROOT, '..', '..');
export const PREVIEW_DIR = path.join(REPO_ROOT, 'public', 'preview');

export function slugify(name, id) {
  const base = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 48) || 'negocio';
  // Sufixo curto e estável para não colidir com outro negócio de mesmo nome.
  const suffix = [...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).slice(0, 4);
  return `${base}-${suffix}`;
}

export function writePreviewFiles(slug, previewHtml, proposalHtml) {
  const dir = path.join(PREVIEW_DIR, slug);
  fs.mkdirSync(path.join(dir, 'proposta'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), previewHtml);
  fs.writeFileSync(path.join(dir, 'proposta', 'index.html'), proposalHtml);
}

export function removePreviewFiles(slug) {
  if (!slug) return;
  fs.rmSync(path.join(PREVIEW_DIR, slug), { recursive: true, force: true });
}

async function git(...args) {
  const { stdout } = await run('git', ['-C', REPO_ROOT, ...args], { maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

export async function pendingPreviewChanges() {
  try {
    return await git('status', '--porcelain', '--', 'public/preview');
  } catch {
    return '';
  }
}

// Faz commit só da pasta public/preview e envia para o GitHub.
export async function publishPreviews() {
  const changes = await pendingPreviewChanges();
  if (!changes) return { published: false, message: 'Nenhuma prévia nova para publicar.' };
  await git('add', '--', 'public/preview');
  const count = changes.split('\n').length;
  await git('commit', '-m', `Previews: ${count} arquivo(s) de prévia atualizados`, '--', 'public/preview');
  await git('push');
  return { published: true, message: `Publicado. O GitHub Pages leva 1 a 2 minutos para atualizar.` };
}
