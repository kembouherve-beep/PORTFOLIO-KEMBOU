// ==========================================================
//  PRESSBOOK — données du slider de la section DESIGN GRAPHIQUE
//
//  Les pages ne sont pas codées en dur ici : elles sont dérivées
//  du projet `pressbook-brain-2024` déclaré dans src/projects.ts,
//  qui fournit déjà les trois résolutions (thumb / card / full).
//
//  Pour changer le nombre de pages ou remplacer un visuel, c'est
//  donc dans src/projects.ts qu'il faut intervenir :
//   · PRESSBOOK_PAGES  -> la liste des numéros de page présents
//   · PRESSBOOK_*      -> les dossiers source des trois résolutions
// ==========================================================

import { getProject } from './projects'

/** Résolution chargée pour le slider intégré à la section. */
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

/** Nombre total de pages réellement présentes. Jamais codé en dur. */
export const PRESSBOOK_PAGE_COUNT = PRESSBOOK_PAGES.length

/** Résolution d'une page pour un mode d'affichage donné. */
export const pressbookSrc = (page: PressbookPage | null, res: PressbookRes): string =>
  page ? page[res] : ''

/**
 * Liste plate des sources pour une résolution donnée.
 *
 * Passée au navigateur via `data-srcs` : c'est elle qui permet au
 * contrôleur d'hydrater n'importe quelle page du slider à la demande,
 * sans rendre un <img> par page dans le HTML.
 */
export const pressbookSrcList = (res: PressbookRes): string[] =>
  PRESSBOOK_PAGES.map((p) => pressbookSrc(p, res))

/**
 * Texte de la carte, généré à partir des données pour rester cohérent
 * si le nombre de pages change.
 */
export const PRESSBOOK_SUMMARY =
  `Un ouvrage de ${PRESSBOOK_PAGE_COUNT} pages, composé et mis en page, ` +
  'décliné en deux formats de diffusion (verso/recto) et livré en version numérique.'
