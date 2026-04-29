// Paginaweb/data/firebase-service.js
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, getDoc, getDocs,
  updateDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const FirebaseService = {

  // --- MENÚ ---
  async getMenu() {
    const snap = await getDocs(collection(db, "menu"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateProduct(productId, data) {
    await updateDoc(doc(db, "menu", productId), data);
  },

  async addProduct(data) {
    return await addDoc(collection(db, "menu"), data);
  },

  // --- PEDIDOS ---
  async createOrder(orderData) {
    const ref = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "nuevo",
      type: "domicilio",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      whatsappSent: false
    });
    return ref.id;
  },

  async getOrderById(orderId) {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  listenToOrder(orderId, callback) {
    return onSnapshot(doc(db, "orders", orderId), snap => {
      if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    });
  },

  listenToOrders(callback) {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async updateOrderStatus(orderId, status) {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // --- CONFIG ---
  async getConfig() {
    const snap = await getDoc(doc(db, "config", "settings"));
    return snap.exists() ? snap.data() : {
      isOpen: true,
      pickupEnabled: false,
      whatsappNumber: "529811234567",
      deliveryFee: 30,
      minOrder: 100
    };
  },

  async updateConfig(data) {
    await setDoc(doc(db, "config", "settings"), data, { merge: true });
  },

  // --- AUTH ---
  async loginAdmin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async logoutAdmin() {
    return signOut(auth);
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
};
