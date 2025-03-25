document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNavigation = document.querySelector('#primary-navigation');

    if (mobileNavToggle && primaryNavigation) {
        mobileNavToggle.addEventListener('click', function() {
            const visibility = primaryNavigation.getAttribute('data-visible');
            
            if (visibility === "false") {
                primaryNavigation.setAttribute('data-visible', true);
                mobileNavToggle.setAttribute('aria-expanded', true);
            } else {
                primaryNavigation.setAttribute('data-visible', false);
                mobileNavToggle.setAttribute('aria-expanded', false);
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!primaryNavigation.contains(event.target) && !mobileNavToggle.contains(event.target)) {
            primaryNavigation.setAttribute('data-visible', false);
            mobileNavToggle.setAttribute('aria-expanded', false);
        }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && primaryNavigation.getAttribute('data-visible') === 'true') {
            primaryNavigation.setAttribute('data-visible', false);
            mobileNavToggle.setAttribute('aria-expanded', false);
        }
    });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
