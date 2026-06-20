// ==================== DOM ELEMENTS ====================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form');
const blogGrid = document.getElementById('blog-grid');
const loadingSpinner = document.getElementById('loading');
const errorMessage = document.getElementById('error');
const navLinks = document.querySelectorAll('.nav-link');

// ==================== DARK MODE FUNCTIONALITY ====================
class DarkModeManager {
    constructor() {
        this.key = 'taskflow-theme-preference';
        this.init();
    }

    init() {
        // Check localStorage, system preference, or default to light mode
        const savedTheme = localStorage.getItem(this.key);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

        if (isDark) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }

        themeToggle.addEventListener('click', () => this.toggle());
    }

    toggle() {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }

    enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem(this.key, 'dark');
        this.updateThemeIcon();
    }

    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem(this.key, 'light');
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = `<span class="theme-icon" aria-hidden="true">${isDark ? '☀️' : '🌙'}</span>`;
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

// ==================== MOBILE MENU FUNCTIONALITY ====================
class MobileMenuManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        hamburger.addEventListener('click', () => this.toggle());
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar-container')) {
                this.close();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.isOpen = false;
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

// ==================== FORM VALIDATION ====================
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            message: document.getElementById('message')
        };
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        Object.values(this.fields).forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            this.submitForm();
        }
    }

    validateField(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let errorMessage = '';

        // Check if field is empty
        if (!field.value.trim()) {
            isValid = false;
            errorMessage = `${this.capitalize(field.name)} is required`;
        } 
        // Validate email format
        else if (field.type === 'email' && !this.isValidEmail(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        // Validate message minimum length
        else if (field.id === 'message' && field.value.trim().length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters';
        }

        // Update UI
        const formGroup = field.closest('.form-group');
        if (isValid) {
            formGroup.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        } else {
            formGroup.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    submitForm() {
        const submitBtn = this.form.querySelector('.submit-button');
        const formMessage = document.getElementById('form-message');

        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate form submission (in real app, send to backend)
        setTimeout(() => {
            // Show success message
            formMessage.className = 'form-message success';
            formMessage.textContent = '✓ Thank you! We\'ll be in touch soon.';

            // Reset form
            this.form.reset();
            Object.keys(this.fields).forEach(key => {
                this.fields[key].closest('.form-group').classList.remove('error');
            });

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';

            // Clear message after 5 seconds
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
            }, 5000);
        }, 1500);
    }
}

// ==================== API INTEGRATION ====================
class BlogManager {
    constructor(gridElement, loadingElement, errorElement) {
        this.grid = gridElement;
        this.loading = loadingElement;
        this.error = errorElement;
        this.apiUrl = 'https://jsonplaceholder.typicode.com/posts';
    }

    async fetchPosts() {
        try {
            this.showLoading();
            
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const posts = await response.json();
            
            // Get first 6 posts
            const latestPosts = posts.slice(0, 6);
            
            this.hideLoading();
            this.renderPosts(latestPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            this.hideLoading();
            this.showError();
        }
    }

    renderPosts(posts) {
        this.grid.innerHTML = '';

        posts.forEach((post, index) => {
            const card = this.createPostCard(post, index);
            this.grid.appendChild(card);
        });

        // Add fade-in animation
        this.animateCards();
    }

    createPostCard(post, index) {
        const article = document.createElement('article');
        article.className = 'blog-card';
        article.style.animationDelay = `${index * 0.1}s`;

        // Truncate title to 60 characters
        const truncatedTitle = post.title.length > 60 
            ? post.title.substring(0, 60) + '...' 
            : post.title;

        // Truncate body to excerpt
        const excerpt = post.body.substring(0, 120) + '...';

        article.innerHTML = `
            <div class="blog-card-header" aria-hidden="true">
                Post #${post.id}
            </div>
            <div class="blog-card-content">
                <span class="blog-card-id">Post ${post.id}</span>
                <h3 class="blog-card-title">${this.escapeHtml(truncatedTitle)}</h3>
                <p class="blog-card-excerpt">${this.escapeHtml(excerpt)}</p>
            </div>
        `;

        return article;
    }

    animateCards() {
        const cards = this.grid.querySelectorAll('.blog-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        });
    }

    showLoading() {
        this.loading.style.display = 'flex';
        this.error.style.display = 'none';
        this.grid.innerHTML = '';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError() {
        this.error.style.display = 'block';
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// ==================== ANIMATION STYLES ====================
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .blog-card {
            animation-duration: 0.6s;
            animation-fill-mode: both;
        }
    `;
    document.head.appendChild(style);
}

// ==================== SMOOTH SCROLL ENHANCEMENT ====================
function enhanceSmoothScroll() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

// ==================== PERFORMANCE: LAZY LOADING FOR IMAGES ====================
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ==================== PERFORMANCE: DEBOUNCE UTILITY ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== ACCESSIBILITY: FOCUS MANAGEMENT ====================
function improveFocusManagement() {
    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#hero';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Trap focus in mobile menu
    const menuItems = navMenu.querySelectorAll('a, button');
    const firstItem = menuItems[0];
    const lastItem = menuItems[menuItems.length - 1];

    navMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && navMenu.classList.contains('active')) {
            if (e.shiftKey) {
                if (document.activeElement === firstItem) {
                    e.preventDefault();
                    lastItem.focus();
                }
            } else {
                if (document.activeElement === lastItem) {
                    e.preventDefault();
                    firstItem.focus();
                }
            }
        }
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('TaskFlow - Initializing application...');

    // Initialize components
    new DarkModeManager();
    new MobileMenuManager();
    new FormValidator(contactForm);

    // Add animation styles
    addAnimationStyles();

    // Enhance navigation
    enhanceSmoothScroll();

    // Initialize lazy loading
    initLazyLoading();

    // Improve accessibility
    improveFocusManagement();

    // Load blog posts
    const blogManager = new BlogManager(blogGrid, loadingSpinner, errorMessage);
    blogManager.fetchPosts();

    // Log ready state
    console.log('TaskFlow - Application ready!');
});

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ==================== PERFORMANCE: OPTIMIZATION ====================
// Lazy load analytics or other non-critical scripts
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('Non-critical tasks loaded');
    });
}
