
// Background video ping-pong loop (forward then reverse) for seamless loop
function setupPingPongVideo(video) {
  if (!video) return;
  video.playbackRate = 1;
  let direction = 1;
  let lastTs = 0;

  function reverseTick(ts) {
    if (direction !== -1) return;
    if (!lastTs) lastTs = ts;
    const delta = (ts - lastTs) / 1000;
    lastTs = ts;
    video.currentTime = Math.max(0, video.currentTime - delta);
    if (video.currentTime <= 0.05) {
      direction = 1;
      lastTs = 0;
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      requestAnimationFrame(reverseTick);
    }
  }

  video.addEventListener('timeupdate', () => {
    if (direction === 1 && video.duration && video.currentTime >= video.duration - 0.1) {
      direction = -1;
      video.pause();
      lastTs = 0;
      requestAnimationFrame(reverseTick);
    }
  });

  const tryPlay = () => video.play().catch(() => {});
  tryPlay();
  document.addEventListener('click', tryPlay, { once: true });
}

document.querySelectorAll('.community-video').forEach(setupPingPongVideo);

// Mastery cards — infinite-loop carousel on mobile
(function () {
  const grid = document.querySelector('.mastery-grid');
  if (!grid || window.innerWidth > 768) return;

  // Clone all cards once at start and once at end for seamless loop
  const originals = Array.from(grid.children);
  const cloneSetBefore = originals.map(c => c.cloneNode(true));
  const cloneSetAfter = originals.map(c => c.cloneNode(true));
  cloneSetBefore.reverse().forEach(c => grid.insertBefore(c, grid.firstChild));
  cloneSetAfter.forEach(c => grid.appendChild(c));

  // Wait for layout, then position scroll at the start of the original set
  requestAnimationFrame(() => {
    const firstOriginal = grid.children[originals.length];
    grid.scrollLeft = firstOriginal.offsetLeft - (grid.clientWidth - firstOriginal.clientWidth) / 2;
  });

  let scrollTimer = null;
  grid.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const scrollLeft = grid.scrollLeft;
      const total = grid.scrollWidth;
      const oneSetWidth = total / 3;
      // If scrolled past the original set into the trailing clones, jump back
      if (scrollLeft >= oneSetWidth * 2 - 20) {
        grid.style.scrollBehavior = 'auto';
        grid.scrollLeft = scrollLeft - oneSetWidth;
        grid.style.scrollBehavior = '';
      } else if (scrollLeft <= 20) {
        grid.style.scrollBehavior = 'auto';
        grid.scrollLeft = scrollLeft + oneSetWidth;
        grid.style.scrollBehavior = '';
      }
    }, 80);
  });
})();

// Nav scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu — staggered open/close handled in index.html inline script
function closeMobile() {
  window.__closeStaggeredMenu && window.__closeStaggeredMenu();
}

// Checkout modal — renders the PayPal Hosted Button for the chosen product
function openCheckout(title, price, paypalBtnId) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalPrice').textContent = price;
  document.getElementById('checkoutModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  const container = document.getElementById('paypal-button-container');
  // Wipe previous PayPal iframe before rendering a new one
  container.innerHTML = '';

  if (!paypalBtnId) {
    container.innerHTML = '<div class="paypal-pending">PayPal checkout is being set up for this product. Please check back shortly or contact us below.</div>';
    return;
  }

  if (typeof paypal === 'undefined' || !paypal.HostedButtons) {
    container.innerHTML = '<div class="paypal-pending">Payment system is loading. Please try again in a moment.</div>';
    return;
  }

  paypal.HostedButtons({ hostedButtonId: paypalBtnId })
    .render('#paypal-button-container');
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
  const container = document.getElementById('paypal-button-container');
  if (container) container.innerHTML = '';
}

document.getElementById('checkoutModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('checkoutModal')) closeCheckout();
});

// Toast
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Contact form
function submitContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  setTimeout(() => {
    btn.textContent = 'Message Sent ✦';
    e.target.reset();
    setTimeout(() => { btn.textContent = 'Send Message'; }, 3000);
  }, 1200);
}


