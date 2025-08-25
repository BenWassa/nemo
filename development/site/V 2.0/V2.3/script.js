class UnderwaterWorld {
    constructor() {
        this.currentLocation = 'anemone-center';
        this.locations = {
            'anemone-center':    { x: 0, y: 0,   indicator: 'Drop-Off / Anemone Hub',       depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.0, causticsOpacity: 0.2, navTargets: { up: 'shark-cove-node', left: 'jellyfield-node', right: 'eac-current-node', down: 'sydney-harbor-node' } },
            'shark-cove-node':   { x: 0, y: -100, indicator: 'Shark Cove: Road of Trials',   depth: 0,  bgVar: 'var(--depth-0-bg)', particleIntensity: 1.5, causticsOpacity: 0.3, navTargets: { down: 'anemone-center' } },
            'jellyfield-node':   { x: 100, y: 0,   indicator: 'Jellyfield: Deepening Crisis', depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.2, causticsOpacity: 0.2, navTargets: { right: 'anemone-center' } },
            'eac-current-node':  { x: -100, y: 0,  indicator: 'EAC Current: Trust & Flow',    depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.2, causticsOpacity: 0.2, navTargets: { left: 'anemone-center' } },
            'sydney-harbor-node':{ x: 0, y: 100,  indicator: 'Sydney Harbor: Ordeal',      depth: 2,  bgVar: 'var(--depth-2-bg)', particleIntensity: 0.7, causticsOpacity: 0.15, navTargets: { up: 'anemone-center', down: 'reef-return-node' } },
            'reef-return-node':  { x: 0, y: 200,  indicator: 'Reef Return: Integration',     depth: 3,  bgVar: 'var(--depth-3-bg)', particleIntensity: 0.5, causticsOpacity: 0.1, navTargets: { up: 'sydney-harbor-node' } }
        };

        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        this.focusedElementBeforeModal = null; // For accessibility: remember focus before opening quick-nav
        
        this.init();
    }

    init() {
        this.setupAudio();
        this.createTentacles();
        this.startParticleSystem();
        this.addEventListeners();
        this.startAmbientAnimations();
        
        // Handle initial URL hash for deep linking
        const initialHash = window.location.hash.substring(1); // Remove '#'
        const initialTargetId = this.findNearestNodeId(initialHash); // Find the corresponding node

        if (initialTargetId && this.locations[initialTargetId]) {
            this.currentLocation = initialTargetId; // Set current location
            this.instantNavigate(this.currentLocation); // Instant move without animation

            // Show welcome message only if it's the hub on first load AND no specific hash was provided
            if (this.currentLocation === 'anemone-center' && !initialHash) {
                this.showWelcomeMessage();
            }
        } else {
            // Default to hub if no valid hash
            this.instantNavigate('anemone-center');
            this.showWelcomeMessage(); // Show on first load of hub
        }
    }

    // Performs an instant, non-animated navigation. Useful for initial page load from hash.
    instantNavigate(targetId) {
        const oceanWorld = document.getElementById('oceanWorld');
        const coords = this.locations[targetId];
        
        // Temporarily disable transitions
        const originalTransition = oceanWorld.style.transition;
        oceanWorld.style.transition = 'none';

        oceanWorld.style.transform = `translate(${-coords.x}vw, ${-coords.y}vh)`;
        
        // Update active class
        document.querySelectorAll('.ocean-node').forEach(node => node.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        this.updateEnvironment(targetId);
        this.currentLocation = targetId;
        history.replaceState(null, '', `#${targetId}`); // Use replaceState to not add to history on initial load

        // Re-enable transitions after a slight delay
        requestAnimationFrame(() => {
            oceanWorld.style.transition = originalTransition;
            if (this.prefersReducedMotion) {
                oceanWorld.style.transition = 'none'; // Ensure no transition if prefers-reduced-motion
            } else {
                oceanWorld.style.transition = `transform 1.5s var(--water-ease)`;
            }
        });
    }

    // Maps a generic content page hash to an index node ID
    findNearestNodeId(hash) {
        switch (hash) {
            case 'episodes': case 'shark-cove-node': return 'shark-cove-node';
            case 'characters': case 'jellyfield-node': return 'jellyfield-node';
            case 'themes': case 'eac-current-node': return 'eac-current-node';
            case 'podcast': case 'sydney-harbor-node': return 'sydney-harbor-node';
            case 'extras': case 'reef-return-node': return 'reef-return-node';
            default: return 'anemone-center'; // Fallback to hub
        }
    }

    setupAudio() {
        // Placeholder for sound effect. You'll need an actual bloop.mp3 file.
        // For now, let's make it a no-op to avoid console errors if file isn't present.
        this.bloopSound = {
            play: () => { /* console.log('Bloop sound played'); */ },
            currentTime: 0,
            muted: false
        };

        this.isMuted = false;
        const muteToggle = document.getElementById('mute-toggle');
        if (muteToggle) {
            muteToggle.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                muteToggle.textContent = this.isMuted ? '🔇' : '🔊';
                muteToggle.setAttribute('aria-label', this.isMuted ? 'Unmute sound' : 'Mute sound');
                if (this.bloopSound) this.bloopSound.muted = this.isMuted;
            });
            muteToggle.setAttribute('aria-label', 'Mute sound');
        }
    }

    createTentacles() {
        const tentaclesContainer = document.getElementById('tentacles');
        if (!tentaclesContainer) return;

        const tentacleCount = 12;
        for (let i = 0; i < tentacleCount; i++) {
            const tentacle = document.createElement('div');
            tentacle.className = 'tentacle';
            tentacle.style.height = (60 + Math.random() * 40) + 'px';
            tentacle.style.left = '50%';
            tentacle.style.bottom = '0';
            tentacle.style.transform = `translateX(-50%) rotate(${(i * 30) + (Math.random() * 15 - 7.5)}deg)`;
            tentacle.style.animationDelay = (i * 0.3) + 's';
            if (this.prefersReducedMotion) tentacle.style.animation = 'none'; // Disable animation
            tentaclesContainer.appendChild(tentacle);
        }
    }

    navigateTo(targetId) {
        if (!targetId || targetId === this.currentLocation) return;
        
        const oceanWorld = document.getElementById('oceanWorld');
        const currentSectionElement = document.getElementById(this.currentLocation);
        const targetSectionElement = document.getElementById(targetId);
        
        if (!targetSectionElement) {
            console.warn(`Target section not found: ${targetId}`);
            return;
        }

        const coords = this.locations[targetId];
        
        // Play sound
        if (this.bloopSound && !this.bloopSound.muted) {
            this.bloopSound.currentTime = 0; // Rewind to start
            this.bloopSound.play().catch(e => console.log("Audio play prevented:", e));
        }

        // Apply transform to move the whole ocean-world
        oceanWorld.style.transform = `translate(${-coords.x}vw, ${-coords.y}vh)`;
        
        // Update sections (opacity fade)
        if (currentSectionElement) {
            currentSectionElement.classList.remove('active');
        }
        
        // Add screen shake effect (only if not reduced motion)
        if (!this.prefersReducedMotion) {
            document.body.style.animation = 'none'; // Reset to re-trigger
            requestAnimationFrame(() => {
                document.body.style.animation = 'screen-shake 0.5s var(--water-ease)'; // Use water-ease
            });
        }

        // Handle active class after transition
        const transitionEndHandler = () => {
            targetSectionElement.classList.add('active');
            history.pushState(null, '', `#${targetId}`); // Update URL hash for bookmarking/sharing
            oceanWorld.removeEventListener('transitionend', transitionEndHandler);
        };

        if (this.prefersReducedMotion) {
            // For reduced motion, just snap to active state
            targetSectionElement.classList.add('active');
            history.pushState(null, '', `#${targetId}`);
        } else {
            oceanWorld.addEventListener('transitionend', transitionEndHandler, { once: true });
            // Fallback for browsers that don't fire transitionend reliably or for faster transitions
            setTimeout(() => {
                if (!targetSectionElement.classList.contains('active')) { // Check if already handled
                    targetSectionElement.classList.add('active');
                    history.pushState(null, '', `#${targetId}`);
                }
            }, 1000); // Should be > transition duration for opacity fade
        }
        
        // Update environment (background, depth indicator, particles)
        this.updateEnvironment(targetId);
        this.currentLocation = targetId;
    }

    updateEnvironment(locationId) {
        const locationData = this.locations[locationId];
        const depthIndicator = document.getElementById('depthIndicator');
        const body = document.body;
        const causticsLayer = document.querySelector('.caustics-layer');
        
        if (locationData) {
            body.style.background = locationData.bgVar;
            if (depthIndicator) depthIndicator.textContent = locationData.indicator;
            
            // Adjust caustics opacity based on depth
            if (causticsLayer && !this.prefersReducedMotion) causticsLayer.style.opacity = locationData.causticsOpacity;
            else if (causticsLayer && this.prefersReducedMotion) causticsLayer.style.opacity = 0; // Hide caustics if reduced motion

            this.updateParticleIntensity(locationId);
        }
    }

    updateParticleIntensity(locationId) {
        const particles = document.querySelectorAll('.particle, .bubble');
        const intensity = this.locations[locationId]?.particleIntensity || 1; // Default to 1

        if (this.prefersReducedMotion) {
            particles.forEach(p => p.style.display = 'none');
        } else {
            particles.forEach(p => {
                p.style.display = 'block'; // Ensure visible
                p.style.opacity = intensity;
            });
        }

        const fishElements = document.querySelectorAll('.fish');
        fishElements.forEach(fish => {
            if (this.prefersReducedMotion) {
                fish.style.display = 'none';
            } else if (this.locations[locationId]?.depth >= 2) { // Deeper/darker zones
                fish.style.opacity = '0.4';
                fish.style.animationDuration = (25 + Math.random() * 10) + 's'; // Slower swim
                fish.style.display = 'block';
            } else {
                fish.style.opacity = '0.8';
                fish.style.animationDuration = (15 + Math.random() * 10) + 's';
                fish.style.display = 'block';
            }
        });
    }

    startParticleSystem() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer || this.prefersReducedMotion) {
            if (particlesContainer) particlesContainer.style.display = 'none';
            return;
        }

        // Create initial particles and then recycle them
        const numParticles = 30;
        const numBubbles = 15;
        const numFish = 5;

        for (let i = 0; i < numParticles; i++) this.createParticle(particlesContainer);
        for (let i = 0; i < numBubbles; i++) this.createBubble(particlesContainer);
        for (let i = 0; i < numFish; i++) this.createFish(particlesContainer);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 12 + 's';
        particle.style.animationDuration = (8 + Math.random() * 8) + 's';
        
        container.appendChild(particle);
        
        particle.addEventListener('animationend', () => {
            if (particle.parentNode === container) { // Ensure it's still in the container before recycling
                particle.remove();
                this.createParticle(container);
            }
        });
    }

    createBubble(container) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = 8 + Math.random() * 25;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDelay = Math.random() * 8 + 's';
        bubble.style.animationDuration = (6 + Math.random() * 6) + 's';
        
        container.appendChild(bubble);

        bubble.addEventListener('animationend', () => {
            if (bubble.parentNode === container) {
                bubble.remove();
                this.createBubble(container);
            }
        });
    }

    createFish(container) {
        const fish = document.createElement('div');
        fish.className = 'fish';
        fish.style.setProperty('--fish-y-offset', Math.random() * 80 + 10); // Random Y position (10-90vh)
        fish.style.animationDuration = (15 + Math.random() * 10) + 's';
        fish.style.animationDelay = Math.random() * 5 + 's';
        
        const colors = ['var(--sea-green)', 'var(--palatinate-blue)', 'var(--golden-gate-bridge)', 'var(--indigo-dye)'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        fish.style.background = randomColor;
        fish.style.setProperty('border-left-color', randomColor);
        
        container.appendChild(fish);
        
        fish.addEventListener('animationend', () => {
            if (fish.parentNode === container) {
                fish.remove();
                this.createFish(container);
            }
        });
    }

    startAmbientAnimations() {
        const anemone = document.getElementById('mainAnemone');
        if (anemone && !this.prefersReducedMotion) {
            anemone.addEventListener('mouseenter', () => {
                anemone.style.transform = 'scale(1.15)';
                anemone.style.filter = 'brightness(1.3)';
            });
            
            anemone.addEventListener('mouseleave', () => {
                anemone.style.transform = 'scale(1)';
                anemone.style.filter = 'brightness(1)';
            });
        }
        
        if (!this.prefersReducedMotion) {
            setInterval(() => {
                this.createCurrentEffect();
            }, 10000); // Every 10 seconds
        }
    }

    createCurrentEffect() {
        const current = document.createElement('div');
        current.style.position = 'fixed';
        current.style.top = '0';
        current.style.left = '0';
        current.style.width = '100%';
        current.style.height = '100%';
        current.style.background = 'linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent)';
        current.style.pointerEvents = 'none';
        current.style.animation = 'current-flow 3s ease-out forwards';
        current.style.zIndex = '50';
        
        document.body.appendChild(current);
        
        setTimeout(() => {
            current.remove();
        }, 3000);
    }

    addEventListeners() {
        // Navigation Orbs and Back Orbs
        document.querySelectorAll('.nav-orb, .back-orb').forEach(orb => {
            orb.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                this.navigateTo(targetId);
            });
        });

        // Bottom-left logo to return to hub
        const siteLogo = document.getElementById('site-logo');
        if (siteLogo) {
            siteLogo.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('anemone-center');
            });
        }

        // Quick Navigation Toggle
        const quickNavToggle = document.getElementById('quick-nav-toggle');
        const quickNavOverlay = document.getElementById('quick-nav-overlay');
        const quickNavClose = document.getElementById('quick-nav-close');
        
        if (quickNavToggle && quickNavOverlay && quickNavClose) {
            quickNavToggle.addEventListener('click', () => {
                this.toggleQuickNav(true);
            });
            quickNavClose.addEventListener('click', () => {
                this.toggleQuickNav(false);
            });
            // Close if clicking outside the menu
            quickNavOverlay.addEventListener('click', (e) => {
                if (e.target === quickNavOverlay) {
                    this.toggleQuickNav(false);
                }
            });

            // Handle clicks on quick-nav menu items to navigate and close
            quickNavOverlay.querySelectorAll('.quick-nav-menu a').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Check if the link is to index.html and has a hash
                    const url = new URL(e.currentTarget.href);
                    if (url.pathname.endsWith('index.html') || url.pathname === '/') {
                        e.preventDefault(); // Prevent full page reload
                        const targetHash = url.hash.substring(1);
                        const targetNodeId = this.findNearestNodeId(targetHash);
                        this.navigateTo(targetNodeId);
                        this.toggleQuickNav(false); // Close quick-nav after navigation
                    } else {
                        // For external page links, just let them navigate normally
                        this.toggleQuickNav(false);
                    }
                });
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && quickNavOverlay.classList.contains('active')) {
                this.toggleQuickNav(false);
                return;
            }

            // If quick nav is active, only handle Escape, otherwise block arrow keys for ocean navigation
            if (quickNavOverlay && quickNavOverlay.classList.contains('active')) {
                // Let tab key function normally within the overlay
                return;
            }

            const currentNavTargets = this.locations[this.currentLocation]?.navTargets;
            if (!currentNavTargets) return;

            let nextNodeId = null;

            switch(e.key) {
                case 'c':
                case 'Home':
                    e.preventDefault();
                    nextNodeId = 'anemone-center';
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    nextNodeId = currentNavTargets.up;
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    nextNodeId = currentNavTargets.left;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextNodeId = currentNavTargets.right;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    nextNodeId = currentNavTargets.down;
                    break;
            }

            if (nextNodeId && this.locations[nextNodeId]) {
                this.navigateTo(nextNodeId);
            }
        });

        // Mouse wheel "depth" control - linear progression
        document.addEventListener('wheel', (e) => {
            // Define a linear order for mouse wheel scrolling that makes sense
            const linearScrollOrder = [
                'shark-cove-node',
                'jellyfield-node',
                'anemone-center',
                'eac-current-node',
                'sydney-harbor-node',
                'reef-return-node'
            ];
            const linearIndex = linearScrollOrder.indexOf(this.currentLocation);

            if (e.deltaY > 0 && linearIndex < linearScrollOrder.length - 1) { // Scroll down (dive deeper)
                this.navigateTo(linearScrollOrder[linearIndex + 1]);
            } else if (e.deltaY < 0 && linearIndex > 0) { // Scroll up (surface)
                this.navigateTo(linearScrollOrder[linearIndex - 1]);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const hash = window.location.hash.substring(1);
            if (hash && this.locations[hash]) {
                // Ensure the transition is animated if not reduced motion
                const oceanWorld = document.getElementById('oceanWorld');
                oceanWorld.style.transition = `transform ${this.prefersReducedMotion ? '0s' : '1.5s var(--water-ease)'}`;
                this.navigateTo(hash);
            } else {
                // If hash is empty or invalid, go to center
                this.navigateTo('anemone-center');
            }
        });
    }

    // Toggles the quick navigation overlay and manages focus for accessibility
    toggleQuickNav(open) {
        const quickNavOverlay = document.getElementById('quick-nav-overlay');
        const quickNavToggle = document.getElementById('quick-nav-toggle');
        const firstFocusableElement = quickNavOverlay.querySelector('a, button'); // First focusable element inside the menu

        if (open) {
            this.focusedElementBeforeModal = document.activeElement; // Save currently focused element
            quickNavOverlay.classList.add('active');
            quickNavOverlay.setAttribute('aria-modal', 'true');
            quickNavOverlay.setAttribute('role', 'dialog');
            if (firstFocusableElement) {
                firstFocusableElement.focus(); // Move focus into the modal
            }
            this.trapFocus(quickNavOverlay); // Start focus trap
        } else {
            quickNavOverlay.classList.remove('active');
            quickNavOverlay.removeAttribute('aria-modal');
            quickNavOverlay.removeAttribute('role');
            if (this.focusedElementBeforeModal) {
                this.focusedElementBeforeModal.focus(); // Return focus to where it was
            }
            this.untrapFocus(); // Stop focus trap
        }
    }

    // Traps focus within a given element (modal)
    trapFocus(element) {
        const focusableElements = element.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        this.firstFocusableElement = focusableElements[0];
        this.lastFocusableElement = focusableElements[focusableElements.length - 1];

        this.handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === this.firstFocusableElement) {
                        this.lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === this.lastFocusableElement) {
                        this.firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        element.addEventListener('keydown', this.handleTabKey);
    }

    // Removes focus trap
    untrapFocus() {
        const quickNavOverlay = document.getElementById('quick-nav-overlay');
        if (quickNavOverlay && this.handleTabKey) {
            quickNavOverlay.removeEventListener('keydown', this.handleTabKey);
            this.handleTabKey = null; // Clear the handler
        }
    }

    showWelcomeMessage() {
        if (sessionStorage.getItem('welcomeShown')) {
            return;
        }

        setTimeout(() => {
            const welcomeOverlay = document.createElement('div');
            welcomeOverlay.className = 'welcome-overlay';
            welcomeOverlay.innerHTML = `
                <div class="welcome-box">
                    <h3>🌊 Welcome to the Odyssey Beneath the Waves</h3>
                    <p>Embark on a unique exploration of story, psychology, and myth, framed by the depths of the ocean.</p>
                    <p class="small-text">
                        Use these currents to navigate:
                        • Click glowing orbs to explore sections
                        • Keyboard Arrows (↑↓←→) for direct navigation
                        • 'C' or 'Home' key returns to the Anemone Hub
                        • Mouse wheel allows you to 'dive' through key areas
                    </p>
                    <button onclick="this.closest('.welcome-overlay').remove(); sessionStorage.setItem('welcomeShown', 'true');">Begin Journey</button>
                </div>
            `;
            document.body.appendChild(welcomeOverlay);
            // Ensure focus is managed for welcome message
            const beginButton = welcomeOverlay.querySelector('button');
            if (beginButton) {
                beginButton.focus();
            }
        }, 1000);
    }
}

// Global helper for `onclick` attributes in HTML
function navigateTo(locationId) {
    if (window.underwaterWorld) {
        window.underwaterWorld.navigateTo(locationId);
    }
}

// Global helper for opening quick nav
function toggleQuickNav(open) {
    if (window.underwaterWorld) {
        window.underwaterWorld.toggleQuickNav(open);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.underwaterWorld = new UnderwaterWorld();
});