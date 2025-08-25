document.addEventListener('DOMContentLoaded', () => {
    const oceanContainer = document.getElementById('ocean-container');
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.ocean-section');

    // Define target positions for the oceanContainer to show each section
    // These correspond to the negative top/left of the target section's position
    // Values are in viewport units (vw, vh)
    const sectionMap = {
        'anemone-center': { x: -100, y: -100 }, // Initial center view
        'character-depths-left': { x: 0, y: -100 },
        'mythic-echoes-right': { x: -200, y: -100 },
        'narrative-currents-top': { x: -100, y: 0 },
        'companion-currents-bottom': { x: -100, y: -200 }
    };

    let currentSectionId = 'anemone-center';

    // Function to update the active section's opacity
    function updateActiveSection(targetId) {
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    // Set the initial active state
    updateActiveSection(currentSectionId);

    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetId = event.target.dataset.target;

            if (targetId && sectionMap[targetId]) {
                const targetPosition = sectionMap[targetId];
                oceanContainer.style.transform = `translate(${targetPosition.x}vw, ${targetPosition.y}vh)`;
                currentSectionId = targetId;

                // Add a small delay for opacity change to sync with transform,
                // or listen to 'transitionend' on oceanContainer for more robust sync.
                // Using a timeout for simplicity and browser compatibility.
                setTimeout(() => {
                     updateActiveSection(currentSectionId);
                }, 700); // This should be roughly half the CSS transition duration (1.5s / 2 = 0.75s)
            }
        });
    });
});