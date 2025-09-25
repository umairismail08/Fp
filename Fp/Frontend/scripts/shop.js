// === FINAL shop.js ===
document.addEventListener('DOMContentLoaded', () => {
    // This event comes from main.js after products are fetched from the database
    document.addEventListener('productsLoaded', renderShopProducts);
    
    // This handles the case where products are already loaded
    if (window.store && window.store.products.length > 0) {
        renderShopProducts();
    }
});

function renderShopProducts() {
    const container = document.getElementById('productsGrid'); // Your shop page needs a <div id="productsGrid">
    if (!container) return;

    container.innerHTML = window.store.products.map(product => `
        <div class="product-card" style="border: 1px solid #eee; padding: 1rem; text-align: center;">
            <img src="images/${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover;">
            <h3>${product.name}</h3>
            <p>${window.store.formatPrice(product.price)}</p>
            <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
    `).join('');
}

// Use a single event listener for all "Add to Cart" buttons
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('add-to-cart-btn')) {
        const productId = e.target.dataset.productId;
        window.store.addToCart(productId);
        alert(`${window.store.products.find(p => p.id == productId).name} added to cart!`);
    }
});