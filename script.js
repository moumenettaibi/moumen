// Wrap code in an IIFE to ensure elements exist and avoid global scope pollution
(function() {
    'use strict'; // Enable strict mode

    // --- EmailJS Initialization ---
    const emailJsPublicKey = "wzUwieRQHSsp6-89j"; // Your actual EmailJS public key
    if (emailJsPublicKey && emailJsPublicKey !== "YOUR_PUBLIC_KEY") {
        emailjs.init(emailJsPublicKey);
    } else {
        console.warn("EmailJS Public Key not set. Form submissions via EmailJS might not work.");
    }

    document.addEventListener('DOMContentLoaded', function() {
        // --- Mobile Navigation Toggle ---
        const menuToggle = document.querySelector('.menu-toggle');
        const navList = document.getElementById('main-nav-list');
        const navLinks = document.querySelectorAll('.nav-link');

        if (menuToggle && navList) {
            menuToggle.addEventListener('click', function() {
                const isActive = navList.classList.toggle('active');
                menuToggle.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', isActive);
                document.body.classList.toggle('no-scroll', isActive);
            });

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
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        // --- Smooth Scroll for Navigation Links ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = document.querySelector('header')?.offsetHeight || 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        if (navList && navList.classList.contains('active')) {
                            navList.classList.remove('active');
                            menuToggle.classList.remove('active');
                            menuToggle.setAttribute('aria-expanded', 'false');
                            document.body.classList.remove('no-scroll');
                        }
                    }
                } else if (href === '#') {
                    e.preventDefault();
                    scrollToTop();
                }
            });
        });

        // --- Contact Form Submission with Formspree ---
        const contactForm = document.getElementById('contact-form');
        const contactMessage = document.getElementById('contact-message');
        if (contactForm && contactMessage) {
            contactForm.addEventListener("submit", async function(event) {
                event.preventDefault();
                const form = event.target;
                const data = new FormData(form);
                const submitButton = form.querySelector('button[type="submit"]');

                try {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Sending...';

                    const response = await fetch(form.action, {
                        method: form.method,
                        body: data,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        form.reset(); // Clear the form fields
                        showMessage('Thanks for your message! I\'ll get back to you soon.', 'success', contactMessage);
                    } else {
                        const errorData = await response.json();
                        if (errorData.errors) {
                            showMessage(errorData.errors.map(error => error.message).join(", "), 'error', contactMessage);
                        } else {
                            showMessage("Oops! There was a problem submitting your form", 'error', contactMessage);
                        }
                    }
                } catch (error) {
                    console.error("Form submission error:", error);
                    showMessage("Oops! There was a problem submitting your form", 'error', contactMessage);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Message';
                }
            });
        }

        // --- Dynamic Year in Footer ---
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // --- Blog Page Subscribe Form ---
        const subscribeForm = document.getElementById('subscribe-form');
        if (subscribeForm && typeof emailjs !== 'undefined') {
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
                const originalButtonText = subscribeButton.textContent;
                subscribeButton.innerHTML = '<span class="spinner" style="display:inline-block; width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>';

                const templateParams = {
                    user_email: emailInput.value,
                    from_name: "Blog Subscriber",
                    message: `New subscription request from ${emailInput.value}`
                };

                const serviceID = 'service_2naiq3f';
                const templateID = 'template_9rkpuqn';

                if (serviceID && templateID) {
                    emailjs.send(serviceID, templateID, templateParams)
                        .then(function(response) {
                            console.log('Subscription SUCCESS!', response.status, response.text);
                            showMessage('Thank you for subscribing!', 'success', messageElement);
                            emailInput.value = '';
                        })
                        .catch(function(error) {
                            console.log('Subscription FAILED...', error);
                            showMessage('Oops! Something went wrong. Please try again.', 'error', messageElement);
                        })
                        .finally(function() {
                            subscribeButton.disabled = false;
                            subscribeButton.textContent = originalButtonText;
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

    function showMessage(message, type, element) {
        if (!element) return;

        element.textContent = message;
        element.className = 'contact-message'; // Reset classes
        element.classList.add(type);
        element.classList.remove('hidden');

        setTimeout(() => {
            element.classList.add('hidden');
        }, 4000); // Hide after 4 seconds
    }

    window.scrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

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