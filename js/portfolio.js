(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileNavigation = window.matchMedia('(max-width: 860px)');
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const navigationLinks = [...document.querySelectorAll('[data-nav-link]')];

  const setMenuState = (open, returnFocus = false) => {
    if (!menuButton || !navigation) return;

    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('menu-open', open);

    if (open) {
      navigationLinks[0]?.focus();
    } else if (returnFocus) {
      menuButton.focus();
    }
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('click', (event) => {
    if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
    if (navigation?.contains(event.target) || menuButton?.contains(event.target)) return;
    setMenuState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (menuButton?.getAttribute('aria-expanded') !== 'true') return;

    if (event.key === 'Escape') {
      setMenuState(false, true);
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [menuButton, ...navigationLinks].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileNavigation.addEventListener('change', (event) => {
    if (!event.matches) setMenuState(false);
  });

  let scrollTicking = false;
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateHeader);
  }, { passive: true });
  updateHeader();

  const revealElements = [...document.querySelectorAll('.reveal')];
  revealElements.forEach((element) => {
    const delay = Math.min(Number(element.dataset.delay || 0), 300);
    if (delay) element.style.transitionDelay = `${delay}ms`;
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8%', threshold: 0.08 });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const timelines = [...document.querySelectorAll('.timeline')];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    timelines.forEach((timeline) => timelineObserver.observe(timeline));
  } else {
    timelines.forEach((timeline) => timeline.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('[data-section]')];
  let navigationTicking = false;

  const updateActiveNavigation = () => {
    const headerHeight = header?.offsetHeight || 0;
    const marker = window.scrollY + headerHeight + Math.min(window.innerHeight * 0.28, 260);
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeSection = section;
    });
    if (atPageEnd) activeSection = sections[sections.length - 1];

    navigationLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${activeSection?.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    navigationTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (navigationTicking) return;
    navigationTicking = true;
    window.requestAnimationFrame(updateActiveNavigation);
  }, { passive: true });
  updateActiveNavigation();

  const roleElement = document.querySelector('.role-rotator');
  const roles = [
    'Senior Data Scientist',
    'AI Engineer',
    'Machine Learning Engineer',
    'GenAI & Agentic AI Practitioner'
  ];

  if (roleElement && !reducedMotion.matches) {
    let roleIndex = 0;
    window.setInterval(() => {
      roleElement.classList.add('is-changing');
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleElement.textContent = roles[roleIndex];
        roleElement.classList.remove('is-changing');
      }, 190);
    }, 2800);
  }

  const counters = [...document.querySelectorAll('[data-counter]')];
  const animateCounter = (element) => {
    const target = Number(element.dataset.counter);
    const suffix = element.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();
    element.textContent = `0${suffix}`;

    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.7 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const copyButton = document.querySelector('[data-copy-email]');
  const copyToast = document.querySelector('.copy-toast');
  let toastTimer;

  const showToast = (message) => {
    if (!copyToast) return;
    window.clearTimeout(toastTimer);
    copyToast.textContent = message;
    copyToast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => copyToast.classList.remove('is-visible'), 2400);
  };

  const fallbackCopy = (text) => {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    return copied;
  };

  copyButton?.addEventListener('click', async () => {
    const email = 'tajamulk@gmail.com';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else if (!fallbackCopy(email)) throw new Error('Copy unavailable');
      copyButton.textContent = 'Copied';
      showToast('Email copied to clipboard.');
      window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1800);
    } catch {
      showToast('Copy unavailable. Email: tajamulk@gmail.com');
    }
  });

  const currentYear = document.querySelector('[data-current-year]');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  class DataNetwork {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: true });
      this.hero = canvas.closest('.hero');
      this.nodes = [];
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.frame = null;
      this.lastFrame = 0;
      this.pointer = { x: 0, y: 0, active: false };
      this.reduce = reducedMotion.matches;
      this.visible = !document.hidden;
      this.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);
      this.onVisibility = this.onVisibility.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerLeave = this.onPointerLeave.bind(this);

      this.resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(this.resize) : null;
      this.resizeObserver?.observe(this.hero);
      if (!this.resizeObserver) window.addEventListener('resize', this.resize, { passive: true });

      document.addEventListener('visibilitychange', this.onVisibility);
      if (this.finePointer) {
        window.addEventListener('pointermove', this.onPointerMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', this.onPointerLeave);
      }

      this.resize();
      if (this.reduce) this.draw(0);
      else this.start();
    }

    resize() {
      const rect = this.hero.getBoundingClientRect();
      this.width = Math.max(1, Math.round(rect.width));
      this.height = Math.max(1, Math.round(rect.height));
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      const nodeCount = Math.max(18, Math.min(38, Math.round(this.width / 42)));
      this.nodes = Array.from({ length: nodeCount }, (_, index) => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        radius: index % 7 === 0 ? 1.7 : 1.1,
        phase: Math.random() * Math.PI * 2
      }));

      if (this.reduce) this.draw(0);
    }

    onPointerMove(event) {
      const rect = this.hero.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) {
        this.pointer.active = false;
        return;
      }
      this.pointer.x = event.clientX - rect.left;
      this.pointer.y = event.clientY - rect.top;
      this.pointer.active = true;
    }

    onPointerLeave() {
      this.pointer.active = false;
    }

    onVisibility() {
      this.visible = !document.hidden;
      if (this.visible) this.start();
      else this.stop();
    }

    start() {
      if (this.frame || this.reduce || !this.visible) return;
      this.lastFrame = performance.now();
      this.frame = window.requestAnimationFrame(this.loop);
    }

    stop() {
      if (!this.frame) return;
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }

    loop(time) {
      this.frame = window.requestAnimationFrame(this.loop);
      if (time - this.lastFrame < 32) return;
      this.lastFrame = time;
      this.update();
      this.draw(time);
    }

    update() {
      this.nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -10) node.x = this.width + 10;
        if (node.x > this.width + 10) node.x = -10;
        if (node.y < -10) node.y = this.height + 10;
        if (node.y > this.height + 10) node.y = -10;

        if (this.pointer.active) {
          const dx = node.x - this.pointer.x;
          const dy = node.y - this.pointer.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 17000 && distanceSquared > 1) {
            const influence = (1 - distanceSquared / 17000) * 0.035;
            node.x += dx * influence;
            node.y += dy * influence;
          }
        }
      });
    }

    draw(time) {
      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      const connectionDistance = this.width < 680 ? 115 : 150;

      for (let i = 0; i < this.nodes.length; i += 1) {
        const a = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j += 1) {
          const b = this.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance >= connectionDistance) continue;

          const alpha = (1 - distance / connectionDistance) * 0.11;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(20, 110, 245, ${alpha})`;
          context.lineWidth = 0.7;
          context.stroke();
        }

        const pulse = this.reduce ? 0 : Math.max(0, Math.sin(time * 0.0007 + a.phase)) * 0.55;
        context.beginPath();
        context.arc(a.x, a.y, a.radius + pulse, 0, Math.PI * 2);
        context.fillStyle = i % 7 === 0 ? 'rgba(34, 184, 207, 0.38)' : 'rgba(20, 110, 245, 0.25)';
        context.fill();
      }
    }
  }

  const networkCanvas = document.querySelector('.data-network');
  if (networkCanvas) new DataNetwork(networkCanvas);
})();
