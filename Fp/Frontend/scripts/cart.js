// This is the main function that will display the cart
function renderCartPage() {
    // First, make sure the global store from main.js exists and is ready
    if (!window.store || typeof window.store.cart === 'undefined') {
        return; 
    }

    const cart = window.store.cart;
    const itemsContainer = document.getElementById('cartItemsContainer');
    const mainCartView = document.querySelector('.cart-main');
    const emptyCartView = document.getElementById('emptyCart');

    // This check prevents the error
    if (!mainCartView || !emptyCartView) return;

    if (!cart || cart.length === 0) {
        mainCartView.style.display = 'none';
        emptyCartView.style.display = 'block';
    } else {
        mainCartView.style.display = 'block';
        emptyCartView.style.display = 'none';
        // Your code to render items goes here
    }
}

// --- Main Execution Logic ---

// Listen for the signal from main.js that the store is 100% ready
document.addEventListener('storeInitialized', renderCartPage);

// Also, refresh the cart whenever it's updated
document.addEventListener('cartUpdated', renderCartPage);

// Run once when the DOM is ready as a fallback
document.addEventListener('DOMContentLoaded', renderCartPage);