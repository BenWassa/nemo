## Original Thought and Vision
"Let's go outside the box here.

We will give the UX the experience on the index page of:
It will seem like a single huge page but really it's just smart navigation JS.

Start in the center of the story - the drop-off with the anemone in the center and various locations around it as stylized choices to explore.
If a user clicks one, then it "moves/floats/swims" over in that direction to another screen which looks like it's a single large screen but it's really just smart navigation tricks.

Everything on the index page should be smooth, flow like water between sections, and have no upper nav bar or icon. A single logo at the bottom left should suffice. This way it can always appear like the site is "underwater."

Also, all the content on the index site should be lean and cut out the fluff - a user would get all the core details and messages without protracted paragraphs. Each section would have buttons to dive deeper. This could then go to other pages... working on how to do this. Maybe literally going deeper in the water via darker palette transitions."

---

# Strategy: “One Ocean, Many Currents”

## Experience Goals

- **Immersive, non-linear**: Start at the Drop-Off hub (anemone center), choose a direction (trial, ally, crisis, ordeal, return).
- **Feels like one giant page**: Actually section-to-section camera moves (translate/scale) with waterlike easing.
- **No top nav**: Only a small logo bottom-left (home to hub). Everything else is contextual.
- **Lean copy**: Snackable 1–2 lines per panel with “Dive deeper” buttons to longform subpages.
- **Depth = meaning**: Navigating “deeper” darkens palette and reduces clarity/noise (darker blues, softer caustics).

---

## Information Architecture (Spatial Map)

Think of the index as a 2D ocean map with 6 nodes around the hub. Each node is a full-bleed “panel” that appears like a new screen.

```
            [SHARK COVE]
                 ↑
   [JELLYFIELD] ← HUB (DROP-OFF/ANEMONE) → [EAC CURRENT]
                 ↓
           [SYDNEY HARBOR]
                 ↓
            [REEF RETURN]
```

---

## Nodes → Content Focus & CTAs

- **Hub — Drop-Off / Anemone**: 1-line logline, “Start with Wound & Call,” small compass chips (Acts/Themes).
- **Shark Cove (Trials)**: Ep2 hook, “Fish are friends” chip, CTA → Episodes#act-2a + Podcast#ep-2.
- **Jellyfield (Crisis)**: Ep3 hook, “Flow vs Force” chip, CTA → Episodes#act-2b + Podcast#ep-3.
- **EAC Current (Trust & Flow)**: Theme micro-blurb, CTA → Themes#trust-flow + Characters#crush.
- **Sydney Harbor (Ordeal)**: Ep4 hook, “Swim down” chip, CTA → Episodes#act-3 + Podcast#ep-4.
- **Reef Return (Integration)**: Ep5 hook, “Same reef, different heart,” CTA → Episodes#act-4 + Podcast#ep-5.

Each node shows 1–2 sentences max, 1 theme chip, 2 CTAs (“Dive deeper” + “Play companion”).

---

## Motion & Interaction Language

- **Camera moves**: Parent `<main>` container uses `transform: translate3d(x,y,0) scale(…)`.
- **Durations**: 600–900ms; easing: `cubic-bezier(.22,.61,.36,1)` (waterlike glide).
- **Water feel**: Tiny floating parallax (caustics layer) at 1–2px offsets; no heavy animations.
- **Depth transitions**: As you move “down” (Hub→Harbor→Reef Return), apply a depth token:
  - `--depth-0` (bright teal), `--depth-1` (mid blue), `--depth-2` (deep navy).
  - Shift background gradient + reduce contrast of decorative layers (not text).
- **Sound (optional)**: Subtle “bloop” on arrival; mute toggle top-right (hidden until hover/focus).
- **Reduced Motion**: If `prefers-reduced-motion`, no camera moves—snap content + fade.

---

## Controls (No Global Navbar)

- **Bottom-left logo** → Returns to Hub (aria-label “Back to Drop-Off”).
- **Bottom-right “compass” button** → Opens a radial quick-nav overlay (Acts, Themes, Podcast, Extras).
- **In-panel chips** → Open modals (e.g., theme micro-explainer) or go to subpages.

---

## Content Pattern (Ultra-Lean on Index)

Each node = Card Above the Reefline

- **Eyebrow**: Act or Theme
- **Title**: 2–5 words
- **One-liner**: Tier-3 narrative-mythic
- **Chip**: Theme tag
- **2 CTAs**: Dive deeper → subpage anchor; Play companion → podcast anchor

**Example (Sydney Harbor):**

- **Eyebrow**: Act III
- **Title**: Ordeal & Transformation
- **Line**: “Surrender becomes the only stroke left—and courage surfaces.”
- **Chip**: Death / Rebirth
- **CTAs**: Dive deeper → /episodes.html#act-3; Play companion → /podcast.html#ep-4

---

## Technical Blueprint (Dev-Ready, Minimal JS)

### Layout Skeleton

