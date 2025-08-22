# UX spec (final)

## Index (Drop‑Off Compass)

* **Center:** anemone hub with 1‑line logline (“Choose your current.”).
* **Four stylized bubbles** around the hub (fixed positions):

  * **Up:** Themes
  * **Left:** Characters
  * **Right:** Journey
  * **Down:** Extras & Credits
* **No top nav**; a small **logo bottom‑left** returns to the hub.
* **Motion:** smooth, waterlike **camera glide** between panels (transform translate only).
* **Copy discipline:** each panel = 2–5 word title + 1 short line + 1–2 CTAs. No paragraphs.

## Journey panel (on the right)

* Presents **two large buttons** for **Marlin** and **Nemo** (character arc lanes).
* A **small grey “Back”** button sits **lower‑left** near the two big buttons, returning to the hub (or the compass right panel).
* Choosing a lane goes to `/journey.html?lane=marlin` or `?lane=nemo`.

---

# Index scaffolding (HTML)

```html
<main id="ocean" class="ocean">
  <!-- HUB -->
  <section id="hub" class="panel hub" aria-label="Drop-Off Hub">
    <div class="anemone">
      <p class="tagline">Choose your current.</p>
    </div>

    <!-- Four directional bubbles -->
    <a class="bubble up"    href="#themes"    aria-label="Themes (up)">Themes</a>
    <a class="bubble left"  href="#characters"aria-label="Characters (left)">Characters</a>
    <a class="bubble right" href="#journey"   aria-label="Journey (right)">Journey</a>
    <a class="bubble down"  href="#extras"    aria-label="Extras & Credits (down)">Extras</a>
  </section>

  <!-- UP -->
  <section id="themes" class="panel north" aria-label="Themes">
    <h2>The Reef Compass</h2>
    <p>Five currents for the inner sea.</p>
    <div class="chips">
      <a class="chip" href="/themes.html#fear-courage">Fear & Courage</a>
      <a class="chip" href="/themes.html#overprotection-autonomy">Overprotection & Autonomy</a>
      <a class="chip" href="/themes.html#trust-flow">Trust & Flow</a>
      <a class="chip" href="/themes.html#death-rebirth">Death & Rebirth</a>
      <a class="chip" href="/themes.html#integration">Integration</a>
    </div>
    <div class="actions"><a class="btn" href="/themes.html">Dive deeper</a></div>
  </section>

  <!-- LEFT -->
  <section id="characters" class="panel west" aria-label="Characters">
    <h2>The Reef</h2>
    <p>Companions & shadows. Tap to meet.</p>
    <div class="reef-cloud">
      <a class="fish" href="/characters.html#marlin">Marlin</a>
      <a class="fish" href="/characters.html#nemo">Nemo</a>
      <a class="fish" href="/characters.html#dory">Dory</a>
      <a class="fish" href="/characters.html#gill">Gill</a>
      <a class="fish" href="/characters.html#crush">Crush</a>
      <a class="fish" href="/characters.html#bruce">Bruce</a>
    </div>
    <div class="actions"><a class="btn" href="/characters.html">See all</a></div>
  </section>

  <!-- RIGHT -->
  <section id="journey" class="panel east" aria-label="Choose a Journey">
    <h2>Choose a Journey</h2>
    <p>Two lanes through one sea.</p>
    <div class="lanes">
      <a class="lane-card nemo"   href="/journey.html?lane=nemo"><span>Nemo</span></a>
      <a class="lane-card marlin" href="/journey.html?lane=marlin"><span>Marlin</span></a>
    </div>
    <a class="btn back-ghost" href="#hub" aria-label="Back to Drop-Off">Back</a>
  </section>

  <!-- DOWN -->
  <section id="extras" class="panel south" aria-label="Extras & Credits">
    <h2>Seafloor Treasures</h2>
    <p>Process, sources, credits.</p>
    <div class="treasure-grid">
      <a class="treasure" href="/extras.html#behind-scenes">Behind the Scenes</a>
      <a class="treasure" href="/extras.html#resources">Resources</a>
      <a class="treasure" href="/extras.html#credits">Credits</a>
    </div>
  </section>
</main>

<!-- fixed logo (home) -->
<a class="logo-home" href="#hub" aria-label="Back to Drop-Off">Filmseele</a>
```

---

# Index CSS (layout & motion essentials)

