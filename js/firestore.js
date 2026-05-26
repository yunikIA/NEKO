// ============================================================
// NEKO — Firestore CRUD (Productos)
// ============================================================

const COLLECTION = 'productos';
const ADMIN_CONFIG = 'adminEmails/config';

// ---------- OBTENER TODOS ----------
async function getProductos() {
  const snap = await db.collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ---------- OBTENER UNO ----------
async function getProducto(id) {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// ---------- CREAR ----------
async function addProducto(data) {
  const res = await db.collection(COLLECTION).add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return res.id;
}

// ---------- ACTUALIZAR ----------
async function updateProducto(id, data) {
  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ---------- ELIMINAR ----------
async function deleteProducto(id) {
  await db.collection(COLLECTION).doc(id).delete();
}

// ---------- SUBIR IMAGEN A STORAGE ----------
async function uploadImagen(file) {
  const ref = storage.ref(`productos/${Date.now()}_${file.name}`);
  const snap = await ref.put(file);
  return snap.ref.getDownloadURL();
}

// ---------- VERIFICAR EMAIL AUTORIZADO ----------
async function isEmailAutorizado(email) {
  try {
    const doc = await db.doc(ADMIN_CONFIG).get();
    if (!doc.exists) return false;
    const emails = doc.data().allowedEmails || [];
    return emails.includes(email);
  } catch {
    return false;
  }
}

// ---------- OBTENER EMAILS AUTORIZADOS ----------
async function getEmailsAutorizados() {
  try {
    const doc = await db.doc(ADMIN_CONFIG).get();
    if (!doc.exists) return [];
    return doc.data().allowedEmails || [];
  } catch {
    return [];
  }
}

// ---------- AGREGAR EMAIL AUTORIZADO ----------
async function addEmailAutorizado(email) {
  const doc = await db.doc(ADMIN_CONFIG).get();
  if (!doc.exists) {
    await db.doc(ADMIN_CONFIG).set({ allowedEmails: [email] });
    return;
  }
  const emails = doc.data().allowedEmails || [];
  if (!emails.includes(email)) {
    emails.push(email);
    await db.doc(ADMIN_CONFIG).update({ allowedEmails: emails });
  }
}

// ---------- ELIMINAR EMAIL AUTORIZADO ----------
async function removeEmailAutorizado(email) {
  const doc = await db.doc(ADMIN_CONFIG).get();
  if (!doc.exists) return;
  const emails = (doc.data().allowedEmails || []).filter(e => e !== email);
  await db.doc(ADMIN_CONFIG).update({ allowedEmails: emails });
}
