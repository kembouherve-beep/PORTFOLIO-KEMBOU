import { Hono } from 'hono'
import { renderer } from './renderer'
import {
  IDENTITY, NAV_ITEMS, STATS, SKILLS,
  EXPERIENCES, TOOLS, PROCESS_STEPS
} from './data'
import { PROJECTS, getProjects } from './projects'
import {
  WISTIA_VIDEO_COUNT, WISTIA_VIDEOS,
  getWistiaVideoById, wistiaNumber, wistiaPageUrl, wistiaThumb,
} from './wistia'
import {
  PRESSBOOK_TITLE, PRESSBOOK_YEAR, PRESSBOOK_PAGES,
  PRESSBOOK_PAGE_COUNT, PRESSBOOK_SUMMARY, pressbookSrcList,
  type PressbookRes
} from './pressbook'

const app = new Hono()

app.use(renderer)

// ==========================================================
// API â€” Endpoints JSON (permet d'utiliser le portfolio comme headless)
// ==========================================================
app.get('/api/identity', (c) => c.json(IDENTITY))
app.get('/api/skills', (c) => c.json(SKILLS))
app.get('/api/projects', (c) => c.json(getProjects()))
app.get('/api/projects/:id', (c) => {
  const id = c.req.param('id')
  const project =
    PROJECTS.find((p) => p.id === id) ?? getWistiaVideoById(id)
  if (!project) return c.json({ error: 'Not found' }, 404)
  return c.json(project)
})
app.get('/api/videos', (c) => c.json(WISTIA_VIDEOS))
app.get('/api/experiences', (c) => c.json(EXPERIENCES))
app.get('/api/tools', (c) => c.json(TOOLS))


