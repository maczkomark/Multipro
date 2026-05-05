/* ============================================
   MULTIPRO GROUP — main.js
   Vanilla, no deps
   ============================================ */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const onReady = (fn) => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

  onReady(() => {
    initYear();
    initNavScroll();
    initMobileMenu();
    initSmoothAnchor();
    initReveal();
    initStatsCounter();
    initPortfolioFilter();
    initFAQ();
    initContactForm();
  });

  /* ── Footer year ──────────────────────────── */
  function initYear() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── Nav: shadow on scroll ────────────────── */
  function initNavScroll() {
    const nav = $('#nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mobile menu ──────────────────────────── */
  function initMobileMenu() {
    const burger = $('.nav__burger');
    const menu = $('#mobile-menu');
    if (!burger || !menu) return;
    const close = () => {
      burger.setAttribute('aria-expanded', 'false');
      menu.dataset.open = 'false';
      menu.hidden = true;
    };
    const open = () => {
      burger.setAttribute('aria-expanded', 'true');
      menu.dataset.open = 'true';
      menu.hidden = false;
    };
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });
    $$('a', menu).forEach(a => a.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 960) close(); });
  }

  /* ── Smooth scroll & active anchor ────────── */
  function initSmoothAnchor() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── Scroll reveal ────────────────────────── */
  function initReveal() {
    const targets = [
      ...$$('.section-head'),
      ...$$('.svc'),
      ...$$('.about__media'),
      ...$$('.about__content > *'),
      ...$$('.stats__heading'),
      ...$$('.stat'),
      ...$$('.step'),
      ...$$('.process__cta'),
      ...$$('.portfolio__filters'),
      ...$$('.card'),
      ...$$('.faq__head'),
      ...$$('.faq__item'),
      ...$$('.contact__intro > *'),
      ...$$('.form'),
    ];
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.dataset.delay = (i % 5) + 1;
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* ── Stats counter ────────────────────────── */
  function initStatsCounter() {
    const stats = $$('.stat');
    if (!stats.length || !('IntersectionObserver' in window)) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.target || '0');
      const counter = $('.stat__count', el);
      if (!counter) return;
      const dur = 1600;
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        const v = Math.round(target * eased);
        counter.textContent = v;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(s => io.observe(s));
  }

  /* ── Portfolio filter ─────────────────────── */
  function initPortfolioFilter() {
    const chips = $$('.portfolio__filters .chip');
    const cards = $$('.portfolio__grid .card');
    if (!chips.length || !cards.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-selected', c === chip);
        });
        const filter = chip.dataset.filter;
        cards.forEach(card => {
          const cat = card.dataset.cat;
          const show = filter === 'all' || cat === filter;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ── FAQ: accordion (only one open) ───────── */
  function initFAQ() {
    const items = $$('.faq__item');
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach(other => { if (other !== item) other.open = false; });
        }
      });
    });
  }

  /* ── Contact form ─────────────────────────── */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const successBox = $('.form__success', form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Basic HTML5 validity
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());

      // Build mailto fallback so the message reaches Marcell even without backend
      const subject = encodeURIComponent(`Új ajánlatkérés — ${data.service || 'Általános'}`);
      const body = encodeURIComponent(
        `Név: ${data.name || ''}\n` +
        `Telefon: ${data.phone || ''}\n` +
        `E-mail: ${data.email || ''}\n` +
        `Szolgáltatás: ${data.service || ''}\n\n` +
        `Üzenet:\n${data.message || ''}`
      );
      const mailto = `mailto:infomultipro01@gmail.com?subject=${subject}&body=${body}`;
      // Open user's mail client in a new tab
      window.location.href = mailto;

      // Show inline success
      $$('.field, .checkbox, .btn--block', form).forEach(el => el.style.display = 'none');
      if (successBox) successBox.hidden = false;
      form.reset();
    });
  }

})();
