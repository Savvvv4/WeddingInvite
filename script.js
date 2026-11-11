(() => {
  'use strict';

  const EVENT = {
    date: '2026-12-02',
    title: "Vanshika & Swastik's Engagement",
    venue: 'Myst by The Zora, Lodhi Road, New Delhi',
    details: 'With the blessings of our families, Vanshika and Swastik invite you to celebrate their engagement.'
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Opener ---------- */
  const cover = document.getElementById('cover');
  const openButton = document.getElementById('open');
  let revealObserver = null;

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
    cover.classList.add('open');
    window.scrollTo(0, 0);
    startReveals();
    window.setTimeout(() => {
      cover.hidden = true;
      cover.setAttribute('aria-hidden', 'true');
      root.classList.remove('locked');
      const first = document.getElementById('beginning');
      if (first) first.focus({ preventScroll: true });
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
  const eventStart = new Date(`${EVENT.date}T00:00:00+05:30`);
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

  /* ---------- Calendar ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  const [year, month, day] = EVENT.date.split('-').map(Number);
  const startStr = ymd(new Date(Date.UTC(year, month - 1, day)));
  const endStr = ymd(new Date(Date.UTC(year, month - 1, day + 1))); // all-day end is exclusive

  const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + `&text=${encodeURIComponent(EVENT.title)}`
    + `&dates=${startStr}/${endStr}`
    + `&details=${encodeURIComponent(EVENT.details)}`
    + `&location=${encodeURIComponent(EVENT.venue)}`;

  function downloadICS() {
    const escapeICS = (v) => v.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Engagement Invitation//Vanshika and Swastik//EN',
      'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:engagement-${startStr}@invitation`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${startStr}`, `DTEND;VALUE=DATE:${endStr}`,
      `SUMMARY:${escapeICS(EVENT.title)}`, `LOCATION:${escapeICS(EVENT.venue)}`,
      `DESCRIPTION:${escapeICS(EVENT.details)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT6H', 'ACTION:DISPLAY', 'DESCRIPTION:Tomorrow: Vanshika & Swastik\'s engagement', 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:Today: Vanshika & Swastik\'s engagement', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Vanshika-and-Swastik-Engagement.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  const mainCal = document.getElementById('cal-main');
  const altCal = document.getElementById('cal-alt');
  const altLabel = document.getElementById('cal-alt-label');
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

  function bindAction(el, kind) {
    if (kind === 'google') {
      el.href = googleUrl;
      el.target = '_blank';
      el.rel = 'noopener';
      el.onclick = null;
    } else {
      el.href = '#';
      el.removeAttribute('target');
      el.onclick = (event) => { event.preventDefault(); downloadICS(); };
    }
  }

  // Apple devices get the .ics first; everyone else gets Google Calendar first.
  bindAction(mainCal, isApple ? 'ics' : 'google');
  bindAction(altCal, isApple ? 'google' : 'ics');
  altLabel.textContent = isApple ? 'Use Google Calendar instead' : 'Apple / Outlook (.ics)';
})();
