# 🎬 Movie Miniseries: Finding Nemo

**Movie Miniseries: Finding Nemo** reimagines Pixar’s classic as a mythic, psychologically informed miniseries.
This repo ships a **style‑first HTML/CSS skeleton** with strict placeholders, plus a professor‑level act framework.
Content is added later; UX/UI quality is first‑class.

## ✨ What’s inside
- 4–5 act breakdown (Film Studies + Psychology)
- Themes & archetypes mapped to key beats
- Commissioning brief for LLM/dev handoff
- Polished HTML/CSS site skeleton (placeholders only)
- Podcast scaffolding (trailer + episodes)

## 🧭 How to use
1. Watch film, jot focus notes (e.g., trauma → overprotection; trust/flow).
2. Run the **Master Prompt** in `/prompts` with your inputs.
3. Edit `/site/index.html` + `/site/site.css` (structure/style only).
4. Expand docs in `/docs` when you’re ready for real content.

## 🗂️ Structure
/root    # All live content (final docs, site, assets)
/prompts # Prompts & quick-fill (development)
/docs    # Acts, themes, archetypes (development)
/site    # index.html, site.css, stubs, assets (development)
/assets  # Media, icons, etc. (development)


## 🛠 Tech & constraints
- Semantic HTML + single CSS file (no frameworks)
- Accessible (WCAG AA), responsive, system fonts
- Placeholders everywhere; no real content shipped in v0

## 📜 License
MIT

## Repo scaffold added
I added a minimal repo scaffold to help you start development. New files and folders:

- `prompts/` — `MASTER_PROMPT.md` (prompt template for content drafting)
- `root/docs/` — `README.md` (docs workspace — live)
- `root/site/` — `index.html`, `site.css` (simple placeholder site — live)
- `root/assets/` — `README.md` (where to store images/audio — live)
- `.gitignore`, `LICENSE`

How to preview the placeholder site locally:

1. Open `site/index.html` in your browser (double-click file) or use a simple static server.
2. Optional: with Python installed, run `python -m http.server` from the `site` folder and open http://localhost:8000

Next suggested steps:

- Fill `docs/` with act outlines.
- Use `prompts/MASTER_PROMPT.md` to generate safe placeholder text.
- Replace placeholders in `site/index.html` as you iterate.