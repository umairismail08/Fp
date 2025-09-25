// Orders page functionality
class OrdersPage {
    constructor() {
        this.currentTab = 'all';
        this.orders = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.initTabs();
        this.highlightOrder();
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Order actions
        document.addEventListener('click', (e) => {
            const orderId = e.target.closest('[data-order-id]')?.dataset.orderId;
            
            if (e.target.matches('.track-order-btn') && orderId) {
                this.trackOrder(orderId);
            } else if (e.target.matches('.reorder-btn') && orderId) {
                this.reorderItems(orderId);
            } else if (e.target.matches('.cancel-order-btn') && orderId) {
                this.cancelOrder(orderId);
            } else if (e.target.matches('.view-details-btn') && orderId) {
                this.viewOrderDetails(orderId);
            }
        });

        // Order modal
        const orderModal = document.getElementById('orderModal');
        const closeModal = document.getElementById('closeOrderModal');
        
        if (closeModal && orderModal) {
            closeModal.addEventListener('click', () => {
                orderModal.classList.remove('show');
            });
        }

        if (orderModal) {
            orderModal.addEventListener('click', (e) => {
                if (e.target === orderModal) {
                    orderModal.classList.remove('show');
                }
            });
        }
    }

    initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            if (tab.dataset.tab === this.currentTab) {
                tab.classList.add('active');
            }
        });
    }

    loadOrders() {
        this.orders = window.store.orders;
        this.renderOrders();
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        this.renderOrders();
    }

    getFilteredOrders() {
        switch (this.currentTab) {
            case 'current':
                return this.orders.filter(order => 
                    ['processing', 'shipped', 'out-for-delivery'].includes(order.status)
                );
            case 'delivered':
                return this.orders.filter(order => order.status === 'delivered');
            case 'cancelled':
                return this.orders.filter(order => order.status === 'cancelled');
            case 'all':
            default:
                return this.orders;
        }
    }

    renderOrders() {
        const container = document.getElementById('ordersContent');
        if (!container) return;

        const filteredOrders = this.getFilteredOrders();

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h2>No orders found</h2>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredOrders.map(order => this.generateOrderCard(order)).join('');
        
        // Add reveal animation
        const cards = container.querySelectorAll('.order-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-slideInUp');
        });
    }

    generateOrderCard(order) {
        const statusConfig = {
            'processing': { class: 'status-processing', icon: 'fas fa-clock' },
            'shipped': { class: 'status-shipped', icon: 'fas fa-truck' },
            'out-for-delivery': { class: 'status-shipped', icon: 'fas fa-motorcycle' },
            'delivered': { class: 'status-delivered', icon: 'fas fa-check-circle' },
            'cancelled': { class: 'status-cancelled', icon: 'fas fa-times-circle' }
        };

        const config = statusConfig[order.status] || statusConfig['processing'];
        const estimatedDelivery = order.estimatedDelivery ? 
            window.store.formatDate(order.estimatedDelivery) : 'TBD';

        return `
            <div class="order-card reveal" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.id}</h4>
                        <p>Placed on ${window.store.formatDate(order.createdAt)}</p>
                        <p>Estimated delivery: ${estimatedDelivery}</p>
                    </div>
                    <div class="order-status">
                        <span class="status ${config.class}">
                            <i class="${config.icon}"></i>
                            ${order.status.replace('-', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div class="order-tracking">
                    ${this.generateTrackingSteps(order.trackingSteps)}
                </div>
                
                <div class="order-items">
                    ${order.items.slice(0, 4).map(item => `
                        <div class="order-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                    `).join('')}
                    ${order.items.length > 4 ? `<div class="more-items">+${order.items.length - 4}</div>` : ''}
                </div>
                
                <div class="order-footer">
                    <div class="order-total">
                        Total: ${window.store.formatPrice(order.total)}
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-outline btn-small view-details-btn">View Details</button>
                        ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                            <button class="btn btn-outline btn-small track-order-btn">Track Order</button>
                        ` : ''}
                        ${order.status === 'delivered' ? `
                            <button class="btn btn-primary btn-small reorder-btn">Reorder</button>
                        ` : ''}
                        ${order.status === 'processing' ? `
                            <button class="btn btn-outline btn-small cancel-order-btn" style="color: var(--color-error);">Cancel</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    generateTrackingSteps(steps) {
        return `
            <div class="tracking-steps">
                ${steps.map(step => `
                    <div class="tracking-step ${step.completed ? 'completed' : ''} ${this.isCurrentStep(steps, step) ? 'current' : ''}">
                        <div class="step-icon ${step.completed ? 'completed' : ''} ${this.isCurrentStep(steps, step) ? 'current' : ''}">
                            <i class="${step.icon}"></i>
                        </div>
                        <div class="step-label ${step.completed ? 'completed' : ''} ${this.isCurrentStep(steps, step) ? 'current' : ''}">
                            ${step.name}
                            ${step.timestamp ? `<div class="step-time">${window.store.formatDate(step.timestamp)}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    isCurrentStep(steps, currentStep) {
        const completedSteps = steps.filter(step => step.completed);
        const nextStep = steps[completedSteps.length];
        return nextStep === currentStep;
    }

    trackOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        this.showOrderDetails(order, true);
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        this.showOrderDetails(order, false);
    }

    showOrderDetails(order, trackingFocus = false) {
        const modal = document.getElementById('orderModal');
        const modalBody = document.getElementById('orderModalBody');
        
        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="order-details">
                <div class="order-summary">
                    <h4>Order #${order.id}</h4>
                    <div class="order-meta">
                        <p><strong>Order Date:</strong> ${window.store.formatDate(order.createdAt)}</p>
                        <p><strong>Status:</strong> <span class="status status-${order.status}">${order.status.replace('-', ' ').toUpperCase()}</span></p>
                        <p><strong>Total:</strong> ${window.store.formatPrice(order.total)}</p>
                        ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${window.store.formatDate(order.estimatedDelivery)}</p>` : ''}
                    </div>
                </div>
                
                ${trackingFocus ? `
                    <div class="detailed-tracking">
                        <h4>Order Tracking</h4>
                        ${this.generateDetailedTracking(order.trackingSteps)}
                    </div>
                ` : ''}
                
                <div class="order-items-detail">
                    <h4>Items Ordered</h4>
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <img src="${item.image}" alt="${item.name}">
                                <div class="item-info">
                                    <h5>${item.name}</h5>
                                    <p>Quantity: ${item.quantity}</p>
                                    <p>Price: ${window.store.formatPrice(item.price)}</p>
                                </div>
                                <div class="item-total">
                                    ${window.store.formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${order.customerInfo ? `
                    <div class="delivery-info">
                        <h4>Delivery Information</h4>
                        <div class="delivery-details">
                            <p><strong>Name:</strong> ${order.customerInfo.fullName}</p>
                            <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
                            <p><strong>Address:</strong> ${order.customerInfo.address}</p>
                            <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="order-actions-detail">
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-primary reorder-btn">Reorder Items</button>
                        <button class="btn btn-outline">Leave Review</button>
                    ` : ''}
                    ${order.status === 'processing' ? `
                        <button class="btn btn-outline cancel-order-btn" style="color: var(--color-error);">Cancel Order</button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="orderPage.downloadInvoice('${order.id}')">Download Invoice</button>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    generateDetailedTracking(steps) {
        return `
            <div class="detailed-tracking-steps">
                ${steps.map((step, index) => `
                    <div class="tracking-step-detail ${step.completed ? 'completed' : ''} ${this.isCurrentStep(steps, step) ? 'current' : ''}">
                        <div class="step-connector ${index === 0 ? 'first' : ''} ${index === steps.length - 1 ? 'last' : ''}"></div>
                        <div class="step-icon ${step.completed ? 'completed' : ''} ${this.isCurrentStep(steps, step) ? 'current' : ''}">
                            <i class="${step.icon}"></i>
                        </div>
                        <div class="step-content">
                            <h5>${step.name}</h5>
                            ${step.timestamp ? `
                                <p class="step-timestamp">${new Date(step.timestamp).toLocaleDateString()} at ${new Date(step.timestamp).toLocaleTimeString()}</p>
                            ` : ''}
                            ${step.description ? `<p class="step-description">${step.description}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    reorderItems(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Add all items from the order to cart
        order.items.forEach(item => {
            const currentProduct = window.store.products.find(p => p.id === item.id);
            if (currentProduct && currentProduct.stock > 0) {
                window.store.addToCart(item.id, Math.min(item.quantity, currentProduct.stock));
            }
        });

        window.store.showToast('Items added to cart!', 'success');
        
        // Redirect to cart after a delay
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1500);
    }

    cancelOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const confirmCancel = confirm('Are you sure you want to cancel this order?');
        if (confirmCancel) {
            window.store.updateOrderStatus(orderId, 'cancelled');
            this.orders = window.store.orders;
            this.renderOrders();
            window.store.showToast('Order cancelled successfully', 'success');
        }
    }

    highlightOrder() {
        const urlParams = new URLSearchParams(window.location.search);
        const highlightId = urlParams.get('highlight');
        
        if (highlightId) {
            setTimeout(() => {
                const orderCard = document.querySelector(`[data-order-id="${highlightId}"]`);
                if (orderCard) {
                    orderCard.style.background = 'var(--primary-50)';
                    orderCard.style.border = '2px solid var(--color-primary)';
                    orderCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        orderCard.style.background = '';
                        orderCard.style.border = '';
                    }, 3000);
                }
            }, 500);
        }
    }

    // Download invoice
    downloadInvoice(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Generate simple text invoice
        const invoice = this.generateInvoiceText(order);
        const blob = new Blob([invoice], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `FreshMart-Invoice-${order.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.store.showToast('Invoice downloaded successfully', 'success');
    }

    generateInvoiceText(order) {
        return `
FRESHMART INVOICE
================

Order ID: #${order.id}
Order Date: ${window.store.formatDate(order.createdAt)}
Status: ${order.status.toUpperCase()}

CUSTOMER INFORMATION
-------------------
${order.customerInfo ? `
Name: ${order.customerInfo.fullName}
Email: ${order.customerInfo.email}
Phone: ${order.customerInfo.phone}
Address: ${order.customerInfo.address}
` : 'Customer information not available'}

ITEMS ORDERED
-------------
${order.items.map(item => 
    `${item.name} x${item.quantity} - ${window.store.formatPrice(item.price * item.quantity)}`
).join('\n')}

SUMMARY
-------
Subtotal: ${window.store.formatPrice(order.total)}
Total: ${window.store.formatPrice(order.total)}

Thank you for shopping with FreshMart!
Visit us at freshmart.com
        `;
    }

    // Filter orders by date range
    filterByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });
    }

    // Export orders data
    exportOrders() {
        const data = this.orders.map(order => ({
            id: order.id,
            date: order.createdAt,
            status: order.status,
            total: order.total,
            itemCount: order.items.length
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'freshmart-orders.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row => 
            headers.map(header => `"${row[header]}"`).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Real-time order updates simulation
    initRealTimeUpdates() {
        // Simulate real-time order status updates
        setInterval(() => {
            this.orders.forEach(order => {
                if (order.status === 'processing' && Math.random() < 0.1) {
                    window.store.updateOrderStatus(order.id, 'shipped');
                    this.orders = window.store.orders;
                    this.renderOrders();
                    window.store.showToast(`Order #${order.id} has been shipped!`, 'success');
                } else if (order.status === 'shipped' && Math.random() < 0.1) {
                    window.store.updateOrderStatus(order.id, 'out-for-delivery');
                    this.orders = window.store.orders;
                    this.renderOrders();
                    window.store.showToast(`Order #${order.id} is out for delivery!`, 'success');
                }
            });
        }, 30000); // Check every 30 seconds
    }
}

// Initialize orders page
let orderPage;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('orders.html')) {
        orderPage = new OrdersPage();
    }
});

// Make orderPage globally accessible
window.orderPage = orderPage;