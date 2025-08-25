class UnderwaterWorld {
    constructor() {
        this.currentLocation = 'anemone-center';
        this.locations = {
            'anemone-center': { x: 0, y: 0, indicator: 'Anemone Hub', background: 'radial-gradient(circle at 50% 50%, var(--indigo-dye) 0%, var(--prussian-blue) 70%, #051a2aff 100%)', particleIntensity: 1 },
            'narrative-currents-top': { x: 0, y: -100, indicator: 'Narrative Currents: Episodes', background: 'radial-gradient(circle at 50% 50%, rgba(56, 144, 84, 0.4), rgba(12, 67, 123, 0.7))', particleIntensity: 1.5 },
            'character-depths-left': { x: 100, y: 0, indicator: 'Character Depths: Archetypes', background: 'radial-gradient(circle at 50% 50%, rgba(1, 63, 232, 0.4), rgba(14, 57, 82, 0.7))', particleIntensity: 1.2 },
            'mythic-echoes-right': { x: -100, y: 0, indicator: 'Mythic Echoes: Themes', background: 'radial-gradient(circle at 50% 50%, rgba(12, 67, 123, 0.6), rgba(5, 26, 42, 0.9))', particleIntensity: 0.7 },
            'companion-currents-bottom': { x: 0, y: 100, indicator: 'Companion Currents: Podcast', background: 'radial-gradient(circle at 50% 50%, rgba(242, 71, 2, 0.3), rgba(12, 67, 123, 0.7))', particleIntensity: 0.9 }
        };
        
        this.init();
    }

    init() {
        this.createTentacles();
        this.startParticleSystem();
        this.addEventListeners();
        this.startAmbientAnimations();
        this.showWelcomeMessage();
        // Set initial state
        this.updateEnvironment(this.currentLocation);
        document.getElementById(this.currentLocation).classList.add('active');
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
        
        // Update world position
        oceanWorld.style.transform = `translate(${coords.x}vw, ${coords.y}vh)`;
        
        // Update sections (opacity fade)
        if (currentSectionElement) {
            currentSectionElement.classList.remove('active');
        }
        
        // Add screen shake effect
        document.body.style.animation = 'none'; // Reset to re-trigger
        requestAnimationFrame(() => {
            document.body.style.animation = 'screen-shake 0.5s ease-out';
        });

        // Use transitionend for more robust sync
        oceanWorld.addEventListener('transitionend', () => {
            targetSectionElement.classList.add('active');
            oceanWorld.removeEventListener('transitionend', arguments.callee); // Remove listener after first use
        }, { once: true });
        
        // Fallback for browsers that don't fire transitionend reliably or for faster transitions
        setTimeout(() => {
            targetSectionElement.classList.add('active');
        }, 1000); // Half of ocean-world transition duration (2s/2 = 1s)
        
        // Update environment (background, depth indicator, particles)
        this.updateEnvironment(targetId);
        this.currentLocation = targetId;
    }

    updateEnvironment(locationId) {
        const locationData = this.locations[locationId];
        const depthIndicator = document.getElementById('depthIndicator');
        
        if (locationData) {
            document.body.style.background = locationData.background;
            depthIndicator.textContent = locationData.indicator;
            this.updateParticleIntensity(locationId);
        }
    }

    updateParticleIntensity(locationId) {
        const particles = document.querySelectorAll('.particle, .bubble');
        const intensity = this.locations[locationId]?.particleIntensity || 1; // Default to 1

        // Use CSS custom property to control opacity for particles/bubbles
        // This is a simpler way than iterating all particles, but requires more CSS
        // For now, let's stick to iterating for granular control from JS
        particles.forEach(p => {
            p.style.opacity = intensity;
        });

        // Adjust fish activity based on "depth"
        const fishElements = document.querySelectorAll('.fish');
        fishElements.forEach(fish => {
            if (locationId === 'mythic-echoes-right' || locationId === 'companion-currents-bottom') { // Deeper/darker zones
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
        
        // Periodic current effect
        setInterval(() => {
            this.createCurrentEffect();
        }, 10000); // Every 10 seconds
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
        // Navigation Orbs
        document.querySelectorAll('.nav-orb, .back-orb').forEach(orb => {
            orb.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                this.navigateTo(targetId);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'c': case 'Home': this.navigateTo('anemone-center'); break;
                case 'ArrowUp': this.navigateTo('narrative-currents-top'); break;
                case 'ArrowLeft': this.navigateTo('character-depths-left'); break;
                case 'ArrowRight': this.navigateTo('mythic-echoes-right'); break;
                case 'ArrowDown': this.navigateTo('companion-currents-bottom'); break;
            }
        });
        
        // Mouse wheel depth control
        document.addEventListener('wheel', (e) => {
            const sections = Object.keys(this.locations);
            const currentIndex = sections.indexOf(this.currentLocation);
            
            // Map the logical order to a linear "depth" for scrolling
            const linearOrder = [
                'narrative-currents-top',
                'character-depths-left', // Arbitrary order for scroll
                'anemone-center',
                'mythic-echoes-right',
                'companion-currents-bottom'
            ];
            const linearIndex = linearOrder.indexOf(this.currentLocation);

            if (e.deltaY > 0 && linearIndex < linearOrder.length - 1) { // Scroll down
                this.navigateTo(linearOrder[linearIndex + 1]);
            } else if (e.deltaY < 0 && linearIndex > 0) { // Scroll up
                this.navigateTo(linearOrder[linearIndex - 1]);
            }
        });
    }

    showWelcomeMessage() {
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
                <button onclick="this.closest('.welcome-overlay').remove()">Begin Journey</button>
            </div>
        `;
        document.body.appendChild(welcomeOverlay);
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