// ─── ABOUT SCROLL ANIMATION ───────────────────────────────────
(function () {
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;
  const title = aboutSection.querySelector('.about-title');
  const text  = aboutSection.querySelector('.about-text');
  const words = Array.from(aboutSection.querySelectorAll('.about-words span'));
  function triggerAbout() {
    const rect = aboutSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.65) {
      title?.classList.add('about-in');
      text?.classList.add('about-in');
      words.forEach((w, i) => setTimeout(() => w.classList.add('about-in'), 400 + i * 120));
      window.removeEventListener('scroll', triggerAbout);
    }
  }
  window.addEventListener('scroll', triggerAbout, { passive: true });
  triggerAbout();
})();

// ─── SCROLL REVEAL (Motion) ───────────────────────────────────
(function () {
  if (typeof Motion === 'undefined') return;
  const { animate, inView, stagger } = Motion;

  const EASE   = [0.22, 1, 0.36, 1];
  const SPRING = { type: 'spring', stiffness: 80, damping: 18 };

  // Section headers — fade + rise
  inView('.section-header', ({ target }) => {
    animate(target, { opacity: [0, 1], y: [44, 0] },
      { duration: 0.75, easing: EASE });
  }, { amount: 0.3 });

  // Manifesto quote — slide from left
  const mq = document.querySelector('.manifesto-quote');
  if (mq) inView(mq, ({ target }) => {
    animate(target, { opacity: [0, 1], x: [-50, 0] },
      { duration: 0.8, easing: EASE });
  }, { amount: 0.4 });

  // About content — fade up
  inView('.about-content', ({ target }) => {
    animate(target, { opacity: [0, 1], y: [36, 0] },
      { duration: 0.7, easing: EASE });
  }, { amount: 0.3 });

  // Book cards — spring stagger
  inView('.books-grid', ({ target }) => {
    animate(target.querySelectorAll('.book-card'),
      { opacity: [0, 1], y: [60, 0] },
      { ...SPRING, delay: stagger(0.13) });
  }, { amount: 0.15 });

  // Mastery cards — spring stagger
  inView('.mastery-grid', ({ target }) => {
    animate(target.querySelectorAll('.mastery-card'),
      { opacity: [0, 1], y: [50, 0], scale: [0.96, 1] },
      { ...SPRING, delay: stagger(0.10) });
  }, { amount: 0.1 });

  // Community cards — slide from left stagger
  inView('.comm-cards', ({ target }) => {
    animate(target.querySelectorAll('.comm-card'),
      { opacity: [0, 1], x: [-40, 0] },
      { duration: 0.65, easing: EASE, delay: stagger(0.12) });
  }, { amount: 0.2 });

  // Bundle card — subtle scale in
  inView('.bundle-card', ({ target }) => {
    animate(target, { opacity: [0, 1], scale: [0.94, 1], y: [30, 0] },
      { ...SPRING });
  }, { amount: 0.3 });
})();

// ─── HERO PARALLAX ────────────────────────────────────────────
const heroEl    = document.getElementById('hero');
const orb1      = document.querySelector('.orb-1');
const orb2      = document.querySelector('.orb-2');
const heroGrid  = document.querySelector('.hero-grid');
const heroScroll = document.querySelector('.hero-scroll');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > (heroEl?.offsetHeight || 900)) return;
  const pct = y / (heroEl?.offsetHeight || 900);

  // orbs drift at different rates for depth
  if (orb1) orb1.style.transform = `translateY(${y * 0.18}px) scale(1)`;
  if (orb2) orb2.style.transform = `translateY(${y * 0.12}px) scale(1.05)`;

  // grid fades as you scroll
  if (heroGrid) heroGrid.style.opacity = String(1 - pct * 1.6);

  // scroll indicator fades out quickly
  if (heroScroll) heroScroll.style.opacity = String(1 - pct * 5);
}, { passive: true });

