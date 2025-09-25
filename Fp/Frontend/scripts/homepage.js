// Homepage specific functionality
class Homepage {
    constructor() {
        this.currentSlide = 0;
        this.featuredProducts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeaturedProducts();
        this.initCarousel();
        this.initNewsletter();
        this.initPromoBanner();
        this.initParallax();
        this.initCategoryEffects();
        this.initCounterAnimations();
        this.initScrollAnimations();
        this.initHeroTypewriter();
    }

    setupEventListeners() {
        // Listen for products loaded
        window.store.addEventListener('productsLoaded', (e) => {
            this.loadFeaturedProducts();
        });
    }

    loadFeaturedProducts() {
        // Get featured products (highest rated)
        this.featuredProducts = window.store.products
            .filter(product => product.rating >= 4.5)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8);

        this.renderFeaturedProducts();
    }

    renderFeaturedProducts() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        if (this.featuredProducts.length === 0) {
            container.innerHTML = '<div class="loading">Loading products...</div>';
            return;
        }

        container.innerHTML = this.featuredProducts
            .map(product => window.store.generateProductCard(product))
            .join('');

        // Add reveal animation delay
        const cards = container.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    initCarousel() {
        const container = document.getElementById('featuredProducts');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        
        if (!container || !prevBtn || !nextBtn) return;

        let isScrolling = false;
        
        prevBtn.addEventListener('click', () => {
            if (isScrolling) return;
            isScrolling = true;
            
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            
            setTimeout(() => { isScrolling = false; }, 300);
        });

        nextBtn.addEventListener('click', () => {
            if (isScrolling) return;
            isScrolling = true;
            
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            setTimeout(() => { isScrolling = false; }, 300);
        });

        // Update button states based on scroll position
        container.addEventListener('scroll', () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            
            prevBtn.disabled = scrollLeft <= 0;
            nextBtn.disabled = scrollLeft >= scrollWidth - clientWidth - 10;
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let scrollLeft = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('touchmove', (e) => {
            if (!startX) return;
            
            e.preventDefault();
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('touchend', () => {
            startX = 0;
        });
    }

    initNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email') || form.querySelector('input[type="email"]').value;
            
            if (email) {
                // Simulate newsletter subscription
                window.store.showToast('Thank you for subscribing to our newsletter!', 'success');
                form.reset();
                
                // Save subscription to localStorage
                const subscriptions = JSON.parse(localStorage.getItem('freshmart_newsletter') || '[]');
                if (!subscriptions.includes(email)) {
                    subscriptions.push(email);
                    localStorage.setItem('freshmart_newsletter', JSON.stringify(subscriptions));
                }
            }
        });
    }

    // Promotional banner functionality
    initPromoBanner() {
        const promoBanner = document.querySelector('.promo-banner');
        if (!promoBanner) return;

        // Add scroll-triggered animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slideInUp');
                }
            });
        }, { threshold: 0.3 });

        observer.observe(promoBanner);
    }

    // Hero parallax effect
    initParallax() {
        const heroImage = document.querySelector('.hero-image img');
        if (!heroImage) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3;
            heroImage.style.transform = `translateY(${parallax}px)`;
        });
    }

    // Enhanced typing animation for hero title
    initHeroTypewriter() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid var(--color-primary)';
        heroTitle.style.animation = 'none';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            } else {
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                    heroTitle.style.animation = 'fadeIn 0.5s ease-in';
                }, 1000);
            }
        };

        // Start typing animation after page load
        setTimeout(typeWriter, 1000);
    }

    // Enhanced category effects with click handling
    initCategoryEffects() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });

            // Click handling
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                if (category) {
                    // Add click animation
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        window.location.href = `shop.html?category=${category}`;
                    }, 150);
                }
            });
        });
    }

    // Intersection Observer for counter animations
    initCounterAnimations() {
        const counters = document.querySelectorAll('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    }

    // Scroll-triggered animations
    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .category-card, .product-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease-out';
            observer.observe(element);
        });
    }

    // Enhanced newsletter with validation
    initNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (!this.isValidEmail(email)) {
                this.showFormError(emailInput, 'Please enter a valid email address');
                return;
            }

            // Show loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                // Save subscription
                const subscriptions = JSON.parse(localStorage.getItem('freshmart_newsletter') || '[]');
                if (!subscriptions.includes(email)) {
                    subscriptions.push(email);
                    localStorage.setItem('freshmart_newsletter', JSON.stringify(subscriptions));
                    window.store.showToast('Thank you for subscribing! You\'ll receive our latest offers and updates.', 'success');
                } else {
                    window.store.showToast('You\'re already subscribed to our newsletter!', 'info');
                }
                
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                this.clearFormError(emailInput);
            }, 1500);
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFormError(input, message) {
        this.clearFormError(input);
        input.style.borderColor = 'var(--color-error)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--color-error)';
        errorDiv.style.fontSize = 'var(--font-size-sm)';
        errorDiv.style.marginTop = 'var(--space-1)';
        
        input.parentNode.appendChild(errorDiv);
    }

    clearFormError(input) {
        input.style.borderColor = '';
        const errorDiv = input.parentNode.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Enhanced promo banner with auto-hide
    initPromoBanner() {
        const promoBanner = document.querySelector('.promo-banner');
        if (!promoBanner) return;

        // Add scroll-triggered animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slideInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(promoBanner);

        // Add floating animation to promo elements
        const promoElements = promoBanner.querySelectorAll('.promo-text h2, .promo-text p, .btn');
        promoElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            element.classList.add('animate-slideInLeft');
        });
    }
}

// Initialize homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('homepage') || window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        new Homepage();
    }
});

// Add homepage class to body
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    document.body.classList.add('homepage');
}

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add loading animation for page transitions
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0.8';
    document.body.style.transition = 'opacity 0.3s ease';
});