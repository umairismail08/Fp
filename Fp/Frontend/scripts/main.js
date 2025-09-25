// Global State and Utilities
class GroceryStore {
    constructor() {
        this.products = [];
        this.cart = this.loadCart();
        this.user = this.loadUser();
        this.orders = this.loadOrders();
        this.wishlist = this.loadWishlist();
        this.theme = this.loadTheme();
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.updateCartCount();
        this.initTheme();
        this.initSearch();
        this.initMobileMenu();
        this.initScrollReveal();
        this.initTooltips();
    }


    // PASTE THIS NEW FUNCTION INSIDE YOUR GroceryStore CLASS
updateCartItemQuantity(productId, action) {
    const idToFind = parseInt(productId, 10);
    const item = this.cart.find(item => item.id == idToFind);
    if (!item) return;

    if (action === 'increase') {
        item.quantity++;
    } else if (action === 'decrease') {
        item.quantity--;
    }

    if (item.quantity <= 0) {
        this.removeFromCart(productId);
    } else {
        this.saveCart();
    }
}

    // Data Loading
    async loadProducts() {
        try {
            const response = await fetch('/fp/backend/get_products.php');
            this.products = await response.json();
            this.dispatchEvent('productsLoaded', this.products);
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showToast('Failed to load products', 'error');
        }
    }

