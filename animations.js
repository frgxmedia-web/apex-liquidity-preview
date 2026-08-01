// ─── GSAP SCROLL ANIMATIONS ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.innerWidth < 768;

  // pin removed — caused overlap issues

  // ── MANIFESTO MONEY (subtle drift handled in CSS keyframes) ──

  // ── 2. HERO STATS FADE IN ──────────────────────────────────────
  gsap.to('.hero-stats', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 1.2,
  });

  // ── 3. STATS COUNT UP ─────────────────────────────────────────
  document.querySelectorAll('.stat-num').forEach(el => {
    const target  = parseFloat(el.dataset.count) || 0;
    const prefix  = el.dataset.prefix  || '';
    const suffix  = el.dataset.suffix  || '';
    const isFloat = String(target).includes('.');

    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = prefix + (isFloat
              ? obj.val.toFixed(1)
              : Math.round(obj.val)) + suffix;
          }
        });
      }
    });
  });

  // ── 4. SECTION TITLE CLIP-PATH WIPE ───────────────────────────
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0,
      duration: 1.1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      }
    });
  });

  // ── 5. ABOUT TITLE WORD-BY-WORD SPLIT ─────────────────────────
  const aboutTitle = document.querySelector('.about-title');
  if (aboutTitle) {
    const original = aboutTitle.textContent.trim();
    aboutTitle.innerHTML = original
      .split(' ')
      .map(w => `<span class="split-word">${w}</span>`)
      .join(' ');

    gsap.from('.about-title .split-word', {
      y: 70,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: aboutTitle,
        start: 'top 78%',
        once: true,
      }
    });
  }

  // ── 6. MANIFESTO QUOTE WORD SPLIT ─────────────────────────────
  const quote = document.querySelector('.manifesto-quote');
  if (quote) {
    // preserve the text, strip HTML line breaks into spaces
    const text = quote.innerText.trim();
    quote.innerHTML = text
      .split(' ')
      .map(w => `<span class="split-word">${w}</span>`)
      .join(' ');

    gsap.from('.manifesto-quote .split-word', {
      y: 50,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.045,
      scrollTrigger: {
        trigger: quote,
        start: 'top 80%',
        once: true,
      }
    });
  }

  // ── 7. SECTION EYEBROW FADE UP ────────────────────────────────
  gsap.utils.toArray('.section-eyebrow').forEach(el => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      }
    });
  });

  // ── 8. PARALLAX ON ABOUT TEXT ─────────────────────────────────
  if (!isMobile) {
    gsap.to('.about-text', {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // ── 9. CURSOR SPOTLIGHT (desktop only) ────────────────────────
  if (!isMobile) {
    const spot = document.createElement('div');
    spot.className = 'cursor-spotlight';
    document.body.appendChild(spot);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let sx = mx, sy = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function tick() {
      // smoothing — spotlight eases toward the cursor
      sx += (mx - sx) * 0.18;
      sy += (my - sy) * 0.18;
      spot.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ── 10. MAGNETIC BUTTONS (desktop only) ───────────────────────
  if (!isMobile) {
    document.querySelectorAll('.btn-gold, .btn-buy').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.4, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ── 11. FORTIFIED COVER FLOAT ─────────────────────────────────
  const cover = document.querySelector('.fortified-cover');
  if (cover) {
    gsap.to(cover, {
      y: -10,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  // ── 12. STICKY FLOATING CTA ───────────────────────────────────
  const stickyCTA = document.createElement('a');
  stickyCTA.className = 'sticky-cta';
  stickyCTA.href = '#books';
  stickyCTA.textContent = 'Claim Your Edge';
  document.body.appendChild(stickyCTA);

  gsap.set(stickyCTA, { opacity: 0, y: 80, pointerEvents: 'none' });

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom 70%',
    onEnter: () => gsap.to(stickyCTA, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.5 }),
    onLeaveBack: () => gsap.to(stickyCTA, { opacity: 0, y: 80, pointerEvents: 'none', duration: 0.4 }),
  });

  // hide sticky CTA when books section is visible (already there)
  ScrollTrigger.create({
    trigger: '#books',
    start: 'top center',
    end: 'bottom center',
    onToggle: ({ isActive }) => {
      gsap.to(stickyCTA, {
        opacity: isActive ? 0 : 1,
        pointerEvents: isActive ? 'none' : 'auto',
        duration: 0.3,
      });
    },
  });
});
