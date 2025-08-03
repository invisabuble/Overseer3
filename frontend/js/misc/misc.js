export function minimax (element,  defaultHeight="0px") {
    /*
    Grow or shrink an element when clicking on it.
    */

    var config = document.getElementById(element + "C");

    if (config.classList.contains('collapsed')) {
        // Expand
        config.classList.remove('collapsed');

        // Set height from 0 to scrollHeight to animate
        config.style.height = defaultHeight;
        requestAnimationFrame(() => {
        config.style.height = config.scrollHeight + 'px';
        });

        // After transition ends, set height to auto for flexibility
        config.addEventListener('transitionend', function handler() {
        config.style.height = 'auto';
        config.removeEventListener('transitionend', handler);
        });

    } else {
        // Collapse

        // Set fixed height to allow transition
        config.style.height = config.scrollHeight + 'px';
        config.offsetHeight;

        // Animate to default height
        config.style.height = defaultHeight;

        // Add collapsed class
        config.classList.add('collapsed');
    }
}


console.info("Loaded : misc.js");