```html
<main id="ocean">
  <section id="hub-dropoff" class="panel depth-0">…</section>
  <section id="shark-cove" class="panel depth-1">…</section>
  <section id="jellyfield" class="panel depth-1">…</section>
  <section id="eac-current" class="panel depth-1">…</section>
  <section id="sydney-harbor" class="panel depth-2">…</section>
  <section id="reef-return" class="panel depth-0">…</section>
</main>

<!-- Fixed UI -->
<a class="brand-home" href="#hub-dropoff" aria-label="Back to Drop-Off">Filmseele</a>
<button class="compass-toggle" aria-haspopup="dialog" aria-controls="nav-compass">☸</button>
<dialog id="nav-compass" class="compass">…radial links…</dialog>
```

### CSS Tokens (Depth + Motion)

```css
:root {
  --ink: #072b3a;
  --accent: #ffb703;
  --sea-0: #e8f7ff;
  --sea-1: #bfe6f7;
  --sea-2: #0b3550;
  --caustics: radial-gradient(...); /* subtle light pattern */
  --radius: 16px;
  --shadow: 0 8px 24px rgba(0, 0, 0, .12);
  --ease: cubic-bezier(.22, .61, .36, 1);
}

#ocean {
  transition: transform .8s var(--ease), background .8s var(--ease);
}

.panel {
  width: 100vw;
  height: 100vh;
  position: absolute; /* positioned via JS */
}

.depth-0 {
  --bg: var(--sea-0);
}

.depth-1 {
  --bg: var(--sea-1);
}

.depth-2 {
  --bg: var(--sea-2);
}

.panel {
  background: radial-gradient(120% 120% at 50% 30%, var(--bg), #001623 120%);
}

.card {
  background: rgba(255, 255, 255, .08);
  backdrop-filter: blur(8px);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
```

### Smart Navigation (Hash-Based; Progressive Enhancement)

```javascript
(() => {
  const ocean = document.getElementById('ocean');
  const panels = Array.from(document.querySelectorAll('.panel'));

  // Absolute coordinates for each node in the 2D ocean (in vw/vh)
  const coords = {
    'hub-dropoff': { x: 0, y: 0, depth: 0 },
    'shark-cove': { x: -100, y: -30, depth: 1 },
    'jellyfield': { x: -60, y: 40, depth: 1 },
    'eac-current': { x: 70, y: -20, depth: 1 },
    'sydney-harbor': { x: 40, y: 80, depth: 2 },
    'reef-return': { x: 10, y: 160, depth: 0 }
  };

  function go(id) {
    const c = coords[id] || coords['hub-dropoff'];
    ocean.style.transform = `translate3d(${-c.x}vw, ${-c.y}vh, 0)`;
    document.documentElement.dataset.depth = c.depth; // swap palettes if desired
    history.replaceState(null, '', '#' + id);
    // a11y: move focus into panel heading
    const h = document.querySelector(`#${id} h2, #${id} h1`);
    if (h) h.setAttribute('tabindex', '-1'), h.focus();
  }

  // Position panels in the ocean
  for (const [id, c] of Object.entries(coords)) {
    const el = document.getElementById(id);
    if (el) el.style.transform = `translate(${c.x}vw, ${c.y}vh)`;
  }

  // Handle hash nav
  window.addEventListener('hashchange', () => go(location.hash.slice(1)));
  go(location.hash.slice(1) || 'hub-dropoff');

  // Compass modal (optional)
  const compass = document.getElementById('nav-compass');
  document.querySelector('.compass-toggle')?.addEventListener('click', () => compass.showModal());
  compass?.addEventListener('click', e => (e.target === compass) && compass.close());
})();
```

---

## Notes

- **No JS fallback**: Panels stack vertically (set `.panel { position: relative; }` in a no-JS stylesheet), links are regular anchors.
- **A11y**: On navigation, focus the panel title; support `prefers-reduced-motion` with immediate transform changes or jump scroll.
- **Performance**: Use GPU transforms only; keep images lightweight; one caustics overlay (CSS) is enough.

---

## Copy Discipline (Index Only)

- **Hub (1 line)**: “A mythic swim through fear, trust, and return—choose your current.”
- **Per Node**: 1-line title, 1-line sentence, 1 theme chip, 2 CTAs. No paragraphs.
- **Modals (optional)**: Up to 60–90 words + link out.

---

## Visual System Highlights

- **Depth meter (left edge)**: A thin vertical bar that darkens as you move “down.”
- **Particles**: A few floating motes moving 0.2–0.4 speed of scroll to suggest water.
- **Palette shift by depth token**: Text remains AA contrast at all times.
- **Logo**: Small, bottom-left; on hover it glows (home cue).

---

## Why This Works

- **Clarity**: You always know “where you are” (visual nodes, depth meter).
- **Delight**: Gentle motion + aquatic metaphors make the site feel alive.
- **Respect for attention**: Surface is lean; deeper content is opt-in via CTAs.
- **Scalable**: New films = new map coordinates; same engine.