// ==========================================================
// PAGE PRINCIPALE
// ==========================================================
app.get('/', (c) => {
  return c.render(
    <>
      {/* ============ CURSEUR PERSONNALISÃ‰ ============ */}
      <div id="cursor-dot" class="hidden md:block fixed w-2 h-2 bg-amber-400 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-150"></div>
      <div id="cursor-ring" class="hidden md:block fixed w-10 h-10 border border-amber-400/50 rounded-full pointer-events-none z-[9998] transition-all duration-300"></div>

      {/* ============ BARRE DE PROGRESSION SCROLL ============ */}
      <div class="fixed top-0 left-0 right-0 h-[2px] bg-transparent z-[100]">
        <div id="scroll-progress" class="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-sky-400 w-0 transition-all duration-100"></div>
      </div>

      {/* ============ NAVIGATION FIXE ============ */}
      <Navigation />

      {/* ============ SECTIONS ============ */}
      <main class="relative">
        <HeroSection />
        <ProfileSection />
        <DesignGraphiqueSection />
        <ReferenceWorksSection />
        <SkillsSection />
        <ExperienceSection />
        <ToolsSection />
        <ProcessSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
})

// ==========================================================
// COMPOSANTS
// ==========================================================

function Navigation() {
  return (
    <header id="main-nav" class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-500">
      <nav class="glass-nav rounded-full px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="#accueil" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span class="text-black font-bold text-sm">K</span>
          </div>
          <span class="font-display font-bold text-sm md:text-base tracking-wider hidden sm:block">KEMBOU</span>
        </a>

        {/* Nav Desktop */}
        <ul class="hidden lg:flex items-center gap-1 text-[11px] tracking-[0.2em] font-medium">
          {NAV_ITEMS.map(item => (
            <li>
              <a
                href={`#${item.id}`}
                data-nav={item.id}
                class="nav-link px-4 py-2 rounded-full text-white/70 hover:text-amber-400 transition-all"
              >
                {item.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        {/* Bouton contact desktop */}
        <a
          href="#contact"
          class="hidden lg:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-400 text-black text-xs font-semibold tracking-wider hover:bg-white transition-all"
        >
          DÃ‰MARRER
          <i class="fas fa-arrow-right text-[10px]"></i>
        </a>

        {/* Menu mobile burger */}
        <button id="mobile-menu-btn" class="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <i class="fas fa-bars text-amber-400"></i>
        </button>
      </nav>

      {/* Menu mobile overlay */}
      <div id="mobile-menu" class="lg:hidden hidden mt-3 glass-nav rounded-2xl p-6">
        <ul class="flex flex-col gap-3 text-sm tracking-widest">
          {NAV_ITEMS.map(item => (
            <li>
              <a
                href={`#${item.id}`}
                data-mobile-nav
                class="block py-2 text-white/80 hover:text-amber-400 border-b border-white/5"
              >
                {item.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section id="accueil" class="hro">
      {/* Fond : dÃ©gradÃ© radial, grille technique, halos orange discrets */}
      <div class="hro-veil" aria-hidden="true" />
      {/* Mention dÃ©corative, presque invisible */}
      <span class="hro-ghost" aria-hidden="true">01</span>

      <div class="hro-card" data-bento>
        {/* ---------- 01 â€” ACCUEIL + statut ---------- */}
        <div class="hro-eyebrow">
          <span class="hro-index">01 â€” Accueil</span>
          <span class="hro-status">
            <i class="hro-status-dot" aria-hidden="true" />
            Disponible pour mission
          </span>
        </div>

        {/* ---------- ZONE 1 : informations ---------- */}
        <div class="hro-left">
          <div class="hro-pair">
            <div class="hro-field">
              <span class="hro-label">Fonction</span>
              <strong class="hro-value hro-value-sm">{IDENTITY.role}</strong>
            </div>
            <div class="hro-field">
              <span class="hro-label">ExpÃ©rience</span>
              <strong class="hro-value">+{IDENTITY.yearsExperience} ans</strong>
            </div>
          </div>

          <div class="hro-field hro-field-count">
            <span class="hro-label">Projets</span>
            <strong class="hro-count">+{IDENTITY.projectsCount}</strong>
            <span class="hro-count-rule" aria-hidden="true" />
          </div>
        </div>

        {/* ---------- ZONE 2 : portrait ---------- */}
        <figure class="hro-portrait hero-portrait">
          <span class="hro-portrait-frame" aria-hidden="true" />
          <div class="hro-portrait-media">
            <img
              src={IDENTITY.heroImage}
              alt="KEMBOU â€” Designer et monteur vidÃ©o, en studio de montage"
              class="hro-portrait-img bento-portrait-img"
              fetchpriority="high"
              decoding="async"
            />
          </div>
          <figcaption class="hro-portrait-tag">Studio de montage</figcaption>
        </figure>

        {/* ---------- ZONE 3 : nom, texte, CTA ---------- */}
        <div class="hro-right">
          <h1 class="hro-name">{IDENTITY.name}</h1>
          <p class="hro-role">
            {IDENTITY.role.toUpperCase()}
            <i class="hro-role-rule" aria-hidden="true" />
          </p>
          <p class="hro-text">{IDENTITY.tagline}</p>
          <p class="hro-text-sub">{IDENTITY.slogan}</p>
        </div>

        <div class="hro-cta">
          <a href="#projets" class="hro-btn hro-btn-primary">
            Voir les projets
            <i class="fas fa-arrow-right hro-btn-arrow" aria-hidden="true" />
          </a>
          <a href="#contact" class="hro-btn hro-btn-ghost">Me contacter</a>
        </div>
      </div>

      <a href="#profil" class="hro-scroll" aria-label="Aller Ã  la section profil">
        <span>SCROLL</span>
        <span class="hro-scroll-line hero-scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}

function ProfileSection() {
  return (
    <section id="profil" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#071525] to-[#050505]"></div>
      <div class="absolute top-1/2 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        {/* Titre section */}
        <div class="mb-16 md:mb-20">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-xs tracking-[0.4em] text-amber-400">02 â€” PROFIL</span>
            <div class="h-[1px] flex-1 max-w-24 bg-amber-400/30"></div>
          </div>
          <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold reveal-text">
            QUI EST <span class="text-amber-400">KEMBOU</span> ?
          </h2>
        </div>

        <div class="grid lg:grid-cols-12 gap-12 items-start">
          {/* Portrait circulaire */}
          <div class="lg:col-span-4 reveal-fade">
            <div class="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0">
              <div class="absolute inset-0 rounded-3xl overflow-hidden">
                <img
                  src={IDENTITY.portrait}
                  alt="KEMBOU portrait"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
              </div>
              {/* Cadre */}
              <div class="absolute -inset-2 border border-amber-400/30 rounded-3xl pointer-events-none"></div>
              <div class="absolute -bottom-6 -right-6 w-24 h-24 border-2 border-amber-400 rounded-full bg-[#050505] flex flex-col items-center justify-center text-center">
                <span class="text-amber-400 font-display text-2xl font-bold leading-none">+10</span>
                <span class="text-[8px] tracking-widest text-white/70 mt-1">ANS D'EXP.</span>
              </div>
            </div>
          </div>

          {/* Texte */}
          <div class="lg:col-span-8 space-y-8 reveal-fade">
            <div class="space-y-2">
              <p class="text-xs tracking-[0.3em] text-amber-400/80 uppercase">Hello, je suis</p>
              <h3 class="font-display text-3xl md:text-4xl font-bold">
                KEMBOU
              </h3>
            </div>

            <div class="space-y-4">
              <p class="text-white/70 leading-relaxed text-lg">
                {IDENTITY.bio}
              </p>
            </div>

            {/* RÃ´les */}
            <div class="grid sm:grid-cols-2 gap-3 pt-4">
              {IDENTITY.professions.map((prof, i) => (
                <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all">
                  <span class="text-amber-400 font-mono text-xs">0{i + 1}</span>
                  <span class="text-sm text-white/80">{prof}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              {STATS.map(stat => (
                <div class="text-center md:text-left space-y-1 p-3 rounded-xl hover:bg-white/[0.03] transition-all">
                  <i class={`fas ${stat.icon} text-amber-400 text-lg mb-2`}></i>
                  <p class="font-display text-2xl font-bold text-white">{stat.value}</p>
                  <p class="text-[10px] tracking-widest text-white/50 uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SkillsSection() {
  return (
    <section id="competences" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-[#050505]"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div class="mb-16 md:mb-20 flex items-end justify-between flex-wrap gap-6">
          <div>
            <div class="flex items-center gap-4 mb-4">
              <span class="text-xs tracking-[0.4em] text-amber-400">04 â€” EXPERTISE</span>
              <div class="h-[1px] w-24 bg-amber-400/30"></div>
            </div>
            <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold">
              COMPÃ‰TENCES<span class="text-amber-400">.</span>
            </h2>
          </div>
          <p class="text-white/50 text-sm max-w-md leading-relaxed">
            5 domaines d'expertise complÃ©mentaires au service de vos projets audiovisuels et digitaux.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKILLS.map((skill, i) => (
            <div class={`skill-card group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-amber-400/40 transition-all duration-500 overflow-hidden ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
              {/* Halo au hover */}
              <div class={`absolute inset-0 bg-gradient-to-br ${skill.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

              <div class="relative z-10 space-y-5">
                <div class="flex items-start justify-between">
                  <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i class={`fas ${skill.icon} text-amber-400 text-xl`}></i>
                  </div>
                  <span class="font-mono text-xs text-white/30">{skill.number}</span>
                </div>

                <div class="space-y-3">
                  <h3 class="font-display text-xl font-bold leading-tight">
                    {skill.title}
                  </h3>
                  <p class="text-sm text-white/60 italic leading-relaxed">
                    Â« {skill.description} Â»
                  </p>
                </div>

                <div class="pt-4 border-t border-white/10">
                  <div class="flex flex-wrap gap-1.5">
                    {skill.tags.map(tag => (
                      <span class="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 hover:bg-amber-400/10 hover:text-amber-300 transition-all">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ==========================================================
//  04 â€” TRAVAUX DE RÃ‰FÃ‰RENCE
//  Lecteur Wistia officiel (composant Aurora) + playlist de 15
//  vidÃ©os. Les donnÃ©es viennent de src/wistia.ts : titres,
//  durÃ©es et vignettes sont ceux de Wistia â€” rien n'est inventÃ©.
//  Aucune vidÃ©o n'est stockÃ©e localement : le lecteur n'est
//  chargÃ© qu'au premier clic (public/static/js/playlist.js).
// ==========================================================

/** 04 â€” TRAVAUX DE RÃ‰FÃ‰RENCE â€” lecteur Wistia et playlist. */
function ReferenceWorksSection() {
  if (WISTIA_VIDEOS.length === 0) return null
  const first = WISTIA_VIDEOS[0]
  const last = WISTIA_VIDEOS.length - 1

  return (
    <section id="projets" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#08111e] to-[#050505]"></div>
      <div class="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        {/* ---------- EN-TÃŠTE ---------- */}
        <div class="mb-12 md:mb-16">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-xs tracking-[0.4em] text-amber-400">04 â€” TRAVAUX DE RÃ‰FÃ‰RENCE</span>
            <div class="h-px w-24 bg-amber-400/30"></div>
          </div>
          <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold">
            PROJETS VIDÃ‰O<span class="text-amber-400">.</span>
          </h2>
          <p class="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-2xl">
            Une sÃ©lection de films montÃ©s et post-produits, lus directement en
            ligne depuis le lecteur Wistia.
          </p>
        </div>

        {/* ---------- LECTEUR PRINCIPAL + PLAYLIST ---------- */}
        <div class="wpl" data-wpl>
          {/* ---------- LECTEUR ---------- */}
          <div class="wpl-stage-col">
            <div class="wpl-stage" data-wpl-stage>
              {/* AperÃ§u avant lecture : vignette Wistia. Au premier clic,
                  public/static/js/playlist.js y installe le lecteur officiel
                  <wistia-player media-id="â€¦"> Ã  la place. */}
              <img
                class="wpl-stage-poster"
                src={wistiaThumb(first, 640, 360)}
                alt={`${first.title} â€” aperÃ§u de la vidÃ©o`}
                loading="lazy"
                decoding="async"
              />
              <button type="button" class="wpl-stage-play" data-wpl-play aria-label={`Lire ${first.title}`}>
                <i class="fas fa-play"></i>
              </button>
            </div>

            <div class="wpl-meta">
              <p class="wpl-count">
                <span data-wpl-index>{wistiaNumber(0)}</span>
                <span class="wpl-count-sep">/</span>
                <span>{wistiaNumber(last)}</span>
              </p>
              <h3 class="wpl-title" data-wpl-title>{first.title}</h3>
              <div class="wpl-nav">
                <button type="button" class="wpl-nav-btn" data-wpl-prev aria-label="VidÃ©o prÃ©cÃ©dente">
                  <i class="fas fa-chevron-left"></i>
                  <span>PrÃ©cÃ©dente</span>
                </button>
                <button type="button" class="wpl-nav-btn" data-wpl-next aria-label="VidÃ©o suivante">
                  <span>Suivante</span>
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* ---------- PLAYLIST ---------- */}
          <aside class="wpl-aside" aria-label="Playlist des travaux vidÃ©o">
            <div class="wpl-aside-head">
              <span class="wpl-aside-label">Playlist</span>
              <span class="wpl-aside-total">{WISTIA_VIDEO_COUNT} vidÃ©os</span>
            </div>
            <ol class="wpl-list" data-wpl-list>
              {WISTIA_VIDEOS.map((v, i) => (
                <li key={v.id}>
                  <button
                    type="button"
                    class={`wpl-item${i === 0 ? ' is-active' : ''}`}
                    data-wpl-item={i}
                    data-media-id={v.mediaId}
                    data-title={v.title}
                    data-share={v.shareUrl}
                    data-page={wistiaPageUrl(v.mediaId)}
                    aria-current={i === 0 ? 'true' : undefined}
                  >
                    <span class="wpl-item-num">{wistiaNumber(i)}</span>
                    <span class="wpl-item-thumb">
                      <img
                        src={wistiaThumb(v)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width={112}
                        height={63}
                      />
                      <i class="fas fa-play wpl-item-play"></i>
                    </span>
                    <span class="wpl-item-text">
                      <span class="wpl-item-title">{v.title}</span>
                      <span class="wpl-item-sub">
                        <span data-wpl-duration>{v.durationLabel}</span>
                        <span class="wpl-item-flag">Indisponible</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  )
}

/** Nombre de cartes visibles dans la colonne de miniatures. */
const PBS_THUMB_SLOTS = 7
/** Cartes de marge au-dessus / en dessous de la miniature active. */
const PBS_THUMB_PAD = 3

/**
 * PRESSBOOK — slider de cartes éditorial.
 *
 * Une grande page au centre, les pages voisines en retrait de part et
 * d'autre, une colonne de miniatures, un compteur et une navigation.
 * Aucune notion de feuillet : c'est une présentation, pas un livre.
 *
 * Le composant ne rend que cinq cartes (fenêtre glissante autour de la
 * page active) ; le contrôleur public/static/js/pressbook.js recycle ces
 * cinq emplacements et n'hydrate que les pages proches. `data-srcs`
 * porte la liste complète des sources de la résolution demandée.
 *
 * `res` choisit la résolution ('card' dans la section, 'full' dans la
 * visionneuse plein écran).
 */
function PressbookSlider({
  res = 'card',
  id,
  variant = 'section',
}: {
  res?: PressbookRes
  id?: string
  variant?: 'section' | 'viewer'
}) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const total = PRESSBOOK_PAGE_COUNT
  const viewer = variant === 'viewer'
  const srcs = pressbookSrcList(res)

  // Page 0 au centre au chargement, page 1 à droite. Les trois autres
  // emplacements sont des réservoirs que le contrôleur remplira ensuite.
  const slots = [0, 1, null, null, null]

  return (
    <div
      class={`pbs${viewer ? ' pbs--viewer' : ''}`}
      data-pbs
      data-variant={variant}
      data-total={total}
      data-srcs={JSON.stringify(srcs)}
      data-alts={JSON.stringify(PRESSBOOK_PAGES.map((p) => p.alt))}
      id={id}
    >
      {/* ---------- COMPTEUR + NAVIGATION ---------- */}
      <div class="pbs-head">
        <div class="pbs-count">
          <span class="pbs-count-track" aria-hidden="true">
            <span class="pbs-count-fill" data-pbs-fill />
          </span>
          <span class="pbs-count-value">
            <span class="pbs-count-label">Page</span>
            <b data-pbs-current>01</b>
            <i aria-hidden="true">/</i>
            <span data-pbs-total>{pad(total)}</span>
          </span>
        </div>

        <div class="pbs-nav">
          <button
            type="button"
            class="pbs-btn"
            data-pbs-btn="prev"
            aria-label="Projet précédent"
          >
            <i class="fas fa-arrow-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="pbs-btn"
            data-pbs-btn="next"
            aria-label="Projet suivant"
          >
            <i class="fas fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ---------- SCÈNE ---------- */}
      <div
        class="pbs-stage"
        data-pbs-stage
        role="group"
        aria-roledescription="carrousel"
        aria-label={`${PRESSBOOK_TITLE} — pages`}
      >
        {slots.map((page, i) => {
          const p = page == null ? null : PRESSBOOK_PAGES[page]
          return (
            <div
              key={i}
              class="pbs-card"
              data-pbs-card={i}
              data-page={page == null ? undefined : page}
              aria-hidden={page === 0 ? undefined : 'true'}
            >
              <div class="pbs-shot">
                <div class="pbs-par">
                  <figure class="pbs-media">
                    <img
                      data-pbs-img
                      /* Les trois premiers emplacements sont servis
                         dans le HTML : la page affichée s'affiche sans
                         attendre le script. */
                      src={page != null && page < 3 ? srcs[page] : undefined}
                      alt={p ? p.alt : ''}
                      width={900}
                      height={506}
                      decoding="async"
                    />
                    <figcaption class="pbs-tag" aria-hidden="true">
                      <b data-pbs-tag>{pad(page == null ? 0 : page + 1)}</b>
                      <span>{PRESSBOOK_YEAR}</span>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          )
        })}

        <span class="pbs-swipe" aria-hidden="true">
          Glisser pour parcourir
        </span>
      </div>

      {/* ---------- MINIATURES ---------- */}
      {!viewer && (
        <div class="pbs-thumbs" data-pbs-thumbs>
          <div class="pbs-track" data-pbs-track>
            {/* Marges invisibles : elles permettent de centrer la miniature
                active même sur les premières et dernières pages. */}
            {Array.from({ length: PBS_THUMB_PAD }, (_, i) => (
              <span class="pbs-pad" key={`pad-top-${i}`} aria-hidden="true" />
            ))}

            {PRESSBOOK_PAGES.map((p, i) => (
              <button
                key={p.page}
                type="button"
                class="pbs-thumb"
                data-pbs-thumb={i}
                aria-label={`Sélectionner la page ${i + 1}`}
                aria-current={i === 0 ? 'true' : undefined}
                style={`--pbs-i:${i}`}
              >
                <span class="pbs-thumb-bar" aria-hidden="true" />
                <span class="pbs-thumb-frame">
                  <img
                    data-pbs-thumb-img
                    data-src={p.thumb}
                    src={i < PBS_THUMB_SLOTS ? p.thumb : undefined}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={200}
                    height={112}
                  />
                </span>
                <span class="pbs-thumb-num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
              </button>
            ))}

            {Array.from({ length: PBS_THUMB_PAD }, (_, i) => (
              <span class="pbs-pad" key={`pad-bot-${i}`} aria-hidden="true" />
            ))}
          </div>
        </div>
      )}

      <span class="sr-only" aria-live="polite" data-pbs-live>
        Page 01 sur {total}
      </span>
    </div>
  )
}

function DesignGraphiqueSection() {
  return (
    <>
      <section id="design-graphique" class="dg-section">
        <div class="dg-atmos" aria-hidden="true" />
        <span class="dg-ghost dg-anim dg-anim--ghost" data-dg-anim aria-hidden="true">
          03
        </span>

        <div class="dg-shell">
          {/* ---------- EN-TÊTE ---------- */}
          <header class="dg-head">
            <span class="dg-eyebrow dg-anim" data-dg-anim style="--dg-delay:60ms">
              03 — Design graphique
            </span>

            <div class="dg-head-main">
              <h2 class="dg-title dg-anim" data-dg-anim style="--dg-delay:140ms">
                <span class="dg-title-line">Design</span>
                <span class="dg-title-line dg-title-accent">Graphique</span>
              </h2>

              <div class="dg-side dg-anim" data-dg-anim style="--dg-delay:220ms">
                <span class="dg-side-rule" aria-hidden="true" />
                <p class="dg-motto">Créer / Imaginer / Impacter</p>
              </div>
            </div>

            <p class="dg-desc dg-anim" data-dg-anim style="--dg-delay:300ms">
              Composition, mise en page et supports imprimés et numériques
              conçus sur mesure pour valoriser votre image et amplifier
              votre message.
            </p>

            <div class="dg-sign dg-anim" data-dg-anim style="--dg-delay:360ms">
              <span class="dg-sign-text">
                Portfolio
                <br />
                Créatif
              </span>
            </div>
          </header>

          {/* ---------- CARTE PRESSBOOK ---------- */}
          <div data-pb-scope>
            <article class="dg-card dg-anim" data-dg-anim style="--dg-delay:420ms">
              <div class="dg-card-top">
                <div>
                  <span class="dg-flash">Projet à la une</span>
                  <h3 class="dg-card-title">Pressbook</h3>
                  <p class="dg-card-desc">{PRESSBOOK_SUMMARY}</p>
                </div>
                <span class="dg-badge">Print &amp; Digital</span>
              </div>

              <PressbookSlider res="card" />

              <div class="dg-card-foot">
                <p class="dg-foot-note">
                  {PRESSBOOK_PAGE_COUNT} pages · Version numérique &amp; imprimée
                </p>

                <button type="button" class="dg-view" data-dg-open aria-label="Ouvrir le projet">
                  <i class="fas fa-eye" aria-hidden="true" />
                  <span class="dg-view-label">Voir le projet complet</span>
                  <i class="dg-view-arrow" aria-hidden="true">
                    &#8594;
                  </i>
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- VISIONNEUSE PLEIN ÉCRAN ---------- */}
      <div
        class="dg-lightbox"
        data-dg-lightbox
        hidden
        role="dialog"
        aria-modal="true"
        aria-label={`${PRESSBOOK_TITLE} — pressbook`}
      >
        <div class="dg-lb-inner">
          <div class="dg-lb-bar">
            <div class="dg-lb-meta">
              <p class="dg-lb-kicker">Pressbook</p>
              <p class="dg-lb-title">{PRESSBOOK_TITLE}</p>
            </div>
            <button
              type="button"
              class="dg-lb-close"
              data-dg-close
              aria-label="Fermer la visionneuse"
            >
              <i class="fas fa-times" aria-hidden="true" />
            </button>
          </div>

          <PressbookSlider res="full" variant="viewer" />

          <div class="dg-lb-foot">
            <p class="dg-lb-hint">
              &#8592; &#8594; pour parcourir — glissez sur mobile — Échap pour fermer
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function ExperienceSection() {
  return (
    <section id="experience" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-[#050505]"></div>
      <div class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div class="mb-16 md:mb-20">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-xs tracking-[0.4em] text-amber-400">06 â€” PARCOURS</span>
            <div class="h-[1px] w-24 bg-amber-400/30"></div>
          </div>
          <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold">
            EXPÃ‰RIENCE<span class="text-amber-400">.</span>
          </h2>
        </div>

        {/* Timeline */}
        <div class="relative">
          {/* Ligne verticale */}
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-amber-400/30 to-transparent"></div>

          <div class="space-y-8 md:space-y-12">
            {EXPERIENCES.map((exp, i) => (
              <div class={`relative flex items-center gap-8 exp-item ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Point sur la timeline */}
                <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-[#050505] z-10">
                  {exp.highlight && (
                    <div class="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></div>
                  )}
                </div>

                {/* Contenu */}
                <div class={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div class="group p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-amber-400/40 transition-all">
                    <div class={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? 'md:justify-end' : ''}`}>
                      <div class="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                        <i class={`fas ${exp.icon} text-amber-400`}></i>
                      </div>
                      <h3 class="font-display text-xl font-bold">{exp.company}</h3>
                    </div>
                    <p class="text-sm text-amber-400/80 font-medium mb-2">{exp.role}</p>
                    <p class="text-sm text-white/60 leading-relaxed mb-3">{exp.description}</p>
                    <div class={`flex flex-wrap gap-1.5 ${i % 2 === 0 ? 'md:justify-end' : ''}`}>
                      {exp.projects.map(p => (
                        <span class="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/60">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Espace opposÃ© */}
                <div class="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ToolsSection() {
  return (
    <section id="outils" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#071525] to-[#050505]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div class="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
          <div class="flex items-center gap-4 mb-4 justify-center">
            <div class="h-[1px] w-16 bg-amber-400/30"></div>
            <span class="text-xs tracking-[0.4em] text-amber-400">07 â€” STACK</span>
            <div class="h-[1px] w-16 bg-amber-400/30"></div>
          </div>
          <h2 class="font-display text-4xl md:text-6xl font-bold mb-4">
            OUTILS & <span class="text-amber-400">TECHNOLOGIES</span>
          </h2>
          <p class="text-white/50 text-sm leading-relaxed">
            Une maÃ®trise complÃ¨te des outils professionnels de post-production, motion design et crÃ©ation digitale.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <div class="tool-card group p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform"
                style={`background:${tool.bg};color:${tool.color}`}
              >
                {tool.short}
              </div>
              <h3 class="font-display text-base font-bold mb-1">{tool.name}</h3>
              <p class="text-xs text-white/50 leading-relaxed">{tool.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section id="processus" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-[#050505]"></div>
      <div class="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div class="mb-16 md:mb-20">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-xs tracking-[0.4em] text-amber-400">08 â€” MÃ‰THODOLOGIE</span>
            <div class="h-[1px] w-24 bg-amber-400/30"></div>
          </div>
          <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold">
            MA <span class="text-amber-400">MÃ‰THODE</span>
          </h2>
        </div>

        <div class="relative">
          {/* Ligne de progression */}
          <div class="hidden lg:block absolute top-16 left-0 right-0 h-[2px] bg-white/10">
            <div id="process-progress" class="h-full bg-gradient-to-r from-amber-400 to-amber-600 w-0 transition-all duration-1000"></div>
          </div>

          <div class="grid lg:grid-cols-5 gap-6 lg:gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <div class="process-step relative group" data-step={i}>
                {/* Point */}
                <div class="hidden lg:flex w-8 h-8 rounded-full bg-[#050505] border-2 border-amber-400 items-center justify-center absolute top-12 left-1/2 -translate-x-1/2 z-10">
                  <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                </div>

                <div class="lg:pt-24 space-y-4 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-amber-400/40 transition-all h-full">
                  <div class="flex items-center justify-between">
                    <span class="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600">
                      {step.number}
                    </span>
                    <i class={`fas ${step.icon} text-amber-400/60 text-2xl`}></i>
                  </div>
                  <h3 class="font-display text-lg font-bold tracking-wide">
                    {step.title}
                  </h3>
                  <p class="text-sm text-amber-400/80 italic">
                    Â« {step.description} Â»
                  </p>
                  <p class="text-xs text-white/50 leading-relaxed pt-2 border-t border-white/10">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" class="relative py-24 md:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a1830] to-[#050505]"></div>
      <div class="absolute inset-0 bg-gradient-radial-gold opacity-30"></div>

      <div class="relative z-10 max-w-6xl mx-auto px-6 md:px-10">
        <div class="text-center space-y-8 mb-16">
          <div class="flex items-center gap-4 justify-center">
            <div class="h-[1px] w-16 bg-amber-400/30"></div>
            <span class="text-xs tracking-[0.4em] text-amber-400">09 â€” COLLABORATION</span>
            <div class="h-[1px] w-16 bg-amber-400/30"></div>
          </div>

          <h2 class="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-none">
            UN PROJET<br />
            <span class="text-amber-400 italic font-light">en tÃªte ?</span>
          </h2>

          <p class="text-white/60 text-lg md:text-xl italic max-w-2xl mx-auto">
            Â« Parlons de votre prochaine histoire visuelle. Â»
          </p>

          <div class="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href={`mailto:${IDENTITY.contact.email}`}
              class="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-amber-400 text-black font-semibold tracking-widest text-sm hover:bg-white transition-all"
            >
              DÃ‰MARRER UN PROJET
              <i class="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
            </a>
            <a
              href="#projets"
              class="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 text-white font-semibold tracking-widest text-sm hover:border-amber-400 hover:text-amber-400 transition-all"
            >
              VOIR MES RÃ‰ALISATIONS
            </a>
          </div>
        </div>

        {/* CoordonnÃ©es */}
        <div class="grid md:grid-cols-2 gap-6 pt-12 border-t border-white/10">
          {/* Directs */}
          <div class="space-y-4">
            <h3 class="text-xs tracking-[0.3em] text-amber-400 uppercase">Contact direct</h3>
            <div class="space-y-3">
              <a href={`mailto:${IDENTITY.contact.email}`} class="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <div class="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <i class="fas fa-envelope text-amber-400"></i>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] tracking-widest text-white/40 uppercase">Email</p>
                  <p class="text-sm text-white group-hover:text-amber-400 transition-colors">{IDENTITY.contact.email}</p>
                </div>
                <i class="fas fa-arrow-up-right-from-square text-white/30 group-hover:text-amber-400"></i>
              </a>
              <a href={`tel:${IDENTITY.contact.phone.replace(/\s/g, '')}`} class="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <div class="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <i class="fas fa-phone text-amber-400"></i>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] tracking-widest text-white/40 uppercase">TÃ©lÃ©phone</p>
                  <p class="text-sm text-white group-hover:text-amber-400 transition-colors">{IDENTITY.contact.phone}</p>
                </div>
              </a>
              <a href={`tel:${IDENTITY.contact.phoneSecondary.replace(/\s/g, '')}`} class="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <div class="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <i class="fas fa-mobile-screen text-amber-400"></i>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] tracking-widest text-white/40 uppercase">TÃ©lÃ©phone 2</p>
                  <p class="text-sm text-white group-hover:text-amber-400 transition-colors">{IDENTITY.contact.phoneSecondary}</p>
                </div>
              </a>
              <a href={`https://wa.me/${IDENTITY.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" class="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <div class="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <i class="fab fa-whatsapp text-amber-400"></i>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] tracking-widest text-white/40 uppercase">WhatsApp</p>
                  <p class="text-sm text-white group-hover:text-amber-400 transition-colors">{IDENTITY.contact.whatsapp}</p>
                </div>
              </a>
              <div class="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div class="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <i class="fas fa-location-dot text-amber-400"></i>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] tracking-widest text-white/40 uppercase">Adresse</p>
                  <p class="text-sm text-white">{IDENTITY.contact.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RÃ©seaux */}
          <div class="space-y-4">
            <h3 class="text-xs tracking-[0.3em] text-amber-400 uppercase">RÃ©seaux sociaux</h3>
            <div class="grid grid-cols-2 gap-3">
              <a href={IDENTITY.contact.linkedin} target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <i class="fab fa-linkedin text-blue-400 text-xl"></i>
                <span class="text-sm text-white group-hover:text-amber-400">LinkedIn</span>
              </a>
              <a href={IDENTITY.contact.facebook} target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <i class="fab fa-facebook text-blue-500 text-xl"></i>
                <span class="text-sm text-white group-hover:text-amber-400">Facebook</span>
              </a>
              <a href={IDENTITY.contact.instagram} target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <i class="fab fa-instagram text-pink-400 text-xl"></i>
                <span class="text-sm text-white group-hover:text-amber-400">Instagram</span>
              </a>
              <a href={IDENTITY.contact.youtube} target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 transition-all">
                <i class="fab fa-youtube text-red-500 text-xl"></i>
                <span class="text-sm text-white group-hover:text-amber-400">YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer class="relative py-16 border-t border-white/10 overflow-hidden">
      <div class="absolute inset-0 bg-[#030303]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <div class="grid md:grid-cols-3 gap-12 mb-12">
          {/* IdentitÃ© */}
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span class="text-black font-bold">K</span>
              </div>
              <div>
                <p class="font-display font-bold text-lg">KEMBOU</p>
                <p class="text-[10px] tracking-widest text-white/50">VIDÃ‰ASTE & MONTEUR VIDÃ‰O</p>
              </div>
            </div>
            <p class="text-sm text-white/60 italic leading-relaxed max-w-xs">
              Â« Des images pensÃ©es pour raconter, transmettre et marquer. Â»
            </p>
          </div>

          {/* Navigation */}
          <div class="space-y-4">
            <h4 class="text-xs tracking-[0.3em] text-amber-400 uppercase">Navigation</h4>
            <ul class="space-y-2">
              {NAV_ITEMS.map(item => (
                <li>
                  <a href={`#${item.id}`} class="text-sm text-white/60 hover:text-amber-400 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div class="space-y-4">
            <h4 class="text-xs tracking-[0.3em] text-amber-400 uppercase">Contact</h4>
            <ul class="space-y-2 text-sm text-white/60">
              <li><a href={`mailto:${IDENTITY.contact.email}`} class="hover:text-amber-400 transition-colors">{IDENTITY.contact.email}</a></li>
              <li><a href={`tel:${IDENTITY.contact.phone.replace(/\s/g, '')}`} class="hover:text-amber-400 transition-colors">{IDENTITY.contact.phone}</a></li>
              <li><a href={`tel:${IDENTITY.contact.phoneSecondary.replace(/\s/g, '')}`} class="hover:text-amber-400 transition-colors">{IDENTITY.contact.phoneSecondary}</a></li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Abidjan%2C%20C%C3%B4te%20d%27Ivoire"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-amber-400 transition-colors"
                >
                  {IDENTITY.contact.address}
                </a>
              </li>
            </ul>
            <div class="flex items-center gap-3 pt-2">
              <a href={IDENTITY.contact.linkedin} target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black flex items-center justify-center transition-all">
                <i class="fab fa-linkedin text-sm"></i>
              </a>
              <a href={IDENTITY.contact.instagram} target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black flex items-center justify-center transition-all">
                <i class="fab fa-instagram text-sm"></i>
              </a>
              <a href={IDENTITY.contact.youtube} target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black flex items-center justify-center transition-all">
                <i class="fab fa-youtube text-sm"></i>
              </a>
              <a href={IDENTITY.contact.facebook} target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black flex items-center justify-center transition-all">
                <i class="fab fa-facebook text-sm"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-white/40">
            Â© 2026 KEMBOU â€” Tous droits rÃ©servÃ©s.
          </p>
          <p class="text-xs text-white/40">
            Portfolio 2026 Â· VidÃ©aste & Monteur VidÃ©o
          </p>
        </div>
      </div>
    </footer>
  )
}

export default app