```css
:root{
  --ease: cubic-bezier(.22,.61,.36,1);
  --radius: 16px;
  --ink: #062b3a; --accent:#ffb703;
  --sea0:#dff6ff; --sea1:#a9e3f7; --sea2:#0b3550;
}

/* Stage */
.ocean{ position:relative; width:100vw; height:100vh; overflow:hidden;
  transition: transform .8s var(--ease), background .8s var(--ease);
  background: radial-gradient(120% 120% at 50% 30%, var(--sea0), #001623 120%);
}
.panel{ position:absolute; width:100vw; height:100vh; display:grid; place-items:center; padding:2rem; }

/* Positions (no arrow keys; anchor-based) */
#hub{ transform: translate(0,0); }
#themes{ transform: translate(0,-100vh); }
#characters{ transform: translate(-100vw,0); }
#journey{ transform: translate(100vw,0); }
#extras{ transform: translate(0,100vh); }

/* Central anemone hub */
.anemone{ width:14rem; height:14rem; border-radius:50%;
  background: radial-gradient(circle at 50% 40%, #ffffff20 0 30%, #ffffff12 30% 60%, transparent 60%);
  backdrop-filter: blur(8px);
  display:grid; place-items:center; text-align:center;
}
.tagline{ color:#fff; font-weight:600 }

/* Directional bubbles */
.bubble{ position:absolute; display:flex; align-items:center; justify-content:center;
  width:9rem; height:9rem; border-radius:50%; color:#fff; text-decoration:none;
  background: rgba(255,255,255,.12); border:1px solid #ffffff33; backdrop-filter: blur(6px);
  transition: transform .3s var(--ease), background .3s var(--ease);
}
.bubble:hover{ transform: translateY(-2px) scale(1.03); background: rgba(255,255,255,.18); }
.bubble.up{ top:8%; left:50%; transform: translate(-50%,0); }
.bubble.left{ left:8%; top:50%; transform: translate(0,-50%); }
.bubble.right{ right:8%; top:50%; transform: translate(0,-50%); }
.bubble.down{ bottom:8%; left:50%; transform: translate(-50%,0); }

/* Journey panel lanes */
.lanes{ display:flex; gap:1.5rem; flex-wrap:wrap; justify-content:center; }
.lane-card{ width:min(38ch,42vw); aspect-ratio:16/9; border-radius:var(--radius);
  display:grid; place-items:center; text-decoration:none; color:#fff;
  background: linear-gradient(145deg, #0f3a55, #0a2a3e);
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  font-size:1.6rem; font-weight:700;
}
.lane-card.nemo{ background: linear-gradient(145deg, #126582, #0b3f54); }
.lane-card.marlin{ background: linear-gradient(145deg, #174868, #0c2f47); }

/* Small grey back button near lower-left of lane area */
.back-ghost{ position:absolute; left:8%; bottom:12%;
  padding:.6rem 1rem; border-radius:999px; text-decoration:none;
  background: rgba(255,255,255,.08); border:1px solid #ffffff26; color:#c8d6de; font-weight:600;
}
.back-ghost:hover{ background: rgba(255,255,255,.14); }

/* Fixed logo */
.logo-home{ position:fixed; left:1rem; bottom:1rem; color:#fff; text-decoration:none; font-weight:800; }

/* Reduced motion: disable camera glide */
@media (prefers-reduced-motion: reduce){
  .ocean{ transition:none; }
}
```

---

# Minimal JS (smooth “camera” between panels via anchors)

```html
<script>
(() => {
  const ocean = document.getElementById('ocean');
  const map = {
    hub: {x:0, y:0, bg:'var(--sea0)'},
    themes: {x:0, y:-100, bg:'var(--sea1)'},
    characters: {x:-100, y:0, bg:'var(--sea1)'},
    journey: {x:100, y:0, bg:'var(--sea1)'},
    extras: {x:0, y:100, bg:'var(--sea2)'}
  };
  function go(id){
    const p = map[id] || map.hub;
    ocean.style.transform = `translate(${ -p.x }vw, ${ -p.y }vh)`;
    ocean.style.background = `radial-gradient(120% 120% at 50% 30%, ${p.bg}, #001623 120%)`;
    // focus the panel heading for a11y
    const h = document.querySelector(`#${id} h2, #${id} h1, #${id} .anemone .tagline`);
    if (h) { h.setAttribute('tabindex','-1'); h.focus(); }
    history.replaceState(null, '', '#'+id);
  }
  window.addEventListener('hashchange', () => go(location.hash.slice(1)));
  go(location.hash.slice(1) || 'hub');
})();
</script>
```

*(No arrow keys; purely click/tap. Works fine without JS — panels are still accessible via native anchor jump.)*

---

# Journey page skeleton (/journey.html)

```html
<main class="journey">
  <header class="journey-head">
    <a class="back-ghost" href="/#journey" aria-label="Back to Journey choices">Back</a>
    <h1>Journey: <span id="laneName">Marlin</span></h1>
    <nav class="dots" aria-label="Stops">
      <a href="#act-1">I</a><a href="#act-2a">IIa</a><a href="#act-2b">IIb</a><a href="#act-3">III</a><a href="#act-4">IV</a>
    </nav>
  </header>

  <!-- Stop cards (lane-specific copy later) -->
  <section id="act-1" class="stop">
    <h2>Act I — The Wound & the Call</h2>
    <p>Loss clenches; the ocean calls the father inward.</p>
    <div class="actions">
      <a class="btn" href="/episodes.html#act-1">Dive deeper</a>
      <a class="btn ghost" href="/podcast.html#ep-1">Play companion</a>
    </div>
  </section>
  <!-- Repeat IIa, IIb, III, IV -->
</main>

<script>
  // read ?lane param to set headings/styling
  const params = new URLSearchParams(location.search);
  const lane = (params.get('lane') || 'marlin').toLowerCase();
  document.getElementById('laneName').textContent = lane[0].toUpperCase()+lane.slice(1);
  document.documentElement.dataset.lane = lane; // use in CSS if desired
</script>
```
