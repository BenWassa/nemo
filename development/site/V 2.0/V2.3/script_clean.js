class OceanNavigator {
    constructor() {
        this.ocean = document.getElementById('ocean');
        this.panels = document.querySelectorAll('.panel');
        this.compassToggle = document.querySelector('.compass-toggle');
        this.navCompass = document.getElementById('nav-compass');
        this.brandHome = document.querySelector('.brand-home');
        this.cursor = document.querySelector('.cursor');

        this.currentPanelId = 'hub-dropoff';
        this.panelMap = this.createPanelMap(); // Stores panel positions
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        this.init();
    }

    createPanelMap() {
        const map = new Map();
        // Define explicit positions for each panel relative to the starting view
        // Each panel is 100vw x 100vh.
        // hub-dropoff is at (0,0) relative to its initial view.
        // shark-cove is UP from hub-dropoff, so main needs to move DOWN (-y).
        // jellyfield is LEFT from hub-dropoff, so main needs to move RIGHT (+x).
        // etc.
        map.set('hub-dropoff', { x: 0, y: 0, depth: 0, filterTarget: '0' });
        map.set('shark-cove', { x: 0, y: -100, depth: 1, filterTarget: '1' }); // Up
        map.set('jellyfield', { x: 100, y: 0, depth: 1, filterTarget: '1' }); // Left
        map.set('eac-current', { x: -100, y: 0, depth: 1, filterTarget: '1' }); // Right
        map.set('sydney-harbor', { x: 0, y: 100, depth: 2, filterTarget: '2' }); // Down
        map.set('reef-return', { x: 0, y: 200, depth: 0, filterTarget: '0' }); // Further Down (returned to surface depth)
        return map;
    }

    init() {
        this.setupCursor();
        this.setupInitialState();
        this.addEventListeners();
        this.applyMotionPreference();

        // Handle initial hash
        const initialHash = window.location.hash.substring(1);
        if (initialHash && this.panelMap.has(initialHash)) {
            this.navigateTo(initialHash, true); // Instant navigation
        } else {
            this.navigateTo('hub-dropoff', true); // Default to hub
        }
    }

    setupInitialState() {
        // Hide all panels initially, except the one navigated to by JS
        this.panels.forEach(panel => panel.classList.remove('active'));
    }

    setupCursor() {
        if (!this.cursor) return;

        document.addEventListener('mousemove', (e) => {
            this.cursor.style.transform = `translate3d(${e.clientX - 14}px, ${e.clientY - 14}px, 0)`;
            this.cursor.style.opacity = 1; // Show cursor on mousemove
        });
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = 0; // Hide cursor when mouse leaves window
        });

        document.querySelectorAll('a, button, .chip').forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });
    }

    applyMotionPreference() {
        if (this.prefersReducedMotion) {
            document.body.classList.add('reduced-motion'); // Add class for CSS
            this.ocean.style.transitionDuration = '0s';
            this.panels.forEach(panel => panel.style.transitionDuration = '0s');
            // Disable custom cursor transition if it interferes
            if (this.cursor) this.cursor.style.transition = 'none';
        }
    }

    navigateTo(targetPanelId, instant = false) {
        if (!this.panelMap.has(targetPanelId) || targetPanelId === this.currentPanelId) {
            return;
        }

        const targetData = this.panelMap.get(targetPanelId);
        const currentPanelElement = document.getElementById(this.currentPanelId);
        const targetPanelElement = document.getElementById(targetPanelId);

        if (!targetPanelElement) return;

        // Apply instant transition if requested or preferred reduced motion
        if (instant || this.prefersReducedMotion) {
            this.ocean.style.transitionDuration = '0s';
            this.panels.forEach(panel => panel.style.transitionDuration = '0s');
        } else {
            this.ocean.style.transitionDuration = 'var(--duration)';
            this.panels.forEach(panel => panel.style.transitionDuration = 'var(--fast-duration)');
        }

        // Move the whole ocean container
        this.ocean.style.transform = `translate(${-targetData.x}vw, ${-targetData.y}vh)`;
        this.ocean.setAttribute('data-current-depth', targetData.filterTarget); // Update data attribute for filter

        // Update active panel visibility
        if (currentPanelElement) currentPanelElement.classList.remove('active');
        targetPanelElement.classList.add('active');

        this.currentPanelId = targetPanelId;
        window.history.pushState(null, '', `#${targetPanelId}`); // Update URL hash

        // Re-enable transitions after the instant move
        if (instant || this.prefersReducedMotion) {
            requestAnimationFrame(() => {
                this.ocean.style.transitionDuration = 'var(--duration)';
                this.panels.forEach(panel => panel.style.transitionDuration = 'var(--fast-duration)');
            });
        }
    }

    addEventListeners() {
        // Panel navigation (chips)
        document.querySelectorAll('.panel .chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('href').substring(1);
                this.navigateTo(targetId);
            });
        });

        // Brand Home button
        if (this.brandHome) {
            this.brandHome.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('hub-dropoff');
            });
        }

        // Compass Toggle
        if (this.compassToggle) {
            this.compassToggle.addEventListener('click', () => this.toggleCompass(true));
        }

        // Compass Modal Navigation & Close
        if (this.navCompass) {
            this.navCompass.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.classList.contains('compass-item')) {
                    e.preventDefault();
                    const targetId = e.target.getAttribute('href').substring(1);
                    this.navigateTo(targetId);
                    this.toggleCompass(false);
                }
                if (e.target === this.navCompass) { // Click outside compass menu, but inside dialog
                    this.toggleCompass(false);
                }
            });
            this.navCompass.addEventListener('close', () => { // Native dialog 'close' event
                this.compassToggle.setAttribute('aria-expanded', 'false');
                if (this.focusedElementBeforeModal) {
                    this.focusedElementBeforeModal.focus();
                    this.focusedElementBeforeModal = null;
                }
            });
        }

        // Keyboard Navigation (Arrows for movement, Esc for compass)
        document.addEventListener('keydown', (e) => {
            if (this.navCompass && this.navCompass.open) { // If compass is open
                if (e.key === 'Escape') {
                    this.toggleCompass(false);
                }
                return; // Prevent ocean navigation
            }

            let nextPanelId = null;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.currentPanelId === 'hub-dropoff') nextPanelId = 'shark-cove';
                    else if (this.currentPanelId === 'sydney-harbor') nextPanelId = 'hub-dropoff';
                    else if (this.currentPanelId === 'reef-return') nextPanelId = 'sydney-harbor';
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.currentPanelId === 'hub-dropoff') nextPanelId = 'sydney-harbor';
                    else if (this.currentPanelId === 'shark-cove') nextPanelId = 'hub-dropoff';
                    else if (this.currentPanelId === 'sydney-harbor') nextPanelId = 'reef-return';
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.currentPanelId === 'hub-dropoff') nextPanelId = 'jellyfield';
                    else if (this.currentPanelId === 'eac-current') nextPanelId = 'hub-dropoff';
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.currentPanelId === 'hub-dropoff') nextPanelId = 'eac-current';
                    else if (this.currentPanelId === 'jellyfield') nextPanelId = 'hub-dropoff';
                    break;
                case 'Home': // Fallback for 'C' if not defined or 'C' is used for something else
                case 'c':
                    e.preventDefault();
                    nextPanelId = 'hub-dropoff';
                    break;
            }

            if (nextPanelId && this.panelMap.has(nextPanelId)) {
                this.navigateTo(nextPanelId);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const hash = window.location.hash.substring(1);
            if (hash && this.panelMap.has(hash)) {
                this.navigateTo(hash);
            } else {
                this.navigateTo('hub-dropoff'); // Default if hash is empty or unknown
            }
        });
    }

    toggleCompass(open) {
        if (!this.navCompass || !this.compassToggle) return;

        if (open) {
            this.focusedElementBeforeModal = document.activeElement;
            this.navCompass.showModal(); // Use native dialog method
            this.navCompass.classList.add('show'); // For custom transition
            this.compassToggle.setAttribute('aria-expanded', 'true');
            this.navCompass.focus(); // Ensure dialog receives focus
        } else {
            this.navCompass.close();
            this.navCompass.classList.remove('show'); // For custom transition
            this.compassToggle.setAttribute('aria-expanded', 'false');
            if (this.focusedElementBeforeModal && document.body.contains(this.focusedElementBeforeModal)) {
                this.focusedElementBeforeModal.focus();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.oceanNavigator = new OceanNavigator();
});
