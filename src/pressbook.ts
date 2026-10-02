// ==========================================================
// PRESSBOOK — données du flipbook de la section DESIGN GRAPHIQUE
//
// Les pages ne sont pas codées en dur ici : elles sont dérivées
// du projet `pressbook-brain-2024` déclaré dans src/projects.ts,
// qui fournit déjà les trois résolutions (thumb / card / full).
//
// Pour changer le nombre de pages ou remplacer un visuel, c'est
// donc dans src/projects.ts qu'il faut intervenir :
//   · PRESSBOOK_PAGES  -> la liste des numéros de page présents
//   · PRESSBOOK_*      -> les dossiers source des trois résolutions
// ==========================================================

import { getProject } from './projects'

/** Résolution chargée pour le livre intégré à la section. */
export type PressbookRes = 'thumb' | 'card' | 'full'

export interface PressbookPage {
  /** Numéro de page dans l'ouvrage source (0002 -> 2). */
  page: number
  thumb: string
  card: string
  full: string
  alt: string
}

const pressbook = getProject('pressbook-brain-2024')

if (!pressbook || !pressbook.gallery?.length) {
  throw new Error(
    "Pressbook introuvable : vérifie que le projet 'pressbook-brain-2024' existe " +
      'dans src/projects.ts avec une galerie renseignée.'
  )
}

export const PRESSBOOK_TITLE = pressbook.title
export const PRESSBOOK_YEAR = pressbook.year ?? ''

/** Toutes les pages disponibles, dans l'ordre de l'ouvrage. */
export const PRESSBOOK_PAGES: PressbookPage[] = pressbook.gallery!.map((g) => ({
  page: g.page,
  thumb: g.thumb,
  card: g.src,
  full: g.full,
  alt: g.alt ?? `${PRESSBOOK_TITLE} — page ${g.page}`,
}))

/** Nombre total de pages réellement présentes. */
export const PRESSBOOK_PAGE_COUNT = PRESSBOOK_PAGES.length

/**
 * Nombre de doubles-pages. 34 pages -> 17 doubles-pages.
 * Jamais codé en dur : recalculé à chaque build.
 */
export const PRESSBOOK_SPREADS = Math.ceil(PRESSBOOK_PAGE_COUNT / 2)

/**
 * Modèle physique du livre.
 *
 * Le livre compte une feuille de couverture en plus des feuilles de contenu,
 * ce qui décale la numérotation d'une page (la couverture occupies la position 0).
 *
 *   feuille 0            : couverture (face avant) + faux page (face arrière)
 *   feuille k (k >= 1)   : page p[2k-1] au recto / page p[2k] au verso
 *
 * Avec 34 pages on obtient 18 feuilles et 17 doubles-pages :
 *   double-page 01 -> p[0] | p[1]
 *   double-page 17 -> p[32] | p[33]
 */
export interface PressbookSheet {
  /** Index de la feuille, 0 = couverture. */
  index: number
  /** Numéro de feuille réellement tournée quand le livre est ouvert (0 = fermé). */
  spread: number
  /** Image du recto, ou null pour la couverture. */
  front: PressbookPage | null
  /** Image du verso, ou null pour le faux page final. */
  back: PressbookPage | null
  /** true si cette feuille porte la couverture. */
  isCover: boolean
}

const at = (i: number): PressbookPage | null => PRESSBOOK_PAGES[i] ?? null

export const PRESSBOOK_SHEETS: PressbookSheet[] = [
  // La couverture porte p[0] en illustration et le même visuel en verso,
  // ce qui rend la double-page 01 complète : (p[0] | p[1]).
  { index: 0, spread: 0, front: null, back: PRESSBOOK_PAGES[0] ?? null, isCover: true },
  ...Array.from({ length: PRESSBOOK_SPREADS }, (_, n) => {
    const k = n + 1
    return {
      index: k,
      spread: k,
      front: at(2 * k - 1),
      back: at(2 * k),
      isCover: false,
    }
  }),
]

/** Résolution d'une page pour un mode d'affichage donné. */
export const pressbookSrc = (page: PressbookPage | null, res: PressbookRes): string =>
  page ? page[res] : ''

/**
 * Texte de la carte, généré à partir des données pour rester cohérent
 * si le nombre de pages change.
 */
export const PRESSBOOK_SUMMARY =
  `Un ouvrage de ${PRESSBOOK_PAGE_COUNT} pages, composé et mis en page, ` +
  'décliné en deux formats de diffusion (verso/recto) et livré en version numérique.'
