document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Animate Content Panels on Scroll ---
    const contentPanels = document.querySelectorAll('.content-panel');

    const observerOptions = {
        root: null, // observes intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the panel is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: stop observing once it's visible to save resources
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Observe each content panel
    contentPanels.forEach(panel => {
        observer.observe(panel);
    });


    // --- 2. Add Glass Effect to Header on Scroll ---
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Add class after scrolling down 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

});