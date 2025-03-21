// Initialize EmailJS
(function() {
    emailjs.init("wzUwieRQHSsp6-89j");
})();

document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.cursor');
    const subscribeForm = document.getElementById('subscribe-form');
    const emailInput = document.getElementById('subscribe-email');
    const subscribeButton = document.getElementById('subscribe-button');
    const messageElement = document.getElementById('subscribe-message');

    // Custom cursor functionality
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.setAttribute("style", "top: "+(e.pageY - 10)+"px; left: "+(e.pageX - 10)+"px;");
        });
        
        document.addEventListener('click', () => {
            cursor.classList.add("expand");
            setTimeout(() => {
                cursor.classList.remove("expand");
            }, 500);
        });
    }

    // Smooth scroll for navigation
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form submission handler
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (!validateEmail(emailInput.value)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            subscribeButton.disabled = true;
            const originalButtonText = subscribeButton.innerHTML;
            subscribeButton.innerHTML = '<span class="spinner"></span>';
            
            // Create template parameters object
            const templateParams = {
                user_email: emailInput.value,
                from_name: "Blog Subscriber",
                message: "New subscription request"
            };
            
            // Send email using EmailJS with correct template ID (not the test one)
            // You need to create a real template in your EmailJS dashboard
            emailjs.send('service_2naiq3f', 'template_9rkpuqn', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showMessage('Thank you for subscribing! You\'ll be notified when new articles are published.', 'success');
                emailInput.value = '';
            })
            .catch(function(error) {
                console.log('FAILED...', error);
                showMessage('Oops! Something went wrong. Please try again later.', 'error');
            })
            .finally(function() {
                subscribeButton.disabled = false;
                subscribeButton.innerHTML = originalButtonText;
            });
        });
    }

    function validateEmail(email) {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    }

    function showMessage(message, type) {
        if (!messageElement) return;
        
        messageElement.textContent = message;
        messageElement.className = `subscribe-message ${type}`;
        messageElement.classList.remove('hidden');
        
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
