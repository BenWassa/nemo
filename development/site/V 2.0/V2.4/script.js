class OceanNavigator {
    constructor() {
        this.sections = document.querySelectorAll('.ocean-section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.body = document.body;
        this.currentSectionId = 'hub-dropoff'; // Start at the beginning

        this.init();
    }

    init() {
        // Set the initial active state
        this.body.setAttribute('data-active-section', this.currentSectionId);
        document.getElementById(this.currentSectionId).classList.add('active');

        // Add click listeners to all navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.dataset.target;
                this.navigateTo(targetId);
            });
        });
    }

    navigateTo(targetId) {
        if (targetId === this.currentSectionId) return; // Do nothing if clicking the current section

        const currentSection = document.getElementById(this.currentSectionId);
        const targetSection = document.getElementById(targetId);

        if (!targetSection) {
            console.error(`Navigation error: Section with id "${targetId}" not found.`);
            return;
        }

        // 1. Fade out the current section
        if (currentSection) {
            currentSection.classList.remove('active');
        }

        // 2. Change the background on the body
        this.body.setAttribute('data-active-section', targetId);

        // 3. After a delay for the background to transition, fade in the new section
        setTimeout(() => {
            targetSection.classList.add('active');
            this.currentSectionId = targetId;
        }, 300); // This delay should be less than the CSS transition time to feel smooth
    }
}

// Initialize the navigator once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OceanNavigator();
});