// Dados do portfólio. Edite aqui para atualizar o site.
// Textos que mudam por idioma ficam em { pt, en }.

export type Lang = 'pt' | 'en';
export type Localized = Record<Lang, string>;

export const profile = {
  name: 'Guilherme Xavier',
  shortName: 'xavr.dev',
  email: 'guilhermexavierdev@gmail.com',
  whatsapp: '5511940098765',
  whatsappDisplay: '+55 11 94009-8765',
  github: 'https://github.com/guixavr',
  linkedin: 'https://www.linkedin.com/in/guilhermexavr',
  resume: 'https://drive.google.com/file/d/1VxdwljuqtedL_m5LaPGEnAhfiqZwgb4r/view',
  yearsOfExperience: 6,
};

export function whatsappLink(lang: Lang) {
  const msg =
    lang === 'pt'
      ? 'Olá, Guilherme! Vi seu portfólio e gostaria de conversar sobre um projeto.'
      : "Hi Guilherme! I saw your portfolio and I'd like to talk about a project.";
  return `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(msg)}`;
}

// Clientes exibidos na faixa de logos. Sem logos por enquanto: o nome é
// renderizado como wordmark. Para usar um logo, adicione `logo: '/clients/x.svg'`
// e coloque o arquivo em public/clients/.
export const clients: { name: string; logo?: string }[] = [
  { name: 'T7 Adesivos' },
  { name: 'Suite IT Digital' },
  { name: 'Capuano Festas' },
  { name: 'Escola Ruah' },
];

// Projetos. `featured: true` aparece em destaque (cards grandes).
// TODO: revisar descrições, stack e links de cada projeto com os dados reais.
export type Project = {
  name: string;
  client: string;
  category: Localized;
  description: Localized;
  stack: string[];
  link?: string;
  linkLabel?: Localized;
  featured?: boolean;
  // Card largo (ocupa a linha inteira) com lista de destaques
  wide?: boolean;
  highlights?: Record<Lang, string[]>;
  // Cor usada na capa gerada do card (sem imagem)
  hue: number;
  // Imagem opcional da capa, ex.: '/projects/t7.webp' (em public/projects/)
  image?: string;
};

