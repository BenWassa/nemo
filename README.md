# 🎬 Filmseele: Finding Nemo

Short: this repo holds a style-first HTML/CSS skeleton and supporting docs for a "Filmseele: Finding Nemo" project. The codebase separates working drafts from polished, deployable artifacts — development happens in the top-level folders and production-ready files live under `/root/`.

Goals
- Provide a clear, accessible skeleton for a site (placeholders only).
- Keep editorial drafts and prompt templates for generating placeholder copy.
- Provide a safe promotion workflow from development -> `root/` for pilot/deployment.

Quick links
- Dev site folder: `./site/`
- Dev docs: `./docs/`
- Prompt templates: `./prompts/`
- Live (deployment) stream: `./root/` (contains `root/site/`, `root/docs/`, `root/assets/`)

Table of contents
- What this repo contains
- Streams & structure
- Development workflow
- Promotion (development -> root)
- Previewing locally
- Accessibility & QA
- Branching, commits, PRs
- Next steps
- License

What this repo contains
- A small, style-first HTML/CSS skeleton (placeholders only).
- Prompt templates and sprint planning in `prompts/`.
- Docs scaffolding in `docs/` for act outlines, themes, archetypes.
- `root/` — canonical/live versions of site/docs/assets that are ready for a pilot or public preview.

Streams & structure
This project uses two parallel streams so drafts and final artifacts don't get mixed:

- `/` (development stream)
	- `prompts/` — prompt templates, sprints, automation helpers.
	- `docs/` — draft act outlines, wireframes, component notes.
	- `site/` — development site skeleton, placeholders, and experiments.
	- `assets/` — raw media and working assets (do not commit very large files without LFS).

- `/root/` (deployment / live stream)
	- `root/site/` — polished templates that will be previewed or deployed.
	- `root/docs/` — final docs and act outlines.
	- `root/assets/` — assets intended to ship with the pilot.

When to edit which stream
- Edit development files for drafting and experimentation.
- Only copy reviewed, final files to `root/` (see Promotion below).

Development workflow (recommended)
1. Create a feature branch: `git checkout -b sprint/NN-short-desc`.
2. Work in `site/`, `docs/`, or `prompts/` as applicable.
3. Keep content placeholder-safe: use tags like `[INSERT TITLE]`, `[SUMMARY]`, `[AUTHOR NOTES]` — do not paste copyrighted scripts or verbatim movie text.
4. Run quick local checks (open HTML, run basic linters, run accessibility checklist).
5. Open a small PR with focused changes and descriptive commit messages.

Promotion (development -> root)
Promote only small, reviewed sets of files. A promotion should be an explicit, auditable commit.

Safe manual promotion example (PowerShell)

```powershell
# ensure destination exists
if (-not (Test-Path -Path .\root\site)) { New-Item -ItemType Directory -Path .\root\site -Force }

# copy development site files into root (careful: this overwrites)
Copy-Item -Path .\site\* -Destination .\root\site -Recurse -Force

# copy a single reviewed doc
Copy-Item -Path .\docs\act-01.md -Destination .\root\docs\ -Force

# review, then commit/push
git add root/; git commit -m "Promote reviewed artifacts to root/"; git push
```

Promotion best practices
- Promote one or two files at a time, not whole directories unless intentionally sweeping.
- Add a promotion note to the commit message describing why the file was promoted.
- Run accessibility and editorial checks before promoting.

Previewing locally
- To preview the development site (from `site/`):

```powershell
cd .\site
python -m http.server 8000
# open http://localhost:8000 in your browser
```

- To preview the live/pilot site (from `root/site/`):

```powershell
cd .\root\site
python -m http.server 8000
# open http://localhost:8000 in your browser
```

If you prefer a single helper script, consider adding `preview.ps1` that accepts `dev` or `root` and serves the correct folder.

Accessibility & QA
- The site should follow WCAG AA principles. Minimal checks to run before promoting:
	- Keyboard navigation (tab order, visible focus)
	- Color contrast for text and UI elements
	- Semantic HTML landmarks and ARIA where needed
	- Images must have alt text placeholders (`alt="[INSERT DESCRIPTION]"`)

- For automated checks, you can run axe-core or Lighthouse locally; include simple instructions in `prompts/`.

Branching, commits, PRs
- Branch naming: `sprint/<number>-<short-desc>` or `feature/<short-desc>`.
- Commit messages: short imperative summary, and include a promotion note when applicable.
- PRs: keep them small. Add a checklist in the PR description linking to the sprint acceptance criteria.

Next steps (suggested)
- Add `CONTRIBUTING.md` describing the promotion policy and code review checklist.
- Add `preview.ps1` to simplify serving dev/live folders.
- Add a CI check to validate `root/` before deploy (lint, a11y smoke tests).
- Populate `docs/` with act outlines and wireframes; use `prompts/MASTER_PROMPT.md` to generate placeholder drafts.

Security & legal notes
- Do not commit copyrighted screenplay excerpts or other protected content. Use placeholders and summaries only.
- Keep secrets out of the repo. Use environment variables or vaults for any deployment credentials.

Contributors & contact
- Owner: BenWassa
- Repo workspace: `nemo.code-workspace`
- For questions, open an issue or add a PR comment.

License
- MIT — see `LICENSE` file for details.

Thank you — if you'd like, I can also add `CONTRIBUTING.md`, `preview.ps1`, and a small GitHub Actions workflow to validate `root/` on PRs.
