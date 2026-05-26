// ============================================================
// NEKO — Admin Panel
// ============================================================

const loginScreen = document.getElementById('adminLogin');
const dashboard = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const adminEmailEl = document.getElementById('adminEmail');

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
const prodDestacado = document.getElementById('prodDestacado');
const prodImagenInput = document.getElementById('prodImagenInput');
const convertDriveBtn = document.getElementById('convertDriveBtn');
const addImageBtn = document.getElementById('addImageBtn');
const imageList = document.getElementById('imageList');
const prodImagenes = document.getElementById('prodImagenes');
const cloudinaryFile = document.getElementById('cloudinaryFile');
const uploadStatus = document.getElementById('uploadStatus');

const sidebarLinks = document.querySelectorAll('.admin-sidebar__link');
const tabs = document.querySelectorAll('.admin-tab');

// ---- TABS ----
sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    sidebarLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    tabs.forEach(t => t.classList.remove('active'));
    const tabId = 'tab' + link.dataset.tab.charAt(0).toUpperCase() + link.dataset.tab.slice(1);
    document.getElementById(tabId).classList.add('active');
    if (link.dataset.tab === 'settings') renderEmails();
    if (link.dataset.tab === 'contacto') renderContactoAdmin();
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
    prodDestacado.checked = editData.destacado || false;
    document.querySelectorAll('.talla-check').forEach(cb => {
      cb.checked = (editData.tallas || []).includes(cb.value);
    });
    _imagenesTemp = [...(editData.imagenes || (editData.imagenURL ? [editData.imagenURL] : []))];
    renderImageList();
  } else {
    productForm.reset();
    prodId.value = '';
    modalTitle.textContent = 'Nuevo producto';
    formSubmitBtn.textContent = 'Guardar';
    document.querySelectorAll('.talla-check').forEach(cb => cb.checked = false);
    _imagenesTemp = [];
    renderImageList();
  }
  modal.classList.add('open');
}

function closeModal() { modal.classList.remove('open'); }

addProductBtn.addEventListener('click', () => openModal(null));
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target.classList.contains('modal__backdrop')) closeModal();
});

// ---- MULTI-IMAGE MANAGER ----
let _imagenesTemp = [];

function convertirDriveLink(url) {
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    const id = match[1];
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
  }
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return `https://drive.google.com/thumbnail?id=${match2[1]}&sz=w1200`;
  }
  return url;
}

function renderImageList() {
  if (!_imagenesTemp.length) {
    imageList.innerHTML = '<p class="image-list__empty">Sin imágenes</p>';
    prodImagenes.value = '';
    return;
  }
  imageList.innerHTML = _imagenesTemp.map((url, i) => `
    <div class="image-list__item">
      <img src="${url}" alt="" class="image-list__item-img" onerror="this.src='img/placeholder.png'" />
      <span class="image-list__item-url">${url.length > 50 ? url.slice(0, 50) + '…' : url}</span>
      <button class="image-list__item-del" onclick="removeImage(${i})">&times;</button>
    </div>
  `).join('');
  prodImagenes.value = JSON.stringify(_imagenesTemp);
}

window.removeImage = function(idx) {
  _imagenesTemp.splice(idx, 1);
  renderImageList();
};

function addImage(url) {
  url = url.trim();
  if (!url) return;
  url = convertirDriveLink(url);
  _imagenesTemp.push(url);
  renderImageList();
  prodImagenInput.value = '';
  prodImagenInput.focus();
}

addImageBtn.addEventListener('click', () => addImage(prodImagenInput.value));
prodImagenInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addImage(prodImagenInput.value);
});
convertDriveBtn.addEventListener('click', () => {
  const url = prodImagenInput.value.trim();
  if (!url) return;
  prodImagenInput.value = convertirDriveLink(url);
});

// ---- CLOUDINARY UPLOAD ----
cloudinaryFile.addEventListener('change', async () => {
  const file = cloudinaryFile.files[0];
  if (!file) return;

  try {
    uploadStatus.textContent = 'Subiendo...';
    uploadStatus.style.color = 'var(--secondary)';
    const url = await subirACloudinary(file);
    _imagenesTemp.push(url);
    renderImageList();
    uploadStatus.textContent = '✓ Subida correctamente';
    uploadStatus.style.color = 'var(--accent2)';
  } catch (err) {
    uploadStatus.textContent = 'Error: ' + err.message;
    uploadStatus.style.color = '#e05a4e';
  }

  cloudinaryFile.value = '';
  setTimeout(() => { uploadStatus.textContent = ''; }, 4000);
});

// ---- FORM SUBMIT ----
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tallas = [];
  document.querySelectorAll('.talla-check:checked').forEach(cb => tallas.push(cb.value));

  const data = {
    nombre: prodNombre.value.trim(),
    descripcion: prodDescripcion.value.trim(),
    precio: parseFloat(prodPrecio.value),
    categoria: prodCategoria.value,
    tallas,
    imagenURL: _imagenesTemp[0] || '',
    imagenes: _imagenesTemp,
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
    alert('Error al guardar: ' + err.message);
  } finally {
    formSubmitBtn.textContent = prodId.value ? 'Guardar cambios' : 'Guardar';
    formSubmitBtn.disabled = false;
  }
});

