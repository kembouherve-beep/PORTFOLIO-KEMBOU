// Données du portfolio KEMBOU — facilement configurables

export const IDENTITY = {
  name: 'KEMBOU',
  role: 'Designer - Monteur Vidéos',
  tagline: 'Je donne vie à vos idées à travers des vidéos percutantes, du montage créatif et un storytelling qui marque les esprits.',
  slogan: 'Je transforme vos idées en images qui racontent.',
  yearsExperience: 10,
  projectsCount: 500,
  portrait: '/static/images/kembou-2.jpg',
  heroImage: '/static/images/kembou-hero.jpg',
  bio: `Professionnel de l'image et de la narration visuelle, KEMBOU accompagne les marques, entreprises, institutions et créateurs dans la conception et la réalisation de contenus audiovisuels professionnels. Son expertise couvre le tournage, le montage vidéo, la post-production, le motion design, l'habillage audiovisuel et la création de contenus numériques.`,
  professions: [
    'Technicien supérieur en audiovisuel et photographie',
    'Vidéaste',
    'Monteur vidéo',
    'Motion designer',
    'Créatif digital'
  ],
  contact: {
    email: 'kembouherve@gmail.com',
    phone: '+225 07 59 27 88 22',
    phoneSecondary: '+225 07 11 35 63 24',
    whatsapp: '+225 07 59 27 88 22',
    address: 'Abidjan, Côte d\'Ivoire',
    country: 'Côte d\'Ivoire',
    linkedin: 'https://www.linkedin.com/in/herve-kembou-7b75781a5/?isSelfProfile=true',
    facebook: 'https://www.facebook.com/hervekembou/',
    instagram: 'https://www.instagram.com/kembou',
    youtube: 'https://www.youtube.com/@kembou-h'
  }
}

export const NAV_ITEMS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'profil', label: 'À propos' },
  { id: 'design-graphique', label: 'Design' },
  { id: 'projets', label: 'Travaux' },
  { id: 'competences', label: 'Compétences' },
  { id: 'experience', label: 'Expérience' },
  { id: 'outils', label: 'Outils' },
  { id: 'contact', label: 'Contact' }
]

export const STATS = [
  { value: '+10', label: 'Années d\'expérience', icon: 'fa-award' },
  { value: 'VIDEO', label: 'Post-production', icon: 'fa-film' },
  { value: 'MOTION', label: 'Design', icon: 'fa-wand-magic-sparkles' },
  { value: 'DIGITAL', label: '& Web', icon: 'fa-code' }
]

export const SKILLS = [
  {
    id: 'montage',
    number: '01',
    title: 'MONTAGE VIDÉO',
    description: 'Donner du rythme, du sens et de l\'émotion aux images.',
    icon: 'fa-clapperboard',
    accent: 'from-amber-400/20 to-transparent',
    tags: [
      'Montage institutionnel', 'Films corporate', 'Interviews', 'Reportages',
      'Contenus réseaux sociaux', 'Films publicitaires', 'Formats TV',
      'Formats web', 'Étalonnage', 'Sound design'
    ]
  },
  {
    id: 'motion',
    number: '02',
    title: 'MOTION DESIGN & HABILLAGE TV',
    description: 'Transformer l\'information en expérience visuelle.',
    icon: 'fa-wand-magic-sparkles',
    accent: 'from-sky-400/20 to-transparent',
    tags: [
      'Habillage TV', 'Génériques', 'Titres animés', 'Lower thirds',
      'Transitions', 'Infographies animées', 'Motion graphics',
      'Animations 2D', 'Effets visuels'
    ]
  },
  {
    id: 'uiux',
    number: '03',
    title: 'UI / UX DESIGN',
    description: 'Concevoir des interfaces simples, modernes et efficaces.',
    icon: 'fa-object-group',
    accent: 'from-violet-400/20 to-transparent',
    tags: [
      'Wireframes', 'Design d\'interface', 'Prototypage',
      'Design systems', 'Responsive design', 'Expérience utilisateur'
    ]
  },
  {
    id: 'web',
    number: '04',
    title: 'DÉVELOPPEMENT WEB',
    description: 'Transformer une identité visuelle en expérience web.',
    icon: 'fa-code',
    accent: 'from-emerald-400/20 to-transparent',
    tags: [
      'Sites vitrines', 'Interfaces web', 'WordPress', 'Front-end',
      'Intégration responsive', 'Interfaces modernes', 'Expériences interactives'
    ]
  },
  {
    id: 'graphisme',
    number: '05',
    title: 'DESIGN GRAPHIQUE',
    description: 'Donner une identité forte à chaque projet.',
    icon: 'fa-palette',
    accent: 'from-rose-400/20 to-transparent',
    tags: [
      'Identité visuelle', 'Affiches', 'Supports publicitaires',
      'Réseaux sociaux', 'Présentations', 'Supports print', 'Création graphique'
    ]
  }
]


