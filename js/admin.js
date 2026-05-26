// ============================================================
// NEKO — Admin Panel (admin.html)
// ============================================================

// ---- ELEMENTOS ----
const loginScreen = document.getElementById('adminLogin');
const dashboard = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const adminEmail = document.getElementById('adminEmail');

const tbody = document.getElementById('productsTableBody');
const addProductBtn = document.getElementById('addProductBtn');
const modal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const productForm = document.getElementById('productForm');
const formSubmitBtn = document.getElementById('formSubmitBtn');
const prodId = document.getElementById('prodId');
const prodNombre = document.getElementById('prodNombre');
const prodDescripcion = document.getElementById('prodDescripcion');
const prodPrecio = document.getElementById('prodPrecio');
const prodCategoria = document.getElementById('prodCategoria');
const prodImagen = document.getElementById('prodImagen');
const prodImagenFile = document.getElementById('prodImagenFile');
const prodDestacado = document.getElementById('prodDestacado');

const sidebarLinks = document.querySelectorAll('.admin-sidebar__link');
const tabs = document.querySelectorAll('.admin-tab');

// ---- SIDEBAR TABS ----
sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    sidebarLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    tabs.forEach(t => t.classList.remove('active'));
    document.getElementById('tab' + link.dataset.tab.charAt(0).toUpperCase() + link.dataset.tab.slice(1)).classList.add('active');
    if (link.dataset.tab === 'settings') renderEmails();
  });
});

// ---- MODAL ----
function openModal(editData) {
  if (editData) {
    modalTitle.textContent = 'Editar producto';
    formSubmitBtn.textContent = 'Guardar cambios';
    prodId.value = editData.id;
    prodNombre.value = editData.nombre;
    prodDescripcion.value = editData.descripcion || '';
    prodPrecio.value = editData.precio;
    prodCategoria.value = editData.categoria;
    prodImagen.value = editData.imagenURL || '';
    prodDestacado.checked = editData.destacado || false;
    // Tallas
    document.querySelectorAll('.talla-check').forEach(cb => {
      cb.checked = (editData.tallas || []).includes(cb.value);
    });
  } else {
    productForm.reset();
    prodId.value = '';
    modalTitle.textContent = 'Nuevo producto';
    formSubmitBtn.textContent = 'Guardar';
    document.querySelectorAll('.talla-check').forEach(cb => cb.checked = false);
  }
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
}

addProductBtn.addEventListener('click', () => openModal(null));
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target.classList.contains('modal__backdrop')) closeModal();
});

// ---- FORM SUBMIT ----
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tallas = [];
  document.querySelectorAll('.talla-check:checked').forEach(cb => tallas.push(cb.value));

  let imagenURL = prodImagen.value.trim();

  // Subir archivo si se seleccionó uno
  if (prodImagenFile.files[0]) {
    try {
      formSubmitBtn.textContent = 'Subiendo imagen...';
      formSubmitBtn.disabled = true;
      imagenURL = await uploadImagen(prodImagenFile.files[0]);
    } catch (err) {
      alert('Error al subir la imagen: ' + err.message);
      formSubmitBtn.textContent = 'Guardar';
      formSubmitBtn.disabled = false;
      return;
    }
  }

  const data = {
    nombre: prodNombre.value.trim(),
    descripcion: prodDescripcion.value.trim(),
    precio: parseFloat(prodPrecio.value),
    categoria: prodCategoria.value,
    tallas,
    imagenURL,
    destacado: prodDestacado.checked
  };

  try {
    formSubmitBtn.textContent = 'Guardando...';
    formSubmitBtn.disabled = true;

    if (prodId.value) {
      await updateProducto(prodId.value, data);
    } else {
      await addProducto(data);
    }

    closeModal();
    await renderTable();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    formSubmitBtn.textContent = prodId.value ? 'Guardar cambios' : 'Guardar';
    formSubmitBtn.disabled = false;
  }
});

