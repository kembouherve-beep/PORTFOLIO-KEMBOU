/* =========================================================
   KEMBOU — Portfolio 2026
   Interactions & animations premium
   ========================================================= */

(function () {
  'use strict';

  // ========== SCROLL PROGRESS BAR ==========
  const scrollProgress = document.getElementById('scroll-progress');
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    if (scrollProgress) scrollProgress.style.width = progress + '%';
  };

  // ========== NAV SCROLLED STATE ==========
  const mainNav = document.getElementById('main-nav');
  const updateNavState = () => {
    if (window.scrollY > 100) {
      mainNav?.classList.add('scrolled');
    } else {
      mainNav?.classList.remove('scrolled');
    }
  };

  // ========== NAV ACTIVE LINK ==========
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const updateActiveNav = () => {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-nav') === current) {
        link.classList.add('active');
      }
    });
  };

  // ========== SCROLL LISTENER (throttled) ==========
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavState();
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ========== MOBILE MENU ==========
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
    const icon = mobileBtn.querySelector('i');
    icon?.classList.toggle('fa-bars');
    icon?.classList.toggle('fa-xmark');
  });

  document.querySelectorAll('[data-mobile-nav]').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.add('hidden');
      const icon = mobileBtn?.querySelector('i');
      icon?.classList.add('fa-bars');
      icon?.classList.remove('fa-xmark');
    });
  });

  // ========== INTERSECTION OBSERVER — Reveal ==========
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal-text, .reveal-fade, .exp-item, .process-step').forEach((el) => {
    revealObserver.observe(el);
  });

  // ========== EXPERIENCE ITEMS STAGGER ==========
  const expObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 150);
          expObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.exp-item').forEach((el) => expObserver.observe(el));

  // ========== PROCESS STEPS ANIMATION ==========
  const processObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const steps = document.querySelectorAll('.process-step');
          const progress = document.getElementById('process-progress');
          steps.forEach((step, i) => {
            setTimeout(() => step.classList.add('visible'), i * 200);
          });
          if (progress) {
            setTimeout(() => (progress.style.width = '100%'), 300);
          }
          processObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const processSection = document.getElementById('processus');
  if (processSection) processObserver.observe(processSection);

  // ==========================================================
  //  04 — TRAVAUX DE RÉFÉRENCE
  //  Le lecteur Wistia et sa playlist sont pilotés par
  //  public/static/js/playlist.js. Ici on ne fait que le bloc
  //  d'apparition au scroll.
  // ==========================================================

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Révélation des blocs au scroll ----------
  const blockObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          blockObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.wpl').forEach((el) => blockObserver.observe(el));

  // ========== CURSEUR PERSONNALISÉ (Desktop only) ==========
  if (window.matchMedia('(min-width: 768px)').matches && !('ontouchstart' in window)) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) {
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
      }
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ring) {
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
      }
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover states
    document.querySelectorAll('a, button, .wpl-item, .skill-card, .tool-card').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ========== PARALLAX LÉGER — Hero portrait ==========
  const heroPortrait = document.querySelector('.hero-portrait');
  if (heroPortrait) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        const y = window.scrollY * 0.15;
        heroPortrait.style.transform = `translateY(${y}px)`;
      }
    });
  }

  // ========== HERO BENTO — parallaxe souris sur le portrait ==========
  const bentoPortrait = document.querySelector('.bento-portrait-img');
  const bentoStage = document.querySelector('[data-bento]');
  if (bentoPortrait && bentoStage && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const settle = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      // scale légèrement > 1 pour éviter un liseré vide pendant le déplacement
      bentoPortrait.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(1.04)`;
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(settle) : 0;
    };
    const nudge = () => { if (!raf) raf = requestAnimationFrame(settle); };
    bentoStage.addEventListener('mousemove', (e) => {
      const r = bentoStage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -26;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -18;
      nudge();
    });
    bentoStage.addEventListener('mouseleave', () => { tx = 0; ty = 0; nudge(); });
  }

  // ========== INIT ==========
  updateNavState();
  updateActiveNav();

  console.log('%c KEMBOU Portfolio 2026 ', 'background:#f5c25b;color:#050505;font-weight:bold;padding:6px 12px;border-radius:4px');
  console.log('%c Vidéaste & Monteur Vidéo ', 'color:#f5c25b;font-style:italic');
})();
