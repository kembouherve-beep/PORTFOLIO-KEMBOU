// ==========================================================
//  VIDÉOS WISTIA — KEMBOU Portfolio
// ==========================================================
//  Source de vérité unique des 15 travaux vidéo du portfolio.
//
//  ⚠️  AUCUNE VIDÉO N'EST HÉBERGÉE LOCALEMENT.
//  Tout est lu en ligne via le lecteur officiel Wistia (Aurora) :
//
//      <script src="https://fast.wistia.com/player.js" async></script>
//      <wistia-player media-id="<MEDIA_ID>"></wistia-player>
//
//  Un seul lecteur est instancié à la fois ; la playlist ne contient
//  que des entrées (numéro, vignette, titre, durée). Le lecteur n'est
//  chargé qu'au premier clic (voir /static/js/playlist.js).
//
//  ── Résolution des liens de partage ──────────────────────────
//  Les URL /s/<token> sont des liens de partage : le token n'est PAS
//  le media-id. Le vrai identifiant a été récupéré sur la page
//  Wistia (meta twitter:player → /embed/iframe/<media-id>) :
//
//      https://cocomultimedia2016.wistia.com/s/enkmljpnq4w7ql3
//                          └─ media-id ─┘   2zjmjygyu8
//
//  Titres, durées et vignettes proviennent de l'API publique Wistia
//  (oEmbed) — aucune donnée n'est inventée. Les champs non fournis
//  par Wistia (client, année, description) restent vides.
//
//  ── Téléchargement ──────────────────────────────────────────
//  Le lecteur Aurora ne propose aucun bouton de téléchargement.
//  L'option « Copy link and thumbnail » du menu contextuel est
//  désactivée (`copy-link-and-thumbnail="false"`), et aucune URL de
//  fichier n'est exposée dans le portfolio.
// ==========================================================

// ---------- Constantes Wistia ----------

/** Dossier Wistia de référence (accès collaborateurs). */
export const WISTIA_FOLDER_URL =
  'https://cocomultimedia2016.wistia.com/folders/j9u2g8v8nd?access=collaborators'

/** Lecteur officiel Wistia (Aurora). Injecté à la demande. */
export const WISTIA_PLAYER_SRC = 'https://fast.wistia.com/player.js'

/** Couleur du lecteur : ambre du portfolio (#fbbf24). */
export const WISTIA_PLAYER_COLOR = 'fbbf24'

// ---------- Types ----------

export type WistiaVideo = {
  /** Identifiant interne (= token du lien de partage). */
  id: string
  /** media-id Wistia : valeur attendue par <wistia-player media-id>. */
  mediaId: string
  /** Lien de partage d'origine, conservé comme référence. */
  shareUrl: string
  /** Titre exact du média sur Wistia. */
  title: string
  /** Durée en secondes (API oEmbed Wistia). */
  durationSeconds: number
  /** Durée affichée « m:ss » (calculée depuis durationSeconds). */
  durationLabel: string
  /** Image de couverture gérée par Wistia (redimensionnée à la demande). */
  poster: string
}

// ---------- Helpers ----------

/** Durée Wistia → « m:ss » (arrondi inférieur, comme l'affichage Wistia). */
export const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Vignette Wistia à la taille voulue (redimensionnement côté Wistia). */
export const wistiaThumb = (video: WistiaVideo, width = 320, height = 180) =>
  `${video.poster}?image_crop_resized=${width}x${height}`

/** Page Wistia du média (utilisée uniquement comme lien de secours). */
export const wistiaPageUrl = (mediaId: string) =>
  `https://cocomultimedia2016.wistia.com/medias/${mediaId}`

/** Numéro de playlist sur deux chiffres : 01 → 15. */
export const wistiaNumber = (index: number) => String(index + 1).padStart(2, '0')

// ---------- 15 vidéos de référence ----------
// media-id, titre et durée relevés sur Wistia (API oEmbed) le 02/10/2026.

type RawWistiaVideo = Omit<WistiaVideo, 'durationLabel'>

