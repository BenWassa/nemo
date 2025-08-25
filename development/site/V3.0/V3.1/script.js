document.addEventListener('DOMContentLoaded', () => {

    /**
     * Adds a glassmorphism effect to the header when the user scrolls down.
     * This enhances the sense of depth and keeps the navigation clear.
     */
    const handleHeaderScroll = () => {
        const header = document.querySelector('.main-header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    };

    /**
     * Animates content panels into view as they are scrolled to.
     * Uses IntersectionObserver for optimal performance.
     */
    const animateSectionsOnScroll = () => {
        const sections = document.querySelectorAll('.content-panel');
        if (sections.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of the panel is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Stop observing the element once it has become visible
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    };

    // Initialize all interactive features
    handleHeaderScroll();
    animateSectionsOnScroll();

});