(() => {
    const API_BASE = 'https://restaurant-demo-5m96.onrender.com/api/v1';
    const modal = document.getElementById('liveMenuModal');
    if (!modal) return;

    const status = document.getElementById('liveMenuStatus');
    const categoryFilter = document.getElementById('liveMenuCategory');
    const subcategoryFilter = document.getElementById('liveMenuSubcategory');
    const searchInput = document.getElementById('liveMenuSearch');
    const itemsContainer = document.getElementById('liveMenuItems');
    const cartContainer = document.getElementById('liveCartItems');
    const cartCount = document.getElementById('liveCartCount');
    const cartTotal = document.getElementById('liveCartTotal');
    const orderForm = document.getElementById('liveOrderForm');
    const sendButton = document.getElementById('sendLiveOrderBtn');
    let menu = [];
    let cart = [];

    const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
    const money = value => '₹' + Number(value || 0).toFixed(2);
    const setStatus = (message, type) => {
        status.textContent = message;
        status.className = 'live-menu-status ' + (type || '');
    };
    const openModal = async () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        if (menu.length) return;
        setStatus('Loading live menu…', 'pending');
        try {
            const response = await fetch(API_BASE + '/menu/current');
            if (!response.ok) throw new Error('Menu request failed (' + response.status + ')');
            menu = (await response.json()).filter(item => item.active !== false);
            populateFilters();
            renderMenu();
            renderCart();
            setStatus(menu.length ? '' : 'The live menu is empty.');
        } catch (error) {
            setStatus(error.message + '. Please try again later.', 'error');
        }
    };
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    };
    const populateFilters = () => {
        const categories = [...new Set(menu.map(item => item.category).filter(Boolean))].sort();
        categoryFilter.innerHTML = '<option value="ALL">All categories</option>' +
            categories.map(value => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
        updateSubcategories();
    };
    const updateSubcategories = () => {
        const category = categoryFilter.value;
        const values = [...new Set(menu
            .filter(item => category === 'ALL' || item.category === category)
            .map(item => item.subcategory).filter(Boolean))].sort();
        const current = subcategoryFilter.value;
        subcategoryFilter.innerHTML = '<option value="ALL">All subcategories</option>' +
            values.map(value => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
        if (values.includes(current)) subcategoryFilter.value = current;
    };
    const renderMenu = () => {
        const category = categoryFilter.value;
        const subcategory = subcategoryFilter.value;
        const query = searchInput.value.trim().toLowerCase();
        const filtered = menu.filter(item =>
            (category === 'ALL' || item.category === category) &&
            (subcategory === 'ALL' || item.subcategory === subcategory) &&
            (!query || [item.name, item.category, item.subcategory].some(value => String(value || '').toLowerCase().includes(query)))
        );
        if (!filtered.length) {
            itemsContainer.innerHTML = '<p class="live-menu-empty">No menu items match your filters.</p>';
            return;
        }
        itemsContainer.innerHTML = filtered.map(item => {
            const fullPrice = item.offerPriceFull != null ? item.offerPriceFull : item.priceFull;
            const halfPrice = item.offerPriceHalf != null ? item.offerPriceHalf : item.priceHalf;
            return '<article class="live-menu-card" data-id="' + Number(item.id) + '" data-source="' + escapeHtml(item.source) + '">' +
                '<div class="live-menu-card-heading"><div><span class="live-menu-category">' + escapeHtml(item.category) + '</span>' +
                (item.subcategory ? '<span class="live-menu-subcategory">' + escapeHtml(item.subcategory) + '</span>' : '') + '</div>' +
                '<h4>' + escapeHtml(item.name) + '</h4></div>' +
                '<div class="live-menu-prices">' +
                '<span>Full <strong>' + money(fullPrice) + '</strong>' + (item.offerPriceFull != null ? '<small>' + money(item.priceFull) + '</small>' : '') + '</span>' +
                '<span>Half <strong>' + (halfPrice != null ? money(halfPrice) : '—') + '</strong>' + (item.offerPriceHalf != null ? '<small>' + money(item.priceHalf) + '</small>' : '') + '</span></div>' +
                (item.offerLabel ? '<div class="live-menu-offer">' + escapeHtml(item.offerLabel) + '</div>' : '') +
                '<div class="live-menu-add-row"><select class="live-portion" aria-label="Portion for ' + escapeHtml(item.name) + '">' +
                '<option value="FULL">Full</option><option value="HALF" ' + (item.priceHalf == null ? 'disabled' : '') + '>Half</option></select>' +
                '<input class="live-quantity" type="number" min="1" value="1" aria-label="Quantity for ' + escapeHtml(item.name) + '">' +
                '<button type="button" class="btn live-add-button">Add to Cart</button></div></article>';
        }).join('');
    };
    const renderCart = () => {
        const count = cart.reduce((sum, line) => sum + line.quantity, 0);
        const total = cart.reduce((sum, line) => {
            const item = menu.find(candidate => candidate.id === line.menuItemId && candidate.source === line.menuItemSource);
            const price = line.portion === 'FULL' ? (item && (item.offerPriceFull != null ? item.offerPriceFull : item.priceFull)) : (item && (item.offerPriceHalf != null ? item.offerPriceHalf : item.priceHalf));
            return sum + Number(price || 0) * line.quantity;
        }, 0);
        cartCount.textContent = '(' + count + ' ' + (count === 1 ? 'item' : 'items') + ')';
        cartTotal.textContent = money(total);
        sendButton.disabled = cart.length === 0;
        if (!cart.length) {
            cartContainer.innerHTML = '<p class="live-menu-empty">Your cart is empty.</p>';
            return;
        }
        cartContainer.innerHTML = cart.map((line, index) => {
            const item = menu.find(candidate => candidate.id === line.menuItemId && candidate.source === line.menuItemSource);
            if (!item) return '';
            const price = line.portion === 'FULL' ? (item.offerPriceFull != null ? item.offerPriceFull : item.priceFull) : (item.offerPriceHalf != null ? item.offerPriceHalf : item.priceHalf);
            return '<div class="live-cart-line" data-index="' + index + '">' +
                '<div><strong>' + escapeHtml(item.name) + '</strong><small>' + (line.portion === 'FULL' ? 'Full' : 'Half') + ' · ' + money(price) + ' each</small></div>' +
                '<input class="live-cart-quantity" type="number" min="1" value="' + line.quantity + '" aria-label="Quantity for ' + escapeHtml(item.name) + '">' +
                '<strong>' + money(Number(price || 0) * line.quantity) + '</strong>' +
                '<button type="button" class="live-remove-button" aria-label="Remove ' + escapeHtml(item.name) + '">&times;</button></div>';
        }).join('');
    };

    document.querySelectorAll('#getLiveMenuBtn, #registerTrainingBtn').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        openModal();
    }));
    document.getElementById('closeLiveMenuBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    categoryFilter.addEventListener('change', () => { updateSubcategories(); renderMenu(); });
    subcategoryFilter.addEventListener('change', renderMenu);
    searchInput.addEventListener('input', renderMenu);
    itemsContainer.addEventListener('click', event => {
        const button = event.target.closest('.live-add-button');
        if (!button) return;
        const card = button.closest('.live-menu-card');
        const item = menu.find(candidate => candidate.id === Number(card.dataset.id) && candidate.source === card.dataset.source);
        const portion = card.querySelector('.live-portion').value;
        const quantity = Math.max(1, parseInt(card.querySelector('.live-quantity').value, 10) || 1);
        if (!item) return;
        const existing = cart.find(line => line.menuItemId === item.id && line.menuItemSource === item.source && line.portion === portion);
        if (existing) existing.quantity += quantity;
        else cart.push({ menuItemId: item.id, menuItemSource: item.source, portion, quantity });
        renderCart();
        setStatus(item.name + ' added to your cart.', 'success');
    });
    cartContainer.addEventListener('change', event => {
        if (!event.target.matches('.live-cart-quantity')) return;
        const index = Number(event.target.closest('.live-cart-line').dataset.index);
        cart[index].quantity = Math.max(1, parseInt(event.target.value, 10) || 1);
        renderCart();
    });
    cartContainer.addEventListener('click', event => {
        if (!event.target.closest('.live-remove-button')) return;
        const index = Number(event.target.closest('.live-cart-line').dataset.index);
        cart.splice(index, 1);
        renderCart();
    });
    orderForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!cart.length) return;
        sendButton.disabled = true;
        sendButton.textContent = 'Sending…';
        setStatus('Sending your order…', 'pending');
        try {
            const response = await fetch(API_BASE + '/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: document.getElementById('liveCustomerName').value.trim() || null,
                    customerPhone: document.getElementById('liveCustomerPhone').value.trim() || null,
                    items: cart.map(line => {
                        const item = menu.find(candidate => candidate.id === line.menuItemId && candidate.source === line.menuItemSource);
                        const offerPrice = line.portion === 'FULL' ? item && item.offerPriceFull : item && item.offerPriceHalf;
                        return { ...line, useOffer: offerPrice != null };
                    })
                })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || result.error || 'Order request failed (' + response.status + ')');
            cart = [];
            orderForm.reset();
            renderCart();
            setStatus('Thanks! Your order #' + result.id + ' has been sent.', 'success');
        } catch (error) {
            setStatus(error.message + '. Please try again.', 'error');
        } finally {
            sendButton.disabled = cart.length === 0;
            sendButton.textContent = 'Send Order';
        }
    });
})();