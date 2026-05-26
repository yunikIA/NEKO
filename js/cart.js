// ============================================================
// NEKO — Carrito de compras + WhatsApp Checkout
// ============================================================

const CART_KEY = 'neko_cart';

// ---------- OBTENER CARRITO ----------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// ---------- GUARDAR CARRITO ----------
function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCartCount();
  renderCartSidebar();
}

// ---------- AGREGAR ITEM ----------
function addToCart(producto, talla, cantidad = 1) {
  let items = getCart();
  const idx = items.findIndex(i => i.id === producto.id && i.talla === talla);

  if (idx !== -1) {
    items[idx].cantidad += cantidad;
  } else {
    items.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenURL: producto.imagenURL || '',
      talla: talla || 'Única',
      cantidad
    });
  }

  saveCart(items);
  abrirCartSidebar();
}

// ---------- QUITAR ITEM ----------
function removeFromCart(id, talla) {
  let items = getCart().filter(i => !(i.id === id && i.talla === talla));
  saveCart(items);
}

// ---------- CAMBIAR CANTIDAD ----------
function updateCantidad(id, talla, delta) {
  let items = getCart();
  const idx = items.findIndex(i => i.id === id && i.talla === talla);
  if (idx === -1) return;

  items[idx].cantidad += delta;
  if (items[idx].cantidad <= 0) {
    items.splice(idx, 1);
  }

  saveCart(items);
}

// ---------- VACIAR CARRITO ----------
function clearCart() {
  saveCart([]);
}

// ---------- TOTAL ----------
function getTotal() {
  return getCart().reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

// ---------- CONTADOR HEADER ----------
function renderCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  const total = getCart().reduce((s, i) => s + i.cantidad, 0);
  el.textContent = total;
}

// ---------- RENDER SIDEBAR ----------
function renderCartSidebar() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container || !totalEl) return;

  const items = getCart();

  if (!items.length) {
    container.innerHTML = '<p class="cart-sidebar__empty">Tu bolsa está vacía.</p>';
    totalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = items.map((item, i) => `
    <div class="cart-sidebar__item">
      <img
        src="${item.imagenURL || 'img/placeholder.png'}"
        alt="${item.nombre}"
        class="cart-sidebar__item-img"
        onerror="this.src='img/placeholder.png'"
      />
      <div class="cart-sidebar__item-info">
        <strong>${item.nombre}</strong>
        <span class="cart-sidebar__item-talla">Talle: ${item.talla}</span>
        <span class="cart-sidebar__item-precio">$${Number(item.precio).toFixed(2)}</span>
        <div class="cart-sidebar__item-cant">
          <button class="cart-sidebar__qty-btn" onclick="updateCantidad('${item.id}','${item.talla}',-1)">−</button>
          <span>${item.cantidad}</span>
          <button class="cart-sidebar__qty-btn" onclick="updateCantidad('${item.id}','${item.talla}',1)">+</button>
        </div>
      </div>
      <button class="cart-sidebar__item-remove" onclick="removeFromCart('${item.id}','${item.talla}')">&times;</button>
    </div>
  `).join('');

  totalEl.textContent = `$${getTotal().toFixed(2)}`;
}

// ---------- ABRIR / CERRAR SIDEBAR ----------
function abrirCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('open');
}

function cerrarCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ---------- CHECKOUT WHATSAPP ----------
function checkoutWhatsApp(numero) {
  const items = getCart();
  if (!items.length) {
    alert('Agregá productos a la bolsa primero.');
    return;
  }
  if (!numero) {
    alert('No hay número de WhatsApp configurado. El admin debe configurarlo en Contacto.');
    return;
  }

  const lineas = items.map((item, i) =>
    `${i + 1}. ${item.nombre} (${item.talla}) x${item.cantidad} — $${(item.precio * item.cantidad).toFixed(2)}`
  );

  const mensaje = encodeURIComponent(
    `🛍️ *Pedido NEKO*\n\n${lineas.join('\n')}\n\n💰 *Total: $${getTotal().toFixed(2)}*\n\n¡Gracias por tu compra!`
  );

  const limpio = numero.replace(/\D/g, '');
  window.open(`https://wa.me/${limpio}?text=${mensaje}`, '_blank');
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  renderCartCount();

  // Eventos sidebar
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartCheckout = document.getElementById('cartCheckout');

  if (cartToggle) cartToggle.addEventListener('click', abrirCartSidebar);
  if (cartClose) cartClose.addEventListener('click', cerrarCartSidebar);
  if (cartOverlay) cartOverlay.addEventListener('click', cerrarCartSidebar);

  if (cartCheckout) {
    cartCheckout.addEventListener('click', async () => {
      const contacto = await getContacto();
      checkoutWhatsApp(contacto.whatsapp || '');
    });
  }
});
