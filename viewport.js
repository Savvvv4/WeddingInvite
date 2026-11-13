(() => {
  'use strict';
  const root = document.documentElement;
  const hasDvh = !!(window.CSS && CSS.supports && CSS.supports('height', '100dvh'));
  let smallest = 0, lastWidth = window.innerWidth, index = 0, settling = false, timer = 0;
  function measure(reset) {
    const h = window.innerHeight;
    if (!h) return;
    smallest = (reset || !smallest) ? h : Math.min(smallest, h);
    root.style.setProperty('--app-h', h + 'px');
    root.style.setProperty('--svh', smallest + 'px');
  }
  function pageHeight() {
    const page = document.querySelector('.page');
    return page ? page.offsetHeight : 0;
  }
  function jumpTo(i) {
    const h = pageHeight();
    if (!h) return;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto'; window.scrollTo(0, i * h); root.style.scrollBehavior = previous;
  }
  if (!hasDvh) measure(true);
  window.addEventListener('scroll', () => {
    if (settling) return;
    const h = pageHeight();
    if (h) index = Math.round(window.scrollY / h);
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!hasDvh) measure(false);
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth; settling = true; window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (!hasDvh) measure(true);
      if (!root.classList.contains('locked')) jumpTo(index);
      settling = false;
    }, 160);
  });
})();