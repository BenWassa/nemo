# Sprints: To Do (5-sprint plan)

Goal: iterate from MVP -> Pilot in 5 sprints. Each sprint is small and focused; lanes are parallel streams an AI coding assistant can work on in-repo. Keep content as placeholders — the user will supply final copy elsewhere.

How to use:
- Follow the lanes (UX, HTML/UI, CSS, JS, Prompts/Automation).
- For each ticket: implement minimal code, add tests/lint where applicable, commit with a clear message, and open a tiny PR for review.
- Promote reviewed files to `/root/` when ready (see repo README for promotion commands).

Sprint cadence: 1 sprint = 1 week (adjust as needed).

Sprint 1 — MVP foundations

- UX
  - Create information architecture (IA) sketch: pages, content slots, metadata fields. (File: `docs/ia.md` placeholder)
  - Placeholder copy map: list of content placeholders to be filled later ([INSERT TITLES], [INSERT SUMMARIES]).
  - Acceptance: `docs/ia.md` exists and lists required pages and placeholders.

- HTML / UI
  - Add canonical page scaffolds in `/site/`: `index.html`, `episodes.html`, `about.html`, `episodes/episode-template.html` (placeholders only).
  - Ensure semantic structure and accessible landmarks.
  - Acceptance: pages open and present placeholders; no real content.

- CSS
  - Add base variables and a design tokens file in `site/site.css` (color, spacing, type scale).
  - Ensure responsive grid and utility classes for layout.
  - Acceptance: CSS file loaded by pages; basic layout matches placeholders.

- JS
  - Add minimal site JS scaffold (`site/main.js`) that provides keyboard navigation and a no-JS fallback plan.
  - Acceptance: `main.js` loads (empty handlers OK) and does not break page render.

- Prompts / Automation
  - Create `prompts/content_template.md` for the Master Prompt to output safe placeholders.
  - Add `prompts/sprints_to_do.md` (this file) and `prompts/sprints_complete.md` (template).
  - Acceptance: prompt template exists and documents required input fields.

Sprint 2 — UX polish & page-level structure

- UX
  - Wireframes for `index`, `episode`, and `about` pages (in `docs/wireframes/` as simple SVG/PNG placeholders or markdown descriptions).
  - Acceptance: wireframes added and referenced by HTML pages.

- HTML / UI
  - Flesh out page regions (hero, list, detail, footer) using placeholder components and include aria labels.
  - Acceptance: semantic sections present and navigable.

- CSS
  - Implement responsive header/footer and typographic scale; add a placeholder component style (card/list item).
  - Acceptance: components styled and responsive at common breakpoints.

- JS
  - Implement accessible navigation toggle (mobile) and simple client-side routing for episode template preview.
  - Acceptance: nav toggle works with keyboard; episode template can be previewed locally.

- Prompts / Automation
  - Add a small script or checklist to run accessibility checks (axe-core script or lighthouse note) locally.
  - Acceptance: checklist or script present in `prompts/`.

Sprint 3 — Styling system & components

- UX
  - Define component content patterns (titles, metadata, body, CTAs) in `docs/components.md`.
  - Acceptance: components.md lists fields for each component.

- HTML / UI
  - Convert placeholder components into reusable partials (simple includes or copyable fragments in `site/components/`).
  - Acceptance: components folder exists and pages use fragments.

- CSS
  - Implement component styles (cards, buttons, form controls) and a small utility class set.
  - Add print styles and focus-visible rules.
  - Acceptance: components visually coherent and accessible.

- JS
  - Add progressive enhancement for components (e.g., lazy-load images, collapsible summary components).
  - Acceptance: JS progressively enhances components without breaking no-JS.

- Prompts / Automation
  - Create prompt variants for generating episode outlines and episode summaries with placeholders only.
  - Acceptance: prompt variants produce placeholder-safe markdown.

Sprint 4 — Content pipeline & QA

- UX
  - Create a lightweight editorial checklist and review template for episode content (in `docs/editorial_checklist.md`).
  - Acceptance: checklist present and referenced in `prompts/` templates.

- HTML / UI
  - Add metadata templates (open graph, structured data placeholders) to `root/site` staging files.
  - Acceptance: metadata placeholders present on `root/site` templates.

- CSS
  - Finalize theme tokens and accessibility contrast checks; add variables for dark mode toggling (optional).
  - Acceptance: contrast check notes in `docs/` and CSS variables implemented.

- JS
  - Add small client-side test harness for interactive components (smoke tests) and an update script for local preview.
  - Acceptance: harness runs locally and validates basic interactions.

- Prompts / Automation
  - Add a small `promote.ps1` or script (in `prompts/` or repo root) that helps copy reviewed artifacts to `/root/` with a dry-run option.
  - Acceptance: script present and documented.

Sprint 5 — Pilot readiness & handoff

- UX
  - Final review: IA, content placeholders, and acceptance checklist completed.
  - Acceptance: editorial and accessibility reviews marked done.

- HTML / UI
  - Polish `root/site` templates, ensure canonical links and sitemap placeholder present.
  - Acceptance: `root/site` ready for a pilot preview.

- CSS
  - Final QA: cross-browser checks and final token tweaks.
  - Acceptance: QA notes recorded; CSS considered stable for pilot.

- JS
  - Finalize progressive enhancement and client-side smoke tests.
  - Acceptance: client-side tests pass locally.

- Prompts / Automation
  - Prepare a short handoff brief for external collaborators explaining where to add content and how promotions work.
  - Acceptance: `prompts/handoff_brief.md` exists.

Definition of Done (per sprint)
- Code compiles / pages render locally.
- Basic accessibility checks run (manual or automated) and noted.
- PR opened with small, focused changes and a descriptive commit message.
- Changes documented in `docs/` or `prompts/` where applicable.

Notes for the AI coding assistant
- Work in small commits and push feature branches named `sprint/N/<short-desc>`.
- When editing content placeholders, do not add final creative text — leave `[INSERT ...]` placeholders.
- Before promoting to `root/`, ensure the files meet the sprint's Acceptance criteria and add a short promotion note in the commit message.
