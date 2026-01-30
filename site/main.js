function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('u-hidden', expanded);
  });
}

function loadEpisodeTemplate() {
  const preview = document.getElementById('episode-preview');
  if (!preview) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('episode')) {
    fetch('episodes/episode-template.html')
      .then(r => r.text())
      .then(html => {
        preview.innerHTML = html;
      });
  }
}

function enhanceComponents() {
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.setAttribute('loading', 'lazy');
    img.src = img.dataset.src;
  });
}

function initCollapsibles() {
  document.querySelectorAll('[data-collapsible]').forEach(btn => {
    const target = document.getElementById(btn.getAttribute('data-target'));
    if (!target) return;
    btn.addEventListener('click', () => {
      const hidden = target.classList.toggle('u-hidden');
      btn.setAttribute('aria-expanded', String(!hidden));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadEpisodeTemplate();
  enhanceComponents();
  initCollapsibles();
});

function updatePreview() {
  console.log('Update preview placeholder');
}
