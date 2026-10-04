/* =========================================================
   KEMBOU — Pressbook : slider de cartes éditorial
   ------------------------------------------------------------
   Le HTML ne rend que cinq cartes. Chacune peut porter l'un des
   cinq rôles suivants, calculé à partir de la page active :

     is-center    la page affichée
     is-left      la page précédente, en retrait
     is-right     la page suivante, en retrait
     is-far-*     les pages au-delà, invisibles (fenêtre glissante)
     is-idle      emplacement libre

   Le rôle porte la transformation, en CSS. Il en découle que la
   direction du mouvement est automatique : en avançant, l'ancienne
   carte passe de `is-center` a `is-left` — elle sort par la gauche
   pendant que la nouvelle passe de `is-right` a `is-center`, elle
   arrive par la droite. En reculant, c'est l'inverse exact. Aucun
   cas particulier à écrire, donc aucune chance de désynchroniser
   les deux sens de navigation.

   Chargement : seules les pages de la fenêtre active portent un
   `src`. Les voisines sont préchargées via `new Image()`, ce qui
   remplit le cache du navigateur sans créer d'élément dans le
   document ni déclencher de lecture pour une image hors champ.
   ========================================================= */

(function () {
  'use strict';

  /* Aligné sur --pbs-dur (720ms), marge de sécurité comprise. */
  var SETTLE = 780;
  /* Durée de la cascade d'entrée, après laquelle les retard de
     transition des miniatures sont neutralisés (le survol doit
     rester réactif). */
  var CASCADE = 1800;
  /* Portée de l'hydratation des vignettes, en pages de part et
     d'autre de la page active. */
  var THUMB_REACH_Y = 4;
  var THUMB_REACH_X = 9;
  var SWIPE_MIN = 42;   /* px horizontal avant de valider un swipe  */
  var SWIPE_SLOP = 9;   /* px pour distinguer un swipe d'un tap    */
  var SWIPE_PULL = 0.55;

  var raf2 = window.requestAnimationFrame
    ? function (fn) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(fn);
        });
      }
    : function (fn) { window.setTimeout(fn, 32); };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function all(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function isNarrow() { return window.matchMedia('(max-width: 767px)').matches; }

  function readJson(root, attr) {
    try {
      return JSON.parse(root.getAttribute(attr) || '[]');
    } catch (e) {
      return [];
    }
  }

  /* =========================================================
     Slider — une instance par zone (section + visionneuse)
     ========================================================= */
  function Slider(root) {
    var i;

    this.root = root;
    this.stage = $('[data-pbs-stage]', root);
    this.btnPrev = $('[data-pbs-btn="prev"]', root);
    this.btnNext = $('[data-pbs-btn="next"]', root);
    this.thumbsBox = $('[data-pbs-thumbs]', root);
    this.track = $('[data-pbs-track]', root);
    this.fill = $('[data-pbs-fill]', root);
    this.live = $('[data-pbs-live]', root);
    this.outCur = $('[data-pbs-current]', root);
    this.outTot = $('[data-pbs-total]', root);

    this.total = parseInt(root.getAttribute('data-total'), 10) || 0;
    this.srcs = readJson(root, 'data-srcs');
    this.alts = readJson(root, 'data-alts');

    this.index = 0;
    this.busy = false;
    this.timer = 0;
    this.settleTimer = 0;
    this.visible = false;

    this.thumbs = this.track ? all('[data-pbs-thumb]', this.track) : [];

    /* Marges invisibles en tête de piste : elles laissent la piste
       défiler au-delà du début pour que la vignette active reste
       centrée sur la toute première page. */
    this.pad = 0;
    if (this.track) {
      for (i = 0; i < this.track.children.length; i++) {
        if (!this.track.children[i].classList.contains('pbs-pad')) break;
        this.pad++;
      }
    }

    this.cards = all('[data-pbs-card]', root).map(function (el) {
      return {
        el: el,
        img: $('[data-pbs-img]', el),
        tag: $('[data-pbs-tag]', el),
        index: null,
        role: 'idle'
      };
    });

    this._bind();
    this._sync();
    this._syncReadout();
    this._preload(0);

    /* La visionneuse est masquée au chargement : on joue sa cascade
       tout de suite pour ne pas la figer à opacity 0. */
    if (root.getAttribute('data-variant') === 'viewer') this.reveal();
  }

  /* ---------------- Rôles ---------------- */

  Slider.prototype._roles = function () {
    var a = this.index;
    var n = this.total;
    var out = {};
    out[a] = 'center';
    if (a - 1 >= 0) out[a - 1] = 'left';
    if (a + 1 < n) out[a + 1] = 'right';
    if (a - 2 >= 0) out[a - 2] = 'far-left';
    if (a + 2 < n) out[a + 2] = 'far-right';
    return out;
  };

  /**
   * Recalcule l'occupation des cinq emplacements.
   *
   * Deux temps, et la distinction est tout le système :
   *
   *   1. les cartes qui gardent leur page mais changent de rôle. C'est
   *      exactement ce qui produit la transition : l'ancienne carte
   *      centrale devient la voisine de gauche en avançant, la voisine
   *      de droite devient centrale. Seule la classe change, la
   *      transition CSS fait le reste.
   *
   *   2. les emplacements libres, qui reçoivent une nouvelle page. Ce
   *      sont toujours des emplacements invisibles (lointains ou libres),
   *      donc ils sont posés sous `is-jump` pour ne pas traverser la
   *      scène en animant.
   */
  Slider.prototype._sync = function (immediate) {
    var self = this;
    var roles = this._roles();
    var lock = immediate ? ' is-jump' : '';
    var i, j;

    for (i = 0; i < this.cards.length; i++) {
      var slot = this.cards[i];
      if (slot.index === null) continue;

      var want = roles[slot.index];

      if (!want) {
        /* Page hors fenêtre : l'emplacement est libéré. */
        slot.el.className = 'pbs-card is-idle is-jump';
        slot.el.setAttribute('data-page', '');
        slot.el.setAttribute('aria-hidden', 'true');
        slot.index = null;
        slot.role = 'idle';
      } else if (want !== slot.role) {
        slot.el.className = 'pbs-card is-' + want + lock;
        slot.role = want;
      }

      if (slot.index === self.index) slot.el.setAttribute('aria-hidden', 'false');
    }

    Object.keys(roles).forEach(function (key) {
      var idx = parseInt(key, 10);
      var role = roles[key];

      for (j = 0; j < self.cards.length; j++) {
        if (self.cards[j].index === idx) return;
      }

      var free = null;
      for (j = 0; j < self.cards.length; j++) {
        if (self.cards[j].index === null) { free = self.cards[j]; break; }
      }
      if (!free) return;

      free.index = idx;
      free.role = role;
      free.el.className = 'pbs-card is-' + role + ' is-jump';
      free.el.setAttribute('data-page', String(idx));
      free.el.setAttribute('aria-hidden', idx === self.index ? 'false' : 'true');

      if (free.img) {
        var url = self.srcs[idx];
        if (url) free.img.setAttribute('src', url);
        var alt = self.alts[idx];
        free.img.setAttribute('alt', alt || '');
      }
      if (free.tag) free.tag.textContent = pad2(idx + 1);
    });

    raf2(function () {
      for (var k = 0; k < self.cards.length; k++) {
        self.cards[k].el.classList.remove('is-jump');
      }
    });
  };

  /* ---------------- Compteur ---------------- */

  Slider.prototype._syncReadout = function () {
    var i;
    var n = this.total;

    if (this.outCur) this.outCur.textContent = pad2(this.index + 1);
    if (this.outTot) this.outTot.textContent = pad2(n);
    if (this.live) this.live.textContent = 'Page ' + (this.index + 1) + ' sur ' + n;

    this.root.style.setProperty(
      '--pbs-fill',
      String(n > 1 ? (this.index + 1) / n : 1)
    );

    for (i = 0; i < this.thumbs.length; i++) {
      if (i === this.index) this.thumbs[i].setAttribute('aria-current', 'true');
      else this.thumbs[i].removeAttribute('aria-current');
    }

    var atStart = this.index <= 0;
    var atEnd = this.index >= n - 1;
    if (this.btnPrev) this.btnPrev.disabled = atStart;
    if (this.btnNext) this.btnNext.disabled = atEnd;
  };

  /* ---------------- Colonne de miniatures ---------------- */

  /**
   * Recentre la vignette active dans la fenêtre visible.
   *
   * On lit la position réelle d'une vignette de référence dans la
   * piste plutôt que de recalculer la hauteur : la mesure reste juste
   * quels que soient les breakpoints, et la lecture se fait dans le
   * bon axe selon que la colonne est verticale (desktop) ou
   * horizontale (mobile).
   */
  Slider.prototype._slideTrack = function (immediate) {
    if (!this.track || !this.thumbs.length) return;

    var narrow = isNarrow();
    var perView = narrow ? this._perViewX() : this._perViewY();
    var lead = clamp(
      this.index - Math.floor(perView / 2),
      -this.pad,
      Math.max(-this.pad, this.total - perView)
    );

    var ref = this.track.children[this.pad + lead];
    if (!ref) return;

    var x = narrow ? ref.offsetLeft : 0;
    var y = narrow ? 0 : ref.offsetTop;

    this.track.style.transition = immediate ? 'none' : '';
    this.track.style.transform = 'translate3d(' + -x + 'px,' + -y + 'px,0)';

    if (immediate) {
      var self = this;
      raf2(function () { self.track.style.transition = ''; });
    }
  };

  Slider.prototype._perViewY = function () {
    var h = this.thumbs[0] ? this.thumbs[0].offsetHeight : 0;
    if (!h || !this.thumbsBox) return 3;
    var gap = parseFloat(getComputedStyle(this.track).getPropertyValue('gap')) || 0;
    return Math.max(1, Math.round(this.thumbsBox.clientHeight / (h + gap)));
  };

  Slider.prototype._perViewX = function () {
    var w = this.thumbs[0] ? this.thumbs[0].offsetWidth : 0;
    if (!w || !this.thumbsBox) return 3;
    var gap = parseFloat(getComputedStyle(this.track).getPropertyValue('gap')) || 0;
    return Math.max(1, Math.round(this.thumbsBox.clientWidth / (w + gap)));
  };

  Slider.prototype._lazyThumbs = function () {
    var reach = isNarrow() ? THUMB_REACH_X : THUMB_REACH_Y;
    for (var i = 0; i < this.thumbs.length; i++) {
      if (Math.abs(i - this.index) > reach) continue;
      var img = $('[data-pbs-thumb-img]', this.thumbs[i]);
      if (!img || img.getAttribute('src')) continue;
      var src = img.getAttribute('data-src');
      if (!src) continue;
      img.setAttribute('src', src);
      img.removeAttribute('data-src');
    }
  };

  /* ---------------- Préchargement ---------------- */

  Slider.prototype._preload = function (target) {
    var from = Math.max(0, target - 2);
    var to = Math.min(this.total - 1, target + 2);
    for (var i = from; i <= to; i++) {
      var url = this.srcs[i];
      if (!url) continue;
      var probe = new Image();
      probe.src = url;
    }
  };

  /* ---------------- Navigation ---------------- */

  Slider.prototype.goTo = function (target, immediate) {
    if (this.total < 2) return false;

    var to = clamp(target, 0, this.total - 1);
    if (to === this.index) return false;

    this.index = to;
    this._sync(immediate);
    this._syncReadout();
    this._slideTrack(immediate);
    this._lazyThumbs();
    this._preload(to);

    if (immediate) return true;

    var self = this;
    this.busy = true;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(function () { self.busy = false; }, SETTLE);
    return true;
  };

  Slider.prototype.next = function () { return this.goTo(this.index + 1); };
  Slider.prototype.prev = function () { return this.goTo(this.index - 1); };

  /* ---------------- Cascade d'entrée ---------------- */

  Slider.prototype.reveal = function () {
    var self = this;
    this.root.classList.add('is-in');
    window.clearTimeout(this.settleTimer);
    this.settleTimer = window.setTimeout(function () {
      self.root.classList.add('is-settled');
    }, CASCADE);
  };

  /* ---------------- Événements ---------------- */

  Slider.prototype._bind = function () {
    var self = this;

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', function () { self.prev(); });
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', function () { self.next(); });
    }

    /* Miniatures : sélection directe, avec la transition des flèches. */
    this.thumbs.forEach(function (btn, i) {
      btn.addEventListener('click', function () { self.goTo(i); });
    });

    /* --- Swipe / glisser-déposer --- */
    var sx = 0, sy = 0;
    var tracking = false;
    var decided = false;
    var swiped = false;

    /* Un glissement validé ne doit pas déclencher le clic qui le suit :
       sans ce garde-fou, viser une vignette pendant un swipe changerait
       deux fois de page. */
    this.root.addEventListener(
      'click',
      function (e) {
        if (!swiped) return;
        swiped = false;
        e.stopPropagation();
        e.preventDefault();
      },
      true
    );

    this.root.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      /* Sans cela,Chromium démarre un glissement natif de l'image au
         premier mouvement et émet `pointercancel` : le swipe est perdu. */
      if (e.cancelable) e.preventDefault();
      sx = e.clientX;
      sy = e.clientY;
      tracking = true;
      decided = false;
    });

    this.root.addEventListener('pointermove', function (e) {
      if (!tracking) return;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;

      if (!decided) {
        /* Trop court pour être un geste : on attend. */
        if (Math.abs(dx) < SWIPE_SLOP && Math.abs(dy) < SWIPE_SLOP) return;
        decided = true;
        /* Geste vertical : on rend la main au défilement de la page. */
        if (Math.abs(dy) > Math.abs(dx)) { tracking = false; return; }
        if (self.stage) self.stage.classList.add('is-grabbing');
        try { self.root.setPointerCapture(e.pointerId); } catch (err) {}
      }

      var pull = clamp(dx, -170, 170) * SWIPE_PULL;
      self.root.style.setProperty('--pbs-drag', pull.toFixed(1) + 'px');
    });

    function release(e) {
      if (!tracking) return;
      tracking = false;
      if (self.stage) self.stage.classList.remove('is-grabbing');
      self.root.style.setProperty('--pbs-drag', '0px');
      if (!decided) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) < SWIPE_MIN) return;
      swiped = true;
      if (dx < 0) self.next(); else self.prev();
    }

    this.root.addEventListener('pointerup', release);
    this.root.addEventListener('pointercancel', function () {
      tracking = false;
      if (self.stage) self.stage.classList.remove('is-grabbing');
      self.root.style.setProperty('--pbs-drag', '0px');
    });

    /* --- Parallaxe très légère au survol de la scène --- */
    if (this.stage) {
      this.stage.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || tracking) return;
        var r = self.stage.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        self.root.style.setProperty('--pbs-mx', (-nx * 12).toFixed(2) + 'px');
        self.root.style.setProperty('--pbs-my', (-ny * 7).toFixed(2) + 'px');
      });
      this.stage.addEventListener('pointerleave', function () {
        self.root.style.setProperty('--pbs-mx', '0px');
        self.root.style.setProperty('--pbs-my', '0px');
      });
    }

    /* La colonne change d'axe sous 768px, et la fenêtre peut être
       redimensionnée : dans les deux cas l'offset doit être refait. */
    var mq = window.matchMedia('(max-width: 767px)');
    var relayout = function () {
      self._slideTrack(true);
      self._lazyThumbs();
    };
    if (mq.addEventListener) mq.addEventListener('change', relayout);
    else if (mq.addListener) mq.addListener(relayout);

    window.addEventListener('resize', relayout);
  };

  /* =========================================================
     Construction
     ========================================================= */
  function build() {
    return all('[data-pbs]').map(function (el) { return new Slider(el); });
  }

  /* =========================================================
     Révélation : en-tête, carte, puis slider
     ========================================================= */
  function initReveal(instances) {
    /* Liste { el, slider } plutôt qu'une table indexée sur l'élément :
       une clé d'objet JavaScript est une chaîne, et tous les éléments
       DOM donneraient la même. */
    var targets = all('[data-dg-anim]').map(function (el) {
      return { el: el, slider: null };
    });
    instances.forEach(function (s) {
      if (s.root.getAttribute('data-variant') !== 'viewer') {
        targets.push({ el: s.root, slider: s });
      }
    });
    if (!targets.length) return;

    function show(t) {
      if (t.slider) t.slider.reveal();
      else t.el.classList.add('is-in');
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(show);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hit = null;
          for (var i = 0; i < targets.length; i++) {
            if (targets[i].el === entry.target) { hit = targets[i]; break; }
          }
          if (!hit) return;
          io.unobserve(entry.target);
          show(hit);
        });
      },
      /* Seuil bas et marge positive : la scène est haute, exiger 12 %
         de sa surface retardait la révélation jusqu'au scroll suivant. */
      { threshold: 0.04, rootMargin: '0px 0px 6% 0px' }
    );
    targets.forEach(function (t) { io.observe(t.el); });
  }

  /* =========================================================
     Visionneuse plein écran
     ========================================================= */
  function initLightbox(instances) {
    var box = $('[data-dg-lightbox]');
    if (!box) return;

    var closeBtn = $('[data-dg-close]', box);
    var big = instances.filter(function (s) {
      return s.root.closest('[data-dg-lightbox]');
    })[0];
    var main = instances.filter(function (s) {
      return !s.root.closest('[data-dg-lightbox]');
    })[0];
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      if (big && main && big !== main) big.goTo(main.index, true);
      box.classList.add('is-open');
      box.removeAttribute('hidden');
      document.documentElement.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      box.setAttribute('hidden', '');
      document.documentElement.style.overflow = '';
      if (big && main && big !== main && !main.busy) main.goTo(big.index);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    all('[data-dg-open]').forEach(function (btn) {
      btn.addEventListener('click', open);
    });
    if (closeBtn) closeBtn.addEventListener('click', close);

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.hasAttribute('data-dg-dismiss')) close();
    });

    box.__close = close;
    box.__open = open;
  }

  /* =========================================================
     Clavier : ← / → pour parcourir, Échap pour fermer
     ========================================================= */
  function initKeyboard(instances) {
    var box = $('[data-dg-lightbox]');

    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented) return;

      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }

      var open = !!(box && box.classList.contains('is-open'));

      if (e.key === 'Escape' && open) {
        e.preventDefault();
        box.__close();
        return;
      }

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      /* En visionneuse, le grand slider capte toujours les flèches.
         Sinon on ne réagit que si la section est franchement visible,
         pour ne pas confisquer le défilement horizontal ailleurs. */
      var slider = null;
      if (open) {
        slider = instances.filter(function (s) {
          return s.root.closest('[data-dg-lightbox]');
        })[0];
      } else {
        slider = instances.filter(function (s) { return s.visible; })[0];
      }
      if (!slider) return;

      e.preventDefault();
      if (e.key === 'ArrowLeft') slider.prev();
      else slider.next();
    });
  }

  /* =========================================================
     Visibilité : sert au clavier
     ========================================================= */
  function initVisibility(instances) {
    if (!('IntersectionObserver' in window)) {
      instances.forEach(function (s) { s.visible = true; });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var found = instances.filter(function (s) {
            return s.root === entry.target;
          })[0];
          if (found) found.visible = entry.isIntersecting;
        });
      },
      { threshold: 0.3 }
    );
    instances.forEach(function (s) { io.observe(s.root); });
  }

  /* =========================================================
     Boot
     ========================================================= */
  function boot() {
    if (!document.querySelector('[data-pbs]')) return;

    var instances = build();
    initVisibility(instances);
    initLightbox(instances);
    initKeyboard(instances);
    initReveal(instances);

    /* Exposé pour l'inspection en console. */
    window.__pressbook = instances;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
