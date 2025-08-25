class OceanNavigator {
    constructor() {
        this.oceanWorld = document.getElementById('oceanWorld');
        this.panels = document.querySelectorAll('.ocean-node'); // Select .ocean-node now
        this.compassToggle = document.getElementById('quick-nav-toggle'); // Use ID for consistency
        this.navCompass = document.getElementById('nav-compass'); // Native dialog element
        this.siteLogo = document.getElementById('site-logo'); // Use ID for consistency
        this.muteToggle = document.getElementById('mute-toggle'); // Mute toggle
        this.cursor = document.querySelector('.cursor');
        this.depthIndicator = document.getElementById('depthIndicator'); // Depth indicator

        this.currentLocation = 'anemone-center';
        this.locations = {
            'anemone-center':    { x: 0, y: 0,   indicator: 'Drop-Off / Anemone Hub',       depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.0, causticsOpacity: 0.2, navTargets: { up: 'shark-cove-node', left: 'jellyfield-node', right: 'eac-current-node', down: 'sydney-harbor-node' } },
            'shark-cove-node':   { x: 0, y: -100, indicator: 'Shark Cove: Road of Trials',   depth: 0,  bgVar: 'var(--depth-0-bg)', particleIntensity: 1.5, causticsOpacity: 0.3, navTargets: { down: 'anemone-center' } },
            'jellyfield-node':   { x: 100, y: 0,   indicator: 'Jellyfield: Deepening Crisis', depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.2, causticsOpacity: 0.2, navTargets: { right: 'anemone-center' } }, // FIXED: x was -100 in previous wrong map, should be +100 to move container right for left panel
            'eac-current-node':  { x: -100, y: 0,  indicator: 'EAC Current: Trust & Flow',    depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.2, causticsOpacity: 0.2, navTargets: { left: 'anemone-center' } }, // FIXED: x was +100 in previous wrong map, should be -100 to move container left for right panel
            'sydney-harbor-node':{ x: 0, y: 100,  indicator: 'Sydney Harbor: Ordeal',      depth: 2,  bgVar: 'var(--depth-2-bg)', particleIntensity: 0.7, causticsOpacity: 0.15, navTargets: { up: 'anemone-center', down: 'reef-return-node' } },
            'reef-return-node':  { x: 0, y: 200,  indicator: 'Reef Return: Integration',     depth: 0,  bgVar: 'var(--depth-0-bg)', particleIntensity: 0.5, causticsOpacity: 0.1, navTargets: { up: 'sydney-harbor-node' } } // Depth 0 for return to surface
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

            // Only show welcome message if it's the hub on first load AND no specific hash was provided
            if (this.currentLocation === 'anemone-center' && !initialHash) {
                this.showWelcomeMessage();
            }
        } else {
            // Default to hub if no valid hash
            this.instantNavigate('anemone-center');
            this.showWelcomeMessage(); // Show on first load of hub
        }

        // Ensure the quick-nav overlay is hidden and inaccessible initially
        if (this.navCompass) {
            this.navCompass.classList.remove('show'); // For custom transition
            this.navCompass.setAttribute('aria-hidden', 'true');
            this.navCompass.setAttribute('tabindex', '-1');
        }
    }

    // Performs an instant, non-animated navigation. Useful for initial page load from hash.
    instantNavigate(targetId) {
        const coords = this.locations[targetId];
        
        // Temporarily disable transitions
        this.oceanWorld.style.transition = 'none';

        // Translate the ocean-world container. Note the negative sign for correct movement.
        this.oceanWorld.style.transform = `translate(${-coords.x}vw, ${-coords.y}vh)`;
        
        // Update active class for the visible section
        this.panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        this.updateEnvironment(targetId); // Update background, indicator, particles
        this.currentLocation = targetId;
        window.history.replaceState(null, '', `#${targetId}`); // Use replaceState to not add to history on initial load

        // Re-enable transitions after a slight delay for subsequent animated movements
        requestAnimationFrame(() => {
            if (this.prefersReducedMotion) {
                this.oceanWorld.style.transition = 'none'; // No transition if reduced motion
            } else {
                this.oceanWorld.style.transition = `transform 1.5s var(--water-ease)`;
            }
        });
    }

    // Maps a generic content page hash (e.g., 'episodes') to an index node ID
    // This allows header navigation links from content pages to point to the correct interactive section.
    findNearestNodeId(hash) {
        // Direct mapping for nodes
        if (this.locations[hash]) return hash;

        // Map content page names to a logical index node
        switch (hash) {
            case 'episodes':   return 'shark-cove-node';
            case 'characters': return 'jellyfield-node';
            case 'themes':     return 'eac-current-node';
            case 'podcast':    return 'sydney-harbor-node';
            case 'extras':     return 'reef-return-node';
            default:           return 'anemone-center'; // Fallback to hub
        }
    }

    setupAudio() {
        try {
            this.bloopSound = new Audio('assets/bloop.mp3'); // Assuming 'assets' folder for sounds
            this.bloopSound.volume = 0.3;
            this.bloopSound.preload = 'auto'; // Preload audio
        } catch (error) {
            console.warn("Failed to load bloop.mp3, sound effects disabled:", error);
            this.bloopSound = null;
        }

        this.isMuted = false; // Initial state: not muted
        if (this.muteToggle) {
            this.muteToggle.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                this.muteToggle.textContent = this.isMuted ? '🔇' : '🔊';
                this.muteToggle.setAttribute('aria-label', this.isMuted ? 'Unmute sound' : 'Mute sound');
                if (this.bloopSound) this.bloopSound.muted = this.isMuted;
            });
            this.muteToggle.setAttribute('aria-label', 'Mute sound');
            this.muteToggle.setAttribute('tabindex', '0'); // Ensure it's tabbable
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
        if (!this.panelMap.has(targetId) || targetId === this.currentLocation) { // Changed this to panelMap.has
            return;
        }

        const targetSectionElement = document.getElementById(targetId);
        if (!targetSectionElement) {
            console.warn(`Attempted to navigate to unknown targetId: ${targetId}`);
            return;
        }

        const currentSectionElement = document.getElementById(this.currentLocation);
        const coords = this.locations[targetId];
        
        // Play sound if available and not muted
        if (this.bloopSound && !this.bloopSound.muted) {
            this.bloopSound.currentTime = 0; // Rewind to start for quick successive clicks
            this.bloopSound.play().catch(e => console.log("Audio play prevented:", e));
        }

        // Apply transform to move the whole ocean-world
        this.oceanWorld.style.transform = `translate(${-coords.x}vw, ${-coords.y}vh)`;
        
        // Update active class for the visible section (fade effect handled by CSS opacity transition)
        if (currentSectionElement) {
            currentSectionElement.classList.remove('active');
        }
        
        // Add screen shake effect (only if not reduced motion)
        if (!this.prefersReducedMotion) {
            document.body.style.animation = 'none'; // Reset to re-trigger
            requestAnimationFrame(() => {
                document.body.style.animation = 'screen-shake 0.5s var(--water-ease)';
            });
        }

        // Handle active class after transition completes
        const transitionEndHandler = () => {
            targetSectionElement.classList.add('active');
            window.history.pushState(null, '', `#${targetId}`); // Update URL hash for bookmarking/sharing
            this.oceanWorld.removeEventListener('transitionend', transitionEndHandler); // Remove listener after use
        };

        if (this.prefersReducedMotion) {
            // For reduced motion, just snap to active state and update hash immediately
            targetSectionElement.classList.add('active');
            window.history.pushState(null, '', `#${targetId}`);
        } else {
            // Add listener for smooth transition completion
            this.oceanWorld.addEventListener('transitionend', transitionEndHandler, { once: true });
            // Fallback: If 'transitionend' doesn't fire (e.g., element removed/browser bug), ensure active state is set
            setTimeout(() => {
                if (!targetSectionElement.classList.contains('active')) { // Only if not already handled by transitionEndHandler
                    targetSectionElement.classList.add('active');
                    window.history.pushState(null, '', `#${targetId}`);
                }
            }, 1000); // Slightly less than CSS transition duration (1.5s is CSS, so 1s here)
        }
        
        this.updateEnvironment(targetId); // Update background, indicator, particles
        this.currentLocation = targetId;
    }

    updateEnvironment(locationId) {
        const locationData = this.locations[locationId];
        const body = document.body;
        const causticsLayer = document.querySelector('.caustics-layer');
        
        if (locationData) {
            if (this.depthIndicator) this.depthIndicator.textContent = locationData.indicator; // Update depth indicator

            body.style.background = locationData.bgVar; // Update body background for depth effect
            
            // Adjust caustics opacity based on depth and reduced motion preference
            if (causticsLayer) {
                causticsLayer.style.opacity = this.prefersReducedMotion ? 0 : locationData.causticsOpacity;
            }

            this.updateParticleIntensity(locationId);
        }
    }

    updateParticleIntensity(locationId) {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return; // Ensure container exists

        const particles = particlesContainer.querySelectorAll('.particle, .bubble');
        const intensity = this.locations[locationId]?.particleIntensity || 1; // Default to 1

        if (this.prefersReducedMotion) {
            particlesContainer.style.display = 'none'; // Hide all particles
        } else {
            particlesContainer.style.display = 'block'; // Ensure container is visible
            particles.forEach(p => {
                p.style.opacity = intensity; // Apply intensity dynamically
                p.style.display = 'block'; // Ensure individual particles are visible
            });
        }

        const fishElements = particlesContainer.querySelectorAll('.fish');
        fishElements.forEach(fish => {
            if (this.prefersReducedMotion) {
                fish.style.display = 'none';
            } else if (this.locations[locationId]?.depth >= 2) { // Deeper/darker zones
                fish.style.opacity = '0.4'; // Less visible
                fish.style.animationDuration = (25 + Math.random() * 10) + 's'; // Slower swim
                fish.style.display = 'block';
            } else {
                fish.style.opacity = '0.8'; // More visible
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

        // Initialize and recycle particles
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
        
        // Use a single animationend listener for recycling
        particle.addEventListener('animationend', () => {
            if (particle.parentNode === container) {
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
        
        // Remove current effect after animation to clean up DOM
        current.addEventListener('animationend', () => {
            if (current.parentNode) {
                current.remove();
            }
        });
    }

    addEventListeners() {
        // Orb and Back Orb clicks
        document.querySelectorAll('.nav-orb, .back-orb').forEach(orb => {
            orb.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                if (targetId) this.navigateTo(targetId);
            });
        });

        // Bottom-left logo to return to hub
        if (this.siteLogo) {
            this.siteLogo.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                this.navigateTo('anemone-center');
            });
            this.siteLogo.setAttribute('tabindex', '0'); // Make it tabbable
        }

        // Quick Navigation Toggle Button
        const quickNavClose = this.navCompass.querySelector('.quick-nav-close');
        
        if (this.compassToggle && this.navCompass && quickNavClose) {
            this.compassToggle.addEventListener('click', () => {
                this.toggleQuickNav(true);
            });
            quickNavClose.addEventListener('click', () => {
                this.toggleQuickNav(false);
            });
            // Close if clicking outside the menu, but only on the dialog element itself
            this.navCompass.addEventListener('click', (e) => {
                if (e.target === this.navCompass) {
                    this.toggleQuickNav(false);
                }
            });

            // Handle clicks on quick-nav menu items to navigate and close
            this.navCompass.querySelectorAll('.quick-nav-menu a').forEach(link => {
                link.addEventListener('click', (e) => {
                    const url = new URL(e.currentTarget.href);
                    if (url.origin === window.location.origin && (url.pathname === '/index.html' || url.pathname === '/' || url.pathname === '')) {
                        // This is an internal link to the index.html or root with a hash
                        e.preventDefault(); // Prevent full page reload
                        const targetHash = url.hash.substring(1);
                        const targetNodeId = this.findNearestNodeId(targetHash);
                        this.navigateTo(targetNodeId);
                        this.toggleQuickNav(false); // Close quick-nav after navigation
                    } else {
                        // This is an external page link (e.g., to episodes.html). Let default behavior occur.
                        // The default behavior will trigger a full page load, which handles closing the nav.
                    }
                });
            });
        }
        
        // Keyboard navigation (main ocean world)
        document.addEventListener('keydown', (e) => {
            // If quick nav is active, only handle Escape, otherwise block arrow keys for ocean navigation
            if (this.navCompass.open) { // Check dialog.open property
                if (e.key === 'Escape') {
                    this.toggleQuickNav(false);
                }
                return; // Block other keydown events when overlay is active
            }

            const currentNavTargets = this.locations[this.currentLocation]?.navTargets;
            if (!currentNavTargets) return; // No navigation targets from current node

            let nextNodeId = null;

            switch(e.key) {
                case 'c':
                case 'Home':
                    e.preventDefault(); // Prevent default browser behavior for Home key
                    nextNodeId = 'anemone-center';
                    break;
                case 'ArrowUp':
                    e.preventDefault(); // Prevent page scroll
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

            if (nextNodeId && this.locations[nextNodeId]) { // Check if the target node actually exists
                this.navigateTo(nextNodeId);
            }
        });

        // Mouse wheel "depth" control - linear progression
        document.addEventListener('wheel', (e) => {
            // Prevent scrolling if quick nav is open
            if (this.navCompass.open) {
                e.preventDefault();
                return;
            }

            // Define a linear order for mouse wheel scrolling that makes sense
            const linearScrollOrder = [
                'shark-cove-node',
                'jellyfield-node', // Arbitrary placement in linear order
                'anemone-center',
                'eac-current-node', // Arbitrary placement in linear order
                'sydney-harbor-node',
                'reef-return-node'
            ];
            const linearIndex = linearScrollOrder.indexOf(this.currentLocation);

            if (e.deltaY > 0 && linearIndex < linearScrollOrder.length - 1) { // Scroll down (dive deeper)
                this.navigateTo(linearScrollOrder[linearIndex + 1]);
            } else if (e.deltaY < 0 && linearIndex > 0) { // Scroll up (surface)
                this.navigateTo(linearScrollOrder[linearIndex - 1]);
            }
        }, { passive: false }); // Use passive: false to allow e.preventDefault() for mouse wheel

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1);
            if (hash && this.locations[hash]) {
                // Ensure the transition is animated if not reduced motion (or immediate if reduced motion)
                this.oceanWorld.style.transition = `transform ${this.prefersReducedMotion ? '0s' : '1.5s var(--water-ease)'}`;
                this.navigateTo(hash);
            } else {
                // If hash is empty or invalid, go to center
                this.navigateTo('anemone-center');
            }
        });

        // Custom cursor interactions
        if (this.cursor) {
            document.addEventListener('mousemove', (e) => {
                this.cursor.style.transform = `translate3d(${e.clientX - 14}px, ${e.clientY - 14}px, 0)`;
                this.cursor.style.opacity = 1; // Show cursor on mousemove
            });
            document.addEventListener('mouseleave', () => {
                this.cursor.style.opacity = 0; // Hide cursor when mouse leaves window
            });

            document.querySelectorAll('a, button, .chip, .nav-orb, .back-orb').forEach(el => {
                el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
            });
        }
    }

    // Toggles the quick navigation overlay and manages focus for accessibility
    toggleQuickNav(open) {
        const quickNavClose = this.navCompass.querySelector('.quick-nav-close');
        const focusableElements = this.navCompass.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        const firstFocusableElement = focusableElements[0];
        
        if (open) {
            this.focusedElementBeforeModal = document.activeElement; // Save currently focused element
            this.navCompass.showModal(); // Use native dialog method
            this.navCompass.classList.add('show'); // For custom transition
            this.compassToggle.setAttribute('aria-expanded', 'true');
            this.navCompass.setAttribute('aria-hidden', 'false');
            this.navCompass.setAttribute('tabindex', '0'); // Make overlay tabbable

            if (firstFocusableElement) {
                firstFocusableElement.focus(); // Move focus into the modal
            } else {
                quickNavClose.focus(); // Fallback if no other focusable elements
            }
            this.trapFocus(this.navCompass); // Start focus trap
        } else {
            this.navCompass.close(); // Use native dialog method
            this.navCompass.classList.remove('show'); // For custom transition
            this.compassToggle.setAttribute('aria-expanded', 'false');
            this.navCompass.setAttribute('aria-hidden', 'true');
            this.navCompass.setAttribute('tabindex', '-1'); // Make overlay untabbable
            
            if (this.focusedElementBeforeModal && document.body.contains(this.focusedElementBeforeModal)) {
                this.focusedElementBeforeModal.focus(); // Return focus to where it was
            } else {
                this.compassToggle.focus(); // Fallback to toggle button
            }
            this.untrapFocus(); // Stop focus trap
        }
    }

    // Traps focus within a given element (modal)
    trapFocus(element) {
        const focusableElements = Array.from(element.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'));
        this.firstFocusableElement = focusableElements[0];
        this.lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) return; // No focusable elements to trap

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
        if (this.navCompass && this.handleTabKey) {
            this.navCompass.removeEventListener('keydown', this.handleTabKey);
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
                    <button id="beginJourneyButton">Begin Journey</button>
                </div>
            `;
            document.body.appendChild(welcomeOverlay);

            const beginButton = document.getElementById('beginJourneyButton');
            if (beginButton) {
                beginButton.focus(); // Ensure the button is focused for accessibility
                beginButton.addEventListener('click', () => {
                    welcomeOverlay.remove();
                    sessionStorage.setItem('welcomeShown', 'true');
                    // Restore focus to original element if it exists and is still in DOM
                    if (this.focusedElementBeforeModal && document.body.contains(this.focusedElementBeforeModal)) {
                        this.focusedElementBeforeModal.focus();
                    } else {
                        // Fallback: focus a relevant element on the page, e.g., site logo or quick-nav toggle
                        this.compassToggle.focus();
                    }
                });
            }
        }, 1000); // Short delay to let initial page render
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.oceanNavigator = new OceanNavigator();
});