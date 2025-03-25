// Wrap code in an IIFE or DOMContentLoaded to ensure elements exist
(function() {
    'use strict'; // Enable strict mode

    // --- EmailJS Initialization (Assuming you still need it) ---
    // Make sure to replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
    const emailJsPublicKey = "wzUwieRQHSsp6-89j"; // Use your actual key
    if (emailJsPublicKey && emailJsPublicKey !== "YOUR_PUBLIC_KEY") {
        emailjs.init(emailJsPublicKey);
    } else {
        console.warn("EmailJS Public Key not set. Form submissions via EmailJS might not work.");
    }

    document.addEventListener('DOMContentLoaded', function() {
        // --- Mobile Navigation Toggle ---
        const menuToggle = document.querySelector('.menu-toggle');
        const navList = document.getElementById('main-nav-list');
        const navLinks = document.querySelectorAll('.nav-link'); // Get all nav links

        if (menuToggle && navList) {
            menuToggle.addEventListener('click', function() {
                // Toggle active class on the button and the nav list
                const isActive = navList.classList.toggle('active');
                menuToggle.classList.toggle('active');

                // Update ARIA attribute for accessibility
                menuToggle.setAttribute('aria-expanded', isActive);

                // Prevent body scroll when menu is open
                document.body.classList.toggle('no-scroll', isActive);
            });

            // Close menu when a nav link is clicked
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (navList.classList.contains('active')) {
                        navList.classList.remove('active');
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                        document.body.classList.remove('no-scroll');
                    }
                });
            });

            // Optional: Close menu if clicked outside of it
             document.addEventListener('click', function(event) {
                const isClickInsideNav = navList.contains(event.target);
                const isClickOnToggle = menuToggle.contains(event.target);

                if (!isClickInsideNav && !isClickOnToggle && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('no-scroll');
                }
            });

        } else {
            console.warn("Mobile navigation elements not found.");
        }


        // --- Header Scroll Effect ---
        const header = document.querySelector('header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) { // Add shadow after scrolling 50px
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        // --- Smooth scroll for navigation links (already implemented in HTML via href="#...") ---
        // If you prefer JS-based smooth scrolling:
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                 // Check if it's a valid internal link and not just "#"
                if (href && href.startsWith('#') && href.length > 1) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                         e.preventDefault(); // Prevent default only if target exists

                         // Calculate offset for fixed header
                         const headerOffset = document.querySelector('header')?.offsetHeight || 70;
                         const elementPosition = targetElement.getBoundingClientRect().top;
                         const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                         window.scrollTo({
                             top: offsetPosition,
                             behavior: 'smooth'
                         });

                         // Close mobile menu if open after clicking a link
                         if (navList && navList.classList.contains('active')) {
                             navList.classList.remove('active');
                             menuToggle.classList.remove('active');
                             menuToggle.setAttribute('aria-expanded', 'false');
                             document.body.classList.remove('no-scroll');
                         }
                    }
                } else if (href === '#') {
                     e.preventDefault(); // Prevent jumping for href="#"
                     scrollToTop(); // Scroll to top if it's just "#"
                }
                // Allow default behavior for external links or different pages (like blog.html)
            });
        });


        // --- Formspree Form Submission (for contact form) ---
        // Formspree handles this automatically via the action attribute,
        // but you can add JS for AJAX submission + success/error messages if needed.
        // Example for AJAX (optional):
        /*
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener("submit", async function(event) {
                event.preventDefault();
                const form = event.target;
                const data = new FormData(form);
                try {
                    const response = await fetch(form.action, {
                        method: form.method,
                        body: data,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    if (response.ok) {
                        alert("Thanks for your message! I'll get back to you soon.");
                        form.reset();
                    } else {
                        response.json().then(data => {
                            if (Object.hasOwn(data, 'errors')) {
                                alert(data["errors"].map(error => error["message"]).join(", "));
                            } else {
                                alert("Oops! There was a problem submitting your form");
                            }
                        })
                    }
                } catch (error) {
                    alert("Oops! There was a problem submitting your form");
                }
            });
        }
        */

        // --- Dynamic Year in Footer ---
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // --- Blog Page Subscribe Form (Assuming similar structure as original script) ---
        const subscribeForm = document.getElementById('subscribe-form'); // This ID might be on blog.html
        if (subscribeForm && typeof emailjs !== 'undefined') { // Check if emailjs is loaded
            const emailInput = document.getElementById('subscribe-email');
            const subscribeButton = document.getElementById('subscribe-button');
            const messageElement = document.getElementById('subscribe-message');

            subscribeForm.addEventListener('submit', function(event) {
                event.preventDefault();

                if (!emailInput || !subscribeButton || !messageElement) {
                    console.error("Subscribe form elements not found.");
                    return;
                }

                if (!validateEmail(emailInput.value)) {
                    showMessage('Please enter a valid email address', 'error', messageElement);
                    return;
                }

                subscribeButton.disabled = true;
                const originalButtonText = subscribeButton.textContent; // Use textContent
                subscribeButton.innerHTML = '<span class="spinner" style="display:inline-block; width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>'; // Basic spinner

                const templateParams = {
                    user_email: emailInput.value,
                    from_name: "Blog Subscriber", // Or make dynamic if you have a name field
                    message: `New subscription request from ${emailInput.value}`
                };

                // Replace with your actual Service ID and Template ID from EmailJS
                const serviceID = 'service_2naiq3f'; // Replace if needed
                const templateID = 'template_9rkpuqn'; // Replace if needed

                if (serviceID && templateID) {
                    emailjs.send(serviceID, templateID, templateParams)
                        .then(function(response) {
                            console.log('Subscription SUCCESS!', response.status, response.text);
                            showMessage('Thank you for subscribing!', 'success', messageElement);
                            emailInput.value = ''; // Clear input on success
                        })
                        .catch(function(error) {
                            console.log('Subscription FAILED...', error);
                            showMessage('Oops! Something went wrong. Please try again.', 'error', messageElement);
                        })
                        .finally(function() {
                            subscribeButton.disabled = false;
                            subscribeButton.textContent = originalButtonText; // Restore original text
                        });
                } else {
                    console.error("EmailJS Service ID or Template ID not provided for subscribe form.");
                    showMessage('Configuration error. Cannot send subscription.', 'error', messageElement);
                    subscribeButton.disabled = false;
                    subscribeButton.textContent = originalButtonText;
                }
            });
        }

    }); // End DOMContentLoaded

    // --- Helper Functions ---
    function validateEmail(email) {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    }

    // Modified showMessage to accept the message element as an argument
    function showMessage(message, type, element) {
        if (!element) return;

        element.textContent = message;
        // Ensure base class exists, then add type and remove hidden
        element.className = 'subscribe-message'; // Reset classes
        element.classList.add(type);
        element.classList.remove('hidden'); // Make sure it's visible

        // Hide after 5 seconds
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }

    // Make scrollToTop globally accessible if needed by inline `onclick`
    window.scrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Keyframe for spinner (if not defined in CSS)
    const styleSheet = document.styleSheets[0];
    if (styleSheet) {
        try {
            styleSheet.insertRule(`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `, styleSheet.cssRules.length);
        } catch (e) {
            console.warn("Could not insert spinner keyframe:", e);
        }
    }


})(); // End IIFE


