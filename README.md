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
This repository uses a two-stream model: a development stream for drafts and a `root/` stream for polished, deployment-ready artifacts.

High-level workflow:
1. Draft and iterate in the development folders (`/site`, `/docs`, `/assets`).
2. Use `prompts/MASTER_PROMPT.md` to generate safe placeholder text and outlines.
3. When content is reviewed and ready, promote specific files to `/root/` (see Promotion section below).
4. Preview or deploy from `/root/`.

## 🗂️ Structure
- `/root/` — Live / deployment stream (final docs, site, assets). Only polished, reviewed content should be placed here.
- `/prompts` — Prompt templates and tooling for content generation (development).
- `/docs` — Development docs: act outlines, themes, archetypes, drafts.
- `/site` — Development site skeleton, stubs, and style experiments.
- `/assets` — Development media, icons, and raw assets.

Promotion (development -> root)

Make small, intentional promotions. Example PowerShell commands (run from repo root) to copy reviewed files into `root/`:

```powershell
# ensure destination exists
if (-not (Test-Path -Path .\root\site)) { New-Item -ItemType Directory -Path .\root\site -Force }

# copy entire site (use carefully)
Copy-Item -Path .\site\* -Destination .\root\site -Recurse -Force

# copy a single doc
Copy-Item -Path .\docs\act-01.md -Destination .\root\docs\ -Force

# commit promoted files
git add root/; git commit -m "Promote reviewed artifacts to root/"; git push
```

Checklist before promoting:
- Confirm content review and accessibility (WCAG AA) where applicable.
- Ensure no copyrighted or sensitive material is included.
- Keep promotions focused (promote single files or small folders).


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