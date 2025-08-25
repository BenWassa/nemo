(() => {
    const ocean = document.getElementById('ocean');
    const panels = Array.from(document.querySelectorAll('.panel'));
    const cursor = document.querySelector('.cursor');
    const compass = document.getElementById('nav-compass');
    const compassToggle = document.querySelector('.compass-toggle');

    // Panel coordinates and depth mapping
    const coords = {
        'hub-dropoff': { x: 0, y: 0, depth: 0 },
        'shark-cove': { x: -120, y: -40, depth: 1 },
        'jellyfield': { x: -80, y: 50, depth: 1 },
        'eac-current': { x: 90, y: -30, depth: 1 },
        'sydney-harbor': { x: 60, y: 100, depth: 2 },
        'reef-return': { x: -20, y: 180, depth: 0 }
    };

    // Initialize panel positions
    for (const [id, coord] of Object.entries(coords)) {
        const panel = document.getElementById(id);
        if (panel) {
            panel.style.transform = `translate(${coord.x}vw, ${coord.y}vh)`;
        }
    }

    // Navigation function
    function navigateTo(id) {
        const coord = coords[id] || coords['hub-dropoff'];
        
        // Smooth camera movement with subtle scale for depth feel
        ocean.style.transform = `translate3d(${-coord.x}vw, ${-coord.y}vh, 0) scale(${1 - coord.depth * 0.03})`; // Smaller scale for deeper panels
        
        // Update depth for styling
        document.documentElement.dataset.depth = coord.depth;
        
        // Update URL hash using replaceState to avoid cluttering history
        if (location.hash.slice(1) !== id) {
            history.replaceState({ id: id }, '', '#' + id);
        }

        // Close compass if open
        if (compass.classList.contains('show')) {
            compass.classList.remove('show');
            compassToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Focus management for accessibility
        // Use a short timeout to ensure the panel is visually ready before focusing
        setTimeout(() => {
            const heading = document.querySelector(`#${id} h1, #${id} h2`);
            if (heading) {
                heading.setAttribute('tabindex', '-1');
                heading.focus();
                // Removing tabindex can sometimes be problematic for screen readers on subsequent focus,
                // but for headings, it's often preferred to remove it after focus.
                // heading.removeAttribute('tabindex'); 
            }
        }, 800); // Increased timeout to match longer transition
    }

    // Hash change listener
    window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1);
        if (coords[hash]) {
            navigateTo(hash);
        }
    });

    // Initialize with current hash or default
    const initialHash = location.hash.slice(1) || 'hub-dropoff';
    navigateTo(initialHash);

    // Custom cursor tracking
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let cursorVisible = false;

    // Update mouse position and manage cursor visibility
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cursorVisible) {
            cursor.style.opacity = "0.9";
            cursorVisible = true;
        }
    });

    // Hide cursor if mouse leaves document, show if re-enters
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = "0";
        cursorVisible = false;
    });
    document.addEventListener('mouseenter', () => {
        if (!cursorVisible) { // Only show if it was previously hidden and not just on an element
            cursor.style.opacity = "0.9";
            cursorVisible = true;
        }
    });

    function updateCursor() {
        // Significantly increased interpolation factor for responsiveness
        cursorX += (mouseX - cursorX) * 0.4; 
        cursorY += (mouseY - cursorY) * 0.4; 
        // Use translate3d for GPU acceleration and centering
        cursor.style.transform = `translate3d(${cursorX - 14}px, ${cursorY - 14}px, 0)`; 
        requestAnimationFrame(updateCursor);
    }
    updateCursor();


    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .chip');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Compass functionality
    compassToggle.addEventListener('click', () => {
        const isShowing = compass.classList.toggle('show');
        compassToggle.setAttribute('aria-expanded', isShowing);
        if (isShowing) {
            // Trap focus within the dialog when open
            // Using requestAnimationFrame to ensure dialog is rendered before focusing
            requestAnimationFrame(() => {
                const firstFocusable = compass.querySelector('a, button');
                if (firstFocusable) firstFocusable.focus();
            });
        } else {
            compassToggle.focus(); // Return focus to the toggle button
        }
    });

    // Close compass when clicking outside
    compass.addEventListener('click', (e) => {
        if (e.target === compass) { // Clicked on the dialog backdrop
            compass.classList.remove('show');
            compassToggle.setAttribute('aria-expanded', 'false');
            compassToggle.focus(); // Return focus
        }
    });

    // Close compass on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && compass.classList.contains('show')) {
            compass.classList.remove('show');
            compassToggle.setAttribute('aria-expanded', 'false');
            compassToggle.focus(); // Return focus
        }
    });

    // Smooth scroll prevention for hash links
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const hash = e.target.getAttribute('href').slice(1);
            if (coords[hash]) {
                navigateTo(hash);
            }
        }
    });
    
    // Keyboard navigation (Arrow keys)
    document.addEventListener('keydown', (e) => {
        if (e.key.startsWith('Arrow') && !compass.classList.contains('show')) {
            const currentPanelId = location.hash.slice(1) || 'hub-dropoff';
            const panelIds = Object.keys(coords);
            const currentIndex = panelIds.indexOf(currentPanelId);
            
            let nextIndex = currentIndex;
            // Define a more logical adjacency for arrow keys
            // This is a simple linear cycle; for true 2D navigation, a more complex grid logic would be needed.
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % panelIds.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                nextIndex = (currentIndex - 1 + panelIds.length) % panelIds.length;
            }
            
            if (nextIndex !== currentIndex) {
                navigateTo(panelIds[nextIndex]);
                e.preventDefault();
            }
        }
    });

    // Preload optimization (can be expanded for specific assets)
    const preloadAssets = () => {
        // Example: If you had background images, you'd add them here
        // new Image().src = 'path/to/image.png';
    };

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadAssets);
    } else {
        preloadAssets();
    }
})();