const RAW_VIDEOS: RawWistiaVideo[] = [{
    id: 'enkmljpnq4w7ql3',
    mediaId: '2zjmjygyu8',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/enkmljpnq4w7ql3',
    title: 'BIO TOUMANI DIABATE OFFICIEL',
    durationSeconds: 249.84,
    poster: 'https://embed-ssl.wistia.com/deliveries/20ba6bec325e3582eff8fbe9054f7b47caf24644.jpg',
  },
  {
    id: 'raxa0dytf2hf9m6',
    mediaId: '9sjkmw9fl6',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/raxa0dytf2hf9m6',
    title: 'Hommage HDD 2021',
    durationSeconds: 1020.52,
    poster: 'https://embed-ssl.wistia.com/deliveries/ef97c78157e1b6a78e5432eec3001d47a9facb95.jpg',
  },
  {
    id: 'gxzj3f1pg54kbeq',
    mediaId: 'qg4n853ahk',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/gxzj3f1pg54kbeq',
    title: 'food\'sco',
    durationSeconds: 134.08,
    poster: 'https://embed-ssl.wistia.com/deliveries/a1f3c2dde2aca2520cd27631d70219d162c678c2.jpg',
  },
  {
    id: 'xi4f03bv533f43w',
    mediaId: '0icivjqla1',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/xi4f03bv533f43w',
    title: 'AGROUTE_MARCHE_5MIN_VERSION FINALE',
    durationSeconds: 300.142,
    poster: 'https://embed-ssl.wistia.com/deliveries/bac1a7d74e32e6a5e5c5d5482025ef95a7e3c56c.jpg',
  },
  {
    id: 'qgdibxjypkyo3ae',
    mediaId: '6cwofabcjv',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/qgdibxjypkyo3ae',
    title: '40 ANS GESTOCI-26-01-23',
    durationSeconds: 165.884,
    poster: 'https://embed-ssl.wistia.com/deliveries/55b1a287fe2d6c62f0cb0aec68fa3886be2d8691.jpg',
  },
  {
    id: '0b4a3t2seafz71d',
    mediaId: '9fybu1tvs5',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/0b4a3t2seafz71d',
    title: 'SAGA DE LA MODE',
    durationSeconds: 907.739,
    poster: 'https://embed-ssl.wistia.com/deliveries/08f0faa59cd50ce423f1a099f42df26557efdc94.jpg',
  },
  {
    id: 'gjvghijmips1lgp',
    mediaId: 'owj5sx9wzc',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/gjvghijmips1lgp',
    title: 'New Entreprise ITW OK VALIDÉ',
    durationSeconds: 961.833,
    poster: 'https://embed-ssl.wistia.com/deliveries/58d1bbf8dc5926415361476d99613502537e2540.jpg',
  },
  {
    id: '21uraecskf9j9pn',
    mediaId: 'wg75mhfh4u',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/21uraecskf9j9pn',
    title: 'PRESENTATION-COORDO-FINAL2',
    durationSeconds: 479.586,
    poster: 'https://embed-ssl.wistia.com/deliveries/042fbe1078f636a7aafe3153455592eb3bd2435e.jpg',
  },
  {
    id: 'q80x7hs2i6jl6rt',
    mediaId: 'moth7e2l4y',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/q80x7hs2i6jl6rt',
    title: 'MISSIONS-FINAL-OQSF-CI',
    durationSeconds: 134.633,
    poster: 'https://embed-ssl.wistia.com/deliveries/3ffd9f3cad36b1853ed3f803462b68d52f70c0ce.jpg',
  },
  {
    id: 't79p6oqo7kjjdmn',
    mediaId: '8t5ie5p27k',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/t79p6oqo7kjjdmn',
    title: 'PAGDS-BANQUE MONDIALE-ABOISSO_FINAL',
    durationSeconds: 297.889,
    poster: 'https://embed-ssl.wistia.com/deliveries/ffe243512974379df65a1a5d1e42d2f5bdf6be68.jpg',
  },
  {
    id: 'owolwmri6wutyll',
    mediaId: '6dlc8t0pnp',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/owolwmri6wutyll',
    title: 'NEW FORFAITS 3G+PETIT',
    durationSeconds: 42.36,
    poster: 'https://embed-ssl.wistia.com/deliveries/d430f8e925937a8f52a2ad0b2bfc0a5011834424.jpg',
  },
  {
    id: '0fjwky1pntcizgf',
    mediaId: 'fqhkwmk71p',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/0fjwky1pntcizgf',
    title: 'MEDIATION FRANCAIS FINAL_OQSF',
    durationSeconds: 149.351,
    poster: 'https://embed-ssl.wistia.com/deliveries/998123fc895f2ec535e04e3d242af80fd4dc3709.jpg',
  },
  {
    id: '2fw78q3ni5tk9df',
    mediaId: 'nb5ym5qapy',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/2fw78q3ni5tk9df',
    title: 'LBL',
    durationSeconds: 30.8642,
    poster: 'https://embed-ssl.wistia.com/deliveries/bc6823be9babb5161041de8bc8feb9c8771ed5a7.jpg',
  },
  {
    id: '5bjexm272iwfpv2',
    mediaId: 'rhtrt2u7k6',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/5bjexm272iwfpv2',
    title: 'LANCEMENT BYD',
    durationSeconds: 141.247,
    poster: 'https://embed-ssl.wistia.com/deliveries/709aec8a27f789e82651b894e1ea72cf3bca1026.jpg',
  },
  {
    id: 'jcktmu00sfbsi7e',
    mediaId: 'nrh5y6eyf0',
    shareUrl: 'https://cocomultimedia2016.wistia.com/s/jcktmu00sfbsi7e',
    title: 'CIEM (AN 62)',
    durationSeconds: 847.367,
    poster: 'https://embed-ssl.wistia.com/deliveries/10472fcc253afb78794adcbb2ce345ad15b364e3.jpg',
  },]

/** Les 15 vidéos, enrichies de leur durée affichée. */
export const WISTIA_VIDEOS: WistiaVideo[] = RAW_VIDEOS.map((v) => ({
  ...v,
  durationLabel: formatDuration(v.durationSeconds),
}))

/** Nombre de vidéos dans la playlist. */
export const WISTIA_VIDEO_COUNT = WISTIA_VIDEOS.length

/** Vidéo par index de playlist (0 → 14). */
export const getWistiaVideo = (index: number) => WISTIA_VIDEOS[index]

/** Vidéo par identifiant interne. */
export const getWistiaVideoById = (id: string) =>
  WISTIA_VIDEOS.find((v) => v.id === id || v.mediaId === id)