// ============================================================
// NEKO — Firestore CRUD
// ============================================================

const COLLECTION = 'productos';
const ADMIN_CONFIG = 'adminEmails/config';
const CONTACTO_DOC = 'siteConfig/contacto';

// ---------- PRODUCTOS ----------

async function getProductos() {
  const snap = await db.collection(COLLECTION)
    .orderBy('createdAt', 'desc').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getProducto(id) {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function addProducto(data) {
  const res = await db.collection(COLLECTION).add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return res.id;
}

async function updateProducto(id, data) {
  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteProducto(id) {
  await db.collection(COLLECTION).doc(id).delete();
}

// ---------- SUBIR IMAGEN ----------
async function uploadImagen(file) {
  // Verificar que Firebase Storage está disponible
  if (!storage) throw new Error('Firebase Storage no está inicializado');
  
  const nombreLimpio = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ref = storage.ref(`productos/${Date.now()}_${nombreLimpio}`);
  
  const snap = await ref.put(file);
  const url = await snap.ref.getDownloadURL();
  return url;
}

// ---------- EMAILS AUTORIZADOS ----------

async function isEmailAutorizado(email) {
  try {
    const doc = await db.doc(ADMIN_CONFIG).get();
    if (!doc.exists) return false;
    return (doc.data().allowedEmails || []).includes(email);
  } catch { return false; }
}

async function getEmailsAutorizados() {
  try {
    const doc = await db.doc(ADMIN_CONFIG).get();
    if (!doc.exists) return [];
    return doc.data().allowedEmails || [];
  } catch { return []; }
}

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

async function removeEmailAutorizado(email) {
  const doc = await db.doc(ADMIN_CONFIG).get();
  if (!doc.exists) return;
  const emails = (doc.data().allowedEmails || []).filter(e => e !== email);
  await db.doc(ADMIN_CONFIG).update({ allowedEmails: emails });
}

// ---------- CONTACTO ----------

async function getContacto() {
  try {
    const doc = await db.doc(CONTACTO_DOC).get();
    if (!doc.exists) return { whatsapp: '', instagram: '', facebook: '', tiktok: '', texto: '' };
    return doc.data();
  } catch { return { whatsapp: '', instagram: '', facebook: '', tiktok: '', texto: '' }; }
}

async function saveContacto(data) {
  await db.doc(CONTACTO_DOC).set(data, { merge: true });
}
