/* =========================================================
   KEMBOU — Pressbook flipbook 3D
   ------------------------------------------------------------
   Le livre compte une feuille de couverture plus une feuille par
   double-page. Chaque feuillet a un recto et un verso ; un
   feuillet tourné passe en `rotateY(-180deg)` autour de son bord
   gauche, ce qui amène son verso sur la moitié gauche du livre.

   index = nombre de feuillets déjà tournés
     index 0  -> livre fermé, couverture à droite
     index n  -> double-page n

   Les images ne sont jamais chargées d'un bloc : seules les pages
   proches de la position courante reçoivent un `src`.
   ========================================================= */

(function () {
  'use strict';

  var DUR = 720;    // ms, doit rester aligné sur --pb-dur
  var WINDOW = 1;   // pages chargées de part et d'autre

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  /* =========================================================
     Pressbook — une instance par livre (section + lightbox)
     ========================================================= */
  function Pressbook(root) {
    this.root = root;
    this.stage = $('[data-pb-stage]', root);
    this.sheets = Array.prototype.slice.call(root.querySelectorAll('[data-pb-sheet]'));
    this.hitPrev = $('[data-pb-hit="prev"]', root);
    this.hitNext = $('[data-pb-hit="next"]', root);
    this.btnPrev = $('[data-pb-btn="prev"]', root);
    this.btnNext = $('[data-pb-btn="next"]', root);

    var scope = root.closest('[data-pb-scope]') || document;
    this.outCur = $('[data-pb-current]', scope);
    this.outTot = $('[data-pb-total]', scope);
    this.outLive = $('[data-pb-live]', root);

    this.spreads = parseInt(root.getAttribute('data-spreads'), 10) || 0;
    this.index = 0;
    this.busy = false;
    this.timer = 0;

    this._bind();
    this.setMode(Pressbook.preferredMode(), true);

    // goTo(0) serait un no-op (l'index vaut déjà 0) : on pose l'état initial
    // à la main. Sinon les z-index ne sont jamais attribués — la pile s'affiche
    // alors dans l'ordre du DOM, donc à la dernière page et non à la couverture —
    // et les images ne sont jamais hydratées.
    this._render();
    this._hydrate();
    this._preload(0);
  }

  Pressbook.preferredMode = function () {
    return window.matchMedia('(max-width: 639px)').matches ? 'single' : 'spread';
  };

  Pressbook.prototype.setMode = function (mode, initial) {
    this.root.setAttribute('data-mode', mode);
    var single = mode === 'single';
    // En mode single page, toute la page visible fait « avancer ».
    if (this.hitPrev) this.hitPrev.style.display = single ? 'none' : '';
    if (this.hitNext) {
      this.hitNext.style.left = single ? '0' : '';
      this.hitNext.style.width = single ? '100%' : '';
    }
    if (!initial) this._render();
  };

  /* ---------------- Chargement des images ---------------- */

  Pressbook.prototype._paint = function (sheet, load) {
    if (!sheet) return;
    // Recto et verso portent des images différentes : on lit l'attribut
    // correspondant à la face, sinon le verso afficherait le recto.
    var front = sheet.getAttribute('data-front');
    var back = sheet.getAttribute('data-back');
    var faces = sheet.querySelectorAll('.pb-face');
    for (var i = 0; i < faces.length; i++) {
      var img = $('[data-pb-img]', faces[i]);
      if (!img) continue;
      var url = faces[i].classList.contains('pb-face--back') ? back : front;
      if (load) {
        if (url && img.getAttribute('src') !== url) img.setAttribute('src', url);
      } else {
        img.removeAttribute('src');
      }
    }
  };

  Pressbook.prototype._hydrate = function () {
    for (var i = 0; i < this.sheets.length; i++) {
      var sheet = this.sheets[i];
      var isCover = sheet.hasAttribute('data-cover');
      var spread = parseInt(sheet.getAttribute('data-spread') || '0', 10);
      var near = isCover ? this.index <= 1 : Math.abs(spread - this.index) <= WINDOW;

      this._paint(sheet, near);
      if (near) sheet.removeAttribute('aria-hidden');
      else sheet.setAttribute('aria-hidden', 'true');
    }
  };

  /** Précharge en mémoire les pages de la position voisine.
   *  On passe par des Image() hors DOM plutôt que par un src : le navigateur
   *  met en cache sans garder d'élément en mémoire, et sans déclencher de
   *  lecture quand l'image est hors champ (loading="lazy"). */
  Pressbook.prototype._preload = function (target) {
    var lo = Math.max(0, target - 2);
    var hi = Math.min(this.sheets.length - 1, target + 2);
    for (var i = lo; i <= hi; i++) {
      var sheet = this.sheets[i];
      if (!sheet || sheet.hasAttribute('data-cover')) continue;
      var faces = [sheet.getAttribute('data-front'), sheet.getAttribute('data-back')];
      for (var j = 0; j < faces.length; j++) {
        if (!faces[j]) continue;
        var probe = new Image();
        probe.src = faces[j];
      }
    }
  };

  /* ---------------- Rendu d'état ---------------- */

  Pressbook.prototype._render = function () {
    for (var i = 0; i < this.sheets.length; i++) {
      var sheet = this.sheets[i];
      var spread = parseInt(sheet.getAttribute('data-spread') || '0', 10);

      // À l'index n, le feuillet n est encore debout : c'est son recto qui
      // forme la page de droite de la double-page n. Seuls 0..n-1 sont couchés
      // à gauche. Tester « <= » faisait tourner le feuillet n d'une page trop
      // tôt : la double-page sautait une page et le compteur mentait.
      if (spread < this.index) {
        sheet.classList.add('is-flipped');
        // Pile de gauche : le feuillet le plus récemment tourné au-dessus.
        sheet.style.zIndex = String(1000 + spread);
      } else {
        sheet.classList.remove('is-flipped');
        // Pile de droite : la couverture (spread 0) au-dessus.
        sheet.style.zIndex = String(2000 - spread);
      }
    }

    if (this.outCur) {
      this.outCur.textContent = String(this.index < 1 ? 1 : this.index).padStart(2, '0');
    }
    if (this.outTot) this.outTot.textContent = String(this.spreads).padStart(2, '0');
    // Annonce pour les lecteurs d'ecran : le compteur visuel, lui, est masque.
    if (this.outLive) {
      this.outLive.textContent =
        'Double-page ' + (this.index < 1 ? 1 : this.index) + ' sur ' + this.spreads;
    }

    var atStart = this.index <= 0;
    var atEnd = this.index >= this.spreads;
    if (this.btnPrev) this.btnPrev.disabled = atStart;
    if (this.btnNext) this.btnNext.disabled = atEnd;
    if (this.hitPrev) this.hitPrev.setAttribute('aria-disabled', String(atStart));
    if (this.hitNext) this.hitNext.setAttribute('aria-disabled', String(atEnd));

    this.root.setAttribute('data-index', String(this.index));
  };

  /* ---------------- Navigation ---------------- */

  Pressbook.prototype.goTo = function (target, immediate) {
    var to = Math.max(0, Math.min(this.spreads, target));
    if (this.busy && !immediate) return false;
    if (to === this.index) return false;

    var self = this;
    var forward = to > this.index;

    if (immediate) {
      // Pose l'état sans déclencher de transition.
      this.stage.classList.remove('is-flip-forward', 'is-flip-back');
      for (var k = 0; k < this.sheets.length; k++) this.sheets[k].classList.add('is-disabled');
    } else {
      this.stage.classList.toggle('is-flip-forward', forward);
      this.stage.classList.toggle('is-flip-back', !forward);
    }

    this.index = to;
    this._render();
    this._hydrate();
    this._preload(to);

    if (immediate) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          for (var k = 0; k < self.sheets.length; k++) self.sheets[k].classList.remove('is-disabled');
        });
      });
      return true;
    }

    this.busy = true;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(function () {
      self.stage.classList.remove('is-flip-forward', 'is-flip-back');
      self.busy = false;
    }, DUR + 40);
    return true;
  };

  Pressbook.prototype.next = function () { return this.goTo(this.index + 1); };
  Pressbook.prototype.prev = function () { return this.goTo(this.index - 1); };

  /* ---------------- Événements ---------------- */

  Pressbook.prototype._bind = function () {
    var self = this;

    if (this.btnPrev) this.btnPrev.addEventListener('click', function () { self.prev(); });
    if (this.btnNext) this.btnNext.addEventListener('click', function () { self.next(); });
    if (this.hitPrev) this.hitPrev.addEventListener('click', function () { self.prev(); });
    if (this.hitNext) this.hitNext.addEventListener('click', function () { self.next(); });

    var sx = 0, sy = 0, tracking = false;
    this.root.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    this.root.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx;
      var dy = t.clientY - sy;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) self.next(); else self.prev();
    }, { passive: true });
  };

  window.Pressbook = Pressbook;

  window.__pressbookInit = function () {
    var books = Array.prototype.slice.call(document.querySelectorAll('[data-pressbook]'));
    var instances = books.map(function (el) { return new Pressbook(el); });

    var mq = window.matchMedia('(max-width: 639px)');
    var onChange = function () {
      var mode = Pressbook.preferredMode();
      instances.forEach(function (b) { b.setMode(mode); });
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);

    return instances;
  };

  /* =========================================================
     Lightbox plein écran
     ========================================================= */
  function initLightbox(instances) {
    var box = $('[data-dg-lightbox]');
    if (!box) return;

    var closeBtn = $('[data-dg-close]', box);
    // On identifie les livres par leur ancêtre, pas par leur position.
    var big = instances.filter(function (b) { return b.root.closest('[data-dg-lightbox]'); })[0];
    var main = instances.filter(function (b) { return !b.root.closest('[data-dg-lightbox]'); })[0];
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      box.classList.add('is-open');
      box.removeAttribute('hidden');
      document.documentElement.style.overflow = 'hidden';
      if (big && main && big !== main) big.goTo(main.index, true);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      box.setAttribute('hidden', '');
      document.documentElement.style.overflow = '';
      if (big && main && big !== main && !main.busy) main.goTo(big.index);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('[data-dg-open]').forEach(function (btn) {
      btn.addEventListener('click', open);
    });
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Clic sur le fond ou sur la zone de dismissal pour fermer.
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.hasAttribute('data-dg-dismiss')) close();
    });

    box.__close = close;
    box.__open = open;
  }

  /* =========================================================
     Clavier : ← / → pour feuilleter, Échap pour fermer
     ========================================================= */
  function initKeyboard(instances) {
    var box = $('[data-dg-lightbox]');

    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented) return;

      var open = box && box.classList.contains('is-open');
      var target = e.target;
      var typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing) return;

      if (e.key === 'Escape' && open) {
        e.preventDefault();
        box.__close();
        return;
      }

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      // En lightbox, le livre agrandi capte toujours les flèches.
      // Sinon, on ne réagit que si la section est franchement visible,
      // pour ne pas confisquer le défilement horizontal ailleurs.
      var book = null;
      if (open) {
        book = instances.find(function (b) { return b.root.closest('[data-dg-lightbox]'); });
      } else {
        book = instances.find(function (b) { return b.visible; });
      }
      if (!book) return;

      e.preventDefault();
      if (e.key === 'ArrowLeft') book.prev();
      else book.next();
    });
  }

  /* =========================================================
     Visibilité : sert au clavier et n'anime qu'une fois
     ========================================================= */
  function initVisibility(instances) {
    if (!('IntersectionObserver' in window)) {
      instances.forEach(function (b) { b.visible = true; });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var book = instances.find(function (b) { return b.root === entry.target; });
          if (book) book.visible = entry.isIntersecting;
        });
      },
      { threshold: 0.35 }
    );
    instances.forEach(function (b) { io.observe(b.root); });
  }

  /* =========================================================
     Révélation de la section, en cascade
     ========================================================= */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-dg-anim]'));
    if (!items.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
     Amorçage
     ========================================================= */
  function boot() {
    if (!document.querySelector('[data-pressbook]')) return;

    var instances = window.__pressbookInit();
    initVisibility(instances);
    initLightbox(instances);
    initKeyboard(instances);
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
