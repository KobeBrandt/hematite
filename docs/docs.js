/* Hematite docs site: shows the HTML under each example, the theme switch, and the side menu. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // Hosts that wrap this page may drop the lang attribute; keep it for screen readers (3.1.1).
  if (!document.documentElement.lang) document.documentElement.lang = 'en';

  ready(function () {
  // Show the HTML of each live example underneath it.
  document.querySelectorAll('[data-example]').forEach(function (stage) {
    var lines = stage.innerHTML.replace(/^\n+|\s+$/g, '').split('\n');
    var indent = Math.min.apply(null, lines.filter(function (l) { return l.trim(); }).map(function (l) { return l.match(/^ */)[0].length; }));
    var pre = document.createElement('pre');
    pre.className = 'docs-example__code';
    pre.tabIndex = 0;
    pre.setAttribute('role', 'region');
    var title = stage.closest('.stack').querySelector('.docs-component-title');
    var name = title ? title.firstChild.textContent.trim() : 'this';
    pre.setAttribute('aria-label', 'HTML for the ' + name + ' example');
    var code = document.createElement('code');
    code.textContent = lines.map(function (l) { return l.slice(indent); }).join('\n');
    pre.appendChild(code);
    stage.parentNode.appendChild(pre);
  });
  });

  // Theme switch, kept across pages. The click is handled on the document,
  // so it works however late the buttons are added to the page.
  function setTheme(value) {
    if (value === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', value);
    document.querySelectorAll('[data-theme-set]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.themeSet === value));
    });
    try { localStorage.setItem('hematite-theme', value); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-set]');
    if (b) setTheme(b.dataset.themeSet);
  });
  try { var saved = localStorage.getItem('hematite-theme'); if (saved) setTheme(saved); } catch (e) {}

  // Example forms are for show only.
  document.querySelectorAll('[data-example] form').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  // Side menu: open on wide screens, a closed "In this section" toggle on narrow ones.
  // Without JavaScript it simply stays open.
  var wide = window.matchMedia('(min-width: 64em)');
  function syncSide() {
    document.querySelectorAll('details[data-open-wide]').forEach(function (d) { d.open = wide.matches; });
  }
  syncSide();
  wide.addEventListener('change', syncSide);

  // On narrow screens the side menu is a bottom sheet, like the header menu.
  var narrow = window.matchMedia('(max-width: 63.99em)');
  document.querySelectorAll('details[data-open-wide]').forEach(function (d) {
    d.setAttribute('data-ready', '');
    var summary = d.querySelector('summary');
    d.addEventListener('toggle', function () {
      if (!d.open || !narrow.matches) return;
      document.querySelectorAll('details[open][data-ready]').forEach(function (o) { if (o !== d) o.open = false; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.open && narrow.matches) { d.open = false; summary.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (d.open && narrow.matches && !d.contains(e.target)) d.open = false;
    });
    // Following a link to a part of this page closes the sheet.
    d.addEventListener('click', function (e) {
      if (narrow.matches && e.target.closest('a[href^="#"]')) d.open = false;
    });
  });
})();
