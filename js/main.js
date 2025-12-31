console.log("Vihaan's Portfolio Loaded");

// Mobile Navigation Toggle
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const icon = mobileNavToggle.querySelector('span');
        icon.textContent = navLinks.classList.contains('open') ? 'close' : 'menu';
    });
}

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            mobileNavToggle.querySelector('span').textContent = 'menu';
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Interactive Cards - Manual Toggle for Mobile/Touch
document.querySelectorAll('.interactive-card').forEach(card => {
    let lastEventTime = 0;

    const handleToggle = (e) => {
        const now = Date.now();
        if (now - lastEventTime < 300) return; // Ignore double triggers
        lastEventTime = now;

        // Only apply toggle logic on mobile or if hover is not supported
        const isMobile = window.innerWidth <= 768 ||
            window.matchMedia("(pointer: coarse)").matches ||
            /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            const wasActive = card.classList.contains('active');

            // Close other cards
            document.querySelectorAll('.interactive-card').forEach(c => {
                c.classList.remove('active');
            });

            // Toggle current card
            if (!wasActive) {
                card.classList.add('active');
            }

            // For iOS specifically, stop propagation
            if (e.type === 'touchstart') {
                // Let the transition happen
            }
        }
    };

    card.addEventListener('click', handleToggle);
    card.addEventListener('touchstart', handleToggle, { passive: true });
});
