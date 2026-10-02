# KEMBOU — Portfolio 2026

## Vue d'ensemble
- **Nom** : Portfolio KEMBOU
- **Rôle** : Vidéaste & Monteur Vidéo
- **Objectif** : Portfolio créatif immersif et cinématographique présentant l'expertise audiovisuelle, motion design et digitale de KEMBOU.
- **Approche** : Expérience visuelle premium avant tout — esthétique sombre + accents dorés/bleu nuit.

## URLs
- **Développement local** : http://localhost:5173 (ou 3000 via PM2)
- **Preview public sandbox** : https://3000-i4j99wvoff2dtlphvb6v0-d0b9e1e2.sandbox.novita.ai

## Architecture des sections (ordre du DOM)

| # | Ancre | Section |
|---|-------|---------|
| 01 | `#accueil` | Hero — nom, rôle, statut, CTA |
| 02 | `#profil` | 02 — PROFIL : portrait, bio, 5 rôles, stats |
| 03 | `#design-graphique` | 03 — DESIGN GRAPHIQUE : accroche + **PROJET À LA UNE — PRESSBOOK** (flipbook 3D) |
| 04 | `#projets` | 04 — TRAVAUX DE RÉFÉRENCE : lecteur Wistia unique + playlist de 15 vidéos |
| 04 | `#competences` | 04 — EXPERTISE : 5 cartes compétences |
| 06 | `#experience` | 06 — PARCOURS : timeline zigzag |
| 07 | `#outils` | 07 — STACK : 8 outils |
| 08 | `#processus` | 08 — MÉTHODOLOGIE : 5 étapes + barre de progression |
| 09 | `#contact` | 09 — COLLABORATION : CTA, coordonnées, réseaux |
| — | — | Footer : identité, navigation, contact, copyright |

Sections retirées : ancien **02 — Design graphique**, **05 — Mon travail** et **04 — Autres réalisations** (avec leurs statistiques).

### Composants notables
- **Pressbook** : flipbook 3D (`src/pressbook.ts` + `public/static/js/pressbook.js`) alimenté par la galerie du projet `pressbook-brain-2024`, avec lightbox plein écran et compteur de doubles-pages.
- **Lecteur vidéo** : lecteur Aurora officiel Wistia **unique** (`<wistia-player>`), monté à la demande dans la section `#projets`, avec playlist de 15 entrées, précédent/suivant, auto-avance et gestion d'indisponibilité.

## Interactions & animations
- Navigation flottante glassmorphique avec état actif dynamique.
- Barre de progression scroll (dégradé or → bleu).
- Curseur personnalisé (dot + ring) desktop.
- Reveal progressif via IntersectionObserver.
- Lecteur vidéo Wistia intégré (un seul lecteur, chargement paresseux, aucune vidéo hébergée localement).
- Flipbook du pressbook : navigation clavier, tactile, glisser-déposer des feuilles.
- Menu mobile animé.
- Parallaxe léger sur portrait hero + parallaxe souris du Hero bento.
- Barre de progression méthodologie animée.
- Effets shine sur cartes outils, halos colorés hover cartes compétences.
- Grain cinématographique en overlay global.

## URIs / Endpoints API

| Méthode | URI | Description |
|--------|-----|-------------|
| GET | `/` | Page principale du portfolio (SSR) |
| GET | `/api/identity` | Retourne l'identité complète (nom, rôle, bio, contact) |
| GET | `/api/skills` | Retourne les 5 compétences (montage, motion, uiux, web, graphisme) |
| GET | `/api/projects` | Retourne les œuvres design (Pressbook) |
| GET | `/api/videos` | Retourne les 15 vidéos Wistia (`id`, `mediaId`, `title`, `durationSeconds`, `durationLabel`, `poster`, `shareUrl`) |
| GET | `/api/projects/:id` | Retourne une œuvre design par ID, ou une vidéo Wistia par son `mediaId` |
| GET | `/api/experiences` | Retourne les expériences professionnelles |
| GET | `/api/tools` | Retourne les outils / stack |
| GET | `/static/*`, `/media/*` | Assets statiques (CSS, JS, images, vignettes) |

## Architecture des données

### `src/data.ts`
- **IDENTITY** : identité, bio, contact, portrait
- **NAV_ITEMS** : entrées du menu (ancres de navigation)
- **STATS[]** : statistiques de profil
- **SKILLS[]** : 5 compétences avec tags
- **EXPERIENCES[]** : expériences professionnelles
- **TOOLS[]** : outils avec couleurs de marque
- **PROCESS_STEPS[]** : 5 étapes de la méthode

### `src/projects.ts` — œuvres design
```ts
{
  id, title, kind,          // 'design'
  category, categoryLabel,
  thumbnail,                // aperçu du projet
  description, year, client,
  gallery?: GalleryImage[]  // pages d'un ouvrage design
}
```
Sélecteurs : `getProject`, `getProjects`, `getPressbook`.

### Vidéos — Wistia uniquement (`src/wistia.ts`)
- **Aucun fichier vidéo local n'est utilisé** : les `.mp4` du dossier `VIDEOS/` sont **ignorés**, et le dossier `public/media/video/` a été supprimé.
- Source de référence : https://cocomultimedia2016.wistia.com/folders/j9u2g8v8nd?access=collaborators
- Intégration officielle : `https://fast.wistia.com/player.js` + balise `<wistia-player>` + `replaceWithMedia(mediaId)`.
- Fichier de données :
```ts
{
  id,                       // token du lien de partage (.../s/<id>)
  mediaId,                  // hashed_id Wistia → lecteur officiel
  shareUrl,                 // lien de partage d'origine (conservé)
  title,                    // titre officiel Wistia
  durationSeconds, durationLabel,
  poster                    // vignette Wistia 320x180
}
```
Sélecteurs : `getWistiaVideo`, `getWistiaVideoById`, `wistiaThumb`, `wistiaPageUrl`, `formatDuration`.
- **Pour ajouter une vidéo** : renseigner son `mediaId` dans `src/wistia.ts`
  (Wistia → *Partager* → dernier segment de l'URL `.../medias/<MEDIA_ID>` ; le token `/s/...` n'est pas le `mediaId`).

