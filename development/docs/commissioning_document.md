# Commissioning Document: "One Ocean, Many Currents"

## Objective

This document serves as a commissioning brief for an AI coding agent to develop the index page and CSS for the "One Ocean, Many Currents" strategy. The goal is to create a professional-grade UX and UI skeleton with placeholder content, ensuring a seamless and immersive user experience.

---

## Deliverables

1. **Index Page Skeleton**
   - A fully responsive HTML structure for the index page.
   - Placeholder content for all sections and nodes.
   - Clear semantic structure with accessibility considerations.

2. **CSS Styling**
   - A complete CSS file implementing the "One Ocean, Many Currents" design language.
   - Depth-based palette transitions and waterlike motion effects.
   - Placeholder styles for all interactive elements.

3. **JavaScript Navigation**
   - Hash-based navigation with smooth transitions between sections.
   - Progressive enhancement for users with JavaScript enabled.
   - Fallback for no-JS environments.

---

## Design Guidelines

### Experience Goals

- **Immersive, non-linear navigation**: Start at the Drop-Off hub (anemone center) and allow users to choose a direction (trial, ally, crisis, ordeal, return).
- **Feels like one giant page**: Use section-to-section camera moves with waterlike easing.
- **Minimalist UI**: No top navigation bar; only a small logo at the bottom-left and contextual controls.
- **Lean content**: Placeholder text limited to 1–2 lines per panel.
- **Depth-based design**: Darken the palette and reduce clarity/noise as users navigate deeper.

### Information Architecture

- **Hub (Drop-Off / Anemone)**: Placeholder for logline and compass chips.
- **Shark Cove (Trials)**: Placeholder for Episode 2 hook and CTAs.
- **Jellyfield (Crisis)**: Placeholder for Episode 3 hook and CTAs.
- **EAC Current (Trust & Flow)**: Placeholder for theme micro-blurb and CTAs.
- **Sydney Harbor (Ordeal)**: Placeholder for Episode 4 hook and CTAs.
- **Reef Return (Integration)**: Placeholder for Episode 5 hook and CTAs.

### Motion & Interaction

- **Camera moves**: Use `transform: translate3d(x,y,0)` and `scale()` for transitions.
- **Easing**: Apply `cubic-bezier(.22,.61,.36,1)` for waterlike glide.
- **Depth transitions**: Implement depth tokens (`--depth-0`, `--depth-1`, `--depth-2`) to adjust palette and contrast.
- **Reduced motion**: Provide a no-motion alternative for users with `prefers-reduced-motion` enabled.

### Controls

- **Logo (bottom-left)**: Links back to the Drop-Off hub.
- **Compass button (bottom-right)**: Opens a radial quick-nav overlay.
- **In-panel chips**: Placeholder for modals or subpage links.

---

## Technical Blueprint

### Layout Skeleton

```html
<main id="ocean">
  <section id="hub-dropoff" class="panel depth-0">Placeholder content</section>
  <section id="shark-cove" class="panel depth-1">Placeholder content</section>
  <section id="jellyfield" class="panel depth-1">Placeholder content</section>
  <section id="eac-current" class="panel depth-1">Placeholder content</section>
  <section id="sydney-harbor" class="panel depth-2">Placeholder content</section>
  <section id="reef-return" class="panel depth-0">Placeholder content</section>
</main>

<a class="brand-home" href="#hub-dropoff" aria-label="Back to Drop-Off">Filmseele</a>
<button class="compass-toggle" aria-haspopup="dialog" aria-controls="nav-compass">☸</button>
<dialog id="nav-compass" class="compass">Placeholder radial links</dialog>
```

### CSS Tokens

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

### JavaScript Navigation

```javascript
(() => {
  const ocean = document.getElementById('ocean');
  const panels = Array.from(document.querySelectorAll('.panel'));

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
    document.documentElement.dataset.depth = c.depth;
    history.replaceState(null, '', '#' + id);
    const h = document.querySelector(`#${id} h2, #${id} h1`);
    if (h) h.setAttribute('tabindex', '-1'), h.focus();
  }

  for (const [id, c] of Object.entries(coords)) {
    const el = document.getElementById(id);
    if (el) el.style.transform = `translate(${c.x}vw, ${c.y}vh)`;
  }

  window.addEventListener('hashchange', () => go(location.hash.slice(1)));
  go(location.hash.slice(1) || 'hub-dropoff');

  const compass = document.getElementById('nav-compass');
  document.querySelector('.compass-toggle')?.addEventListener('click', () => compass.showModal());
  compass?.addEventListener('click', e => (e.target === compass) && compass.close());
})();
```

---

## Notes

- **Accessibility**: Ensure focus management and support for `prefers-reduced-motion`.
- **Performance**: Optimize for GPU transforms and lightweight assets.
- **Scalability**: Design to accommodate additional nodes in the future.

---

## Timeline

- **Phase 1**: Skeleton and placeholder content (2 days).
- **Phase 2**: CSS styling and motion effects (3 days).
- **Phase 3**: JavaScript navigation and progressive enhancement (2 days).

---

## Contact

For questions or clarifications, please contact the commissioning team.
