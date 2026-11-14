// Armazenamento simples em JSON (data/db.json). Suficiente para centenas de leads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');
export const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const STATUSES = [
  'novo',        // encontrado, ainda sem prévia
  'pronto',      // prévia gerada, pronto para enviar
  'enviado',     // primeira mensagem enviada
  'respondeu',   // cliente respondeu
  'proposta',    // proposta enviada
  'fechado',     // virou cliente
  'perdido',     // não quis
  'nao_contatar' // pediu para não receber mensagens (nunca mais abordar)
];

const DEFAULT_SETTINGS = {
  name: 'Guilherme Xavier',
  brand: 'xavr.dev',
  whatsapp: '5511940098765',
  siteUrl: 'https://guixavr.github.io',
  followUpDays: 3,
  packages: [
    {
      id: 'essencial',
      name: 'Essencial',
      price: 'R$ 997',
      highlight: false,
      items: [
        'Landing page de 1 página, feita sob medida',
        'Botão de WhatsApp e mapa de localização',
        'Pronta para celular e rápida',
        'Entrega em até 7 dias',
      ],
    },
    {
      id: 'profissional',
      name: 'Profissional',
      price: 'R$ 1.697',
      highlight: true,
      items: [
        'Tudo do Essencial',
        'Domínio próprio (.com.br) configurado',
        'SEO local para aparecer no Google',
        'Formulário de contato e Google Analytics',
        '2 rodadas de ajustes',
      ],
    },
  ],
  monthly: { name: 'Hospedagem e manutenção', price: 'R$ 79/mês', items: ['Hospedagem e SSL', 'Pequenas alterações de texto e fotos', 'Suporte pelo WhatsApp'] },
  paymentTerms: '50% para começar e 50% na entrega. Pix ou cartão.',
};

function load() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db.settings = { ...DEFAULT_SETTINGS, ...db.settings };
    db.leads ??= {};
    return db;
  } catch {
    return { settings: structuredClone(DEFAULT_SETTINGS), leads: {} };
  }
}

let db = load();

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export const store = {
  settings: () => db.settings,
  updateSettings(patch) {
    db.settings = { ...db.settings, ...patch };
    save();
    return db.settings;
  },
  leads: () => Object.values(db.leads),
  get: (id) => db.leads[id],
  has: (id) => Boolean(db.leads[id]),
  // Insere sem sobrescrever o que já foi trabalhado (status, notas, prévia).
  upsertFound(lead) {
    const old = db.leads[lead.id];
    db.leads[lead.id] = old ? { ...lead, ...pickWork(old), firstSeenAt: old.firstSeenAt } : lead;
    return { isNew: !old };
  },
  update(id, patch) {
    if (!db.leads[id]) return null;
    db.leads[id] = { ...db.leads[id], ...patch, updatedAt: new Date().toISOString() };
    save();
    return db.leads[id];
  },
  replace(id, lead) {
    if (!db.leads[id]) return null;
    db.leads[id] = { ...lead, updatedAt: new Date().toISOString() };
    save();
    return db.leads[id];
  },
  remove(id) {
    delete db.leads[id];
    save();
  },
  save,
};

function pickWork(old) {
  const keys = ['status', 'notes', 'slug', 'content', 'previewAt', 'publishedAt', 'sentAt', 'followUpAt', 'proposalSentAt', 'history', 'message', 'proposalMessage', 'followUpMessage', 'contract'];
  return Object.fromEntries(keys.filter((k) => old[k] !== undefined).map((k) => [k, old[k]]));
}
