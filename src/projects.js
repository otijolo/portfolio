export const projects = [
  {
    id: "abeia",
    title: "Abeia",
    year: "2026",
    collections: ["interfaces", "codigos"],
    category: "design",
    categoryLabel: "APLICATIVO / PWA",
    featured: true,
    tagline: "Aplicativo pra gestão de apiários e colmeias.",
    description:
      "O Abeia é um aplicativo pra ajudar apicultores a cuidar dos seus apiários e colmeias. Dá pra registrar inspeções, acompanhar a produção de mel, consultar alertas e localizar os apiários no mapa.",
    role: "Criei as interfaces e os elementos visuais no Figma, além da animação de carregamento. O projeto evoluiu pra um PWA com foco no celular, usando React e TypeScript, API em Java e Spring Boot, login e banco de dados no Firebase.",
    credit:
      "Projeto acadêmico desenvolvido em equipe. O aplicativo tem uma demonstração com dados de exemplo e contas com cadastros separados por usuário.",
    image: "assets/images/projects/abeia-tela-05.png",
    gallery: Array.from({ length: 27 }, (_, index) => index + 1)
      .filter((number) => number !== 5 && number !== 12)
      .map((number) => ({
        src: `assets/images/projects/abeia-tela-${String(number).padStart(2, "0")}.png`,
        caption: `Abeia — Tela ${String(number).padStart(2, "0")}`,
      })),
  },
  {
    id: "folclore",
    title: "Outra Rodada",
    year: "2026",
    collections: ["jogos"],
    category: "arte",
    categoryLabel: "DIREÇÃO CRIATIVA / PERSONAGENS",
    featured: true,
    tagline: "Jogo de terror e estratégia com dados e folclore brasileiro.",
    description:
      "Outra Rodada é um jogo de terror e estratégia por turnos inspirado no folclore brasileiro. Um lenhador perdido vai parar num bar misterioso, onde precisa apostar nos dados pra tentar sair. Já dá pra baixar e jogar no itch.io, e a gente continua trabalhando em melhorias!",
    role: "Defini a direção criativa, o tom visual e as referências artísticas do projeto. Desenhei os personagens mostrados nas cenas e suas variações de poses e expressões.",
    credit:
      "Crédito da equipe: cenários e objetos foram ilustrados por outro integrante. As cenas completas são trabalho colaborativo.",
    image: "assets/images/projects/folclore-bar.webp",
    gallery: [
      {
        src: "assets/images/projects/folclore-curupira.webp",
        caption: "Outra cena e personagem desenhado por mim",
      },
    ],
    artworkNote:
      "TODO: adicionar folhas de personagem (poses/expressões) pra mostrar seu processo.",
  },
  {
    id: "insetonauta",
    title: "Insetonautas",
    year: "2025",
    collections: ["jogos"],
    category: "arte",
    categoryLabel: "PIXEL ART / PERSONAGENS",
    featured: true,
    tagline: "Bichos carismáticos em várias resoluções.",
    description:
      "Jogo educativo de temática ambiental, com personagens cartunescos, sprites e cenários em pixel art.",
    role: "Criação de desenhos e sprites de personagens, incluindo versões detalhadas e reduzidas, além de arte visual pra a tela inicial.",
    credit:
      "Projeto colaborativo. Ao publicar, especifique os outros responsáveis por código, áudio e demais elementos.",
    image: "assets/images/projects/insetonautas.png",
    gallery: [
      {
        src: "assets/images/projects/insetonautas-menu.png",
        caption: "Insetonautas — Menu",
      },
    ],
    artworkNote:
      "TODO: exportar um sprite-sheet legível e o GIF do menu em tamanho adequado.",
  },
  {
    id: "unifor-hub",
    title: "Unifor Hub",
    year: "2026",
    collections: ["interfaces", "codigos"],
    category: "design",
    categoryLabel: "SISTEMA WEB / GESTÃO",
    featured: true,
    tagline: "Sistema de gestão e acompanhamento de startups.",
    description:
      "O Unifor Hub é um sistema web pra equipe acompanhar startups nas etapas de pré-aceleração, aceleração e incubação. Reúne cadastros, checkpoints, IRLs e OKRs, mentorias, workshops e documentos, com um painel de indicadores.",
    role: "Participei do design da tela inicial e dos elementos de interface no Figma. O projeto evoluiu pra uma aplicação em React, com login pelo Firebase e uma API em Node.js e Express preparada pra persistência em MySQL.",
    credit:
      "Projeto acadêmico desenvolvido em equipe. Inclui perfis de coordenador, analista e bolsista, com acesso organizado por trilha, além de um modo de demonstração com dados de exemplo.",
    image: "assets/images/projects/unifor-hub-login.png",
    gallery: [
      {
        src: "assets/images/projects/unifor-hub-irl-okrs.png",
        caption: "Unifor Hub — IRLs e OKRs",
      },
      {
        src: "assets/images/projects/unifor-hub-dashboard.png",
        caption: "Unifor Hub — Dashboard",
      },
    ],
  },
  {
    id: "loja",
    title: "A própria loja",
    year: "2026",
    collections: ["interfaces", "codigos"],
    category: "codigo",
    categoryLabel: "PORTFÓLIO / WEB",
    featured: false,
    tagline: "Meu portfólio é uma lojinha de RPG.",
    description:
      "Portfólio interativo inspirado em RPGs clássicos, com mercador, cenário ilustrado, inventário de projetos e diálogos.",
    role: "Concepção da experiência, direção visual e ilustrações autorais.",
    credit: "Artes e identidade visual por Juan Carlos.",
    image: "assets/images/projects/loja-inicio.png",
    gallery: [
      {
        src: "assets/images/projects/loja-projetos.png",
        caption: "A própria loja — Projetos",
      },
      {
        src: "assets/images/projects/loja-habilidades.png",
        caption: "A própria loja — Habilidades",
      },
      {
        src: "assets/images/projects/loja-porta.png",
        caption: "A própria loja — Porta de entrada",
      },
    ],
  },
  {
    id: "acessa",
    title: "Acessa",
    year: "2026",
    collections: ["interfaces", "codigos"],
    category: "codigo",
    categoryLabel: "APP / PROJETO ACADÊMICO",
    featured: false,
    tagline: "Acessibilidade urbana em aplicativo móvel.",
    description:
      "Aplicativo acadêmico de mapeamento e avaliação de locais quanto à acessibilidade.",
    role: "Projeto presente no portfólio original. TODO: detalhar minha contribuição individual antes de divulgação profissional.",
    credit: "Equipe e divisão de responsabilidades a completar.",
    image: "assets/images/projects/acessa.jpeg",
    gallery: [],
  },
  {
    id: "pergaminho",
    title: "Pergaminho de Funções",
    year: "2026",
    collections: ["jogos", "codigos"],
    category: "codigo",
    categoryLabel: "JOGO EDUCATIVO",
    featured: false,
    tagline: "Puzzle matemático com fantasia medieval.",
    description:
      "Jogo educativo sobre funções matemáticas, ambientado em um universo de magia. Pretendo colocar mais umas coisinhas nele pra futuramente lançar no itch.io.",
    role: "Projeto presente no portfólio original. TODO: detalhar minha contribuição individual antes de divulgação profissional.",
    credit: "Equipe e divisão de responsabilidades a completar.",
    image: "assets/images/projects/pergaminho_de_funcoes.png",
    gallery: [],
  },
  {
    id: "caiabreso",
    title: "caIAbreso",
    year: "2025",
    collections: ["codigos"],
    category: "codigo",
    categoryLabel: "APLICATIVO / EXPERIMENTO",
    featured: false,
    tagline: "Projeto universitário com humor.",
    description:
      "Aplicativo com proposta cômica, criado em contexto universitário.",
    role: "Projeto presente no portfólio original. TODO: detalhar minha contribuição individual antes de divulgação profissional.",
    credit: "Equipe e divisão de responsabilidades a completar.",
    image: "assets/images/projects/caiabreso2.jpeg",
    gallery: [],
  },
];
