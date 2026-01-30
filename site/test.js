// Simple client-side test harness
(function(){
  console.log('Running smoke tests');
  const toggle = document.getElementById('nav-toggle');
  if (toggle) {
    toggle.click();
    console.assert(toggle.getAttribute('aria-expanded') === 'true', 'nav opens');
    toggle.click();
    console.assert(toggle.getAttribute('aria-expanded') === 'false', 'nav closes');
  }
  const collapsible = document.querySelector('[data-collapsible]');
  if (collapsible) {
    collapsible.click();
    console.assert(collapsible.getAttribute('aria-expanded') === 'true', 'collapsible opens');
  }
})();
