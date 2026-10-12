# Changelog

Hematite follows [semantic versioning](https://semver.org/).


## 1.0.0 (2026-10-12)

First release of Hematite, forked from Formwork 2.4.0. Every class, component, pattern and template
is kept; only the skin changes.

- New look after the MX Master 4: graphite and pale grey themes, sculpted radii, soft layered
  shadows with a top sheen, metal and knurl textures for moving parts, graphite grain and dished keys, no brand colour.
- New tokens: `--color-sunken`, `--color-line`, `--color-edge`, `--color-accent-soft`,
  `--color-sheen`, `--color-shade`, `--color-accent-glow`, `--radius-xs` to `--radius-pill`,
  `--shadow-1/2/3`, `--shadow-inset`, `--shadow-key`, `--shadow-key-pressed`, `--radius-key`,
  `--border-control`, `--gradient-*`, `--texture-knurl`, `--texture-grain`, `--texture-ripple`,
  `--color-led`, `--color-on-metal`, `--color-grain`,
  `--font-display`, `--weight-medium`, `--step--2`, `--press-scale`, `--lift`, `--ease-snap`.
- `--color-key` and `--color-on-key`: keys (buttons, current page, toasts) stay graphite in
  both themes, like the keys on the mouse, instead of turning pale in the dark theme.
- On phones the floating Menu button slides away while you scroll down and comes back when you
  scroll up, reach the end of the page or tab to it.
- `tools/check-a11y.mjs` runs axe on every page in both themes; CI runs it with the contrast check.
- Removed tokens: `--shadow-offset`, `--shadow-press`.
- `--color-accent` is gunmetal in light and brushed silver in dark; the main action is knurled metal.
- New modifiers: `.button--quiet`, `.card--flat`, `.table--striped` (stripes are now opt-in).
- Focus is a single 2px gunmetal outline with a soft halo instead of the two-colour ring.
- Mono is for code only; headings, labels and buttons use the system sans.
- Files renamed: `hematite.css`, `hematite.js` (global `Hematite`), `hematite-icons.svg`; cascade
  layers are `hematite.*`.
- `tools/check-contrast.py` also checks surfaces, edges and the accent in both themes.
- Consistency pass: docs footers use the same footer as the templates (no inverted block),
  `.mono` is kept for code and a new `.tabular` utility sets times and phone numbers, the
  person avatar and confirmation panel read only tokens (new `--color-on-metal`), the notification
  title uses the same overline size as other labels, file paths in eyebrows keep their case, and
  token tables stack in narrow columns.
- In-page navigation ("On this page") now has the same rows, hover and raised current item as
  the side navigation. The mouse logo and hero drawing were removed from the docs.

The entries below are the history of Formwork, which Hematite was forked from.

## Formwork 2.4.0 · 2026-10-12

### Changed

- Phones: the header menu button now floats at the bottom right, within thumb reach, instead of
  sitting at the top. The links open as a sheet along the bottom edge, with the button that closes
  it underneath. Escape or a tap outside closes it and returns focus to the button; only one sheet
  is open at a time. Needs hematite.js (it marks the menu `data-ready`); without it the menu stays
  an open list in the header.
- Phones: the header is one slim row (brand and nothing else) and `.site-header--sticky` is no
  longer sticky below 48em. The phase banner drops its optional end (`.phase-banner__more`)
  below 30em. Header plus phase banner went from 183px to 107px at 375px wide.
- Docs: "In this section" also floats at the bottom (left) on narrow screens and opens as a sheet.

### Added

- Safe-area insets (`env(safe-area-inset-*)`) on the container gutters, sticky action bar, toast
  region and the floating menu button; `viewport-fit=cover` in the templates and docs.
- `--fab-lift` token: raises the floating button, for example above a sticky action bar (set
  automatically when the page has one). `Hematite.sheet(details, mediaQuery)` makes any
  `<details>` behave as a bottom sheet.

## 2.3.0 · 2026-10-12

### Changed

- Contrast now has a ceiling as well as a floor: every colour pair stays between its floor
  (7:1 body text, 4.5:1 other text, 3:1 borders and focus rings) and 15:1. No pure black or pure
  white is left. Paper is a warm off-white (`oklch(97.5% 0.008 95)`), ink a warm near-black
  (`oklch(25.5% 0.012 95)`, 14.7:1); in dark mode a soft charcoal with off-white ink (13.6:1).
  Muted, link and status colours were retuned to match. Was 19.8:1 / 18.1:1.
- Text on the accent and print ink are softened the same way (11.0:1 and 14.6:1).

### Added

- `tools/check-contrast.py` checks every token pair in both themes against the floor and the
  ceiling, and exits with an error if one is out of range.
- The Tokens page documents the range and why there is a ceiling.

## 2.2.2 · 2026-10-12

### Fixed

- Docs theme buttons, tabs, dialogs and the example code still did not work on the published
  docs. The host's Content-Security-Policy blocks script files and only allows inline scripts.
  The published copy now has its scripts inlined, made with the new `tools/build-docs.py`
  (writes to `dist/`). The source pages keep their script files.
- The theme switch works when the browser blocks storage; it just isn't remembered.

## 2.2.1 · 2026-10-12

### Fixed

- Docs theme buttons did nothing on the published page. The docs scripts now load at the end of
  `<body>`, the example code waits for the page to be parsed, and the theme buttons are handled
  through one click listener on the document, so load order no longer matters.

## 2.2.0 · 2026-10-12

### Changed

- The documentation is now a multi-page site instead of one long page. `index.html` is the
  overview and principles; `docs/` holds Tokens, Components (an index plus one page per
  component group, matching the 8 files in `css/components/`), Patterns, Templates,
  Accessibility, Usage and Modern CSS.
- Every docs page has the same header, a side menu (component groups and "In this group" links,
  or "On this page" links), previous and next links, and the theme switch. The side menu stays in
  view on wide screens and folds into an "In this section" button on narrow ones.
- Docs styles and script moved to `docs/docs.css` and `docs/docs.js`.

No change to the CSS, JavaScript, icons or templates.

## 2.1.0 · 2026-10-12

Moved Hematite onto current CSS. Nothing is renamed or removed; pages look the same.

### Changed

- Colour tokens are now one set of `light-dark()` values, switched by `color-scheme` (light dark by
  default, pinned with `data-theme`). The old media-query blocks stay as a fallback inside
  `@supports not (color: light-dark(white, black))`.
- State rules (`:hover`, `:focus-visible`, `[aria-*]`, `::before`) are nested inside their component
  rule with native CSS nesting. Selectors and specificity are unchanged.
- Summary list, steps, contact and bar chart use container queries, so they adapt to the space they
  are in (a card, a sidebar) instead of the screen width. The steps hide their labels below 28rem of
  their own width; the summary list stacks below 26rem.
- Dialog, popover and toast animate with transitions, `@starting-style` and
  `transition-behavior: allow-discrete` instead of keyframes, and now also animate out.
- `body` and the sticky in-page nav use `dvh` (with a `vh` fallback); `html` has
  `scrollbar-gutter: stable`.

### Added

- `:user-invalid`: fields get the error style from the browser's own validation once someone has
  used them, as well as from `aria-invalid`. Invalid fields also get a faint danger tint.
- Tokens `--color-scrim`, `--color-shimmer` and `--color-danger-tint`; the tints are made with
  relative colour syntax (`oklch(from var(--color-ink) l c h / 0.12)`).
- `@property --value` (a typed `<percentage>`), so bar chart bars grow in.
- Skeleton loader gets a stepped sweep.
- `.textarea--auto`: grows with its text from 4 to 12 lines with `field-sizing: content`.
- `.theme-dark` and `.theme-light` utilities pin one block to a theme.
- Docs: a "Modern CSS" table with each feature, what it does, its Baseline status and what happens
  without it.

## 2.0.1 · 2026-10-12

### Fixed

- Docs page dark mode: the hosting page injected an unlayered `body { background: #fff; color: #000 }`
  and `color-scheme: light`, which beat Hematite's layered base, so tokens turned dark on a white page.
  The docs now restate the page ground unlayered.
- Docs and README explain how unlayered resets interact with Hematite's cascade layers.

## 2.0.0 · 2026-10-12

Filled the gaps found by comparing Hematite with the GOV.UK, Vlaanderen and US Web design systems.

### Breaking

- All CSS now loads in cascade layers (`hematite.tokens` to `hematite.print`). Unlayered CSS in
  your project now always beats Hematite, whatever its specificity.
- `components.css` is now an index that imports `css/components/*.css`. Link `hematite.css` or
  `components.css` as before; if you copied `components.css` alone, copy the `components/` folder too.
- Focus is now two rings (yellow band plus ink outline) through the new `--focus-ring` token.
  Components with their own `box-shadow` must add `var(--focus-ring)` on `:focus-visible`.
- Physical properties replaced by logical ones (`border-left` → `border-inline-start` etc.).

### Added

- Tokens: `--color-info` (light and dark), `--step-4`, h5 and h6 styles, `--tracking-tight`,
  `--z-*` stacking scale, `--duration-slow`, `--ease`, `--icon-*`, `--bp-*`, `--container-narrow`,
  `--shadow-press`, `--focus-ring`, `--color-focus-gap`.
- Forms: error summary, date input, choice tiles, inline choices, prefix and suffix, search,
  character count, password input, file upload, range slider, combo box, multiselect, input widths,
  readonly and disabled states, `.field--error`, bare fieldset, page-heading labels and legends.
- Feedback: info alert and badge, solid badge, notification banner, confirmation panel, warning
  text, loader, skeleton, progress bar, toast, phase banner, site banner.
- Content: prose, lists, link list, icons and icon list, card media and stat, inset text, summary
  box, quote, divider, figure, video, gallery, contact block, person, process list, bar chart.
- Data: sortable, compact and sticky tables; summary list and summary card.
- Navigation: pagination, side navigation, in-page navigation, step indicator, task list,
  language selector, share links.
- Interactive: plain disclosure, accordion, tabs, dialog, tooltip, popover.
- Page: collapsing header menu, sticky header, footer columns, cookie banner, sticky action bar.
- Actions: small, icon, block and link-style buttons, busy state, button group, back link, exit this page.
- Layout: `.container--narrow`, `.page`, `.switcher`.
- `print.css`, `js/hematite.js`, `icons/hematite-icons.svg`, 10 templates.
- Docs: component index, patterns, writing rules, templates, axe test record, browser support,
  install and versioning notes.
- `[hidden]` now always hides, even on components that set `display`.

## 1.0.0 · 2026-10-12

First release: tokens, base, layout, button, badge, field, alert, breadcrumb, card, site header,
table, disclosure, footer, skip link.