export const projects: Project[] = [
  {
    name: 'T7 Plus',
    client: 'T7 Adesivos',
    category: { pt: 'Sistema fullstack · Indústria', en: 'Fullstack system · Manufacturing' },
    description: {
      pt: 'Sistema de planejamento e controle de produção (PCP) da T7 Adesivos, desenvolvido de ponta a ponta: painel web para gestores e um totem touch para os operadores no chão de fábrica.',
      en: 'Production planning and control (PCP) system for T7 Adesivos, built end to end: a web dashboard for managers and a touch-screen kiosk for operators on the factory floor.',
    },
    highlights: {
      pt: [
        'Ordens de produção, programação, expedição e estatísticas em um só sistema',
        'Atualizações em tempo real via WebSocket entre o totem e o painel',
        'API própria em Node.js + Fastify com PostgreSQL, autenticação JWT e controle de acesso',
        'Funciona mesmo sem internet na fábrica, com servidor local e deploy automatizado via CI/CD',
        'Relatórios em PDF, gráficos, auditoria, backups e monitoramento de erros com Sentry',
      ],
      en: [
        'Production orders, scheduling, shipping and statistics in a single system',
        'Real-time updates over WebSocket between the kiosk and the dashboard',
        'Custom Node.js + Fastify API with PostgreSQL, JWT authentication and role-based access',
        'Keeps working without internet on the factory floor, with an on-premise server and automated CI/CD deploys',
        'PDF reports, charts, audit logs, backups and error monitoring with Sentry',
      ],
    },
    stack: ['Flutter', 'TypeScript', 'Node.js', 'Fastify', 'PostgreSQL', 'WebSocket', 'GitHub Actions', 'Sentry'],
    featured: true,
    wide: true,
    hue: 200,
  },
  {
    name: 'Escalleo',
    client: 'Produto próprio',
    category: { pt: 'SaaS próprio · App Android e web', en: 'Own SaaS · Android & web app' },
    description: {
      pt: 'Meu próprio SaaS, criado do zero: escalas, repertório e avisos em um só lugar para ministérios de louvor, bandas, corais e equipes de voluntários. Publicado na Google Play e na web, com planos por assinatura.',
      en: 'My own SaaS, built from scratch: schedules, setlists and announcements in one place for worship teams, bands, choirs and volunteer groups. Live on Google Play and the web, with subscription plans.',
    },
    highlights: {
      pt: [
        'Escalas por função com confirmação de presença, pedidos de troca e geração automática',
        'Repertório com letra, cifra, tom e BPM, e modo palco com transposição na hora',
        'Escalas disponíveis offline, com afinador e metrônomo embutidos',
        'Avisos, chat, notificações e agenda sincronizada com Google, iPhone e Outlook',
        'Cinco planos de assinatura cobrados pela Google Play, do grátis ao Platina',
      ],
      en: [
        'Role-based schedules with attendance confirmation, swap requests and automatic generation',
        'Setlists with lyrics, chords, key and BPM, plus a stage mode with on-the-fly transposition',
        'Schedules available offline, with a built-in tuner and metronome',
        'Announcements, chat, push notifications and calendar sync with Google, iPhone and Outlook',
        'Five subscription plans billed through Google Play, from free to Platinum',
      ],
    },
    stack: ['Android', 'PWA', 'Google Play Billing', 'Offline', 'Push notifications'],
    link: 'https://escalleo.com.br/',
    linkLabel: { pt: 'Conhecer o Escalleo', en: 'Visit Escalleo' },
    image: '/projects/escalleo.webp',
    featured: true,
    wide: true,
    hue: 240,
  },
  {
    name: 'Suite IT Digital',
    client: 'Suite IT Digital',
    category: { pt: 'Desenvolvimento mobile', en: 'Mobile development' },
    description: {
      pt: 'Desenvolvimento de aplicativos mobile para Android e iOS, da interface à integração com APIs, além de apoio em projetos web.',
      en: 'Mobile app development for Android and iOS, from the interface to API integration, plus support on web projects.',
    },
    stack: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
    featured: true,
    hue: 260,
  },
  {
    name: 'Capuano Festas',
    client: 'Capuano Festas',
    category: { pt: 'Site · Eventos', en: 'Website · Events' },
    description: {
      pt: 'Site da Capuano Festas, empresa de festas e eventos: apresentação dos serviços e caminho rápido para o cliente pedir orçamento.',
      en: 'Website for Capuano Festas, a party and events company: service showcase and a quick path for customers to request a quote.',
    },
    stack: ['Responsive UI', 'SEO'],
    link: 'https://www.capuanofestas.com.br/',
    linkLabel: { pt: 'Visitar site', en: 'Visit website' },
    featured: true,
    hue: 320,
  },
  {
    name: 'Escola Ruah',
    client: 'Escola Ruah',
    category: { pt: 'Site · Educação', en: 'Website · Education' },
    description: {
      pt: 'Site institucional da Escola Ruah, com informações para pais e responsáveis, proposta pedagógica e canais de contato para matrículas.',
      en: "Institutional website for Escola Ruah, with information for parents, the school's pedagogical approach and contact channels for enrollment.",
    },
    stack: ['Responsive UI', 'SEO'],
    link: 'https://www.escolaruah.com.br/',
    linkLabel: { pt: 'Visitar site', en: 'Visit website' },
    featured: true,
    hue: 150,
  },
  {
    name: 'NoteNow',
    client: 'Produto próprio',
    category: { pt: 'App de notas', en: 'Notes app' },
    description: {
      pt: 'Aplicativo de notas publicado na Google Play, que funciona sem conta e guarda tudo no aparelho. Tem versão gratuita com anúncios e versão Pro.',
      en: 'Note-taking app published on Google Play that works without an account and keeps everything on the device. Free ad-supported version and a Pro version.',
    },
    stack: ['Flutter', 'Dart', 'AdMob'],
    link: 'https://play.google.com/store/apps/details?id=notenow.app',
    linkLabel: { pt: 'Ver na Google Play', en: 'View on Google Play' },
    hue: 40,
  },
  {
    name: 'Gemla',
    client: 'Produto próprio',
    category: { pt: 'Jogo mobile', en: 'Mobile game' },
    description: {
      pt: 'Jogo de quebra-cabeça de blocos com fases, desafio diário com ranking entre jogadores, progresso sincronizado na nuvem e login com Google.',
      en: 'Block puzzle game with levels, a daily challenge with a player leaderboard, cloud-synced progress and Google sign-in.',
    },
    stack: ['Firebase', 'Google Sign-In', 'AdMob'],
    hue: 290,
  },
];

// Stack agrupada por área.
// TODO: confirmar o que entra e o que sai.
export const stack: { area: Localized; items: string[] }[] = [
  {
    area: { pt: 'Front-end & Web', en: 'Front-end & Web' },
    items: ['TypeScript', 'React', 'Next.js', 'Astro', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    area: { pt: 'Mobile', en: 'Mobile' },
    items: ['Flutter', 'Dart', 'GetX', 'Android', 'iOS'],
  },
  {
    area: { pt: 'Back-end & Dados', en: 'Back-end & Data' },
    items: ['Node.js', 'Fastify', 'PostgreSQL', 'REST APIs', 'WebSocket', 'Firebase', 'Dart (backend)'],
  },
  {
    area: { pt: 'Qualidade & Processo', en: 'Quality & Process' },
    items: ['Git/GitHub', 'GitHub Actions', 'Docker', 'Sentry', 'Vitest', 'Appium', 'Postman/Insomnia', 'Scrum'],
  },
];
