// === FINAL AND COMPLETE cart.js FILE ===

document.addEventListener('DOMContentLoaded', () => {
    // Render the cart when the page first loads
    renderCartPage();

    // Listen for the correct event from main.js to automatically refresh
    document.addEventListener('store:cartUpdated', renderCartPage);

    // Add a listener for the checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // We will build this functionality next
            alert('Proceeding to checkout!');
        });
    }

    // Add a listener for the clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                window.store.clearCart();
            }
        });
    }
});

function renderCartPage() {
    const cart = window.store.cart;
    const container = document.getElementById('cartItemsContainer');
    const emptyCartView = document.getElementById('emptyCart');
    const mainCartView = document.querySelector('.cart-main');

    if (!container || !emptyCartView || !mainCartView) return;

    if (!cart || cart.length === 0) {
        emptyCartView.style.display = 'block';
        mainCartView.style.display = 'none';
    } else {
        emptyCartView.style.display = 'none';
        mainCartView.style.display = 'block';

        document.getElementById('cartItemCount').textContent = `${window.store.getCartItemCount()} items in your cart`;

        container.innerHTML = cart.map(item => `
            <div class="cart-item" style="display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #eee; padding: 1rem 0;">
                <img src="images/${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">${item.name}</h4>
                    <span>${window.store.formatPrice(item.price)}</span>
                </div>
                <div>
                    <span>Qty: ${item.quantity}</span>
                </div>
                <div style="font-weight: bold;">
                    ${window.store.formatPrice(item.price * item.quantity)}
                </div>
                <button onclick="removeItem(${item.id})" title="Remove Item" style="background: transparent; border: none; font-size: 1.2rem; color: #999; cursor: pointer;">
                    &times;
                </button>
            </div>
        `).join('');
    }
    updateSummary();
}

function updateSummary() {
    const subtotal = window.store.getCartTotal();
    const deliveryFee = subtotal > 25 ? 0 : 4.99;
    const tax = subtotal * 0.08;
    const total = subtotal + tax + deliveryFee;

    document.getElementById('subtotal').textContent = window.store.formatPrice(subtotal);
    document.getElementById('deliveryFee').textContent = deliveryFee === 0 ? 'FREE' : window.store.formatPrice(deliveryFee);
    document.getElementById('tax').textContent = window.store.formatPrice(tax);
    document.getElementById('total').textContent = window.store.formatPrice(total);

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = window.store.cart.length === 0;
    }
}

function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item?')) {
        window.store.removeFromCart(productId);
    }
}