// ==========================================================
//  NOTE : les données des œuvres (catégories, works vidéo Wistia,
//  ouvrage design, médias) vivent dans `src/projects.ts`.
//  Le pressbook est dérivé du projet `pressbook-brain-2024`.
// ==========================================================

export const EXPERIENCES = [
  {
    company: 'RTI1',
    role: 'Monteur vidéo & Motion Designer',
    projects: ['Éco à la Une', 'La Côte d\'Ivoire en marche'],
    description: 'Post-production, habillage graphique et motion design pour les émissions institutionnelles et économiques de la chaîne nationale.',
    icon: 'fa-tv',
    highlight: true
  },
  {
    company: 'UNICEF',
    role: 'Vidéaste & Post-production',
    projects: ['Campagnes institutionnelles'],
    description: 'Production de contenus vidéo pour les campagnes de sensibilisation et de communication institutionnelle.',
    icon: 'fa-hand-holding-heart',
    highlight: true
  },
  {
    company: 'TELECEL',
    role: 'Motion Designer & Créatif Digital',
    projects: ['Habillage motion', 'Contenus digitaux'],
    description: 'Création d\'habillages motion et de contenus digitaux pour la marque télécom.',
    icon: 'fa-signal',
    highlight: true
  },
  {
    company: 'DYCOCO Comedy Club',
    role: 'Monteur & Post-production',
    projects: ['Captations & Montages'],
    description: 'Montage et post-production de spectacles de stand-up et contenus digitaux.',
    icon: 'fa-microphone',
    highlight: false
  },
  {
    company: 'HIMAJE PLUS',
    role: 'Motion Designer & Habillage',
    projects: ['Habillage complet', 'Génériques'],
    description: 'Conception d\'habillages graphiques animés et création de contenus visuels.',
    icon: 'fa-video',
    highlight: false
  },
  {
    company: 'Production TV / Live',
    role: 'Supervision de production & Post-production',
    projects: ['Direct TV', 'Post-production'],
    description: 'Supervision et coordination de productions télévisuelles en direct et différé.',
    icon: 'fa-broadcast-tower',
    highlight: false
  },
  {
    company: 'Digital / WordPress',
    role: 'Développeur Web & UI Designer',
    projects: ['Sites vitrines', 'Interfaces web'],
    description: 'Conception d\'interfaces web modernes et développement de sites WordPress sur mesure.',
    icon: 'fa-globe',
    highlight: false
  }
]

export const TOOLS = [
  { name: 'Premiere Pro', role: 'Montage vidéo professionnel', color: '#9999FF', bg: '#2A0634', short: 'Pr' },
  { name: 'After Effects', role: 'Motion design & effets visuels', color: '#D291FF', bg: '#1D0A2A', short: 'Ae' },
  { name: 'DaVinci Resolve', role: 'Étalonnage & post-production', color: '#F5A623', bg: '#1A1A1A', short: 'DR' },
  { name: 'Final Cut Pro', role: 'Montage vidéo Apple', color: '#00A8E8', bg: '#0F1E2E', short: 'FC' },
  { name: 'Photoshop', role: 'Retouche & création graphique', color: '#31A8FF', bg: '#001E36', short: 'Ps' },
  { name: 'Cinema 4D', role: 'Animation & 3D', color: '#0099FF', bg: '#001A33', short: 'C4' },
  { name: 'WordPress', role: 'Développement web & CMS', color: '#21759B', bg: '#0A1929', short: 'Wp' },
  { name: 'Figma', role: 'UI / UX Design & prototypage', color: '#F24E1E', bg: '#1A0A05', short: 'Fg' }
]

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'ÉCOUTE',
    description: 'Comprendre le besoin.',
    detail: 'Analyse du brief, échange avec le client, identification des objectifs et des enjeux du projet.',
    icon: 'fa-ear-listen'
  },
  {
    number: '02',
    title: 'CONCEPTION',
    description: 'Définir l\'idée et la direction visuelle.',
    detail: 'Recherche créative, moodboard, storyboard, définition de la ligne artistique et validation.',
    icon: 'fa-lightbulb'
  },
  {
    number: '03',
    title: 'PRODUCTION',
    description: 'Tournage / création / design.',
    detail: 'Réalisation des prises de vue, création des visuels, animation des éléments graphiques.',
    icon: 'fa-camera'
  },
  {
    number: '04',
    title: 'POST-PRODUCTION',
    description: 'Montage, motion design, étalonnage et finition.',
    detail: 'Montage narratif, habillage motion, étalonnage colorimétrique, mixage sonore et finitions.',
    icon: 'fa-sliders'
  },
  {
    number: '05',
    title: 'LIVRAISON',
    description: 'Optimisation des formats et diffusion.',
    detail: 'Exports multi-formats, adaptation aux plateformes cibles, remise finale et suivi de diffusion.',
    icon: 'fa-rocket'
  }
]
