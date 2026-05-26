// ============================================================
// NEKO — Catálogo Público (index.html) v2
// ============================================================

let productos = [];
const grid = document.getElementById('productGrid');
const filterCategory = document.getElementById('filterCategory');
const filterSort = document.getElementById('filterSort');
const productCount = document.getElementById('productCount');

// ---------- RENDER ----------
function renderProductos(lista) {
  if (productCount) {
    productCount.textContent = `${lista.length} ${lista.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'}`;
  }

  if (!lista.length) {
    grid.innerHTML = '<p class="catalog__loading">No hay productos disponibles.</p>';
    return;
  }

  grid.innerHTML = lista.map(p => `
    <div class="product-card">
      <div class="product-card__img-wrap">
        <img
          src="${p.imagenURL || 'img/placeholder.png'}"
          alt="${p.nombre}"
          class="product-card__img"
          loading="lazy"
          onerror="this.src='img/placeholder.png'"
        />
        <div class="product-card__badge-wrap">
          ${p.destacado ? '<span class="product-card__badge">Destacado</span>' : ''}
        </div>
      </div>
      <div class="product-card__body">
        ${p.categoria ? `<p class="product-card__cat">${p.categoria}</p>` : ''}
        <h3 class="product-card__name">${p.nombre}</h3>
        <p class="product-card__desc">${p.descripcion || ''}</p>
        <div class="product-card__footer">
          <span class="product-card__price">$${Number(p.precio).toFixed(2)}</span>
          ${p.tallas?.length ? `
            <div class="product-card__tallas">
              ${p.tallas.map(t => `<span class="product-card__talla">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ---------- FILTRAR + ORDENAR ----------
function filtrarYOrdenar() {
  const cat = filterCategory.value;
  const sort = filterSort.value;
  let filtered = [...productos];

  if (cat !== 'all') filtered = filtered.filter(p => p.categoria === cat);

  switch (sort) {
    case 'price-asc': filtered.sort((a, b) => a.precio - b.precio); break;
    case 'price-desc': filtered.sort((a, b) => b.precio - a.precio); break;
    case 'name': filtered.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
  }

  renderProductos(filtered);
}

// ---------- INIT ----------
async function init() {
  try {
    productos = await getProductos();
    filtrarYOrdenar();
  } catch (err) {
    console.error('Error cargando productos:', err);
    grid.innerHTML = '<p class="catalog__loading">Error al cargar productos.</p>';
  }
}

filterCategory.addEventListener('change', filtrarYOrdenar);
filterSort.addEventListener('change', filtrarYOrdenar);
init();
