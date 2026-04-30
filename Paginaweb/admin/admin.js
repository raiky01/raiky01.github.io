// Paginaweb/admin/admin.js
import { FirebaseService } from '../data/firebase-service.js';

// ── AUTH GUARD ────────────────────────────────────────────────────────────────

FirebaseService.onAuthChange(user => {
  if (!user) window.location.href = 'login.html';
});

// ── HELPERS ───────────────────────────────────────────────────────────────────

function statusLabel(status) {
  return { nuevo:'Nuevo', preparando:'Preparando', en_camino:'En camino', entregado:'Entregado', cancelado:'Cancelado' }[status] || status;
}

function showAdminToast(msg, type = 'info') {
  let t = document.getElementById('admin-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'admin-toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── TABS ──────────────────────────────────────────────────────────────────────

window.showTab = function(tab) {
  ['pedidos','menu','config'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? 'block' : 'none';
    const navBtn = document.getElementById(`nav-${t}`);
    if (navBtn) navBtn.classList.toggle('active', t === tab);
  });
  if (tab === 'menu') loadMenu();
  if (tab === 'config') loadConfig();
};

window.logout = async function() {
  await FirebaseService.logoutAdmin();
  window.location.href = 'login.html';
};

// ── PEDIDOS EN TIEMPO REAL ────────────────────────────────────────────────────

const STATUS_NEXT = {
  nuevo: 'preparando',
  preparando: 'en_camino',
  en_camino: 'entregado',
};

const STATUS_BTN = {
  nuevo:      { label: '✅ Aceptar',        cls: 'btn-aceptar' },
  preparando: { label: '🛵 Enviar a domicilio', cls: 'btn-camino' },
  en_camino:  { label: '🎉 Marcar entregado', cls: 'btn-entregar' },
};

function ordersToday(orders) {
  const today = new Date().toDateString();
  return orders.filter(o => {
    const d = o.createdAt?.toDate?.();
    return d && d.toDateString() === today;
  });
}

FirebaseService.listenToOrders(orders => {
  const today = ordersToday(orders);
  const active = orders.filter(o => ['nuevo','preparando','en_camino'].includes(o.status));
  const revenue = today.filter(o => o.status === 'entregado').reduce((s, o) => s + (o.total || 0), 0);

  document.getElementById('stat-today').textContent = today.length;
  document.getElementById('stat-revenue').textContent = `$${revenue}`;
  document.getElementById('stat-active').textContent = active.length;

  const list = document.getElementById('orders-list');
  if (!orders.length) {
    list.innerHTML = '<div style="color:var(--texto-suave);padding:20px;">No hay pedidos aún.</div>';
    return;
  }

  list.innerHTML = '';
  orders.forEach(o => {
    const card = document.createElement('div');
    card.className = `order-card ${o.status}`;

    const time = o.createdAt?.toDate?.()?.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' }) || '';
    const nextStatus = STATUS_NEXT[o.status];
    const nextBtn = STATUS_BTN[o.status];
    const itemsText = (o.items || []).map(i => `${i.name} x${i.qty}`).join(', ');

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div>
          <div class="order-id"></div>
          <div class="order-customer"></div>
          <div class="order-items"></div>
          <div class="order-address" style="font-size:12px;color:var(--texto-suave);"></div>
          <div class="order-phone" style="font-size:12px;color:var(--texto-suave);"></div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <span class="status-badge badge-${o.status}">${statusLabel(o.status)}</span>
          <div class="order-total" style="margin-top:6px;">$${o.total || 0}</div>
        </div>
      </div>
      <div class="order-actions">
        ${nextBtn ? `<button class="action-btn ${nextBtn.cls}" data-id="${o.id}" data-next="${nextStatus}">${nextBtn.label}</button>` : ''}
        ${o.status !== 'cancelado' && o.status !== 'entregado'
          ? `<button class="action-btn btn-cancelar" data-id="${o.id}" data-next="cancelado">❌ Cancelar</button>` : ''}
      </div>`;

    card.querySelector('.order-id').textContent = `#${o.id.slice(-6).toUpperCase()} · ${time}`;
    card.querySelector('.order-customer').textContent = o.customer?.name || 'Sin nombre';
    card.querySelector('.order-items').textContent = itemsText;
    card.querySelector('.order-address').textContent = `📍 ${o.customer?.address || ''}`;
    card.querySelector('.order-phone').textContent = `📞 ${o.customer?.phone || ''}`;

    card.querySelectorAll('.action-btn[data-next]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const next = btn.dataset.next;
        if (next === 'cancelado' && !confirm('¿Cancelar este pedido?')) return;
        try {
          await FirebaseService.updateOrderStatus(btn.dataset.id, next);
          showAdminToast(next === 'cancelado' ? 'Pedido cancelado' : `Estado: ${statusLabel(next)}`);
        } catch (e) { showAdminToast('Error al actualizar', 'error'); console.error(e); }
      });
    });

    list.appendChild(card);
  });
}, err => { console.error('Orders listener error:', err); });

// ── MENÚ ──────────────────────────────────────────────────────────────────────