// ---- RENDER TABLE ----
async function renderTable() {
  try {
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
    const productos = await getProductos();
    if (!productos.length) {
      tbody.innerHTML = '<tr><td colspan="6">No hay productos todavía.</td></tr>';
      return;
    }
    tbody.innerHTML = productos.map(p => {
      const imgs = p.imagenes || (p.imagenURL ? [p.imagenURL] : []);
      const badge = imgs.length > 1 ? `<span class="admin-table__img-count">+${imgs.length - 1}</span>` : '';
      return `
      <tr>
        <td style="position:relative;">
          <img src="${imgs[0] || 'img/placeholder.png'}" alt="${p.nombre}" class="admin-table__img" onerror="this.src='img/placeholder.png'" />
          ${badge}
        </td>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.categoria || '—'}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>${(p.tallas || []).join(', ') || '—'}</td>
        <td>
          <div class="admin-table__actions">
            <button class="btn btn--outline" onclick="editarProducto('${p.id}')">Editar</button>
            <button class="btn btn--outline" style="border-color:#e05a4e;color:#e05a4e;" onclick="eliminarProducto('${p.id}')">Eliminar</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar.</td></tr>';
  }
}

window.editarProducto = async function(id) {
  const prod = await getProducto(id);
  if (prod) openModal(prod);
};

window.eliminarProducto = async function(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  await deleteProducto(id);
  await renderTable();
};

// ---- EMAILS ----
const newEmailInput = document.getElementById('newEmailInput');
const addEmailBtn = document.getElementById('addEmailBtn');
const emailsList = document.getElementById('emailsList');
const emailError = document.getElementById('emailError');

async function renderEmails() {
  emailsList.innerHTML = '<p class="catalog__loading">Cargando...</p>';
  const emails = await getEmailsAutorizados();
  if (!emails.length) {
    emailsList.innerHTML = '<p class="catalog__loading">No hay admins autorizados.</p>';
    return;
  }
  emailsList.innerHTML = emails.map(email => `
    <div class="admin-emails__item">
      <span class="admin-emails__item-email">${email}</span>
      <button class="btn btn--outline admin-emails__item-btn" onclick="eliminarEmail('${email}')">Eliminar</button>
    </div>
  `).join('');
}

addEmailBtn.addEventListener('click', async () => {
  emailError.textContent = '';
  const email = newEmailInput.value.trim();
  if (!email || !email.includes('@')) { emailError.textContent = 'Email inválido.'; return; }
  addEmailBtn.textContent = 'Agregando...';
  addEmailBtn.disabled = true;
  await addEmailAutorizado(email);
  newEmailInput.value = '';
  await renderEmails();
  addEmailBtn.textContent = 'Agregar';
  addEmailBtn.disabled = false;
});

newEmailInput.addEventListener('keydown', e => { if (e.key === 'Enter') addEmailBtn.click(); });

window.eliminarEmail = async function(email) {
  if (!confirm(`¿Quitar a ${email}?`)) return;
  await removeEmailAutorizado(email);
  await renderEmails();
};

// ---- CONTACTO ADMIN ----
async function renderContactoAdmin() {
  const data = await getContacto();
  document.getElementById('ctaWhatsapp').value = data.whatsapp || '';
  document.getElementById('ctaInstagram').value = data.instagram || '';
  document.getElementById('ctaFacebook').value = data.facebook || '';
  document.getElementById('ctaTiktok').value = data.tiktok || '';
  document.getElementById('ctaTexto').value = data.texto || '';
}

const contactoForm = document.getElementById('contactoForm');
if (contactoForm) {
  contactoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contactoSaveBtn');
    btn.textContent = 'Guardando...';
    btn.disabled = true;
    try {
      await saveContacto({
        whatsapp: document.getElementById('ctaWhatsapp').value.trim(),
        instagram: document.getElementById('ctaInstagram').value.trim(),
        facebook: document.getElementById('ctaFacebook').value.trim(),
        tiktok: document.getElementById('ctaTiktok').value.trim(),
        texto: document.getElementById('ctaTexto').value.trim(),
      });
      btn.textContent = '✓ Guardado';
      setTimeout(() => { btn.textContent = 'Guardar cambios'; btn.disabled = false; }, 2000);
    } catch (err) {
      alert('Error: ' + err.message);
      btn.textContent = 'Guardar cambios';
      btn.disabled = false;
    }
  });
}

// ---- AUTH ----
loginBtn.addEventListener('click', async () => {
  loginError.textContent = '';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      loginError.textContent = 'Error: ' + err.message;
    }
  }
});

logoutBtn.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const authorized = await isEmailAutorizado(user.email);
    if (authorized) {
      adminEmailEl.textContent = user.email;
      loginScreen.style.display = 'none';
      dashboard.style.display = 'flex';
      await renderTable();
    } else {
      loginError.textContent = `El correo ${user.email} no está autorizado.`;
      await auth.signOut();
    }
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
});
