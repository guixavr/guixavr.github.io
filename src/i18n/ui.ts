import type { Lang } from '../data/site';

const pt = {
  meta: {
    title: 'Guilherme Xavier · Desenvolvedor Fullstack',
    description:
      'Desenvolvedor Fullstack com 6 anos de experiência. Crio sites, aplicativos e sistemas web rápidos, bonitos e que geram resultado para o seu negócio.',
  },
  nav: {
    services: 'Serviços',
    work: 'Projetos',
    about: 'Sobre',
    process: 'Processo',
    contact: 'Contato',
    cta: 'Fale comigo',
    menu: 'Menu',
    switchLang: 'English',
  },
  hero: {
    badge: 'Disponível para novos projetos',
    titleA: 'Sites, apps e sistemas',
    titleB: 'que fazem seu negócio crescer.',
    subtitle:
      'Sou Guilherme Xavier, desenvolvedor Fullstack com 6 anos de experiência. Do primeiro rascunho à publicação, entrego produtos digitais rápidos, bem construídos e fáceis de manter.',
    primary: 'Conversar no WhatsApp',
    secondary: 'Ver projetos',
  },
  stats: [
    { value: '6+', label: 'anos de experiência' },
    { value: 'Web + Mobile', label: 'de ponta a ponta' },
    { value: '100%', label: 'responsivo e otimizado' },
  ],
  clients: { title: 'Empresas que confiaram no meu trabalho' },
  services: {
    eyebrow: 'Serviços',
    title: 'O que eu posso construir para você',
    subtitle: 'Soluções completas, do design da interface ao servidor, com foco em performance e resultado.',
    items: [
      {
        icon: 'web',
        title: 'Sites e landing pages',
        text: 'Páginas rápidas, otimizadas para o Google e pensadas para transformar visitantes em clientes.',
      },
      {
        icon: 'mobile',
        title: 'Aplicativos mobile',
        text: 'Apps para Android e iOS com Flutter, publicados nas lojas e prontos para escalar.',
      },
      {
        icon: 'system',
        title: 'Sistemas web e APIs',
        text: 'Painéis, áreas de cliente e integrações sob medida para automatizar a sua operação.',
      },
      {
        icon: 'support',
        title: 'Manutenção e evolução',
        text: 'Melhorias contínuas, correções e novas funcionalidades em produtos que já existem.',
      },
    ],
  },
  work: {
    eyebrow: 'Projetos',
    title: 'Trabalhos selecionados',
    subtitle: 'Alguns dos projetos que desenvolvi para empresas de diferentes segmentos.',
    more: 'Outros projetos',
    client: 'Cliente',
  },
  about: {
    eyebrow: 'Sobre',
    title: 'Um desenvolvedor que entende de negócio',
    paragraphs: [
      'Há 6 anos desenvolvo software para empresas de todos os tamanhos, de pequenos negócios a indústrias e empresas de tecnologia.',
      'Atuo de ponta a ponta: front-end, mobile e back-end. Isso significa um único ponto de contato, menos ruído na comunicação e um produto coerente do início ao fim.',
      'Meu foco é entregar o que gera resultado: código limpo, performance, prazos claros e comunicação transparente durante todo o projeto.',
    ],
    stackTitle: 'Tecnologias que uso no dia a dia',
    resume: 'Ver currículo',
  },
  process: {
    eyebrow: 'Processo',
    title: 'Como trabalhamos juntos',
    steps: [
      { title: 'Conversa inicial', text: 'Entendo o seu negócio, objetivos e público. Sem compromisso.' },
      { title: 'Proposta e escopo', text: 'Você recebe escopo, prazo e investimento definidos antes de começar.' },
      { title: 'Desenvolvimento', text: 'Entregas frequentes para você acompanhar e opinar a cada etapa.' },
      { title: 'Publicação e suporte', text: 'Coloco no ar, configuro tudo e continuo disponível depois da entrega.' },
    ],
  },
  faq: {
    eyebrow: 'Dúvidas',
    title: 'Perguntas frequentes',
    items: [
      {
        q: 'Quanto custa um projeto?',
        a: 'Depende do escopo. Depois de uma conversa rápida envio uma proposta com valor fechado, sem surpresas no meio do caminho.',
      },
      {
        q: 'Quanto tempo leva?',
        a: 'Uma landing page costuma ficar pronta em poucas semanas. Apps e sistemas variam conforme as funcionalidades, e o prazo é definido na proposta.',
      },
      {
        q: 'Você cuida da hospedagem e do domínio?',
        a: 'Sim. Posso orientar a compra do domínio, configurar a hospedagem e deixar tudo no ar para você.',
      },
      {
        q: 'E depois que o projeto for entregue?',
        a: 'Ofereço suporte e planos de manutenção para correções, melhorias e novas funcionalidades.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contato',
    title: 'Vamos tirar sua ideia do papel?',
    subtitle: 'Conte um pouco sobre o seu projeto. Respondo em até 1 dia útil.',
    whatsapp: 'Chamar no WhatsApp',
    email: 'Enviar e-mail',
    copy: 'Copiar e-mail',
    copied: 'Copiado!',
  },
  footer: {
    rights: 'Todos os direitos reservados.',
    backToTop: 'Voltar ao topo',
    apps: 'Apps',
    privacy: 'Política de privacidade',
    deleteAccount: 'Excluir conta',
  },
  notFound: {
    title: 'Página não encontrada',
    text: 'O endereço que você acessou não existe.',
    back: 'Voltar para o início',
  },
};

type Dict = typeof pt;

const en: Dict = {
  meta: {
    title: 'Guilherme Xavier · Fullstack Developer',
    description:
      'Fullstack Developer with 6 years of experience. I build fast, beautiful websites, apps and web systems that drive results for your business.',
  },
  nav: {
    services: 'Services',
    work: 'Work',
    about: 'About',
    process: 'Process',
    contact: 'Contact',
    cta: "Let's talk",
    menu: 'Menu',
    switchLang: 'Português',
  },
  hero: {
    badge: 'Available for new projects',
    titleA: 'Websites, apps and systems',
    titleB: 'that grow your business.',
    subtitle:
      "I'm Guilherme Xavier, a Fullstack Developer with 6 years of experience. From the first sketch to launch, I ship fast, well-built digital products that are easy to maintain.",
    primary: 'Chat on WhatsApp',
    secondary: 'See my work',
  },
  stats: [
    { value: '6+', label: 'years of experience' },
    { value: 'Web + Mobile', label: 'end to end' },
    { value: '100%', label: 'responsive & optimized' },
  ],
  clients: { title: 'Companies that trusted my work' },
  services: {
    eyebrow: 'Services',
    title: 'What I can build for you',
    subtitle: 'Complete solutions, from interface design to the server, focused on performance and results.',
    items: [
      {
        icon: 'web',
        title: 'Websites & landing pages',
        text: 'Fast, SEO-optimized pages designed to turn visitors into customers.',
      },
      {
        icon: 'mobile',
        title: 'Mobile apps',
        text: 'Android and iOS apps built with Flutter, published to the stores and ready to scale.',
      },
      {
        icon: 'system',
        title: 'Web systems & APIs',
        text: 'Dashboards, customer portals and custom integrations to automate your operation.',
      },
      {
        icon: 'support',
        title: 'Maintenance & growth',
        text: 'Continuous improvements, fixes and new features for existing products.',
      },
    ],
  },
  work: {
    eyebrow: 'Work',
    title: 'Selected work',
    subtitle: "A few of the projects I've built for companies across different industries.",
    more: 'More projects',
    client: 'Client',
  },
  about: {
    eyebrow: 'About',
    title: 'A developer who understands business',
    paragraphs: [
      "For 6 years I've been building software for companies of all sizes, from small businesses to manufacturers and technology companies.",
      'I work end to end: front-end, mobile and back-end. That means a single point of contact, less noise and a consistent product from start to finish.',
      'My focus is delivering what drives results: clean code, performance, clear deadlines and transparent communication throughout the project.',
    ],
    stackTitle: 'Technologies I use every day',
    resume: 'View résumé',
  },
  process: {
    eyebrow: 'Process',
    title: 'How we work together',
    steps: [
      { title: 'Discovery call', text: 'I learn about your business, goals and audience. No strings attached.' },
      { title: 'Proposal & scope', text: 'You get a defined scope, timeline and budget before we start.' },
      { title: 'Development', text: 'Frequent deliveries so you can follow along and give feedback.' },
      { title: 'Launch & support', text: "I put it live, set everything up and stay available after delivery." },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    items: [
      {
        q: 'How much does a project cost?',
        a: 'It depends on the scope. After a quick call I send a fixed-price proposal, with no surprises along the way.',
      },
      {
        q: 'How long does it take?',
        a: 'A landing page is usually ready in a few weeks. Apps and systems vary with the feature set, and the timeline is defined in the proposal.',
      },
      {
        q: 'Do you handle hosting and domain?',
        a: 'Yes. I can guide you through buying a domain, set up hosting and get everything live for you.',
      },
      {
        q: 'What happens after delivery?',
        a: 'I offer support and maintenance plans for fixes, improvements and new features.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: "Let's bring your idea to life",
    subtitle: 'Tell me a bit about your project. I reply within 1 business day.',
    whatsapp: 'Message on WhatsApp',
    email: 'Send an email',
    copy: 'Copy email',
    copied: 'Copied!',
  },
  footer: {
    rights: 'All rights reserved.',
    backToTop: 'Back to top',
    apps: 'Apps',
    privacy: 'Privacy policy',
    deleteAccount: 'Delete account',
  },
  notFound: {
    title: 'Page not found',
    text: "The page you're looking for doesn't exist.",
    back: 'Back to home',
  },
};

export const ui: Record<Lang, Dict> = { pt, en };
export const t = (lang: Lang) => ui[lang];
export const homePath = (lang: Lang) => (lang === 'pt' ? '/' : '/en/');
