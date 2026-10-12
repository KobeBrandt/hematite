# Contributing to Contour

A new component or pattern gets in when it meets all of these:

1. **A real need.** Name at least one page that needs it and why existing components do not work.
2. **HTML first.** Use the native element if there is one (`<details>`, `<dialog>`, `popover`,
   `<progress>`). JavaScript goes in `js/contour.js`, is opt-in, and the component must still be
   usable without it.
3. **Tokens only.** No raw colours, sizes or z-index values in component CSS. rem for sizes, em for
   breakpoints, oklch for colours (a new colour token is a `light-dark()` pair), logical
   properties for direction.
4. **Current CSS, safely.** Use Baseline features freely: nest state rules with `&`, use container
   queries for anything that can sit in a narrow column, and transitions with `@starting-style`
   rather than keyframes. A feature that is not in every browser yet must be an enhancement: put it
   in `@supports`, or make sure the component works and reads the same without it.
5. **BEM and one file.** Name it `.block__element--modifier`, tag it Atom, Molecule or Organism, and
   put it in the matching file in `css/components/`. Add a `forced-colors` rule if it relies on
   borders or fills to show state.
6. **Docs.** Add a live example and "Use" / "Don't" lists to the group's page in `docs/`
   (`docs/components-forms.html` for a form component), a link in its "In this group" side
   menu and on `docs/components.html`. The header, side menu and previous/next links repeat on
   every page: when you add or rename a page, update them on all pages.
7. **Accessibility check.** Contrast 4.5:1 for text (7:1 for body text) and 3:1 for edges, and
   never above 15:1, in both themes (`python3 tools/check-contrast.py`); 2.75rem targets, visible focus, keyboard only, axe with no violations, and a screen reader pass for
   anything interactive. Record the result in the docs test record.
8. **Changelog.** Add a line to `CHANGELOG.md`. Renaming or removing a class or token is a major
   version.
