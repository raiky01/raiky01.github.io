// Paginaweb/script.js

// ── CARRITO ──────────────────────────────────────────────────────────────────

const Cart = {
  _items: [],

  load() {
    try {
      this._items = JSON.parse(localStorage.getItem('raiky_cart') || '[]');
    } catch { this._items = []; }
    return this;
  },

  save() {
    localStorage.setItem('raiky_cart', JSON.stringify(this._items));
    this._emit();
  },

  add(product) {
    const existing = this._items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this._items.push({ ...product, qty: 1 });
    }
    this.save();
  },

  remove(productId) {
    this._items = this._items.filter(i => i.id !== productId);
    this.save();
  },

  setQty(productId, qty) {
    if (qty <= 0) { this.remove(productId); return; }
    const item = this._items.find(i => i.id === productId);
    if (item) { item.qty = qty; this.save(); }
  },

  clear() {
    this._items = [];
    this.save();
  },

  get items() { return this._items; },
  get count() { return this._items.reduce((s, i) => s + i.qty, 0); },
  get total() { return this._items.reduce((s, i) => s + i.price * i.qty, 0); },

  _listeners: [],
  onChange(fn) { this._listeners.push(fn); },
  _emit() { this._listeners.forEach(fn => fn(this)); }
};

// ── TOAST ────────────────────────────────────────────────────────────────────

function showToast(msg, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast' + (type === 'error' ? ' error' : '');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── WHATSAPP ─────────────────────────────────────────────────────────────────

function buildWhatsAppMessage(order, config) {
  const itemLines = order.items.map(i => `  • ${i.name} x${i.qty} — $${i.price * i.qty}`).join('\n');
  const msg = [
    `🍕 *NUEVO PEDIDO — Raiky Pizza*`,
    `ID: #${order.id.slice(-6).toUpperCase()}`,
    ``,
    `*Cliente:* ${order.customer.name}`,
    `*Teléfono:* ${order.customer.phone}`,
    `*Dirección:* ${order.customer.address}`,
    ``,
    `*Productos:*`,
    itemLines,
    ``,
    `*Envío:* $${config.deliveryFee}`,
    `*TOTAL: $${order.total + config.deliveryFee}*`,
  ].join('\n');
  return encodeURIComponent(msg);
}

function openWhatsApp(order, config) {
  const number = config.whatsappNumber.replace(/\D/g, '');
  const msg = buildWhatsAppMessage(order, config);
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function formatPrice(n) { return `$${n.toFixed(0)}`; }

function categoryIcon(cat) {
  return { pizza: '🍕', taco: '🌮', bebida: '🥤', otro: '🛍️' }[cat] || '🍽️';
}

function statusLabel(status) {
  return {
    nuevo: 'Nuevo',
    preparando: 'Preparando',
    en_camino: 'En camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  }[status] || status;
}
