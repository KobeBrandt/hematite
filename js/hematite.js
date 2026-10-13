/* ==========================================================================
   HEMATITE / hematite.js (optional)
   Every component works without this file. It adds only what HTML and CSS
   cannot do yet. No dependencies, no build step, about 15 KB unminified, 5 KB gzipped.
   Load it at the end of <body> or with defer:
     <script src="js/hematite.js" defer></script>
   Each feature is opt-in through a class or data attribute.
   ========================================================================== */
(function () {
  'use strict';

  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var uid = 0;
  var id = function (el, prefix) { if (!el.id) el.id = (prefix || 'fw') + '-' + (++uid); return el.id; };

  /* --- Live region for short announcements -------------------------------- */
  var live;
  function announce(text) {
    if (!live) {
      live = document.createElement('div');
      live.className = 'visually-hidden';
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 50);
  }

  /* --- Toast: Hematite.toast("Saved") ------------------------------------- */
  function toast(message, options) {
    options = options || {};
    var region = document.querySelector('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      document.body.appendChild(region);
    }
    var t = document.createElement('div');
    t.className = 'toast';
    var text = document.createElement('span');
    text.textContent = message;
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', 'Dismiss message');
    close.textContent = '×';
    close.addEventListener('click', function () { t.remove(); });
    t.appendChild(text);
    t.appendChild(close);
    region.appendChild(t);
    // At least 10 seconds, so people who read slowly still see it (2.2.1).
    setTimeout(function () { t.remove(); }, Math.max(options.duration || 10000, 10000));
    return t;
  }

  /* --- Tabs: .tabs with .tabs__list links pointing at .tabs__panel ids ---- */
  function initTabs(root) {
    var list = root.querySelector('.tabs__list');
    var tabs = $$('.tabs__tab', root);
    if (!list || !tabs.length) return;
    list.setAttribute('role', 'tablist');
    $$('li', list).forEach(function (li) { li.setAttribute('role', 'presentation'); });
    var panels = tabs.map(function (tab) {
      var panel = document.getElementById(tab.getAttribute('href').slice(1));
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      id(tab, 'tab');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      return panel;
    });
    function select(i, focus) {
      tabs.forEach(function (tab, j) {
        var on = i === j;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function (e) { e.preventDefault(); select(i); });
      tab.addEventListener('keydown', function (e) {
        var rtl = getComputedStyle(root).direction === 'rtl';
        var next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
        if (next) { e.preventDefault(); select((i + next + tabs.length) % tabs.length, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    var start = tabs.findIndex(function (t) { return t.getAttribute('href') === location.hash; });
    select(start < 0 ? 0 : start);
    root.classList.add('tabs--ready');
  }

  /* --- Accordion: "Show all sections" --------------------------------------- */
  function initAccordion(root) {
    var button = root.querySelector('[data-accordion-toggle]');
    var sections = $$(':scope > details', root);
    if (!button || !sections.length) return;
    button.hidden = false;
    function sync() {
      var all = sections.every(function (d) { return d.open; });
      button.textContent = all ? 'Hide all sections' : 'Show all sections';
      button.setAttribute('aria-expanded', String(all));
    }
    button.addEventListener('click', function () {
      var open = !sections.every(function (d) { return d.open; });
      sections.forEach(function (d) { if (!d.name || !open) d.open = open; });
      sync();
    });
    sections.forEach(function (d) { d.addEventListener('toggle', sync); });
    sync();
  }

  /* --- Character count: .character-count[data-maxlength] ----------------- */
  function initCharacterCount(root) {
    var max = parseInt(root.getAttribute('data-maxlength'), 10);
    var field = root.querySelector('textarea, input');
    var status = root.querySelector('.character-count__status');
    if (!max || !field || !status) return;
    var sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.setAttribute('aria-live', 'polite');
    status.after(sr);
    status.setAttribute('aria-hidden', 'true');
    var timer;
    function message() {
      var left = max - field.value.length;
      return left >= 0
        ? 'You have ' + left + ' character' + (left === 1 ? '' : 's') + ' remaining'
        : 'You have ' + -left + ' character' + (left === -1 ? '' : 's') + ' too many';
    }
    function update() {
      status.textContent = message();
      status.classList.toggle('character-count__status--over', field.value.length > max);
      // Screen readers hear the count once typing pauses, not on every key.
      clearTimeout(timer);
      timer = setTimeout(function () { sr.textContent = message(); }, 1000);
    }
    field.addEventListener('input', update);
    status.textContent = message();
  }

  /* --- Password: Show / Hide --------------------------------------------- */
  function initPassword(root) {
    var input = root.querySelector('.password__input');
    var toggle = root.querySelector('.password__toggle');
    if (!input || !toggle) return;
    toggle.hidden = false;
    toggle.setAttribute('aria-controls', id(input, 'password'));
    toggle.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      announce(show ? 'Your password is visible' : 'Your password is hidden');
    });
    // Never submit a visible password into browser history or autofill as text.
    if (input.form) input.form.addEventListener('submit', function () { input.type = 'password'; });
  }

  /* --- Error summary: focus on load, links focus the field ---------------- */
  function initErrorSummary(summary) {
    summary.tabIndex = -1;
    summary.focus();
    $$('a[href^="#"]', summary).forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        // Scroll so the label or legend is visible, not just the input.
        var label = target.closest('fieldset') ? target.closest('fieldset').querySelector('legend')
          : document.querySelector('label[for="' + target.id + '"]');
        (label || target).scrollIntoView();
        target.focus({ preventScroll: true });
      });
    });
  }

  /* --- Dialog: [data-dialog-open="id"], [data-dialog-close] ---------------- */
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-dialog-open]');
    if (opener) {
      var dialog = document.getElementById(opener.getAttribute('data-dialog-open'));
      if (dialog && dialog.showModal) dialog.showModal();
    }
    var closer = e.target.closest('[data-dialog-close]');
    if (closer && closer.closest('dialog')) closer.closest('dialog').close(closer.value || '');

    // Dismiss: closes the nearest notification, toast, banner or element named by the value.
    var dismiss = e.target.closest('[data-dismiss]');
    if (dismiss) {
      var box = dismiss.getAttribute('data-dismiss')
        ? document.getElementById(dismiss.getAttribute('data-dismiss'))
        : dismiss.closest('.notification, .toast, .site-banner, .alert');
      if (box) {
        box.hidden = true;
        var main = document.querySelector('main');
        if (main) { if (!main.hasAttribute('tabindex')) main.tabIndex = -1; main.focus(); }
      }
    }

    // Copy: [data-copy="text"] or [data-copy-target="#id"].
    var copy = e.target.closest('[data-copy], [data-copy-target]');
    if (copy && navigator.clipboard) {
      var text = copy.getAttribute('data-copy') ||
        (document.querySelector(copy.getAttribute('data-copy-target')) || {}).textContent || location.href;
      navigator.clipboard.writeText(text.trim()).then(function () {
        toast(copy.getAttribute('data-copy-message') || 'Copied');
      });
    }

    // Cookie banner: [data-cookie-choice="accept|reject"].
    var choice = e.target.closest('[data-cookie-choice]');
    if (choice) {
      var banner = choice.closest('.cookie-banner');
      var value = choice.getAttribute('data-cookie-choice');
      try { localStorage.setItem('hematite-cookies', value); } catch (err) {}
      document.dispatchEvent(new CustomEvent('hematite:cookies', { detail: value }));
      $$('[data-cookie-question]', banner).forEach(function (el) { el.hidden = true; });
      $$('[data-cookie-confirm="' + value + '"]', banner).forEach(function (el) { el.hidden = false; el.tabIndex = -1; el.focus(); });
    }
  });

  /* --- Exit this page: [data-exit-page] link; also Shift pressed 3 times --- */
  function exitPage(link) {
    document.body.innerHTML = '';
    document.title = 'Loading';
    location.replace(link.href);
  }
  var exitLink = document.querySelector('[data-exit-page]');
  if (exitLink) {
    exitLink.addEventListener('click', function (e) { e.preventDefault(); exitPage(exitLink); });
    var shifts = [];
    document.addEventListener('keyup', function (e) {
      if (e.key !== 'Shift') return;
      var now = Date.now();
      shifts = shifts.filter(function (t) { return now - t < 1000; }).concat(now);
      if (shifts.length >= 3) exitPage(exitLink);
    });
  }

  /* --- Tooltip: Escape hides it without moving focus (1.4.13) ------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('.tooltip').forEach(function (t) { t.classList.add('is-dismissed'); });
  });
  ['mouseout', 'focusout'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var t = e.target.closest && e.target.closest('.tooltip');
      if (t) t.classList.remove('is-dismissed');
    });
  });

  /* --- Range: keep the <output> in step ------------------------------------ */
  function initRange(input) {
    var out = document.getElementById(input.getAttribute('data-range-output'));
    if (!out) return;
    var unit = input.getAttribute('data-unit') || '';
    var update = function () { out.value = input.value + unit; };
    input.addEventListener('input', update);
    update();
  }

  /* --- Multiselect: show how many are chosen in the summary --------------- */
  function initMultiselect(root) {
    var summary = root.querySelector('.multiselect__summary');
    var boxes = $$('input[type="checkbox"]', root);
    var base = summary.textContent.trim();
    function update() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      summary.textContent = n ? base + ' (' + n + ' selected)' : base;
    }
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    update();
  }

  /* --- In-page navigation: mark the section in view ------------------------ */
  function initInPageNav(nav) {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('a[href^="#"]', nav);
    var map = new Map();
    links.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) map.set(s, a); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        map.get(en.target).setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    map.forEach(function (_, section) { io.observe(section); });
  }

  /* --- Sortable table: <table data-sortable> with .table__sort buttons ----- */
  function initSortable(table) {
    $$('thead th', table).forEach(function (th, col) {
      var button = th.querySelector('.table__sort');
      if (!button) return;
      button.addEventListener('click', function () {
        var asc = th.getAttribute('aria-sort') !== 'ascending';
        $$('thead th', table).forEach(function (h) { h.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
        var body = table.tBodies[0];
        var rows = $$('tr', body);
        var key = function (r) { var c = r.children[col]; return c.getAttribute('data-sort-value') || c.textContent.trim(); };
        rows.sort(function (a, b) {
          var x = key(a), y = key(b), nx = parseFloat(x), ny = parseFloat(y);
          var d = !isNaN(nx) && !isNaN(ny) ? nx - ny : x.localeCompare(y);
          return asc ? d : -d;
        });
        rows.forEach(function (r) { body.appendChild(r); });
        announce('Sorted by ' + button.textContent.trim() + ', ' + (asc ? 'ascending' : 'descending'));
      });
    });
  }

  /* --- Print: open every <details> and tab panel so nothing is lost -------- */
  var closed = [], hiddenPanels = [];
  window.addEventListener('beforeprint', function () {
    closed = $$('details:not([open])');
    closed.forEach(function (d) { d.open = true; });
    hiddenPanels = $$('.tabs__panel[hidden]');
    hiddenPanels.forEach(function (p) { p.hidden = false; });
  });
  window.addEventListener('afterprint', function () {
    closed.forEach(function (d) { d.open = false; });
    hiddenPanels.forEach(function (p) { p.hidden = true; });
  });

  /* --- Header menu: <details class="nav-menu" open> -------------------------
     Open in the HTML so the links show on wide screens and without JS.
     On small screens it starts closed, behind the Menu button. */
  function initNavMenu(menu) {
    var small = window.matchMedia('(max-width: 48em)');
    var sync = function () { menu.open = !small.matches; };
    sync();
    if (small.addEventListener) small.addEventListener('change', sync);
    // On phones the button floats at the bottom and the links open as a sheet.
    menu.setAttribute('data-ready', '');
    initSheet(menu, small);
  }

  /* --- Floating buttons tuck away while you read ---------------------------
     Any <details data-ready> whose button floats (position: fixed) slides it
     below the screen edge while the page scrolls down, and brings it back as
     soon as you scroll up, reach the end or tab to it (CSS: [data-tucked]). */
  function initTuck(details) {
    var summary = details.querySelector('summary');
    if (!summary) return;
    var lastY = window.scrollY, ticking = false;
    var tuck = function (on) {
      var floating = getComputedStyle(summary).position === 'fixed';
      details.toggleAttribute('data-tucked', on && floating && !details.open);
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 8;
        if (atEnd || y < lastY - 4) tuck(false);
        else if (y > lastY + 4 && y > 120) tuck(true);
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
    details.addEventListener('focusin', function () { tuck(false); });
  }

  /* --- Bottom sheet: a <details> shown as a sheet on small screens --------
     Escape or a tap outside closes it and puts focus back on its button.
     Only one sheet is open at a time. Used by the header menu; pages can
     reuse it for their own <details data-sheet>. */
  function initSheet(sheet, small) {
    var summary = sheet.querySelector('summary');
    sheet.addEventListener('toggle', function () {
      if (!sheet.open || !small.matches) return;
      $$('details[open][data-ready]').forEach(function (d) { if (d !== sheet) d.open = false; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.open && small.matches) { sheet.open = false; summary.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (sheet.open && small.matches && !sheet.contains(e.target)) sheet.open = false;
    });
  }

  /* --- Start --------------------------------------------------------------- */
  function init(root) {
    root = root || document;
    $$('.nav-menu', root).forEach(initNavMenu);
    $$('details[data-ready]', root).forEach(initTuck);
    $$('.tabs', root).forEach(initTabs);
    $$('.accordion', root).forEach(initAccordion);
    $$('.character-count[data-maxlength]', root).forEach(initCharacterCount);
    $$('.password', root).forEach(initPassword);
    $$('[data-error-summary]', root).forEach(initErrorSummary);
    $$('[data-range-output]', root).forEach(initRange);
    $$('.multiselect', root).forEach(initMultiselect);
    $$('.in-page-nav', root).forEach(initInPageNav);
    $$('table[data-sortable]', root).forEach(initSortable);
  }

  window.Hematite = { init: init, toast: toast, announce: announce, sheet: initSheet };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