    // Cart Management
    loadCart() {
        const saved = localStorage.getItem('freshmart_cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('freshmart_cart', JSON.stringify(this.cart));
        this.updateCartCount();
       this.dispatchEvent('cartUpdated', this.cart);
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return false;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.showToast(`${product.name} added to cart!`, 'success');
        this.animateAddToCart(product);
        return true;
    }

    updateCartItem(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showToast('Item removed from cart', 'warning');
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartCount() {
        const count = this.getCartItemCount();
        const counters = document.querySelectorAll('.cart-count, #mobileCartCount');
        counters.forEach(counter => {
            if (counter.id === 'mobileCartCount') {
                counter.textContent = count;
            } else {
                counter.textContent = count;
                counter.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    // User Management
    loadUser() {
        const saved = localStorage.getItem('freshmart_user');
        return saved ? JSON.parse(saved) : null;
    }

    saveUser(user) {
        this.user = user;
        localStorage.setItem('freshmart_user', JSON.stringify(user));
        this.dispatchEvent('userUpdated', user);
    }

    logout() {
        this.user = null;
        localStorage.removeItem('freshmart_user');
        this.dispatchEvent('userLoggedOut');
        this.showToast('Logged out successfully', 'success');
    }

    // Orders Management
    loadOrders() {
        const saved = localStorage.getItem('freshmart_orders');
        return saved ? JSON.parse(saved) : [];
    }

    saveOrders() {
        localStorage.setItem('freshmart_orders', JSON.stringify(this.orders));
    }

    createOrder(orderData) {
        const order = {
            id: Date.now().toString(),
            items: [...this.cart],
            total: this.getCartTotal(),
            status: 'processing',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            trackingSteps: [
                { name: 'Processing', icon: 'fas fa-clock', completed: true, timestamp: new Date().toISOString() },
                { name: 'Shipped', icon: 'fas fa-truck', completed: false },
                { name: 'Out for Delivery', icon: 'fas fa-motorcycle', completed: false },
                { name: 'Delivered', icon: 'fas fa-check-circle', completed: false }
            ],
            ...orderData
        };

        this.orders.unshift(order);
        this.saveOrders();
        this.clearCart();
        return order;
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            const statusMap = {
                'processing': 0,
                'shipped': 1,
                'out-for-delivery': 2,
                'delivered': 3
            };
            
            const stepIndex = statusMap[status];
            if (stepIndex !== undefined) {
                order.trackingSteps.forEach((step, index) => {
                    step.completed = index <= stepIndex;
                    if (index === stepIndex) {
                        step.timestamp = new Date().toISOString();
                    }
                });
            }
            
            this.saveOrders();
            this.dispatchEvent('orderUpdated', order);
        }
    }

    // Wishlist Management
    loadWishlist() {
        const saved = localStorage.getItem('freshmart_wishlist');
        return saved ? JSON.parse(saved) : [];
    }

    saveWishlist() {
        localStorage.setItem('freshmart_wishlist', JSON.stringify(this.wishlist));
    }

    toggleWishlist(productId) {
        const index = this.wishlist.indexOf(productId);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showToast('Removed from wishlist', 'warning');
        } else {
            this.wishlist.push(productId);
            this.showToast('Added to wishlist', 'success');
        }
        this.saveWishlist();
        this.dispatchEvent('wishlistUpdated', this.wishlist);
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    // Theme Management
    loadTheme() {
        const saved = localStorage.getItem('freshmart_theme');
        return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    saveTheme() {
        localStorage.setItem('freshmart_theme', this.theme);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcons = document.querySelectorAll('#themeToggle i');
        themeIcons.forEach(icon => {
            icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }

    initTheme() {
        this.applyTheme();
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    // Search Functionality
    initSearch() {
        const searchInputs = document.querySelectorAll('#searchInput');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleSearch(e.target.value, searchSuggestions));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        });

        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (searchSuggestions && !e.target.closest('.search-container')) {
                searchSuggestions.style.display = 'none';
            }
        });
    }

    handleSearch(query, suggestionsElement) {
        if (!query.trim() || !suggestionsElement) {
            if (suggestionsElement) suggestionsElement.style.display = 'none';
            return;
        }

        const suggestions = this.products
            .filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase()) ||
                product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            )
            .slice(0, 5);

        if (suggestions.length > 0) {
            suggestionsElement.innerHTML = suggestions
                .map(product => `
                    <div class="suggestion-item" onclick="window.store.selectSuggestion('${product.name}')">
                        <strong>${product.name}</strong>
                        <div style="font-size: 12px; color: var(--text-muted);">${this.formatCategory(product.category)} - $${product.price}</div>
                    </div>
                `).join('');
            suggestionsElement.style.display = 'block';
        } else {
            suggestionsElement.style.display = 'none';
        }
    }

    selectSuggestion(productName) {
        const searchInputs = document.querySelectorAll('#searchInput');
        searchInputs.forEach(input => input.value = productName);
        
        const suggestionsElement = document.getElementById('searchSuggestions');
        if (suggestionsElement) suggestionsElement.style.display = 'none';
        
        this.performSearch(productName);
    }

    performSearch(query) {
        const searchParams = new URLSearchParams();
        searchParams.set('search', query);
        window.location.href = `shop.html?${searchParams.toString()}`;
    }

    // Mobile Menu
    initMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('mobileMenu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                menu.classList.toggle('show');
            });
        }
    }

    // Scroll Reveal Animation
    initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with reveal class
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                observer.observe(el);
            });
        }, 100);
    }

    // Tooltips
      initTooltips() {
        const storeInstance = this;
        document.body.addEventListener('mouseover', (e) => {
            if (!(e.target instanceof Element)) return;
            const tooltipTarget = e.target.closest('[data-tooltip]');
            if (tooltipTarget && !document.querySelector('.tooltip')) {
                storeInstance.showTooltip(tooltipTarget, tooltipTarget.dataset.tooltip);
            }
        });
        document.body.addEventListener('mouseout', () => {
            storeInstance.hideTooltip();
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Animations
    animateAddToCart(product) {
        const flyingProduct = document.getElementById('flyingProduct');
        const cartIcon = document.querySelector('.cart-link');
        
        if (!flyingProduct || !cartIcon) return;

        const img = flyingProduct.querySelector('img');
        img.src = product.image;

        // Position the flying product
        const productCards = document.querySelectorAll('.product-card');
        let startElement = null;
        
        productCards.forEach(card => {
            const cardProduct = this.products.find(p => p.id.toString() === card.dataset.productId);
            if (cardProduct && cardProduct.id === product.id) {
                startElement = card.querySelector('.product-image');
            }
        });

        if (startElement) {
            const startRect = startElement.getBoundingClientRect();
            flyingProduct.style.left = startRect.left + 'px';
            flyingProduct.style.top = startRect.top + 'px';
            flyingProduct.style.opacity = '1';
            
            setTimeout(() => {
                flyingProduct.classList.add('animate');
                setTimeout(() => {
                    flyingProduct.classList.remove('animate');
                    flyingProduct.style.opacity = '0';
                    
                    // Bounce cart icon
                    cartIcon.style.animation = 'bounce 0.6s ease';
                    setTimeout(() => {
                        cartIcon.style.animation = '';
                    }, 600);
                }, 1000);
            }, 100);
        }
    }

    // Toast Notifications
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon ${iconMap[type]}"></i>
                <div class="toast-text">
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        });
    }

    // Event System
    addEventListener(event, callback) {
        document.addEventListener(`store:${event}`, callback);
    }

    dispatchEvent(event, data) {
        document.dispatchEvent(new CustomEvent(`store:${event}`, { detail: data }));
    }

    // Utility Methods
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    formatDate(dateString) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateString));
    }

    formatCategory(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    calculateDiscount(originalPrice, currentPrice) {
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    // Product Card Generation
    generateProductCard(product, showWishlist = true) {
        const discount = product.originalPrice > product.price ? 
            this.calculateDiscount(product.originalPrice, product.price) : 0;
        
        const isWishlisted = this.isInWishlist(product.id);
        
        return `
            <div class="product-card reveal" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.isOrganic ? '<span class="product-badge organic">Organic</span>' : ''}
                    ${discount > 0 ? `<span class="product-badge sale">${discount}% OFF</span>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${this.formatCategory(product.category)}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">${this.generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${this.formatPrice(product.price)}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="original-price">${this.formatPrice(product.originalPrice)}</span>` : ''
                        }
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="window.store.addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i>
                            Add to Cart
                        </button>
                        ${showWishlist ? `
                            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                                    onclick="window.store.toggleWishlist(${product.id})"
                                    data-tooltip="Add to wishlist">
                                <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Navigation
    navigateToProduct(productId) {
        window.location.href = `product.html?id=${productId}`;
    }

    navigateToCategory(category) {
        window.location.href = `shop.html?category=${category}`;
    }

    // Data Persistence
    loadWishlist() {
        const saved = localStorage.getItem('freshmart_wishlist');
        return saved ? JSON.parse(saved) : [];
    }

    loadOrders() {
        const saved = localStorage.getItem('freshmart_orders');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Generate sample orders for demo
        return [
            {
                id: '1704067200000',
                items: [
                    { ...this.products?.[0] || { name: 'Sample Product', price: 2.99 }, quantity: 2 },
                    { ...this.products?.[1] || { name: 'Sample Product 2', price: 3.49 }, quantity: 1 }
                ],
                total: 9.47,
                status: 'delivered',
                createdAt: '2024-01-01T10:00:00.000Z',
                estimatedDelivery: '2024-01-03T18:00:00.000Z',
                deliveredAt: '2024-01-03T16:30:00.000Z',
                trackingSteps: [
                    { name: 'Processing', icon: 'fas fa-clock', completed: true, timestamp: '2024-01-01T10:00:00.000Z' },
                    { name: 'Shipped', icon: 'fas fa-truck', completed: true, timestamp: '2024-01-02T08:00:00.000Z' },
                    { name: 'Out for Delivery', icon: 'fas fa-motorcycle', completed: true, timestamp: '2024-01-03T14:00:00.000Z' },
                    { name: 'Delivered', icon: 'fas fa-check-circle', completed: true, timestamp: '2024-01-03T16:30:00.000Z' }
                ]
            },
            {
                id: '1704153600000',
                items: [
                    { ...this.products?.[2] || { name: 'Sample Product 3', price: 8.99 }, quantity: 1 }
                ],
                total: 8.99,
                status: 'shipped',
                createdAt: '2024-01-02T10:00:00.000Z',
                estimatedDelivery: '2024-01-04T18:00:00.000Z',
                trackingSteps: [
                    { name: 'Processing', icon: 'fas fa-clock', completed: true, timestamp: '2024-01-02T10:00:00.000Z' },
                    { name: 'Shipped', icon: 'fas fa-truck', completed: true, timestamp: '2024-01-03T09:00:00.000Z' },
                    { name: 'Out for Delivery', icon: 'fas fa-motorcycle', completed: false },
                    { name: 'Delivered', icon: 'fas fa-check-circle', completed: false }
                ]
            }
        ];
    }
}

// Initialize store
window.store = new GroceryStore();

// Page-specific initialization
document.addEventListener('DOMContentLoaded', () => {
    // Add page transition
    document.body.classList.add('page-transition');
    
    // Initialize scroll reveal
    setTimeout(() => {
        window.store.initScrollReveal();
    }, 100);
});

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Handle category navigation
document.addEventListener('click', (e) => {
    const categoryCard = e.target.closest('.category-card');
    if (categoryCard) {
        const category = categoryCard.dataset.category;
        if (category) {
            window.store.navigateToCategory(category);
        }
    }
});

// Handle product navigation
document.addEventListener('click', (e) => {
    const productCard = e.target.closest('.product-card');
    if (productCard && !e.target.closest('button')) {
        const productId = productCard.dataset.productId;
        if (productId) {
            window.store.navigateToProduct(productId);
        }
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Escape key closes modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-backdrop.show, .checkout-modal.show, .auth-modal.show, .order-modal.show, .mobile-filters-modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        
        // Close mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        const menuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenu && mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
            menuToggle.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    window.store.showToast('Something went wrong. Please try again.', 'error');
});

// Handle online/offline status
window.addEventListener('online', () => {
    window.store.showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    window.store.showToast('You are offline. Some features may not work.', 'warning');
});