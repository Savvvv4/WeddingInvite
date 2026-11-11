const EVENT = {
  date: '2026-12-02',
  title: "Vanshika & Swastik's Engagement Celebration",
  venue: 'Myst by The Zora, Lodhi Road, New Delhi'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.22 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const progress = document.getElementById('progress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

const eventDate = new Date(`${EVENT.date}T00:00:00+05:30`);
const countdown = document.getElementById('countdown');
function renderCountdown() {
  let remaining = Math.max(0, eventDate.getTime() - Date.now());
  const units = [['Days', 86400000], ['Hours', 3600000], ['Minutes', 60000]];
  countdown.innerHTML = units.map(([label, size]) => {
    const value = Math.floor(remaining / size);
    remaining -= value * size;
    return `<div>${String(value).padStart(2, '0')}<small>${label}</small></div>`;
  }).join('');
}
renderCountdown();
setInterval(renderCountdown, 60000);

document.getElementById('add-calendar').addEventListener('click', () => {
  const start = EVENT.date.replaceAll('-', '');
  const endDate = new Date(eventDate.getTime() + 86400000);
  const end = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;
  const escapeICS = (value) => value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Engagement Invitation//Vanshika and Swastik//EN',
    'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:engagement-${EVENT.date}@invitation`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeICS(EVENT.title)}`, `LOCATION:${escapeICS(EVENT.venue)}`,
    'DESCRIPTION:Vanshika and Swastik celebrate their engagement.', 'END:VEVENT', 'END:VCALENDAR'
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Vanshika-and-Swastik-Engagement-Reminder.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});