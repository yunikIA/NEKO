// ============================================================
// NEKO — Firebase Config
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCkuNrOLtXAAhnpfeRb8YZegG9zHYpdb_o",
  authDomain: "neko-5c52a.firebaseapp.com",
  projectId: "neko-5c52a",
  storageBucket: "neko-5c52a.firebasestorage.app",
  messagingSenderId: "777676221930",
  appId: "1:777676221930:web:d9d125e1b2f5dbda899693"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Cloudinary
const CLOUD_NAME = 'mediaflows_98e875';
const UPLOAD_PRESET = 'neko_preset';
