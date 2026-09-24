/* ==========================================================
   Week 3 — JavaScript: Making Websites Interactive
   Features implemented:
     1. Dark / light mode toggle (with localStorage persistence)
     2. Image gallery lightbox (click to enlarge, prev/next nav)
     3. Real-time contact form validation with error messages
     4. Scroll-aware "back to top" button visibility
     5. Live character counter on the message field
     6. Active nav link highlighting on scroll (Intersection Observer)
     7. Scroll-reveal animations for each section (Intersection Observer)
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {

    /* ======================================================
       1. DARK / LIGHT MODE TOGGLE
       ====================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;

    // Reusable function: applies a given theme and updates the icon
    function applyTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            bodyElement.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙';
        }
    }

    // Load saved preference on page load (DOM manipulation based on stored data)
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Event listener: click toggles and saves the new theme
    themeToggleBtn.addEventListener('click', function () {
        const isDark = bodyElement.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });


    /* ======================================================
       2. IMAGE GALLERY LIGHTBOX
       ====================================================== */
    const galleryImages = Array.from(document.querySelectorAll('#gallery-grid img'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentImageIndex = 0;

    // Reusable function: updates the lightbox content for a given index
    function showImageAt(index) {
        // wrap around so prev/next loop endlessly
        if (index < 0) {
            index = galleryImages.length - 1;
        } else if (index >= galleryImages.length) {
            index = 0;
        }
        currentImageIndex = index;

        const targetImg = galleryImages[currentImageIndex];
        lightboxImg.src = targetImg.src;
        lightboxImg.alt = targetImg.alt;
        lightboxCaption.textContent = targetImg.dataset.caption || targetImg.alt;
    }

    function openLightbox(index) {
        showImageAt(index);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden'; // prevent background scroll
    }

    function closeLightbox() {
        lightbox.hidden = true;
        document.body.style.overflow = '';
    }

    // Event listeners: click each gallery image to open the lightbox
    galleryImages.forEach(function (img, index) {
        img.addEventListener('click', function () {
            openLightbox(index);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () {
        showImageAt(currentImageIndex - 1);
    });
    lightboxNext.addEventListener('click', function () {
        showImageAt(currentImageIndex + 1);
    });

    // Close on clicking the dark overlay itself (but not the image/buttons)
    lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard support: Escape closes, arrow keys navigate
    document.addEventListener('keydown', function (event) {
        if (lightbox.hidden) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') showImageAt(currentImageIndex - 1);
        if (event.key === 'ArrowRight') showImageAt(currentImageIndex + 1);
    });


    /* ======================================================
       3. CONTACT FORM VALIDATION (with error messages)
       ====================================================== */
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const formSuccess = document.getElementById('form-success');

    // Reusable function: shows/clears an error message for a given field
    function setFieldError(inputEl, errorEl, message) {
        if (message) {
            errorEl.textContent = message;
            inputEl.classList.add('invalid');
        } else {
            errorEl.textContent = '';
            inputEl.classList.remove('invalid');
        }
    }

    // Reusable function: validates the Name field
    function validateName() {
        const value = nameInput.value.trim();
        const errorEl = document.getElementById('name-error');
        if (value.length === 0) {
            setFieldError(nameInput, errorEl, 'Name is required.');
            return false;
        }
        if (value.length < 2) {
            setFieldError(nameInput, errorEl, 'Name must be at least 2 characters.');
            return false;
        }
        setFieldError(nameInput, errorEl, '');
        return true;
    }

    // Reusable function: validates the Email field
    function validateEmail() {
        const value = emailInput.value.trim();
        const errorEl = document.getElementById('email-error');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (value.length === 0) {
            setFieldError(emailInput, errorEl, 'Email is required.');
            return false;
        }
        if (!emailPattern.test(value)) {
            setFieldError(emailInput, errorEl, 'Please enter a valid email address.');
            return false;
        }
        setFieldError(emailInput, errorEl, '');
        return true;
    }

    // Reusable function: validates the Message field
    function validateMessage() {
        const value = messageInput.value.trim();
        const errorEl = document.getElementById('message-error');
        if (value.length === 0) {
            setFieldError(messageInput, errorEl, 'Message is required.');
            return false;
        }
        if (value.length < 10) {
            setFieldError(messageInput, errorEl, 'Message must be at least 10 characters.');
            return false;
        }
        setFieldError(messageInput, errorEl, '');
        return true;
    }

    // Real-time validation: re-check each field as the user types/leaves it
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    messageInput.addEventListener('input', validateMessage);
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    messageInput.addEventListener('blur', validateMessage);

    // Event listener: form submit runs full validation before "sending"
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault(); // stop actual page submission for this demo

        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isMessageValid = validateMessage();

        if (isNameValid && isEmailValid && isMessageValid) {
            // DOM manipulation: hide the form fields, show a success message
            contactForm.reset();
            [nameInput, emailInput, messageInput].forEach(function (input) {
                input.classList.remove('invalid');
            });
            formSuccess.hidden = false;

            // Hide the success message again after a few seconds
            setTimeout(function () {
                formSuccess.hidden = true;
            }, 4000);
        }
    });


    /* ======================================================
       4. SCROLL-AWARE BACK-TO-TOP BUTTON
       ====================================================== */
    const backToTopBtn = document.getElementById('back-to-top');

    // Reusable function: shows/hides the button based on scroll position
    function updateBackToTopVisibility() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Run once on load, then on every scroll event
    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility);


    /* ======================================================
       5. LIVE CHARACTER COUNTER (message field)
       ====================================================== */
    const messageCounter = document.getElementById('message-counter');
    const MAX_MESSAGE_LENGTH = 500;

    // Reusable function: updates the "x / 500" counter text
    function updateCharCounter() {
        const currentLength = messageInput.value.length;
        messageCounter.textContent = currentLength + ' / ' + MAX_MESSAGE_LENGTH;

        // Give a visual nudge once the user is close to the limit
        if (currentLength > MAX_MESSAGE_LENGTH - 30) {
            messageCounter.classList.add('char-counter-warning');
        } else {
            messageCounter.classList.remove('char-counter-warning');
        }
    }

    messageInput.addEventListener('input', updateCharCounter);
    updateCharCounter(); // initialize at 0 / 500 on load


    /* ======================================================
       6. ACTIVE NAV LINK HIGHLIGHTING (Intersection Observer)
       ====================================================== */
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const observedSections = Array.from(document.querySelectorAll('main section[id]'));

    // Reusable function: marks the matching nav link as active
    function setActiveNavLink(sectionId) {
        navLinks.forEach(function (link) {
            const isMatch = link.getAttribute('href') === '#' + sectionId;
            link.classList.toggle('active-link', isMatch);
        });
    }

    const navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                setActiveNavLink(entry.target.id);
            }
        });
    }, {
        rootMargin: '-40% 0px -55% 0px' // triggers when section is roughly centered
    });

    observedSections.forEach(function (section) {
        navObserver.observe(section);
    });


    /* ======================================================
       7. SCROLL-REVEAL ANIMATIONS (Intersection Observer)
       ====================================================== */
    const revealElements = Array.from(document.querySelectorAll('.reveal'));

    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target); // animate once, then stop watching
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

});
