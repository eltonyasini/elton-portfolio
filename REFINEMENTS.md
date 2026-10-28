# October 28 layout refinement

This repository contains a generated export rather than the maintained React
source. This change keeps the original routing, media, project pages and email
sanitization. The homepage is now an editable ES module at
`site/assets/portfolio-home.js`; styling is in `portfolio-refinement.css`.
The existing React and GSAP instances are passed in from the app bundle.

The new layout uses three featured projects and a six-project grid, a shorter
readable hero, compact About section, and a visible contact email. Project hero
heights and caption sizes are improved, and scroll reveals no longer start
transparent. The name-only GSAP intro lasts about 1.4 seconds, runs once per
tab session, skips reduced motion, and dismisses on interaction. Both JS and
CSS timeouts prevent it obscuring content if the app fails to start.

`tools/refine-export.py` documents the narrow changes to the original app bundle
and entry pages and regenerates export-manifest.json. It is idempotent for this
version and refuses unknown bundles. Before publishing a fresh source export,
port the homepage module, CSS, loader and reveal changes into the maintained
source; otherwise a fresh export will replace this work.

The project-story drafts gathered in the conversation are not included in this
layout-only change. Existing contribution credits remain intact.
