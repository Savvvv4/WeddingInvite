(() => {
  'use strict';
  const EVENT = window.INVITE;
  const ART = ['assets/arch-teal.webp', 'assets/ganesha.svg', 'assets/lake-swans.webp', 'assets/frame-swans.webp'];
  const root = document.documentElement;
  root.classList.add('invite-closed');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const Sound = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const LEVEL = 0.6;
    const SPARKLE_NOTES = [74, 76, 78, 81, 83, 86, 88];
    let ctx = null, master = null, started = false, enabled = true, timer = 0, lastNote = -1;
    const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
    function bell(freq, when, volume, decay) {
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, when);
      out.gain.exponentialRampToValueAtTime(volume, when + 0.008);
      out.gain.exponentialRampToValueAtTime(0.0001, when + decay);
      out.connect(master);
      [[1,1],[2.01,.42],[2.76,.22],[5.4,.08]].forEach(([ratio, amount]) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq * ratio; gain.gain.value = amount;
        osc.connect(gain); gain.connect(out); osc.start(when); osc.stop(when + decay + .1);
      });
    }
    function chime() {
      const t = ctx.currentTime + .05;
      bell(hz(50), t, .2, 5);
      [74,78,81,86,90].forEach((note,i) => bell(hz(note), t + .22 + i*.12, .11, 3.4));
    }
    function pad() {
      const now = ctx.currentTime, filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 520; filter.Q.value = .6;
      const lfo = ctx.createOscillator(), lfoDepth = ctx.createGain();
      lfo.frequency.value = .07; lfoDepth.gain.value = 180; lfo.connect(lfoDepth); lfoDepth.connect(filter.frequency); lfo.start();
      const fade = ctx.createGain();
      fade.gain.setValueAtTime(.0001, now); fade.gain.linearRampToValueAtTime(.5, now + 6);
      filter.connect(fade); fade.connect(master);
      [[38,'triangle',-4],[38,'triangle',4],[45,'sine',0],[50,'triangle',3],[57,'sine',-3]].forEach(([midi,type,detune]) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = type; osc.frequency.value = hz(midi); osc.detune.value = detune;
        gain.gain.value = midi < 40 ? .22 : .12; osc.connect(gain); gain.connect(filter); osc.start();
      });
    }
    function sparkle() {
      if (!enabled) return;
      let index;
      do { index = Math.floor(Math.random() * SPARKLE_NOTES.length); } while (index === lastNote);
      lastNote = index; bell(hz(SPARKLE_NOTES[index]), ctx.currentTime + .05, .05, 4);
      timer = window.setTimeout(sparkle, 3200 + Math.random() * 3800);
    }
    function start() {
      if (!AC || started) return;
      try {
        ctx = new AC();
        const limiter = ctx.createDynamicsCompressor();
        master = ctx.createGain(); master.gain.value = LEVEL; master.connect(limiter); limiter.connect(ctx.destination);
        if (ctx.state === 'suspended') ctx.resume();
        started = true; chime(); pad(); timer = window.setTimeout(sparkle, 3500);
      } catch (error) { started = false; }
    }
    function setEnabled(on) {
      enabled = on;
      if (!started) return;
      window.clearTimeout(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(on ? LEVEL : 0, now, on ? .4 : .15);
      if (on) { ctx.resume(); timer = window.setTimeout(sparkle, 1500); }
    }
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (enabled) ctx.resume();
    });
    return { start, setEnabled, supported: !!AC, get enabled() { return enabled; } };
  })();

  const soundButton = document.getElementById('sound');
  const soundIcon = document.getElementById('sound-icon');
  if (!Sound.supported) soundButton.hidden = true;
  soundButton.addEventListener('click', () => {
    const on = !Sound.enabled;
    Sound.setEnabled(on);
    soundIcon.setAttribute('href', on ? '#i-sound-on' : '#i-sound-off');
    soundButton.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
  });

  const cover = document.getElementById('cover');
  const openButton = document.getElementById('open');
  let revealObserver = null;
  root.classList.add('locked');
  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image(); img.onload = () => resolve(); img.onerror = () => resolve(); img.src = src;
  });
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([Promise.all([...ART.map(loadImage), fontsReady]), new Promise((resolve) => window.setTimeout(resolve, 5000))])
    .then(() => cover.classList.add('ready'));

  function startReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('visible')); return; }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: .2 });
    items.forEach((el) => revealObserver.observe(el));
  }
  function openInvite() {
    if (cover.classList.contains('open')) return;
    Sound.start();
    soundButton.classList.add('show');
    startReveals();
    // Reveal the first page underneath the opening doors; keep the cover in place
    // until its fade has completed so no empty/white frame can flash between layers.
    root.classList.remove('invite-closed');
    cover.classList.add('ready', 'open');
    const finishDelay = reduceMotion ? 80 : 1900;
    window.setTimeout(() => {
      cover.hidden = true;
      cover.setAttribute('aria-hidden', 'true');
      root.classList.remove('locked');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, finishDelay);
  }
  openButton.addEventListener('click', openInvite);
  openButton.focus({ preventScroll: true });

  const pages = Array.from(document.querySelectorAll('.invitation > .page'));
  let navigationLocked = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchHandled = false;

  function currentPageIndex() {
    const y = window.scrollY;
    let best = 0;
    let distance = Infinity;
    pages.forEach((page, index) => {
      const d = Math.abs(page.getBoundingClientRect().top);
      if (d < distance) { distance = d; best = index; }
    });
    return best;
  }

  function goToPage(index) {
    if (root.classList.contains('locked') || navigationLocked) return;
    const next = Math.max(0, Math.min(pages.length - 1, index));
    if (next === currentPageIndex()) return;
    navigationLocked = true;
    pages[next].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => { navigationLocked = false; }, reduceMotion ? 120 : 950);
  }

  window.addEventListener('wheel', (event) => {
    if (root.classList.contains('locked') || Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    if (navigationLocked) return;
    goToPage(currentPageIndex() + (event.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  window.addEventListener('touchstart', (event) => {
    if (!event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchHandled = false;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (root.classList.contains('locked') || !event.touches.length) return;
    const dx = event.touches[0].clientX - touchStartX;
    const dy = event.touches[0].clientY - touchStartY;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      event.preventDefault();
      touchHandled = true;
    }
  }, { passive: false });

  window.addEventListener('touchend', (event) => {
    if (!touchHandled || root.classList.contains('locked')) return;
    const touch = event.changedTouches[0];
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dy) > 35) goToPage(currentPageIndex() + (dy < 0 ? 1 : -1));
    touchHandled = false;
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (root.classList.contains('locked') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
      if (event.target.closest('a,button,input,textarea,select')) return;
      event.preventDefault(); goToPage(currentPageIndex() + 1);
    } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault(); goToPage(currentPageIndex() - 1);
    }
  });

  document.querySelectorAll('.cue[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      const index = pages.indexOf(target);
      if (index >= 0) { event.preventDefault(); goToPage(index); }
    });
  });

  const progress = document.getElementById('progress');
  function updateProgress() {
    const max = root.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const eventStart = new Date(EVENT.start);
  const countdown = document.getElementById('countdown');
  function renderCountdown() {
    let remaining = eventStart.getTime() - Date.now();
    if (remaining <= 0) { countdown.innerHTML = '<p>The celebration is here</p>'; return; }
    const units = [['Days',86400000],['Hours',3600000],['Minutes',60000]];
    countdown.innerHTML = units.map(([label,size]) => {
      const value = Math.floor(remaining / size); remaining -= value * size;
      return `<div>${String(value).padStart(2,'0')}<small>${label}</small></div>`;
    }).join('');
  }
  renderCountdown();
  window.setInterval(renderCountdown, 30000);
})();