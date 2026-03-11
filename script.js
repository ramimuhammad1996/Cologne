const products = [
  { id: 1, name: 'Noir Ember', inspiredBy: 'Tom Ford Ombre Leather', collection: 'woody', price: 42, notes: 'Cardamom, leather, amber', strength: 'Extrait' },
  { id: 2, name: 'Aqua Voltage', inspiredBy: 'Bleu de Chanel', collection: 'fresh', price: 36, notes: 'Citrus zest, incense, cedar', strength: 'EDP' },
  { id: 3, name: 'Midnight Saffron', inspiredBy: 'Baccarat Rouge 540', collection: 'sweet', price: 49, notes: 'Saffron, amberwood, jasmine', strength: 'Extrait' },
  { id: 4, name: 'Spice Regent', inspiredBy: 'Spicebomb Extreme', collection: 'spicy', price: 38, notes: 'Vanilla, tobacco, black pepper', strength: 'EDP' },
  { id: 5, name: 'Pine Royale', inspiredBy: 'Creed Aventus', collection: 'fresh', price: 45, notes: 'Pineapple, birch, musk', strength: 'Extrait' },
  { id: 6, name: 'Velvet Oud', inspiredBy: 'Dior Sauvage Elixir', collection: 'woody', price: 47, notes: 'Lavender, cinnamon, oud', strength: 'EDP' },
  { id: 7, name: 'Azure Suit', inspiredBy: 'YSL Y EDP', collection: 'fresh', price: 34, notes: 'Apple, ginger, amberwood', strength: 'EDP' },
  { id: 8, name: 'Golden Smoke', inspiredBy: 'Initio Side Effect', collection: 'spicy', price: 52, notes: 'Rum, tobacco, vanilla', strength: 'Extrait' }
];

const collectionFilter = document.getElementById('collectionFilter');
const priceFilter = document.getElementById('priceFilter');
const priceValue = document.getElementById('priceValue');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const resetFilters = document.getElementById('resetFilters');
const productGrid = document.getElementById('productGrid');
const resultsCount = document.getElementById('resultsCount');

const cartPanel = document.getElementById('cartPanel');
const cartButton = document.getElementById('cartButton');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const clearCart = document.getElementById('clearCart');
const demoButton = document.getElementById('demoButton');
const cartOverlay = document.getElementById('cartOverlay');

const cart = [];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 1600);
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function filteredProducts() {
  const maxPrice = Number(priceFilter.value);
  const collection = collectionFilter.value;
  const search = searchInput.value.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const collectionMatch = collection === 'all' || product.collection === collection;
    const priceMatch = product.price <= maxPrice;
    const searchMatch = [product.name, product.inspiredBy].join(' ').toLowerCase().includes(search);
    return collectionMatch && priceMatch && searchMatch;
  });

  const sortBy = sortSelect.value;
  const sorters = {
    featured: (a, b) => a.id - b.id,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'name-asc': (a, b) => a.name.localeCompare(b.name)
  };

  return filtered.sort(sorters[sortBy]);
}

function renderProducts() {
  const filtered = filteredProducts();
  resultsCount.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;

  if (!filtered.length) {
    productGrid.innerHTML = '<div class="empty-state">No products match your filters. Try reset.</div>';
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (product) => `
      <article class="product-card">
        <span class="badge">Inspired by ${product.inspiredBy}</span>
        <h4>${product.name}</h4>
        <p>${product.notes} • ${product.strength}</p>
        <div class="price-row">
          <strong class="product-price">${formatCurrency(product.price)}</strong>
          <button class="add-btn" data-id="${product.id}">Add</button>
        </div>
      </article>
    `
    )
    .join('');
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty. Add a scent to begin.</div>';
    cartCount.textContent = '0';
    cartTotal.textContent = formatCurrency(0);
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item">
        <div>
          <h5>${item.name}</h5>
          <p>${formatCurrency(item.price)} each</p>
        </div>
        <div>
          <div class="qty-row">
            <button class="qty-btn" data-action="decrement" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="increment" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <strong>${formatCurrency(item.price * item.qty)}</strong>
        </div>
      </article>
    `
    )
    .join('');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  cartCount.textContent = String(totalQty);
  cartTotal.textContent = formatCurrency(totalPrice);
}

function openCart() {
  cartPanel.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
  cartOverlay.classList.add('open');
  cartOverlay.setAttribute('aria-hidden', 'false');
}

function closeCartPanel() {
  cartPanel.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
  cartOverlay.classList.remove('open');
  cartOverlay.setAttribute('aria-hidden', 'true');
}

function clearCartItems() {
  if (!cart.length) {
    showToast('Cart is already empty');
    return;
  }

  cart.length = 0;
  renderCart();
  showToast('Cart cleared');
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  showToast(`${product.name} added to cart`);
  renderCart();
}

function updateCartQuantity(productId, mode) {
  const existing = cart.find((item) => item.id === productId);
  if (!existing) return;

  if (mode === 'increment') {
    existing.qty += 1;
  } else {
    existing.qty -= 1;
  }

  if (existing.qty <= 0) {
    const index = cart.findIndex((item) => item.id === productId);
    cart.splice(index, 1);
  }

  renderCart();
}

function resetAllFilters() {
  collectionFilter.value = 'all';
  priceFilter.value = '80';
  priceValue.textContent = '$80';
  sortSelect.value = 'featured';
  searchInput.value = '';
  renderProducts();
}

async function runDemo() {
  resetAllFilters();
  closeCartPanel();
  cart.length = 0;
  renderCart();
  showToast('Running demo...');

  collectionFilter.value = 'fresh';
  renderProducts();
  await wait(350);

  searchInput.value = 'aventus';
  renderProducts();
  await wait(350);

  searchInput.value = '';
  sortSelect.value = 'price-desc';
  renderProducts();
  await wait(350);

  addToCart(5);
  await wait(250);
  addToCart(2);
  await wait(250);
  addToCart(2);
  await wait(250);

  openCart();
  showToast('Demo complete. Try filters and cart controls.');
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (isDark) {
    root.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

collectionFilter.addEventListener('change', renderProducts);
searchInput.addEventListener('input', renderProducts);
sortSelect.addEventListener('change', renderProducts);
resetFilters.addEventListener('click', resetAllFilters);

priceFilter.addEventListener('input', () => {
  priceValue.textContent = formatCurrency(Number(priceFilter.value));
  renderProducts();
});

productGrid.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  addToCart(Number(target.dataset.id));
});

cartItems.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  updateCartQuantity(Number(target.dataset.id), target.dataset.action);
});

cartButton.addEventListener('click', () => {
  openCart();
});

closeCart.addEventListener('click', () => {
  closeCartPanel();
});

cartOverlay.addEventListener('click', closeCartPanel);
clearCart.addEventListener('click', clearCartItems);
demoButton.addEventListener('click', runDemo);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCartPanel();
});

themeToggle.addEventListener('click', toggleTheme);

loadTheme();
priceValue.textContent = formatCurrency(Number(priceFilter.value));
renderProducts();
renderCart();
