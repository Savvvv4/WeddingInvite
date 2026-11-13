(() => {
  'use strict';
  const EVENT = window.INVITE;
  const mainCal = document.getElementById('cal-main');
  if (!EVENT || !mainCal) return;

  const start = new Date(EVENT.start);
  const end = new Date(EVENT.end);
  const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const startStamp = stamp(start);
  const endStamp = stamp(end);
  const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(EVENT.title)
    + '&dates=' + startStamp + '/' + endStamp
    + '&details=' + encodeURIComponent(EVENT.details)
    + '&location=' + encodeURIComponent(EVENT.venue);

  const escapeICS = (value) => String(value).replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n');

  function fold(line) {
    const parts = [];
    while (line.length > 73) { parts.push(line.slice(0, 73)); line = ' ' + line.slice(73); }
    parts.push(line);
    return parts.join('\r\n');
  }

  function downloadICS() {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Engagement Invitation//Vanshika and Swastik//EN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:engagement-' + startStamp + '@invitation',
      'DTSTAMP:' + stamp(new Date()),
      'DTSTART:' + startStamp, 'DTEND:' + endStamp,
      'SUMMARY:' + escapeICS(EVENT.title),
      'LOCATION:' + escapeICS(EVENT.venue),
      'DESCRIPTION:' + escapeICS(EVENT.details),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
      'DESCRIPTION:' + escapeICS('Tomorrow at ' + EVENT.timeLabel + ': ' + EVENT.shortName), 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY',
      'DESCRIPTION:' + escapeICS('Today at ' + EVENT.timeLabel + ': ' + EVENT.shortName), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([lines.map(fold).join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = EVENT.fileName || 'Engagement.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function bind(el, action) {
    if (!el) return;
    if (action === 'google') {
      el.href = googleUrl; el.target = '_blank'; el.rel = 'noopener';
    } else {
      el.href = '#';
      el.addEventListener('click', (event) => { event.preventDefault(); downloadICS(); });
    }
  }

  // Apple devices get a calendar file (opens straight in Apple Calendar);
  // everyone else goes to Google Calendar.
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  bind(mainCal, isApple ? 'ics' : 'google');
})();