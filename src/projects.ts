// ==========================================================
//  PROJETS DESIGN — KEMBOU Portfolio
// ==========================================================
//  Ce fichier ne contient QUE les ouvrages de design graphique
//  (galeries d'images). Les 15 travaux vidéo ne sont pas ici :
//  ils sont hébergés sur Wistia et décrits dans src/wistia.ts.
//
//  ⚠️  AUCUN FICHIER VIDÉO N'EST STOCKÉ DANS CE DÉPÔT.
// ==========================================================

// ---------- Types ----------

export type GalleryImage = {
  thumb?: string   // vignette de la bande de navigation (200px, ~5 Ko)
  src: string      // version carte (900px)
  full: string     // version plein écran (2000px)
  w: number
  h: number
  alt: string
  page?: number
}

/** Type de contenu : ouvrage design (les vidéos vivent dans src/wistia.ts). */
export type ProjectKind = 'design'

export type Project = {
  id: string
  title: string
  kind: ProjectKind
  category: string
  categoryLabel: string
  /** Aperçu affiché sur la carte. */
  thumbnail: string
  /** Pages d'un ouvrage design. */
  gallery?: GalleryImage[]
  width?: number
  height?: number
  year?: string
}

// ---------- Design graphique : 1 ouvrage réel, 34 pages ----------

/** Pages réellement présentes (la 0001 et la 0023 ne sont pas dans le dossier). */
const PRESSBOOK_PAGES = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
]

const PRESSBOOK_CARD = '/media/design/pressbook-brain-2024/card'
const PRESSBOOK_FULL = '/media/design/pressbook-brain-2024/full'
const PRESSBOOK_THUMB = '/media/design/pressbook-brain-2024/thumb'

const pad4 = (n: number) => String(n).padStart(4, '0')

const pressbookGallery: GalleryImage[] = PRESSBOOK_PAGES.map((p) => ({
  // thumb : bande de vignettes (200px, 184 Ko pour les 34 pages)
  // src   : version carte affichée dans le flipbook (900px)
  // full  : image affichée dans le flipbook plein écran (2000px)
  thumb: `${PRESSBOOK_THUMB}/page-${pad4(p)}.jpg`,
  src: `${PRESSBOOK_CARD}/page-${pad4(p)}.jpg`,
  full: `${PRESSBOOK_FULL}/page-${pad4(p)}.jpg`,
  w: 900,
  h: 506,
  alt: `Pressbook Brain 2024 — page ${p}`,
  page: p,
}))

/** Ouvrages de design graphique du portfolio. */
export const PROJECTS: Project[] = [
  {
    id: 'pressbook-brain-2024',
    title: 'Pressbook Brain 2024',
    kind: 'design',
    category: 'pressbook',
    categoryLabel: 'PRESSBOOK',
    thumbnail: `${PRESSBOOK_CARD}/page-0002.jpg`,
    gallery: pressbookGallery,
    width: 3557,
    height: 2000,
    year: '2024',
  },
]

// ---------- Sélecteurs ----------

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id)

export const getProjects = () => PROJECTS