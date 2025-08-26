document.addEventListener('DOMContentLoaded', () => {
    const doc = document.documentElement;
    const header = document.querySelector('.main-header');
    const contentPanels = document.querySelectorAll('.content-panel');
    const homeSections = document.querySelectorAll('.home-section');
    const heroContent = document.querySelectorAll('.hero-content');

    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------
       Header scroll (throttled via rAF)
       ---------------------- */
    if (header) {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                if (window.scrollY > 50) header.classList.add('scrolled');
                else header.classList.remove('scrolled');
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        // run once in case page loaded with offset
        onScroll();
    }

    /* ----------------------
       Intersection reveal (content-panel, home sections, hero)
       ---------------------- */
    if (!prefersReducedMotion) {
        const revealTargets = [...contentPanels, ...homeSections, ...heroContent];
        if (revealTargets.length > 0) {
            const io = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

            revealTargets.forEach(t => io.observe(t));
        }
    } else {
        // Respect reduced motion: reveal everything immediately
        [...contentPanels, ...homeSections, ...heroContent].forEach(el => el.classList.add('is-visible'));
    }

    /* ----------------------
       Mobile navigation (dynamic, accessible)
       ---------------------- */
    const NAV_BREAKPOINT = 820; // px - below this, mobile nav will be used
    const headerContainer = document.querySelector('.header-container');
    const mainNav = document.querySelector('.main-nav');

    if (headerContainer && mainNav) {
        // Create toggle if not present
        let toggle = document.querySelector('.nav-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'nav-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open navigation menu');
            toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            headerContainer.appendChild(toggle);
        }

        // Build mobile nav overlay (hidden by default)
        let mobileOverlay = document.querySelector('.mobile-nav-overlay');
        if (!mobileOverlay) {
            mobileOverlay = document.createElement('div');
            mobileOverlay.className = 'mobile-nav-overlay';
            mobileOverlay.innerHTML = `<nav class="mobile-nav" role="dialog" aria-modal="true" aria-label="Main navigation">
                ${mainNav.innerHTML}
            </nav>`;
            document.body.appendChild(mobileOverlay);
        }

        const mobileNav = mobileOverlay.querySelector('.mobile-nav');
        const focusableSelector = 'a, button, input, textarea, [tabindex]:not([tabindex="-1"])';
        let lastFocused = null;

        function openMobileNav() {
            toggle.setAttribute('aria-expanded', 'true');
            mobileOverlay.classList.add('open');
            lastFocused = document.activeElement;
            // Move focus to first link
            const first = mobileNav.querySelector(focusableSelector);
            if (first) first.focus();
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', trapKeys);
        }

        function closeMobileNav() {
            toggle.setAttribute('aria-expanded', 'false');
            mobileOverlay.classList.remove('open');
            document.body.style.overflow = '';
            if (lastFocused && lastFocused.focus) lastFocused.focus();
            document.removeEventListener('keydown', trapKeys);
        }

        function trapKeys(e) {
            if (e.key === 'Escape') {
                closeMobileNav();
                return;
            }
            if (e.key === 'Tab') {
                // simple focus trap
                const nodes = Array.from(mobileNav.querySelectorAll(focusableSelector)).filter(n => !n.hasAttribute('disabled'));
                if (nodes.length === 0) return;
                const first = nodes[0]; const last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }

        // Open/close handlers
        toggle.addEventListener('click', (ev) => {
            const open = mobileOverlay.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
            if (open) openMobileNav(); else closeMobileNav();
        });

        // Close when clicking links inside mobile nav
        mobileNav.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (a) {
                // allow normal navigation on real link; close menu for SPA-like feel
                closeMobileNav();
            }
        });

        // Click outside mobile nav closes it
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) closeMobileNav();
        });

        // Keep mobile overlay in sync with resizing
        const onResize = () => {
            if (window.innerWidth > NAV_BREAKPOINT && mobileOverlay.classList.contains('open')) {
                closeMobileNav();
            }
        };
        window.addEventListener('resize', onResize);
    }

    /* ----------------------
       Small utility: smooth focus for in-page anchor links
       ---------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
                history.pushState(null, '', href);
            }
        });
    });

});

// ================================
// FilmSeele Popup — Behavior
// ================================
(() => {
  const popup      = document.getElementById('filmseele-popup');
  const panel      = popup?.querySelector('.popup-panel');
  const backdrop   = popup?.querySelector('.popup-backdrop');
  const enterBtn   = document.getElementById('popup-enter');
  const TITLE_ID   = 'popup-title';
  const SEEN_KEY   = 'filmseele_popup_seen_session';

  if (!popup || !panel || !backdrop || !enterBtn) return;

  const initialOpen = () => {
    // Show once per session
    if (sessionStorage.getItem(SEEN_KEY) === '1') return;
    showPopup();
  };

  const showPopup = () => {
    popup.hidden = false;
    popup.classList.add('show');

    // Focus management
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });

    // Trap focus inside
    document.addEventListener('focus', trapFocus, true);
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    sessionStorage.setItem(SEEN_KEY, '1');
    popup.classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      popup.hidden = true;
      document.body.style.overflow = '';
      document.removeEventListener('focus', trapFocus, true);
      document.removeEventListener('keydown', onKeydown);
    }, 800); // matches CSS transition duration
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && document.activeElement === enterBtn) close();
  };

  // Simple focus trap within the panel
  const trapFocus = (e) => {
    if (!popup.hidden && !panel.contains(e.target)) {
      e.stopPropagation();
      panel.focus({ preventScroll: true });
    }
  };

  // Click handlers
  backdrop.addEventListener('click', close);
  enterBtn.addEventListener('click', close);

  // Open when the page is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initialOpen, 60);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initialOpen, 60));
  }

  // Accessibility labels
  popup.setAttribute('aria-labelledby', popup.getAttribute('aria-labelledby') || TITLE_ID);

  // Expose control functions
  window.FilmSeelePopup = { show: showPopup, hide: close };

  // Event listener for the footer logo
  const footerLogoTrigger = document.getElementById('footer-logo-trigger');
  if (footerLogoTrigger) {
      footerLogoTrigger.addEventListener('click', showPopup);
  }
})();