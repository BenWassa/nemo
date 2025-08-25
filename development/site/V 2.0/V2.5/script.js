/* -----------------------------------------
   OceanNavigator — tiny controller (< 1.5KB)
   Parallax drift, ambient bubbles, audio, and soft page transition.
------------------------------------------ */
(function(){
  const root = document.documentElement;
  const scene = document.querySelector('.scene');
  const layers = [...document.querySelectorAll('.layer')];
  let motionEnabled = true;
  const themeToggle = document.getElementById('themeToggle');
  const motionBtn = document.getElementById('motionToggle');
  const sndBtn = document.getElementById('sndToggle');

  // Theme persistence
  const savedTheme = localStorage.getItem('fs:theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('fs:theme', next);
      themeToggle.setAttribute('aria-pressed', String(next === 'light'));
      themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
    });
  }

  // Ambient parallax via pointer
  // Throttled pointer handling for better perf
  let last = 0;
  function onMove(e){
    if (!motionEnabled) return;
    const now = performance.now();
    if (now - last < 16) return; // ~60fps
    last = now;
    const r = scene.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach(el => {
      const depth = parseFloat(el.dataset.depth || 0);
      const dx = -cx * (depth / 240);
      const dy = -cy * (depth / 240);
      el.style.transform = `translate3d(${dx*30}px, ${dy*20}px, 0) scale(${depth<-1?1.1:1})`;
    });
  }
  window.addEventListener('pointermove', onMove, { passive: true });

  // Ambient bubbles
  const spawnBubble = () => {
    const b = document.createElement('div');
    b.className = 'bubble';
    b.style.left = Math.random()*100 + 'vw';
    b.style.setProperty('--drift', (Math.random()*40-20) + 'vw');
    b.style.animationDuration = (14 + Math.random()*10) + 's';
    scene.appendChild(b);
    setTimeout(() => b.remove(), 24000);
  };
  for (let i=0;i<14;i++) setTimeout(spawnBubble, i*800);
  setInterval(spawnBubble, 1800);

  // Soft page transition ripple
  const navLinks = document.querySelectorAll('a.bubble-btn');
  navLinks.forEach(a => a.addEventListener('click', (ev) => {
    // enable animated leave without breaking middle-click
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    const href = a.getAttribute('href');
    rippleOut(a, () => window.location.href = href);
  }));

  function rippleOut(originEl, done){
    const o = originEl.getBoundingClientRect();
    const cx = o.left + o.width/2; const cy = o.top + o.height/2;
    const cover = Math.hypot(Math.max(cx, innerWidth-cx), Math.max(cy, innerHeight-cy));
    const overlay = document.createElement('div');
    overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.pointerEvents='none'; overlay.style.zIndex='9999';
    overlay.style.background=`radial-gradient(circle at ${cx}px ${cy}px, rgba(242,71,2,.35) 0, rgba(242,71,2,.27) 10%, rgba(12,67,123,.9) 28%, rgba(4,28,44,1) 55%)`;
    overlay.animate([{clipPath:`circle(0px at ${cx}px ${cy}px)`},{clipPath:`circle(${cover}px at ${cx}px ${cy}px)`}], {duration: 520, easing:'cubic-bezier(.2,.6,.2,1)', fill:'forwards'});
    document.body.appendChild(overlay);
    setTimeout(done, 480);
  }

  // Ambient audio (user gesture required)
  const audio = new Audio('assets/audio/reef_ambience.mp3');
  audio.loop = true; audio.volume = 0.25; let audioOn = false;
  if (sndBtn) {
    sndBtn.addEventListener('click', async () => {
      try {
        if (!audioOn) { await audio.play(); audioOn = true; sndBtn.setAttribute('aria-pressed','true'); }
        else { audio.pause(); audio.currentTime = 0; audioOn = false; sndBtn.setAttribute('aria-pressed','false'); }
      } catch(e){ console.warn('Audio blocked:', e); }
    });
  }

  // Motion toggle (for users who want fewer effects beyond media query)
  if (motionBtn) {
    // Initialize motion button state
    const saved = localStorage.getItem('fs:motion');
    if (saved !== null) {
      motionEnabled = saved === 'true';
      motionBtn.setAttribute('aria-pressed', String(motionEnabled));
    }
    motionBtn.addEventListener('click', () => {
      motionEnabled = !motionEnabled; motionBtn.setAttribute('aria-pressed', String(motionEnabled));
      localStorage.setItem('fs:motion', String(motionEnabled));
    });
  }

  // Respect prefers-reduced-motion by default unless user has set a preference
  if (matchMedia('(prefers-reduced-motion: reduce)').matches && localStorage.getItem('fs:motion') === null) {
    motionEnabled = false; if (motionBtn) motionBtn.setAttribute('aria-pressed','false');
  }
})();