// ---- RENDER TABLE ----
async function renderTable() {
  try {
    tbody.innerHTML = '<tr><td colspan="6">Cargando productos...</td></tr>';
    const productos = await getProductos();

    if (!productos.length) {
      tbody.innerHTML = '<tr><td colspan="6">No hay productos todavía. ¡Creá el primero!</td></tr>';
      return;
    }

    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>
          <img
            src="${p.imagenURL || 'img/placeholder.png'}"
            alt="${p.nombre}"
            class="admin-table__img"
            onerror="this.src='img/placeholder.png'"
          />
        </td>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.categoria || '—'}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>${(p.tallas || []).join(', ') || '—'}</td>
        <td>
          <div class="admin-table__actions">
            <button class="btn btn--outline" onclick="editarProducto('${p.id}')">Editar</button>
            <button class="btn btn--outline" style="border-color:#d32f2f;color:#d32f2f;" onclick="eliminarProducto('${p.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error al renderizar tabla:', err);
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar productos.</td></tr>';
  }
}

// ---- EDITAR ----
window.editarProducto = async function(id) {
  try {
    const prod = await getProducto(id);
    if (prod) openModal(prod);
  } catch (err) {
    alert('Error al obtener producto: ' + err.message);
  }
};

// ---- ELIMINAR ----
window.eliminarProducto = async function(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;
  try {
    await deleteProducto(id);
    await renderTable();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
};

// ---- EMAIL MANAGER ----
const newEmailInput = document.getElementById('newEmailInput');
const addEmailBtn = document.getElementById('addEmailBtn');
const emailsList = document.getElementById('emailsList');
const emailError = document.getElementById('emailError');

async function renderEmails() {
  try {
    emailsList.innerHTML = '<p class="catalog__loading">Cargando...</p>';
    const emails = await getEmailsAutorizados();
    if (!emails.length) {
      emailsList.innerHTML = '<p class="catalog__loading">No hay administradores autorizados.</p>';
      return;
    }
    emailsList.innerHTML = emails.map(email => `
      <div class="admin-emails__item">
        <span class="admin-emails__item-email">${email}</span>
        <button class="btn btn--outline admin-emails__item-btn" onclick="eliminarEmail('${email}')">Eliminar</button>
      </div>
    `).join('');
  } catch (err) {
    emailsList.innerHTML = '<p class="catalog__loading">Error al cargar.</p>';
  }
}

addEmailBtn.addEventListener('click', async () => {
  emailError.textContent = '';
  const email = newEmailInput.value.trim();
  if (!email || !email.includes('@')) {
    emailError.textContent = 'Ingresá un email válido.';
    return;
  }
  try {
    addEmailBtn.textContent = 'Agregando...';
    addEmailBtn.disabled = true;
    await addEmailAutorizado(email);
    newEmailInput.value = '';
    await renderEmails();
  } catch (err) {
    emailError.textContent = 'Error: ' + err.message;
  } finally {
    addEmailBtn.textContent = 'Agregar';
    addEmailBtn.disabled = false;
  }
});

newEmailInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addEmailBtn.click();
});

window.eliminarEmail = async function(email) {
  if (!confirm(`¿Quitar a ${email}?`)) return;
  try {
    await removeEmailAutorizado(email);
    await renderEmails();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// ---- AUTENTICACIÓN ----
loginBtn.addEventListener('click', async () => {
  loginError.textContent = '';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      loginError.textContent = 'Error al iniciar sesión: ' + err.message;
    }
  }
});

logoutBtn.addEventListener('click', async () => {
  await auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const authorized = await isEmailAutorizado(user.email);
    if (authorized) {
      adminEmail.textContent = user.email;
      loginScreen.style.display = 'none';
      dashboard.style.display = 'flex';
      await Promise.all([renderTable(), renderEmails()]);
    } else {
      loginError.textContent = `El correo ${user.email} no está autorizado. Contactá al administrador.`;
      await auth.signOut();
    }
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
});