### Stockage
- **Données statiques** : `src/data.ts`, `src/projects.ts`, `src/wistia.ts`, `src/pressbook.ts`
- **Assets** : `public/static/{css,js,images}/`, `public/media/design/`
- **Pas de base de données** requise

## Assets

```
public/
├── media/
│   └── design/pressbook-brain-2024/{thumb,card,full}   # 34 pages, 17 doubles-pages, 3 résolutions
└── static/
    ├── css/{style.css,pressbook.css}
    ├── js/{app.js,playlist.js,pressbook.js}
    └── images/{kembou-2.jpg,kembou-hero.jpg,kembou-source.jpg}
```

Le portrait de la section **02 — PROFIL** utilise `/static/images/kembou-2.jpg` (768×1024, optimisé depuis `ASSET/KEMBOU-2.png`), et le hero `/static/images/kembou-hero.jpg`.

Les vignettes vidéo ne sont pas stockées localement : elles proviennent des CDN Wistia (`embed-ssl.wistia.com/deliveries/...jpg?image_crop_resized=320x180`).

## Fonctionnalités NON encore implémentées
- Formulaire de contact fonctionnel avec envoi email.
- Multi-langue (FR/EN).

> **Téléchargement des vidéos** : côté site, aucun `.mp4` n'est exposé, le lecteur est configuré avec `copy-link-and-thumbnail=false` et `seo=false`. Pour un blocage complet, l'option de téléchargement doit aussi être désactivée dans les paramètres du compte Wistia (un site web ne peut pas empêcher les captures d'écran ou l'enregistrement de l'écran).

## Guide utilisateur

### Navigation
- **Desktop** : menu flottant en haut (8 entrées + bouton « DÉMARRER »), curseur personnalisé sur les zones interactives.
- **Mobile** : bouton burger ouvrant un menu overlay avec toutes les sections.
- **Barre de progression** : en haut, indique la position dans le portfolio.

### Explorer les travaux vidéo
1. Section **04 — TRAVAUX DE RÉFÉRENCE** : un grand lecteur à gauche, la playlist des 15 vidéos à droite (liste défilante).
2. Clic sur le bouton lecture ou sur une entrée → la vidéo démarre **dans le lecteur principal**, sans quitter la page.
3. Navigation : boutons précédent/suivant, clavier `↑`/`↓`, ou fin de vidéo → lecture automatique de la suivante.
4. Contrôles Wistia natifs : lecture, volume, plein écran, qualité adaptative (aucun téléchargement proposé).
5. Si une vidéo est indisponible : message d'erreur + lien vers la page Wistia + bouton « Réessayer ».

### Explorer le design graphique
1. Section **03 — DESIGN GRAPHIQUE** → carte **PROJET À LA UNE — PRESSBOOK**.
2. Feuilleter le livre avec les flèches, les boutons ou en glissant.
3. « Voir le projet complet » ouvre le flipbook en plein écran.

### Contact
- Email cliquable (mailto:), téléphones (tel:), WhatsApp (wa.me)
- Liens vers LinkedIn, Facebook, Instagram, YouTube.

## Déploiement

Le site est rendu côté serveur par Hono (Cloudflare Pages), mais **tous les contenus sont statiques** : `npm run build` pré-rend donc aussi `dist/index.html`, ce qui permet un hébergement 100 % statique (Netlify, GitHub Pages, tout CDN).

- **Cloudflare Pages** : commande `npm run build`, dossier `dist` (le Worker `dist/_worker.js` est prioritaire)
- **Netlify** : configuration automatique via `netlify.toml` (`command = npm run build`, `publish = dist`)
- **Stack technique** : Hono 4 + TypeScript + Vite + TailwindCSS (CDN) + GSAP + Font Awesome
- **Build** : `npm run build` → `dist/_worker.js` (~97 KB, 31 KB gzip) + `dist/index.html` (~90 Ko)
- **Dernière mise à jour** : 2026-10-02

### Commandes utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Preview / déploiement
npm run preview
npm run deploy
```

## Identité visuelle

| Couleur | Hex | Usage |
|---------|-----|-------|
| Noir profond | `#050505` | Fond principal |
| Bleu nuit | `#071525` | Fond section profil, contact |
| Bleu nuit clair | `#0a1830` | Fond contact |
| Or premium | `#f5c25b` | Accent, CTA, titres, boutons |
| Or clair | `#ffd876` | Halos, glow |
| Blanc | `#f5f5f5` | Texte principal |
| Gris | `#8a8a8a` | Texte secondaire |

## Crédits techniques

- **Framework** : [Hono](https://hono.dev/) 4 (edge-first)
- **Runtime** : Cloudflare Workers / Pages
- **Build** : Vite 8 + `@hono/vite-build`
- **Style** : TailwindCSS via CDN + CSS custom
- **Vidéo** : lecteur officiel Wistia Aurora (`fast.wistia.com/player.js` + `<wistia-player>`), un seul lecteur chargé à la demande
- **Animations** : GSAP + ScrollTrigger + IntersectionObserver natif
- **Typographies** : Space Grotesk, Playfair Display, Inter (Google Fonts)
- **Icônes** : Font Awesome 6.4

---

© 2026 KEMBOU — Vidéaste & Monteur Vidéo · Tous droits réservés.