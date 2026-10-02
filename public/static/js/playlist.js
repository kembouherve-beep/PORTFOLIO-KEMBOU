/* =========================================================
   KEMBOU — 04 TRAVAUX DE RÉFÉRENCE
   Lecteur Wistia officiel (Aurora) + playlist de 15 vidéos
   =========================================================

   Principes
   · 1 seul <wistia-player> à la fois, jamais 15.
   · player.js (174 Ko) n'est chargé qu'au premier clic.
   · Le changement de vidéo passe par replaceWithMedia(),
     la méthode documentée par Wistia pour les playlists.
   · Lecture automatique à la fin d'une vidéo (événement `ended`).
   · Si un média ne se charge pas, l'entrée est signalée dans la
     playlist et un lien vers la page Wistia est proposé : on ne
     masque jamais une vidéo et le lecteur ne se casse pas.
   · Aucune URL de fichier, aucun bouton de téléchargement :
     tout passe par le lecteur Wistia.
   ========================================================= */

(function () {
  'use strict';

  const root = document.querySelector('[data-wpl]');
  if (!root) return;

  const PLAYER_SRC = 'https://fast.wistia.com/player.js';
  const PLAYER_COLOR = 'fbbf24'; // ambre du portfolio
  const READY_TIMEOUT = 20000; // chargement du player.js
  const MEDIA_TIMEOUT = 18000; // chargement d'un média

  const stage = root.querySelector('[data-wpl-stage]');
  const list = root.querySelector('[data-wpl-list]');
  const titleEl = root.querySelector('[data-wpl-title]');
  const indexEl = root.querySelector('[data-wpl-index]');
  const prevBtn = root.querySelector('[data-wpl-prev]');
  const nextBtn = root.querySelector('[data-wpl-next]');
  const playBtn = root.querySelector('[data-wpl-play]');
  const items = Array.prototype.slice.call(root.querySelectorAll('[data-wpl-item]'));
  if (!stage || !items.length) return;

  const total = items.length;
  const pad2 = (n) => String(n).padStart(2, '0');

  let current = 0;
  let playerEl = null;
  let readyResolve = null;

  // ---------- Chargement paresseux du lecteur officiel ----------
  function loadPlayer() {
    if (customElements.get('wistia-player')) return Promise.resolve();
    if (readyResolve) return readyResolve.promise;

    readyResolve = {};
    readyResolve.promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PLAYER_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('player.js'));
      document.head.appendChild(script);
      setTimeout(() => reject(new Error('player.js timeout')), READY_TIMEOUT);
    });
    return readyResolve.promise;
  }

  // Pré-chargement quand la section approche de l'écran : le premier
  // clic peut alors installer le lecteur et lancer la lecture dans le
  // geste de l'utilisateur (Chrome bloque la lecture audio otherwise).
  if ('IntersectionObserver' in window) {
    const warm = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        warm.disconnect();
        loadPlayer().catch(() => {
          /* le chargement sera retenté au clic */
        });
      },
      { rootMargin: '600px 0px' }
    );
    warm.observe(root);
  }

  // ---------- Échec de lecture / média indisponible ----------
  function markUnavailable(i, message) {
    const item = items[i];
    if (!item) return;
    item.classList.add('is-unavailable');
    stage.classList.add('is-unavailable');
    stage.innerHTML =
      '<div class="wpl-error">' +
      '<i class="fas fa-triangle-exclamation"></i>' +
      '<p class="wpl-error-text">' + (message || 'Vidéo indisponible dans le lecteur intégré.') + '</p>' +
      '<div class="wpl-error-actions">' +
      '<a class="wpl-error-link" href="' + (item.dataset.page || item.dataset.share) +
      '" target="_blank" rel="noopener noreferrer">Voir cette réalisation sur Wistia</a>' +
      '<button type="button" class="wpl-error-link is-ghost" data-wpl-retry>Réessayer</button>' +
      '</div></div>';
    const retry = stage.querySelector('[data-wpl-retry]');
    if (retry) retry.addEventListener('click', () => select(current, true));
    updateNav();
  }

  function clearUnavailable(i) {
    const item = items[i];
    if (item) item.classList.remove('is-unavailable');
    stage.classList.remove('is-unavailable');
  }

  // Fait défiler la liste — et uniquement la liste — pour garder
  // l'entrée active visible. On ne passe pas par scrollIntoView(),
  // qui ferait aussi défiler la page entière au chargement.
  function keepItemVisible(item) {
    if (!list || list.scrollHeight <= list.clientHeight + 1) return;
    const box = list.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    if (rect.top < box.top) list.scrollTop -= box.top - rect.top + 8;
    else if (rect.bottom > box.bottom) list.scrollTop += rect.bottom - box.bottom + 8;
  }

  // ---------- Mise à jour de l'interface ----------
  function updateNav() {
    if (indexEl) indexEl.textContent = pad2(current + 1);
    if (titleEl) titleEl.textContent = items[current].dataset.title || '';
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;

    items.forEach((item, i) => {
      const active = i === current;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-current', active ? 'true' : 'false');
      if (active) keepItemVisible(item);
    });
  }

  // ---------- Lancement de la lecture ----------
  // Wistia ignore un play() émis avant l'initialisation de son API
  // (l'état reste « beforeplay ») : on rejoue donc la demande dès que
  // le lecteur est prêt, dans la fenêtre de geste de l'utilisateur.
  function tryPlay(el) {
    if (!el) return;
    try {
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (err) {
      /* lecture refusée : le grand bouton du lecteur reste disponible */
    }
  }

  function playWhenReady(el) {
    tryPlay(el);
    ['api-ready', 'can-play', 'can-play-through', 'loaded-metadata'].forEach((evt) => {
      el.addEventListener(evt, () => tryPlay(el), { once: true });
    });
    // Filet de sécurité si aucun événement n'a été émis.
    setTimeout(() => tryPlay(el), 700);
  }

  // ---------- Changement de vidéo dans le lecteur principal ----------
  function select(index, reload) {
    if (index < 0 || index >= total) return;
    current = index;
    const item = items[index];
    const mediaId = item.dataset.mediaId;
    updateNav();

    if (!playerEl || reload) {
      // Premier clic (ou rechargement complet) : on installe le lecteur.
      loadPlayer()
        .then(() => mount(mediaId))
        .catch(() => markUnavailable(index));
      return;
    }

    // Le lecteur existe déjà : remplacement à chaud.
    if (typeof playerEl.replaceWithMedia === 'function') {
      clearUnavailable(index);
      playerEl.replaceWithMedia(mediaId, { playerColor: PLAYER_COLOR, transition: 'fade' });
      watchMedia(index);
      playWhenReady(playerEl);
    } else {
      // Repli : on recrée l'élément (le composant ne connaît pas la méthode).
      mount(mediaId);
    }
  }

  function mount(mediaId) {
    const previous = playerEl;
    const el = document.createElement('wistia-player');
    el.id = 'wpl-player';
    el.setAttribute('media-id', mediaId);
    el.setAttribute('player-color', PLAYER_COLOR);
    el.setAttribute('rounded-player', 'true');
    el.setAttribute('transparent-letterbox', 'true');
    el.setAttribute('big-play-button', 'true');
    el.setAttribute('fullscreen-control', 'true');
    el.setAttribute('volume-control', 'true');
    // Aucune option de partage / copie de lien dans le lecteur.
    el.setAttribute('copy-link-and-thumbnail', 'false');
    el.setAttribute('seo', 'false');
    el.style.width = '100%';

    stage.innerHTML = '';
    stage.appendChild(el);
    playerEl = el;

    if (previous) previous.remove();

    const index = current;
    clearUnavailable(index);
    watchMedia(index);
    playWhenReady(el);
  }

  // ---------- Surveillance du chargement d'un média ----------
  let mediaTimer = null;
  function watchMedia(index) {
    if (!playerEl) return;
    if (mediaTimer) clearTimeout(mediaTimer);

    let ready = false;
    const done = () => {
      if (ready) return;
      ready = true;
      clearUnavailable(index);
    };
    ['api-ready', 'can-play', 'can-play-through', 'loaded-metadata', 'play'].forEach((evt) => {
      playerEl.addEventListener(evt, done, { once: true });
    });
    playerEl.addEventListener('error', () => markUnavailable(index), { once: true });

    mediaTimer = setTimeout(() => {
      if (!ready) markUnavailable(index);
    }, MEDIA_TIMEOUT);
  }

  // ---------- Lecture automatique à la fin d'une vidéo ----------
  function bindPlayerEvents() {
    root.addEventListener(
      'ended',
      (e) => {
        if (e.target !== playerEl) return;
        if (current < total - 1) select(current + 1);
      },
      true
    );
  }

  // ---------- Écouteurs ----------
  items.forEach((item, i) => {
    item.addEventListener('click', () => select(i));
  });

  if (playBtn) playBtn.addEventListener('click', () => select(current));
  if (prevBtn) prevBtn.addEventListener('click', () => select(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => select(current + 1));

  // Navigation clavier dans la playlist (↑ ↓ comme un lecteur).
  if (list) {
    list.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? current + 1 : current - 1;
      if (next < 0 || next >= total) return;
      select(next);
      items[next].focus();
    });
  }

  bindPlayerEvents();
  updateNav();
})();