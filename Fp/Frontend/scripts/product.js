// Product detail page functionality
class ProductPage {
    constructor() {
        this.product = null;
        this.relatedProducts = [];
        this.currentImageIndex = 0;
        this.quantity = 1;
        
        this.init();
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (productId) {
            this.loadProduct(productId);
        } else {
            this.showError('Product not found');
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for products loaded
        window.store.addEventListener('productsLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            if (productId) {
                this.loadProduct(productId);
            }
        });
    }

    loadProduct(productId) {
        this.product = window.store.products.find(p => p.id === productId);
        
        if (!this.product) {
            this.showError('Product not found');
            return;
        }

        this.renderProduct();
        this.loadRelatedProducts();
        this.updateBreadcrumb();
    }

    renderProduct() {
        const container = document.getElementById('productLayout');
        if (!container || !this.product) return;

        const discount = this.product.originalPrice > this.product.price ? 
            window.store.calculateDiscount(this.product.originalPrice, this.product.price) : 0;

        const isWishlisted = window.store.isInWishlist(this.product.id);

        container.innerHTML = `
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${this.product.image}" alt="${this.product.name}" id="mainProductImage">
                </div>
                <div class="thumbnail-gallery">
                    <div class="thumbnail active">
                        <img src="${this.product.image}" alt="${this.product.name}">
                    </div>
                    <div class="thumbnail">
                        <img src="${this.product.image}" alt="${this.product.name} angle 2">
                    </div>
                    <div class="thumbnail">
                        <img src="${this.product.image}" alt="${this.product.name} angle 3">
                    </div>
                    <div class="thumbnail">
                        <img src="${this.product.image}" alt="${this.product.name} angle 4">
                    </div>
                </div>
            </div>
            
            <div class="product-details">
                <div class="product-header">
                    <div class="product-category">${window.store.formatCategory(this.product.category)}</div>
                    <h1 class="product-title">${this.product.name}</h1>
                    <div class="product-rating">
                        <div class="stars">${window.store.generateStars(this.product.rating)}</div>
                        <span class="rating-text">${this.product.rating} (${this.product.reviews} reviews)</span>
                    </div>
                </div>
                
                <div class="product-pricing">
                    <div class="price-section">
                        <span class="current-price">${window.store.formatPrice(this.product.price)}</span>
                        ${this.product.originalPrice > this.product.price ? 
                            `<span class="original-price">${window.store.formatPrice(this.product.originalPrice)}</span>
                             <span class="discount">${discount}% OFF</span>` : ''
                        }
                    </div>
                    <div class="stock-info">
                        ${this.product.stock > 0 ? 
                            `<span class="in-stock"><i class="fas fa-check-circle"></i> ${this.product.stock} left in stock</span>` :
                            `<span class="out-of-stock"><i class="fas fa-times-circle"></i> Out of stock</span>`
                        }
                    </div>
                </div>
                
                <div class="product-description">
                    <h3>Description</h3>
                    <p>${this.product.description}</p>
                    
                    ${this.product.nutrition ? `
                        <div class="nutrition-info">
                            <h4>Nutrition Information (per serving)</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <span class="nutrition-label">Calories</span>
                                    <span class="nutrition-value">${this.product.nutrition.calories}</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-label">Protein</span>
                                    <span class="nutrition-value">${this.product.nutrition.protein}</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-label">Carbs</span>
                                    <span class="nutrition-value">${this.product.nutrition.carbs}</span>
                                </div>
                                <div class="nutrition-item">
                                    <span class="nutrition-label">Fiber</span>
                                    <span class="nutrition-value">${this.product.nutrition.fiber}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="product-tags">
                        ${this.product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="product-actions-section">
                    <div class="quantity-selector">
                        <label>Quantity:</label>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="productPage.decreaseQuantity()">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="1" min="1" max="${this.product.stock}" id="quantityInput">
                            <button class="quantity-btn" onclick="productPage.increaseQuantity()">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-large add-to-cart-btn" 
                                onclick="productPage.addToCart()" 
                                ${this.product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            ${this.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button class="btn btn-secondary btn-large buy-now-btn" 
                                onclick="productPage.buyNow()"
                                ${this.product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-bolt"></i>
                            Buy Now
                        </button>
                        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                                onclick="productPage.toggleWishlist()"
                                data-tooltip="Add to wishlist">
                            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
                
                <div class="product-features">
                    <div class="feature-item">
                        <i class="fas fa-truck"></i>
                        <div>
                            <strong>Free Delivery</strong>
                            <span>On orders over $25</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-undo"></i>
                        <div>
                            <strong>30-Day Returns</strong>
                            <span>Easy return policy</span>
                        </div>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shield-alt"></i>
                        <div>
                            <strong>Quality Guarantee</strong>
                            <span>100% fresh products</span>
                        </div>
                    </div>
                </div>
                
                <div class="reviews-section">
                    <h3>Customer Reviews</h3>
                    <div class="reviews-summary">
                        <div class="rating-overview">
                            <div class="average-rating">
                                <span class="rating-number">${this.product.rating}</span>
                                <div class="stars">${window.store.generateStars(this.product.rating)}</div>
                                <span class="reviews-count">${this.product.reviews} reviews</span>
                            </div>
                        </div>
                    </div>
                    <div class="reviews-list">
                        ${this.generateSampleReviews()}
                    </div>
                </div>
            </div>
        `;

        this.initImageGallery();
        this.initQuantityControls();
    }

    initImageGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('mainProductImage');
        
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                // Add active class to clicked thumbnail
                thumbnail.classList.add('active');
                
                // Update main image
                const img = thumbnail.querySelector('img');
                if (mainImage && img) {
                    mainImage.src = img.src;
                    mainImage.alt = img.alt;
                }
                
                this.currentImageIndex = index;
            });
        });

        // Keyboard navigation for gallery
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }

    initQuantityControls() {
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= this.product.stock) {
                    this.quantity = value;
                } else {
                    e.target.value = this.quantity;
                }
            });
        }
    }

    previousImage() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        if (this.currentImageIndex > 0) {
            thumbnails[this.currentImageIndex - 1].click();
        }
    }

    nextImage() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        if (this.currentImageIndex < thumbnails.length - 1) {
            thumbnails[this.currentImageIndex + 1].click();
        }
    }

    increaseQuantity() {
        if (this.quantity < this.product.stock) {
            this.quantity++;
            document.getElementById('quantityInput').value = this.quantity;
        }
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity--;
            document.getElementById('quantityInput').value = this.quantity;
        }
    }

    addToCart() {
        const success = window.store.addToCart(this.product.id, this.quantity);
        
        if (success) {
            const button = document.querySelector('.add-to-cart-btn');
            if (button) {
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
                button.style.backgroundColor = 'var(--color-success)';
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.backgroundColor = '';
                }, 2000);
            }
        }
    }

    buyNow() {
        window.store.addToCart(this.product.id, this.quantity);
        window.location.href = 'cart.html';
    }

    toggleWishlist() {
        window.store.toggleWishlist(this.product.id);
        const button = document.querySelector('.wishlist-btn');
        const icon = button.querySelector('i');
        
        if (window.store.isInWishlist(this.product.id)) {
            button.classList.add('active');
            icon.className = 'fas fa-heart';
        } else {
            button.classList.remove('active');
            icon.className = 'far fa-heart';
        }
    }

    loadRelatedProducts() {
        // Get products from same category, excluding current product
        this.relatedProducts = window.store.products
            .filter(p => p.category === this.product.category && p.id !== this.product.id)
            .slice(0, 4);

        this.renderRelatedProducts();
    }

    renderRelatedProducts() {
        const container = document.getElementById('relatedProducts');
        if (!container) return;

        if (this.relatedProducts.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }

        container.innerHTML = this.relatedProducts
            .map(product => window.store.generateProductCard(product))
            .join('');
    }

    updateBreadcrumb() {
        if (!this.product) return;

        const categoryElement = document.getElementById('productCategory');
        const nameElement = document.getElementById('productBreadcrumb');
        
        if (categoryElement) {
            categoryElement.textContent = window.store.formatCategory(this.product.category);
        }
        
        if (nameElement) {
            nameElement.textContent = this.product.name;
        }
    }

    generateSampleReviews() {
        const sampleReviews = [
            {
                name: 'Sarah Johnson',
                rating: 5,
                date: '2024-12-15',
                comment: 'Excellent quality! Fresh and delicious. Will definitely order again.',
                verified: true
            },
            {
                name: 'Mike Chen',
                rating: 4,
                date: '2024-12-10',
                comment: 'Good product, fast delivery. Packaging could be better.',
                verified: true
            },
            {
                name: 'Emily Davis',
                rating: 5,
                date: '2024-12-08',
                comment: 'Perfect! Exactly what I expected. Great value for money.',
                verified: false
            }
        ];

        return sampleReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <strong class="reviewer-name">${review.name}</strong>
                        ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
                    </div>
                    <div class="review-meta">
                        <div class="stars">${window.store.generateStars(review.rating)}</div>
                        <span class="review-date">${window.store.formatDate(review.date)}</span>
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
            </div>
        `).join('');
    }

    showError(message) {
        const container = document.getElementById('productLayout');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Product Not Found</h2>
                    <p>${message}</p>
                    <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
        }
    }

    // Image zoom functionality
    initImageZoom() {
        const mainImage = document.getElementById('mainProductImage');
        if (!mainImage) return;

        mainImage.addEventListener('mouseenter', () => {
            mainImage.style.cursor = 'zoom-in';
        });

        mainImage.addEventListener('click', () => {
            this.openImageModal(mainImage.src);
        });
    }

    openImageModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${imageSrc}" alt="${this.product.name}">
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');

        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Share product functionality
    shareProduct() {
        if (navigator.share) {
            navigator.share({
                title: this.product.name,
                text: this.product.description,
                url: window.location.href
            });
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                window.store.showToast('Product link copied to clipboard!', 'success');
            });
        }
    }

    // Review submission
    submitReview(rating, comment) {
        // In a real app, this would submit to a server
        const review = {
            id: Date.now().toString(),
            productId: this.product.id,
            rating: rating,
            comment: comment,
            date: new Date().toISOString(),
            userName: window.store.user?.name || 'Anonymous'
        };

        window.store.showToast('Thank you for your review!', 'success');
        
        // Update product rating (simulation)
        const reviews = JSON.parse(localStorage.getItem('freshmart_reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('freshmart_reviews', JSON.stringify(reviews));
    }

    // Product comparison
    addToComparison() {
        const comparison = JSON.parse(localStorage.getItem('freshmart_comparison') || '[]');
        
        if (comparison.length >= 4) {
            window.store.showToast('You can compare up to 4 products only', 'warning');
            return;
        }

        if (!comparison.find(p => p.id === this.product.id)) {
            comparison.push(this.product);
            localStorage.setItem('freshmart_comparison', JSON.stringify(comparison));
            window.store.showToast('Product added to comparison', 'success');
        } else {
            window.store.showToast('Product already in comparison', 'warning');
        }
    }
}

// Initialize product page
let productPage;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('product.html')) {
        productPage = new ProductPage();
    }
});

// Make productPage globally accessible
window.productPage = productPage;