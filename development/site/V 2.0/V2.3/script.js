class UnderwaterWorld {
    constructor() {
        this.currentLocation = 'anemone-center';
        // Map of conceptual section IDs to their CSS transform positions and display properties
        this.locations = {
            'anemone-center':    { x: 0, y: 0,   indicator: 'Drop-Off / Anemone Hub', depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.0, causticsOpacity: 0.2 },
            'shark-cove-node':   { x: 0, y: -100, indicator: 'Shark Cove: Trials',     depth: 0,  bgVar: 'var(--depth-0-bg)', particleIntensity: 1.5, causticsOpacity: 0.3 },
            'jellyfield-node':   { x: 100, y: 0,   indicator: 'Jellyfield: Crisis',     depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.2, causticsOpacity: 0.2 },
            'eac-current-node':  { x: -100, y: 0,  indicator: 'EAC Current: Trust',     depth: 1,  bgVar: 'var(--depth-1-bg)', particleIntensity: 1.2, causticsOpacity: 0.2 },
            'sydney-harbor-node':{ x: 0, y: 100,  indicator: 'Sydney Harbor: Ordeal',  depth: 2,  bgVar: 'var(--depth-2-bg)', particleIntensity: 0.7, causticsOpacity: 0.15 },
            'reef-return-node':  { x: 0, y: 200,  indicator: 'Reef Return: Integration', depth: 3,  bgVar: 'var(--depth-3-bg)', particleIntensity: 0.5, causticsOpacity: 0.1 }
        };

        // Check for reduced motion preference
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        
        this.init();
    }

    init() {
        this.setupAudio(); // Setup audio first
        this.createTentacles();
        this.startParticleSystem();
        this.addEventListeners();
        this.startAmbientAnimations();
        
        // Handle initial hash on page load
        const initialHash = window.location.hash.substring(1); // Remove '#'
        const initialTargetId = this.findNearestNodeId(initialHash); // Find the corresponding node

        if (initialTargetId && this.locations[initialTargetId]) {
            this.currentLocation = initialTargetId; // Set current location before navigation
            // Instant move without animation if directly linked or reduced motion is preferred
            const oceanWorld = document.getElementById('oceanWorld');
            const coords = this.locations[this.currentLocation];
            oceanWorld.style.transition = 'none'; // Disable transition temporarily
            oceanWorld.style.transform = `translate(${-coords.x}vw, ${-coords.y}vh)`; // Note the negative sign here
            
            // Re-enable transition after a very short delay for future movements
            setTimeout(() => {
                oceanWorld.style.transition = `transform ${this.prefersReducedMotion ? '0s' : '1.5s var(--water-ease)'}`;
            }, 50);

            this.updateEnvironment(this.currentLocation);
            document.getElementById(this.currentLocation).classList.add('active');
            
            // Show welcome message only if it's the hub on first load AND not a direct deep link
            if (this.currentLocation === 'anemone-center' && !initialHash) {
                this.showWelcomeMessage();
            }
        } else {
            // Default to hub if no valid hash
            this.updateEnvironment(this.currentLocation);
            document.getElementById(this.currentLocation).classList.add('active');
            this.showWelcomeMessage(); // Show on first load of hub
        }
    }

    findNearestNodeId(hash) {
        // Simple mapping from conceptual links to node IDs
        switch (hash) {
            case 'narrative-currents-top': return 'shark-cove-node'; // Maps to the first Act
            case 'character-depths-left': return 'jellyfield-node'; // Or perhaps another node related to characters
            case 'mythic-echoes-right': return 'eac-current-node'; // Maps to a theme node
            case 'companion-currents-bottom': return 'sydney-harbor-node'; // Maps to a podcast-related node
            case 'episodes': return 'shark-cove-node';
            case 'characters': return 'jellyfield-node';
            case 'themes': return 'eac-current-node';
            case 'podcast': return 'sydney-harbor-node';
            case 'extras': return 'reef-return-node'; // Extras is a good place for a deeper dive
            default: return 'anemone-center'; // Fallback to hub
        }
    }

    setupAudio() {
        this.bloopSound = new Audio('path/to/bloop.mp3'); // Placeholder for sound effect
        this.bloopSound.volume = 0.3;

        this.isMuted = false; // Default state
        const muteToggle = document.getElementById('mute-toggle');
        if (muteToggle) {
            muteToggle.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                muteToggle.textContent = this.isMuted ? '🔇' : '🔊';
                // Mute/unmute all sounds
                if (this.bloopSound) this.bloopSound.muted = this.isMuted;
                // Add more audio elements here if you have background music etc.
            });
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
        if (this.bloopSound && !this.isMuted) {
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
                document.body.style.animation = 'screen-shake 0.5s ease-out';
            });
        }

        // Handle active class after transition
        const transitionEndHandler = () => {
            targetSectionElement.classList.add('active');
            history.pushState(null, '', `#${targetId}`); // Update URL hash
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
            }, 1000); // Half of ocean-world transition duration (1.5s/2 = 0.75s, use 1s for safety)
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
            if (causticsLayer) causticsLayer.style.opacity = locationData.causticsOpacity;

            this.updateParticleIntensity(locationId);
        }
    }

    updateParticleIntensity(locationId) {
        const particles = document.querySelectorAll('.particle, .bubble');
        const intensity = this.locations[locationId]?.particleIntensity || 1; // Default to 1

        particles.forEach(p => {
            p.style.opacity = intensity;
        });

        // Adjust fish activity based on "depth"
        const fishElements = document.querySelectorAll('.fish');
        fishElements.forEach(fish => {
            if (this.locations[locationId]?.depth >= 2) { // Deeper/darker zones
                fish.style.opacity = '0.4';
                fish.style.animationDuration = (25 + Math.random() * 10) + 's'; // Slower swim
            } else {
                fish.style.opacity = '0.8';
                fish.style.animationDuration = (15 + Math.random() * 10) + 's';
            }
        });
    }

    startParticleSystem() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Skip particles if reduced motion is preferred
        if (this.prefersReducedMotion) {
            particlesContainer.style.display = 'none';
            return;
        }

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            this.createParticle(particlesContainer);
        }
        
        // Create bubbles
        for (let i = 0; i < 15; i++) {
            this.createBubble(particlesContainer);
        }
        
        // Create fish
        for (let i = 0; i < 5; i++) {
            this.createFish(particlesContainer);
        }
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
        
        // Recycle particles
        particle.addEventListener('animationend', () => {
            if (particle.parentNode) {
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

        // Recycle bubbles
        bubble.addEventListener('animationend', () => {
            if (bubble.parentNode) {
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
        
        // Random colors from palette
        const colors = ['var(--sea-green)', 'var(--palatinate-blue)', 'var(--golden-gate-bridge)', 'var(--indigo-dye)'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        fish.style.background = randomColor;
        fish.style.setProperty('border-left-color', randomColor); // Tail color
        
        container.appendChild(fish);
        
        // Recycle fish
        fish.addEventListener('animationend', () => {
            if (fish.parentNode) {
                fish.remove();
                this.createFish(container);
            }
        });
    }

    startAmbientAnimations() {
        // Anemone interaction
        const anemone = document.getElementById('mainAnemone');
        if (anemone) {
            anemone.addEventListener('mouseenter', () => {
                anemone.style.transform = 'scale(1.15)';
                anemone.style.filter = 'brightness(1.3)';
            });
            
            anemone.addEventListener('mouseleave', () => {
                anemone.style.transform = 'scale(1)';
                anemone.style.filter = 'brightness(1)';
            });
        }
        
        // Periodic current effect (only if not reduced motion)
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
        current.style.zIndex = '50'; // Above particles, below text content
        
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
                e.preventDefault(); // Prevent default link behavior
                this.navigateTo('anemone-center');
            });
        }

        // Quick Navigation Toggle
        const quickNavToggle = document.getElementById('quick-nav-toggle');
        const quickNavOverlay = document.getElementById('quick-nav-overlay');
        const quickNavClose = document.getElementById('quick-nav-close');
        
        if (quickNavToggle && quickNavOverlay && quickNavClose) {
            quickNavToggle.addEventListener('click', () => {
                quickNavOverlay.classList.add('active');
            });
            quickNavClose.addEventListener('click', () => {
                quickNavOverlay.classList.remove('active');
            });
            // Close if clicking outside the menu, but not on the toggle itself
            quickNavOverlay.addEventListener('click', (e) => {
                if (e.target === quickNavOverlay) {
                    quickNavOverlay.classList.remove('active');
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Only respond to keydown if quick nav is not active
            if (quickNavOverlay && quickNavOverlay.classList.contains('active')) {
                return;
            }

            switch(e.key) {
                case 'c':
                case 'Home':
                    e.preventDefault(); // Prevent default browser behavior for Home key
                    this.navigateTo('anemone-center');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.currentLocation === 'anemone-center') this.navigateTo('shark-cove-node');
                    else if (this.currentLocation === 'sydney-harbor-node') this.navigateTo('anemone-center');
                    else if (this.currentLocation === 'reef-return-node') this.navigateTo('sydney-harbor-node');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.currentLocation === 'anemone-center') this.navigateTo('jellyfield-node');
                    else if (this.currentLocation === 'eac-current-node') this.navigateTo('anemone-center');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.currentLocation === 'anemone-center') this.navigateTo('eac-current-node');
                    else if (this.currentLocation === 'jellyfield-node') this.navigateTo('anemone-center');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.currentLocation === 'anemone-center') this.navigateTo('sydney-harbor-node');
                    else if (this.currentLocation === 'shark-cove-node') this.navigateTo('anemone-center');
                    else if (this.currentLocation === 'sydney-harbor-node') this.navigateTo('reef-return-node');
                    break;
            }
        });
        
        // Mouse wheel "depth" control - linear progression
        document.addEventListener('wheel', (e) => {
            // Map the nodes to a linear depth order for scrolling
            const linearScrollOrder = [
                'shark-cove-node',
                'jellyfield-node', // Left, for example, can be 'between' shark cove and hub in linear sense
                'eac-current-node', // Right
                'anemone-center',
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
    }

    showWelcomeMessage() {
        // Only show welcome message if it's the hub and hasn't been shown before in this session
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
        }, 1000); // Short delay to let initial page render
    }
}

// Global helper for `onclick` attributes in HTML, if preferred over event listeners
function navigateTo(locationId) {
    if (window.underwaterWorld) {
        window.underwaterWorld.navigateTo(locationId);
    }
}

// Initialize the underwater world when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.underwaterWorld = new UnderwaterWorld();
});