// ─── HERO STAR FIELD ──────────────────────────────────────────
(function () {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars;

  const NUM_STARS = window.innerWidth < 768 ? 80 : 200;

  function mkStar() {
    const bright = Math.random() < 0.12; // ~12% accent stars
    return {
      x:     Math.random(),          // 0-1 normalised
      y:     Math.random() * 0.85,   // only top 85% of canvas
      r:     bright ? (Math.random() * 1.4 + 1.2) : (Math.random() * 0.7 + 0.3),
      vx:    (Math.random() - 0.5) * 0.00006,
      vy:    Math.random() * 0.00008 + 0.00003,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.4,
      bright,
    };
  }

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: NUM_STARS }, mkStar);
  }

  window.addEventListener('resize', init);
  init();

  let last = 0;
  function tick(ts) {
    const dt = Math.min(ts - last, 50);
    last = ts;

    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // wrap x
      if (s.x < 0) s.x = 1;
      if (s.x > 1) s.x = 0;

      // recycle stars that drift past 85%
      if (s.y > 0.86) {
        Object.assign(s, mkStar());
        s.y = 0;
      }

      // top-heavy fade: bright at top, invisible near 80%
      const yFade = 1 - Math.pow(s.y / 0.82, 1.6);
      if (yFade <= 0) continue;

      // twinkle
      const twinkle = 0.55 + 0.45 * Math.sin(s.phase + ts * 0.001 * s.speed);
      const alpha = yFade * twinkle;

      const px = s.x * W;
      const py = s.y * H;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (s.bright) {
        // glow halo
        const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
        grd.addColorStop(0,   'rgba(255,245,210,0.55)');
        grd.addColorStop(0.4, 'rgba(255,245,210,0.15)');
        grd.addColorStop(1,   'rgba(255,245,210,0)');
        ctx.beginPath();
        ctx.arc(px, py, s.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // core dot
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.bright ? '#fff9e8' : '#e8dfc0';
      ctx.fill();

      ctx.restore();
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

// ─── GRID WAVE BACKGROUND (resources section) ─────────────────
(function () {
  if (window.innerWidth < 768) return; // skip on mobile — too heavy
  const section = document.getElementById('resources');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  section.style.position = 'relative';
  section.insertBefore(canvas, section.firstChild);

  // lift existing children above the canvas
  section.querySelectorAll(':scope > *:not(canvas)').forEach(el => {
    el.style.position = 'relative';
    el.style.zIndex   = '1';
  });

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLS = 42, ROWS = 26;
  const CAM_H = 1.4, CAM_Z = -2.5, FOV = 2.6;
  // Y-axis rotation for diagonal look (~28°)
  const TILT = 0.48, cosT = Math.cos(TILT), sinT = Math.sin(TILT);

  function project(wx, wy, wz) {
    // rotate around Y for diagonal perspective
    const rx = wx * cosT + wz * sinT;
    const rz = -wx * sinT + wz * cosT;
    const dz = rz - CAM_Z;
    if (dz < 0.05) return null;
    const s = FOV / dz;
    return {
      x: W * 0.5 + rx * s * W * 0.40,
      y: H * 0.68 - (wy - CAM_H) * s * H * 0.52,
    };
  }

  function tick(ts) {
    const t = ts * 0.001;
    ctx.clearRect(0, 0, W, H);

    // build displaced grid
    const pts = [];
    for (let r = 0; r <= ROWS; r++) {
      pts[r] = [];
      for (let c = 0; c <= COLS; c++) {
        const wx = (c / COLS - 0.5) * 10;
        const wz = (r / ROWS) * 12;
        const wy =
          Math.sin(wx * 0.75 + t * 1.0)  * Math.cos(wz * 0.55 - t * 0.65) * 0.55
        + Math.sin(wx * 1.4  - t * 0.48) * Math.sin(wz * 0.9  + t * 0.36) * 0.25;
        pts[r][c] = { wx, wy, wz, p: project(wx, wy, wz) };
      }
    }

    // horizontal lines — brighter at peaks, fade with depth
    for (let r = 0; r <= ROWS; r++) {
      const depthFade = Math.pow(1 - r / ROWS, 1.4);
      const midWave   = pts[r][Math.floor(COLS / 2)].wy;
      const bright    = 0.5 + Math.max(0, midWave) * 2.2;
      const alpha     = depthFade * bright * 0.55;

      ctx.beginPath();
      let moved = false;
      for (let c = 0; c <= COLS; c++) {
        const { p } = pts[r][c];
        if (!p) continue;
        moved ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), (moved = true));
      }
      ctx.strokeStyle = `rgba(201,168,76,${Math.min(alpha, 0.88)})`;
      ctx.lineWidth   = 0.6 + depthFade * 1.1;
      ctx.stroke();
    }

    // vertical lines
    for (let c = 0; c <= COLS; c++) {
      const edgeFade = 1 - Math.abs(c / COLS - 0.5) * 2 * 0.5;

      ctx.beginPath();
      let moved = false;
      for (let r = 0; r <= ROWS; r++) {
        const { p } = pts[r][c];
        if (!p) continue;
        moved ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), (moved = true));
      }
      ctx.strokeStyle = `rgba(201,168,76,${edgeFade * 0.22})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }

    // corner glow pools
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy]) => {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
      grd.addColorStop(0,   'rgba(201,168,76,0.10)');
      grd.addColorStop(0.5, 'rgba(201,168,76,0.03)');
      grd.addColorStop(1,   'rgba(201,168,76,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


// ─── POSITION SIZE CALCULATOR ────────────────────────────────────
function calcPositionSize() {
  const balance = parseFloat(document.getElementById('ps-balance').value);
  const riskPct = parseFloat(document.getElementById('ps-risk').value);
  const stopPips = parseFloat(document.getElementById('ps-stop').value);
  const pipVal  = parseFloat(document.getElementById('ps-pipval').value);

  const dollarEl = document.getElementById('ps-dollar-risk');
  const lotsEl   = document.getElementById('ps-lots');

  if ([balance, riskPct, stopPips, pipVal].some(isNaN) || stopPips === 0 || pipVal === 0) {
    dollarEl.textContent = 'Fill all fields';
    lotsEl.textContent   = '—';
    return;
  }

  const dollarRisk   = (balance * riskPct) / 100;
  const lots         = dollarRisk / (stopPips * pipVal);

  dollarEl.textContent = '$' + dollarRisk.toFixed(2);
  lotsEl.textContent   = lots.toFixed(2) + ' lots';

  dollarEl.className = 'calc-result-value good';
  lotsEl.className   = 'calc-result-value good';
}

// ─── R:R CALCULATOR ─────────────────────────────────────────────
function calcRR() {
  const entry   = parseFloat(document.getElementById('rr-entry').value);
  const stop    = parseFloat(document.getElementById('rr-stop').value);
  const tp      = parseFloat(document.getElementById('rr-tp').value);
  const riskAmt = parseFloat(document.getElementById('rr-risk-amt').value);

  const ratioEl   = document.getElementById('rr-ratio');
  const profitEl  = document.getElementById('rr-profit');
  const verdictEl = document.getElementById('rr-verdict');

  if ([entry, stop, tp, riskAmt].some(isNaN)) {
    ratioEl.textContent   = 'Fill all fields';
    profitEl.textContent  = '—';
    verdictEl.textContent = '—';
    return;
  }

  const risk   = Math.abs(entry - stop);
  const reward = Math.abs(tp - entry);

  if (risk === 0) { ratioEl.textContent = 'Invalid stop'; return; }

  const rr           = reward / risk;
  const potentialProfit = riskAmt * rr;

  ratioEl.textContent  = '1 : ' + rr.toFixed(2);
  profitEl.textContent = '$' + potentialProfit.toFixed(2);

  if (rr >= 2) {
    ratioEl.className   = 'calc-result-value good';
    verdictEl.textContent = '✓ Take the trade';
    verdictEl.className = 'calc-result-value good';
  } else if (rr >= 1.5) {
    ratioEl.className   = 'calc-result-value ok';
    verdictEl.textContent = '⚠ Marginal — consider waiting';
    verdictEl.className = 'calc-result-value ok';
  } else {
    ratioEl.className   = 'calc-result-value bad';
    verdictEl.textContent = '✕ Skip this trade';
    verdictEl.className = 'calc-result-value bad';
  }
  profitEl.className = 'calc-result-value';
}

// ─── CALCULATOR ACCORDION TOGGLE ────────────────────────────────
function toggleCalc(btn, panelId) {
  const panel = document.getElementById(panelId);
  const wasOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !wasOpen);
  btn.classList.toggle('active', !wasOpen);
}

// Allow pressing Enter in calc inputs to trigger calculate
document.querySelectorAll('.calc-field input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const panel = input.closest('.calc-panel');
    panel && panel.querySelector('.calc-btn').click();
  });
});
