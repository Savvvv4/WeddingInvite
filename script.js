(() => {
  'use strict';

  const EVENT_START = '2026-12-02T18:00:00+05:30';

  const ART = ['assets/arch-teal.webp', 'assets/ganesha.svg', 'assets/lake-swans.webp', 'assets/frame-swans.webp'];

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- Sound ----------
     Everything is synthesised in the browser with the Web Audio API, so there are no audio files.
     Browsers only allow sound after a tap, so it starts when "Open Invitation" is pressed. */
  const Sound = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const LEVEL = 0.6;
    const SPARKLE_NOTES = [74, 76, 78, 81, 83, 86, 88]; // D major pentatonic, D5 up to E6
    let ctx = null;
    let master = null;
    let started = false;
    let enabled = true;
    let timer = 0;
    let lastNote = -1;

    const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

    // One struck-bell note: a few sine partials with a fast attack and a long decay.
    function bell(freq, when, volume, decay) {
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, when);
      out.gain.exponentialRampToValueAtTime(volume, when + 0.008);
      out.gain.exponentialRampToValueAtTime(0.0001, when + decay);
      out.connect(master);
      [[1, 1], [2.01, 0.42], [2.76, 0.22], [5.4, 0.08]].forEach(([ratio, amount]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * ratio;
        gain.gain.value = amount;
        osc.connect(gain);
        gain.connect(out);
        osc.start(when);
        osc.stop(when + decay + 0.1);
      });
    }

    // Opening sound: a low temple bell, then a short rising run of chimes.
    function chime() {
      const t = ctx.currentTime + 0.05;
      bell(hz(50), t, 0.2, 5);
      [74, 78, 81, 86, 90].forEach((note, i) => bell(hz(note), t + 0.22 + i * 0.12, 0.11, 3.4));
    }

    // Background: a soft, slowly breathing drone on D.
    function pad() {
      const now = ctx.currentTime;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.6;
      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();
      lfo.frequency.value = 0.07;
      lfoDepth.gain.value = 180;
      lfo.connect(lfoDepth);
      lfoDepth.connect(filter.frequency);
      lfo.start();
      const fade = ctx.createGain();
      fade.gain.setValueAtTime(0.0001, now);
      fade.gain.linearRampToValueAtTime(0.5, now + 6);
      filter.connect(fade);
      fade.connect(master);
      [[38, 'triangle', -4], [38, 'triangle', 4], [45, 'sine', 0], [50, 'triangle', 3], [57, 'sine', -3]].forEach(([midi, type, detune]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = hz(midi);
        osc.detune.value = detune;
        gain.gain.value = midi < 40 ? 0.22 : 0.12;
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
      });
    }

    // Now and then, one quiet bell note over the drone.
    function sparkle() {
      if (!enabled) return;
      let index;
      do { index = Math.floor(Math.random() * SPARKLE_NOTES.length); } while (index === lastNote);
      lastNote = index;
      bell(hz(SPARKLE_NOTES[index]), ctx.currentTime + 0.05, 0.05, 4);
      timer = window.setTimeout(sparkle, 3200 + Math.random() * 3800);
    }

    function start() {
      if (!AC || started) return;
      try {
        ctx = new AC();
        const limiter = ctx.createDynamicsCompressor();
        master = ctx.createGain();
        master.gain.value = LEVEL;
        master.connect(limiter);
        limiter.connect(ctx.destination);
        if (ctx.state === 'suspended') ctx.resume();
        started = true;
        chime();
        pad();
        timer = window.setTimeout(sparkle, 3500);
      } catch (error) {
        started = false;
      }
    }

    function setEnabled(on) {
      enabled = on;
      if (!started) return;
      window.clearTimeout(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(on ? LEVEL : 0, now, on ? 0.4 : 0.15);
      if (on) {
        ctx.resume();
        timer = window.setTimeout(sparkle, 1500);
      }
    }

    // Pause while the tab is in the background.
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else if (enabled) ctx.resume();
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

  /* ---------- Opener ---------- */
  const cover = document.getElementById('cover');
  const openButton = document.getElementById('open');
  let revealObserver = null;

  const stop = (event) => event.preventDefault();
  const stopKeys = (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key) && event.target !== openButton) {
      event.preventDefault();
    }
  };
  cover.addEventListener('wheel', stop, { passive: false });
  cover.addEventListener('touchmove', stop, { passive: false });
  window.addEventListener('keydown', stopKeys);

  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([
    Promise.all([...ART.map(loadImage), fontsReady]),
    new Promise((resolve) => window.setTimeout(resolve, 5000))
  ]).then(() => cover.classList.add('ready'));

  function startReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('visible'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    items.forEach((el) => revealObserver.observe(el));
  }

  function openInvite() {
    if (cover.classList.contains('open')) return;
    Sound.start();
    soundButton.classList.add('show');
    cover.classList.add('ready', 'open');
    startReveals();
    window.setTimeout(() => {
      cover.removeEventListener('wheel', stop);
      cover.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stopKeys);
      cover.hidden = true;
      cover.setAttribute('aria-hidden', 'true');
    }, reduceMotion ? 120 : 1700);
  }

  openButton.addEventListener('click', openInvite);
  openButton.focus({ preventScroll: true });

  /* ---------- Scroll progress ---------- */
  const progress = document.getElementById('progress');
  function updateProgress() {
    const max = root.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- Countdown ---------- */
  const eventStart = new Date(EVENT_START);
  const countdown = document.getElementById('countdown');
  function renderCountdown() {
    let remaining = eventStart.getTime() - Date.now();
    if (remaining <= 0) {
      countdown.innerHTML = '<p>The celebration is here</p>';
      return;
    }
    const units = [['Days', 86400000], ['Hours', 3600000], ['Minutes', 60000]];
    countdown.innerHTML = units.map(([label, size]) => {
      const value = Math.floor(remaining / size);
      remaining -= value * size;
      return `<div>${String(value).padStart(2, '0')}<small>${label}</small></div>`;
    }).join('');
  }
  renderCountdown();
  window.setInterval(renderCountdown, 30000);
})();