async function loadMenu() {
  try {
    const products = await FirebaseService.getMenu();
    const list = document.getElementById('menu-list');
    list.innerHTML = '';
    products.forEach(p => {
      const row = document.createElement('div');
      row.style.cssText = 'background:white;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:var(--sombra);display:flex;justify-content:space-between;align-items:center;gap:12px;';
      row.innerHTML = `
        <div style="flex:1;">
          <div class="product-name" style="font-weight:700;color:var(--azul);"></div>
          <div class="product-meta" style="font-size:12px;color:var(--texto-suave);"></div>
          <div class="product-desc-text" style="font-size:11px;color:var(--texto-suave);margin-top:2px;"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" class="chk-available" ${p.available !== false ? 'checked' : ''}> Disponible
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" class="chk-featured" ${p.featured ? 'checked' : ''}> ⭐ Popular
          </label>
          <button class="action-btn btn-aceptar" style="font-size:11px;" data-id="${p.id}" data-price="${p.price}">💲 Precio</button>
        </div>`;

      row.querySelector('.product-name').textContent = p.name;
      row.querySelector('.product-meta').textContent = `${p.category} · $${p.price}`;
      row.querySelector('.product-desc-text').textContent = p.description || '';

      row.querySelector('.chk-available').addEventListener('change', async e => {
        await FirebaseService.updateProduct(p.id, { available: e.target.checked });
        showAdminToast(e.target.checked ? 'Producto activado' : 'Producto desactivado');
      });
      row.querySelector('.chk-featured').addEventListener('change', async e => {
        await FirebaseService.updateProduct(p.id, { featured: e.target.checked });
        showAdminToast('Guardado');
      });
      row.querySelector('[data-price]').addEventListener('click', async () => {
        const newPrice = prompt(`Nuevo precio para ${p.name} (actual: $${p.price}):`, p.price);
        if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) return;
        await FirebaseService.updateProduct(p.id, { price: Number(newPrice) });
        showAdminToast(`Precio actualizado: $${newPrice}`);
        row.querySelector('.product-meta').textContent = `${p.category} · $${newPrice}`;
      });

      list.appendChild(row);
    });
  } catch(e) { console.error(e); }
}

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

async function loadConfig() {
  try {
    const cfg = await FirebaseService.getConfig();
    const form = document.getElementById('config-form');
    form.innerHTML = `
      <div style="background:white;border-radius:12px;padding:20px;box-shadow:var(--sombra);display:flex;flex-direction:column;gap:16px;max-width:400px;">

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:${cfg.isOpen ? '#d1fae5' : '#fee2e2'};border-radius:8px;">
          <span style="font-weight:700;color:${cfg.isOpen ? '#065f46' : '#b91c1c'};">${cfg.isOpen ? '🟢 Pizzería ABIERTA' : '🔴 Pizzería CERRADA'}</span>
          <button class="action-btn ${cfg.isOpen ? 'btn-cancelar' : 'btn-entregar'}" id="toggle-open-btn">${cfg.isOpen ? 'Cerrar' : 'Abrir'}</button>
        </div>

        <div class="form-group">
          <label class="form-label">WhatsApp del negocio</label>
          <input class="form-input" id="cfg-whatsapp" value="${cfg.whatsappNumber || ''}" placeholder="529811234567" maxlength="20">
        </div>
        <div class="form-group">
          <label class="form-label">Costo de envío ($)</label>
          <input class="form-input" id="cfg-delivery" type="number" min="0" value="${cfg.deliveryFee ?? 30}">
        </div>
        <div class="form-group">
          <label class="form-label">Pedido mínimo ($)</label>
          <input class="form-input" id="cfg-min" type="number" min="0" value="${cfg.minOrder ?? 100}">
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--gris-bg);border-radius:8px;">
          <div>
            <div style="font-weight:700;font-size:14px;">Servicio a recoger en tienda</div>
            <div style="font-size:12px;color:var(--texto-suave);">Permite que los clientes recojan en tienda</div>
          </div>
          <input type="checkbox" id="cfg-pickup" ${cfg.pickupEnabled ? 'checked' : ''} style="width:20px;height:20px;cursor:pointer;">
        </div>

        <button class="btn-primary" id="save-config-btn">💾 Guardar cambios</button>
      </div>`;

    document.getElementById('toggle-open-btn').addEventListener('click', async () => {
      const newVal = !cfg.isOpen;
      await FirebaseService.updateConfig({ isOpen: newVal });
      showAdminToast(newVal ? '🟢 Pizzería abierta' : '🔴 Pizzería cerrada');
      loadConfig();
    });

    document.getElementById('save-config-btn').addEventListener('click', async () => {
      const btn = document.getElementById('save-config-btn');
      btn.disabled = true;
      try {
        await FirebaseService.updateConfig({
          whatsappNumber: document.getElementById('cfg-whatsapp').value.trim(),
          deliveryFee: Number(document.getElementById('cfg-delivery').value),
          minOrder: Number(document.getElementById('cfg-min').value),
          pickupEnabled: document.getElementById('cfg-pickup').checked,
        });
        showAdminToast('✅ Configuración guardada');
      } catch(e) {
        showAdminToast('Error guardando configuración', 'error');
        console.error(e);
      } finally {
        btn.disabled = false;
      }
    });
  } catch(e) { console.error(e); }
}
