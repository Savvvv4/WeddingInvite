(() => {
  'use strict';
  const EVENT = window.INVITE;
  const ART = ['assets/arch-teal.webp', 'assets/ganesha.webp', 'assets/lake-swans.webp', 'assets/frame-swans.webp'];
  const root = document.documentElement;
  root.classList.add('invite-closed');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Background music: starts as soon as the browser allows it. Most phones block
  // sound until the guest touches the page, so we also start it on the very first
  // tap, swipe, scroll or key press (at the latest, on "Open Invitation").
  const music = document.getElementById('music');
  const Music = (() => {
    const TARGET = 0.7;
    let playing = false, fadeTimer = 0;
    function fadeIn() {
      window.clearInterval(fadeTimer);
      music.volume = 0;
      fadeTimer = window.setInterval(() => {
        music.volume = Math.min(TARGET, music.volume + 0.05);
        if (music.volume >= TARGET) window.clearInterval(fadeTimer);
      }, 90);
    }
    function play() {
      if (!music || playing) return;
      const attempt = music.play();
      if (attempt && attempt.then) {
        attempt.then(() => { if (!playing) { playing = true; fadeIn(); detach(); } }).catch(() => {});
      } else { playing = true; detach(); }
    }
    const EVENTS = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'wheel'];
    function detach() { EVENTS.forEach((type) => window.removeEventListener(type, play, true)); }
    EVENTS.forEach((type) => window.addEventListener(type, play, { capture: true, passive: true }));
    if (music) {
      music.volume = TARGET;
      music.addEventListener('playing', () => { playing = true; detach(); });
      play();
    }
    document.addEventListener('visibilitychange', () => {
      if (!music || !playing) return;
      if (document.hidden) music.pause(); else music.play().catch(() => {});
    });
    return { play };
  })();

  const cover = document.getElementById('cover');
  const openButton = document.getElementById('open');
  let revealObserver = null;
  let bodyLockTop = 0;
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
    Music.play();
    startReveals();
    // Reveal the first page underneath the opening doors; keep the cover in place
    // until its fade has completed so no empty/white frame can flash between layers.
    // Freeze the document itself while the cover animates. This prevents queued
    // wheel/touch input from moving the page underneath the fixed cover.
    bodyLockTop = window.scrollY || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `${-bodyLockTop}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    root.classList.add('locked');
    root.classList.remove('invite-closed');
    cover.classList.add('ready', 'open');
    const finishDelay = reduceMotion ? 80 : 1900;
    window.setTimeout(() => {
      cover.hidden = true;
      cover.setAttribute('aria-hidden', 'true');
      // Release the document lock at the top of the invitation, then verify
      // the first section is aligned before accepting the first user gesture.
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      root.classList.remove('locked');
      // Explicitly align the first invitation page, not just the document's
      // remembered scroll position. This is the engagement ceremony screen.
      const firstPage = document.getElementById('beginning');
      const alignFirstPage = () => {
        if (firstPage) {
          const top = firstPage.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top);
        } else {
          window.scrollTo(0, 0);
        }
        document.documentElement.scrollTop = firstPage ? firstPage.offsetTop : 0;
        document.body.scrollTop = firstPage ? firstPage.offsetTop : 0;
      };
      alignFirstPage();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        alignFirstPage();
        inviteOpened = true;
        navigationLocked = false;
      }));
    }, finishDelay);
  }
  openButton.addEventListener('click', openInvite);

  const pages = Array.from(document.querySelectorAll('.invitation > .page'));
  let navigationLocked = true;
  let inviteOpened = false;
  let wheelGestureActive = false;
  let wheelIdleTimer = 0;
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
    if (!inviteOpened || root.classList.contains('locked') || navigationLocked) return;
    const next = Math.max(0, Math.min(pages.length - 1, index));
    if (next === currentPageIndex()) return;
    navigationLocked = true;
    const targetTop = Math.max(0, pages[next].getBoundingClientRect().top + window.scrollY);
    window.scrollTo({ top: targetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => { navigationLocked = false; }, reduceMotion ? 180 : 1350);
  }

  window.addEventListener('wheel', (event) => {
    if (!inviteOpened || root.classList.contains('locked')) {
      event.preventDefault();
      return;
    }
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    window.clearTimeout(wheelIdleTimer);
    if (wheelGestureActive || navigationLocked) {
      wheelIdleTimer = window.setTimeout(() => { wheelGestureActive = false; }, 260);
      return;
    }
    wheelGestureActive = true;
    goToPage(currentPageIndex() + (event.deltaY > 0 ? 1 : -1));
    wheelIdleTimer = window.setTimeout(() => { wheelGestureActive = false; }, 260);
  }, { passive: false });

  window.addEventListener('touchstart', (event) => {
    if (!event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchHandled = false;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (!inviteOpened || root.classList.contains('locked')) {
      event.preventDefault();
      return;
    }
    if (!event.touches.length) return;
    const dx = event.touches[0].clientX - touchStartX;
    const dy = event.touches[0].clientY - touchStartY;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      event.preventDefault();
      touchHandled = true;
    }
  }, { passive: false });

  window.addEventListener('touchend', (event) => {
    if (!inviteOpened || !touchHandled || root.classList.contains('locked')) return;
    const touch = event.changedTouches[0];
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dy) > 35) goToPage(currentPageIndex() + (dy < 0 ? 1 : -1));
    touchHandled = false;
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (!inviteOpened || root.classList.contains('locked') || event.altKey || event.ctrlKey || event.metaKey) return;
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