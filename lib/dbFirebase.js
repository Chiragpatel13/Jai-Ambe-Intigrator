import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { seedFirebaseDatabase } from './seedFirebase';
import { mockProducts, mockCategories, mockSettings, mockGallery } from './mockData';

let seeded = false;
let firebaseAvailable = true;
let mockInquiries = [];
const FIRESTORE_TIMEOUT_MS = 10000;

// ── Simple in-memory TTL cache ───────────────────────────────────────────────
const CACHE_TTL_MS = 30_000; // 30 seconds
const _cache = new Map(); // key → { data, expiresAt }

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
}
function cacheSet(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
function cacheInvalidate(...keys) {
  keys.forEach(k => _cache.delete(k));
}
// ─────────────────────────────────────────────────────────────────────────────


function withTimeout(promise, ms = FIRESTORE_TIMEOUT_MS) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Firestore operation timed out (database may not be initialized).'));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

async function ensureSeeded() {
  if (!seeded) {
    seeded = true;
    // Run seeding in the background — do NOT block reads or mark Firebase
    // unavailable just because the initial cold-start connection is slow.
    // Each individual operation already has its own 10-second timeout + mock fallback.
    seedFirebaseDatabase()
      .catch((err) => {
        console.warn('\n[FIREBASE] Background seeding skipped (Firestore may still be initializing).');
        console.warn('Error details:', err.message, '\n');
      });
  }
}

// Helper to convert Firestore document to plain JS object with string ID
const docToObj = (docSnap) => {
  if (!docSnap || !docSnap.exists()) return null;
  const data = docSnap.data();
  
  // Convert any timestamps to ISO strings
  const cleanedData = { ...data };
  for (const key in cleanedData) {
    if (cleanedData[key] instanceof Timestamp) {
      cleanedData[key] = cleanedData[key].toDate().toISOString();
    }
  }

  return {
    _id: docSnap.id,
    id: docSnap.id,
    ...cleanedData,
  };
};

/* ==========================================================================
   CATEGORIES CRUD
   ========================================================================== */
export async function getCategories() {
  await ensureSeeded();
  const cached = cacheGet('categories');
  if (cached) return cached;
  try {
    const colRef = collection(db, 'categories');
    const snap = await withTimeout(getDocs(colRef));
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docToObj(docSnap));
    });
    const sorted = list.sort((a, b) => a.name.localeCompare(b.name));
    if (sorted.length > 0) cacheSet('categories', sorted);
    return sorted.length > 0 ? sorted : [...mockCategories].sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('[FIREBASE ERROR] getCategories failed. Using mock fallback:', err.message);
    return [...mockCategories].sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function getCategoryById(id) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    return mockCategories.find(c => c._id === id) || null;
  }
  try {
    const docRef = doc(db, 'categories', id);
    const snap = await withTimeout(getDoc(docRef));
    return docToObj(snap);
  } catch (err) {
    console.error('[FIREBASE ERROR] getCategoryById failed. Using mock fallback:', err.message);
    return mockCategories.find(c => c._id === id) || null;
  }
}

export async function createCategory(data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const newCat = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: data.description || '',
      icon: data.icon || 'Grid',
      createdAt: new Date().toISOString(),
    };
    mockCategories.push(newCat);
    return newCat;
  }
  try {
    const colRef = collection(db, 'categories');
    const cleanData = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: data.description || '',
      icon: data.icon || 'Grid',
      createdAt: Timestamp.now(),
    };
    const docRef = await withTimeout(addDoc(colRef, cleanData));
    cacheInvalidate('categories', 'products');
    return { _id: docRef.id, id: docRef.id, ...cleanData, createdAt: cleanData.createdAt.toDate().toISOString() };
  } catch (err) {
    console.error('[FIREBASE ERROR] createCategory failed:', err.message);
    throw err;
  }
}

export async function updateCategory(id, data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const cat = mockCategories.find((c) => c._id === id || c.id === id);
    if (cat) {
      if (data.name !== undefined) cat.name = data.name;
      if (data.slug !== undefined) cat.slug = data.slug;
      if (data.description !== undefined) cat.description = data.description;
      if (data.icon !== undefined) cat.icon = data.icon;
      return cat;
    }
    return null;
  }
  try {
    const docRef = doc(db, 'categories', id);
    const cleanData = {};
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.slug !== undefined) cleanData.slug = data.slug;
    if (data.description !== undefined) cleanData.description = data.description;
    if (data.icon !== undefined) cleanData.icon = data.icon;
    
    await withTimeout(updateDoc(docRef, cleanData));
    cacheInvalidate('categories', 'products');
    const updatedSnap = await withTimeout(getDoc(docRef));
    return docToObj(updatedSnap);
  } catch (err) {
    console.error('[FIREBASE ERROR] updateCategory failed:', err.message);
    throw err;
  }
}

export async function deleteCategory(id) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const idx = mockCategories.findIndex((c) => c._id === id || c.id === id);
    if (idx !== -1) {
      mockCategories.splice(idx, 1);
      return true;
    }
    return false;
  }
  try {
    const docRef = doc(db, 'categories', id);
    await withTimeout(deleteDoc(docRef));
    cacheInvalidate('categories', 'products');
    return true;
  } catch (err) {
    console.error('[FIREBASE ERROR] deleteCategory failed:', err.message);
    throw err;
  }
}


/* ==========================================================================
   PRODUCTS CRUD
   ========================================================================== */
export async function getProducts(filters = {}) {
  await ensureSeeded();

  // Cache stores the full unfiltered list; filtering/sorting always happens in-memory
  let list = cacheGet('products_raw');

  if (!list) {
    try {
      const colRef = collection(db, 'products');
      const snap = await withTimeout(getDocs(colRef));
      const raw = [];
      snap.forEach((docSnap) => {
        raw.push(docToObj(docSnap));
      });

      const categories = await getCategories();
      const categoryMap = {};
      categories.forEach((cat) => {
        categoryMap[cat._id] = cat;
      });

      list = raw.map((prod) => ({
        ...prod,
        category: categoryMap[prod.categoryId] || { _id: prod.categoryId, name: 'Uncategorized' },
      }));

      if (list.length > 0) cacheSet('products_raw', list);
    } catch (err) {
      console.error('[FIREBASE ERROR] getProducts failed. Using mock fallback:', err.message);
      list = mockProducts.map(p => ({
        ...p,
        category: p.category || { name: 'Uncategorized' },
      }));
    }
  }

  const {
    search = '',
    category = '',
    condition = '',
    featured = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
    page = 1,
    limit = 12,
    daysLimit = '',
  } = filters;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (category) {
    list = list.filter(p => p.category?.slug === category);
  }
  if (condition && (condition === 'new' || condition === 'used')) {
    list = list.filter(p => p.condition === condition);
  }
  if (featured === 'true' || featured === true) {
    list = list.filter(p => p.featured === true);
  }
  if (minPrice) {
    list = list.filter(p => (p.price || 0) >= parseFloat(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => (p.price || 0) <= parseFloat(maxPrice));
  }
  if (daysLimit && !isNaN(parseInt(daysLimit, 10))) {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - parseInt(daysLimit, 10));
    list = list.filter(p => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt) >= limitDate;
    });
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === 'price_desc') {
    list.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = list.length;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  return {
    products: list.slice(skip, skip + parseInt(limit, 10)),
    total,
    totalPages: Math.ceil(total / parseInt(limit, 10)),
    currentPage: parseInt(page, 10),
  };
}

export async function getProductById(id) {
  await ensureSeeded();
  try {
    const docRef = doc(db, 'products', id);
    const snap = await withTimeout(getDoc(docRef));
    if (!snap.exists()) return null;
    const product = docToObj(snap);

    if (product.categoryId) {
      const cat = await getCategoryById(product.categoryId);
      product.category = cat || { _id: product.categoryId, name: 'Uncategorized' };
    } else {
      product.category = { name: 'Uncategorized' };
    }
    return product;
  } catch (err) {
    console.error('[FIREBASE ERROR] getProductById failed. Returning null:', err.message);
    return null;
  }
}

export async function createProduct(data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const newProd = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      price: data.price !== undefined ? parseFloat(data.price) : 0,
      condition: data.condition || 'new',
      description: data.description || '',
      images: data.images || [],
      categoryId: data.categoryId || data.category || '',
      stock: data.stock !== undefined ? parseInt(data.stock, 10) : 1,
      availability: data.availability !== undefined ? data.availability : true,
      featured: data.featured !== undefined ? data.featured : false,
      brand: data.brand || '',
      warranty: data.warranty || '',
      location: data.location || 'Boisar',
      reviews: data.reviews || [],
      createdAt: new Date().toISOString(),
    };
    mockProducts.push(newProd);
    return newProd;
  }
  try {
    const colRef = collection(db, 'products');
    const cleanData = {
      name: data.name,
      price: data.price !== undefined ? parseFloat(data.price) : 0,
      condition: data.condition || 'new',
      description: data.description || '',
      images: data.images || [],
      categoryId: data.categoryId || data.category || '',
      stock: data.stock !== undefined ? parseInt(data.stock, 10) : 1,
      availability: data.availability !== undefined ? data.availability : true,
      featured: data.featured !== undefined ? data.featured : false,
      brand: data.brand || '',
      warranty: data.warranty || '',
      location: data.location || 'Boisar',
      reviews: data.reviews || [],
      createdAt: Timestamp.now(),
    };

    const docRef = await withTimeout(addDoc(colRef, cleanData));
    return { _id: docRef.id, id: docRef.id, ...cleanData, createdAt: cleanData.createdAt.toDate().toISOString() };
  } catch (err) {
    console.error('[FIREBASE ERROR] createProduct failed:', err.message);
    throw err;
  }
}

export async function updateProduct(id, data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const prod = mockProducts.find((p) => p._id === id || p.id === id);
    if (prod) {
      if (data.name !== undefined) prod.name = data.name;
      if (data.price !== undefined) prod.price = parseFloat(data.price) || 0;
      if (data.condition !== undefined) prod.condition = data.condition;
      if (data.description !== undefined) prod.description = data.description;
      if (data.images !== undefined) prod.images = data.images;
      if (data.categoryId !== undefined) prod.categoryId = data.categoryId;
      else if (data.category !== undefined) prod.categoryId = data.category;
      if (data.stock !== undefined) prod.stock = parseInt(data.stock, 10);
      if (data.availability !== undefined) prod.availability = data.availability;
      if (data.featured !== undefined) prod.featured = data.featured;
      if (data.brand !== undefined) prod.brand = data.brand;
      if (data.warranty !== undefined) prod.warranty = data.warranty;
      if (data.location !== undefined) prod.location = data.location;
      return prod;
    }
    return null;
  }
  try {
    const docRef = doc(db, 'products', id);
    const cleanData = {};
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.price !== undefined) cleanData.price = parseFloat(data.price) || 0;
    if (data.condition !== undefined) cleanData.condition = data.condition;
    if (data.description !== undefined) cleanData.description = data.description;
    if (data.images !== undefined) cleanData.images = data.images;
    if (data.categoryId !== undefined) cleanData.categoryId = data.categoryId;
    else if (data.category !== undefined) cleanData.categoryId = data.category;
    if (data.stock !== undefined) cleanData.stock = parseInt(data.stock, 10);
    if (data.availability !== undefined) cleanData.availability = data.availability;
    if (data.featured !== undefined) cleanData.featured = data.featured;
    if (data.brand !== undefined) cleanData.brand = data.brand;
    if (data.warranty !== undefined) cleanData.warranty = data.warranty;
    if (data.location !== undefined) cleanData.location = data.location;

    await withTimeout(updateDoc(docRef, cleanData));
    const updatedSnap = await withTimeout(getDoc(docRef));
    return docToObj(updatedSnap);
  } catch (err) {
    console.error('[FIREBASE ERROR] updateProduct failed:', err.message);
    throw err;
  }
}

export async function deleteProduct(id) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const idx = mockProducts.findIndex((p) => p._id === id || p.id === id);
    if (idx !== -1) {
      mockProducts.splice(idx, 1);
      return true;
    }
    return false;
  }
  try {
    const docRef = doc(db, 'products', id);
    await withTimeout(deleteDoc(docRef));
    return true;
  } catch (err) {
    console.error('[FIREBASE ERROR] deleteProduct failed:', err.message);
    throw err;
  }
}


/* ==========================================================================
   SETTINGS CRUD
   ========================================================================== */
export async function getSettings() {
  await ensureSeeded();
  if (!firebaseAvailable) {
    return { _id: 'global_settings', id: 'global_settings', ...mockSettings };
  }
  try {
    const docRef = doc(db, 'settings', 'global_settings');
    const snap = await withTimeout(getDoc(docRef));
    if (!snap || !snap.exists()) {
      return { _id: 'global_settings', id: 'global_settings', ...mockSettings };
    }
    return docToObj(snap);
  } catch (err) {
    console.error('[FIREBASE ERROR] getSettings failed. Using mock fallback:', err.message);
    return { _id: 'global_settings', id: 'global_settings', ...mockSettings };
  }
}

export async function updateSettings(data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    Object.assign(mockSettings, data);
    return { _id: 'global_settings', id: 'global_settings', ...mockSettings };
  }
  try {
    const docRef = doc(db, 'settings', 'global_settings');
    const cleanData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    delete cleanData._id;
    delete cleanData.id;

    await withTimeout(setDoc(docRef, cleanData, { merge: true }));
    const updatedSnap = await withTimeout(getDoc(docRef));
    return docToObj(updatedSnap);
  } catch (err) {
    console.error('[FIREBASE ERROR] updateSettings failed:', err.message);
    throw err;
  }
}


/* ==========================================================================
   INQUIRIES CRUD
   ========================================================================== */
export async function getInquiries(status = '') {
  await ensureSeeded();
  if (!firebaseAvailable) {
    let list = [...mockInquiries];
    const productsResult = await getProducts();
    const productMap = {};
    productsResult.products.forEach((p) => {
      productMap[p._id] = p;
    });

    list = list.map((inq) => {
      return {
        ...inq,
        productId: productMap[inq.productId] || (inq.productId ? { _id: inq.productId, name: 'Unknown Product' } : null),
      };
    });

    if (status) {
      list = list.filter(inq => inq.status === status);
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  try {
    const colRef = collection(db, 'inquiries');
    const snap = await withTimeout(getDocs(colRef));
    let list = [];
    snap.forEach((docSnap) => {
      list.push(docToObj(docSnap));
    });

    const productsResult = await getProducts();
    const productMap = {};
    productsResult.products.forEach((p) => {
      productMap[p._id] = p;
    });

    list = list.map((inq) => {
      return {
        ...inq,
        productId: productMap[inq.productId] || (inq.productId ? { _id: inq.productId, name: 'Unknown Product' } : null),
      };
    });

    if (status) {
      list = list.filter(inq => inq.status === status);
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('[FIREBASE ERROR] getInquiries failed. Returning empty list:', err.message);
    return [];
  }
}

export async function createInquiry(data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const newInq = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      message: data.message || '',
      productId: data.productId || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    mockInquiries.push(newInq);
    return newInq;
  }
  try {
    const colRef = collection(db, 'inquiries');
    const cleanData = {
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      message: data.message || '',
      productId: data.productId || '',
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    const docRef = await withTimeout(addDoc(colRef, cleanData));
    return { _id: docRef.id, id: docRef.id, ...cleanData, createdAt: cleanData.createdAt.toDate().toISOString() };
  } catch (err) {
    console.error('[FIREBASE ERROR] createInquiry failed:', err.message);
    throw err;
  }
}

export async function updateInquiry(id, data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const inq = mockInquiries.find((i) => i._id === id || i.id === id);
    if (inq) {
      if (data.status !== undefined) inq.status = data.status;
      return inq;
    }
    return null;
  }
  try {
    const docRef = doc(db, 'inquiries', id);
    const cleanData = {};
    if (data.status !== undefined) cleanData.status = data.status;

    await withTimeout(updateDoc(docRef, cleanData));
    const updatedSnap = await withTimeout(getDoc(docRef));
    return docToObj(updatedSnap);
  } catch (err) {
    console.error('[FIREBASE ERROR] updateInquiry failed:', err.message);
    throw err;
  }
}

export async function deleteInquiry(id) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const idx = mockInquiries.findIndex((i) => i._id === id || i.id === id);
    if (idx !== -1) {
      mockInquiries.splice(idx, 1);
      return true;
    }
    return false;
  }
  try {
    const docRef = doc(db, 'inquiries', id);
    await withTimeout(deleteDoc(docRef));
    return true;
  } catch (err) {
    console.error('[FIREBASE ERROR] deleteInquiry failed:', err.message);
    throw err;
  }
}


/* ==========================================================================
   ADMIN LOGIN
   ========================================================================== */
export async function getAdminByUsername(username) {
  await ensureSeeded();
  
  const mockAdminVerify = () => {
    if (username.toLowerCase() === 'admin') {
      return {
        _id: 'mock_admin_id',
        id: 'mock_admin_id',
        username: 'admin',
        password: '$2b$10$pqk/DAaMw9IlHgmooJFpDOuepcFk5sLU0Ry39M0y3U3petw1CEiBe', // hash of admin123
      };
    }
    return null;
  };

  if (!firebaseAvailable) {
    return mockAdminVerify();
  }

  try {
    const colRef = collection(db, 'admins');
    const snap = await withTimeout(getDocs(colRef));
    let adminUser = null;
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.username?.toLowerCase() === username.toLowerCase()) {
        adminUser = docToObj(docSnap);
      }
    });
    return adminUser || mockAdminVerify();
  } catch (err) {
    console.error('[FIREBASE ERROR] getAdminByUsername failed. Using mock credentials:', err.message);
    return mockAdminVerify();
  }
}

export async function createAdmin(username, passwordHash) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    throw new Error('Firebase Firestore is currently unavailable.');
  }
  try {
    const colRef = collection(db, 'admins');
    const existing = await getAdminByUsername(username);
    if (existing) return existing;

    const docRef = await withTimeout(addDoc(colRef, {
      username,
      password: passwordHash,
      createdAt: Timestamp.now(),
    }));
    return { _id: docRef.id, id: docRef.id, username, password: passwordHash };
  } catch (err) {
    console.error('[FIREBASE ERROR] createAdmin failed:', err.message);
    throw err;
  }
}


/* ==========================================================================
   WORK GALLERY CRUD
   ========================================================================== */
export async function getGalleryItems() {
  await ensureSeeded();
  if (!firebaseAvailable) {
    return [...mockGallery].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  try {
    const colRef = collection(db, 'gallery');
    const snap = await withTimeout(getDocs(colRef));
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docToObj(docSnap));
    });
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('[FIREBASE ERROR] getGalleryItems failed. Using mock fallback:', err.message);
    return [...mockGallery].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function createGalleryItem(data) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const newItem = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description || '',
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || 'image',
      createdAt: new Date().toISOString(),
    };
    mockGallery.push(newItem);
    return newItem;
  }
  try {
    const colRef = collection(db, 'gallery');
    const cleanData = {
      title: data.title,
      description: data.description || '',
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || 'image',
      createdAt: Timestamp.now(),
    };
    const docRef = await withTimeout(addDoc(colRef, cleanData));
    return { _id: docRef.id, id: docRef.id, ...cleanData, createdAt: cleanData.createdAt.toDate().toISOString() };
  } catch (err) {
    console.error('[FIREBASE ERROR] createGalleryItem failed:', err.message);
    throw err;
  }
}

export async function deleteGalleryItem(id) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const idx = mockGallery.findIndex((item) => item._id === id || item.id === id);
    if (idx !== -1) {
      mockGallery.splice(idx, 1);
      return true;
    }
    return false;
  }
  try {
    const docRef = doc(db, 'gallery', id);
    await withTimeout(deleteDoc(docRef));
    return true;
  } catch (err) {
    console.error('[FIREBASE ERROR] deleteGalleryItem failed:', err.message);
    throw err;
  }
}

export async function addProductReview(productId, reviewData) {
  await ensureSeeded();
  const newReview = {
    _id: 'rev_' + Math.random().toString(36).substr(2, 9),
    name: reviewData.name,
    rating: parseInt(reviewData.rating, 10),
    comment: reviewData.comment,
    featured: false,
    createdAt: new Date().toISOString(),
  };

  if (!firebaseAvailable) {
    const idx = mockProducts.findIndex(p => p._id === productId || p.id === productId);
    if (idx === -1) return null;
    if (!mockProducts[idx].reviews) mockProducts[idx].reviews = [];
    mockProducts[idx].reviews.push(newReview);
    cacheInvalidate('products_raw');
    return mockProducts[idx];
  }

  try {
    const docRef = doc(db, 'products', productId);
    const snap = await withTimeout(getDoc(docRef));
    if (!snap.exists()) return null;
    const currentData = snap.data();
    const reviews = currentData.reviews || [];
    reviews.push(newReview);

    await withTimeout(updateDoc(docRef, { reviews }));
    cacheInvalidate('products_raw');
    return await getProductById(productId);
  } catch (err) {
    console.error('[FIREBASE ERROR] addProductReview failed. Using fallback:', err.message);
    const idx = mockProducts.findIndex(p => p._id === productId || p.id === productId);
    if (idx !== -1) {
      if (!mockProducts[idx].reviews) mockProducts[idx].reviews = [];
      mockProducts[idx].reviews.push(newReview);
      return mockProducts[idx];
    }
    throw err;
  }
}

export async function deleteProductReview(productId, reviewId) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const idx = mockProducts.findIndex(p => p._id === productId || p.id === productId);
    if (idx === -1) return null;
    if (mockProducts[idx].reviews) {
      mockProducts[idx].reviews = mockProducts[idx].reviews.filter(r => r._id !== reviewId);
    }
    cacheInvalidate('products_raw');
    return mockProducts[idx];
  }

  try {
    const docRef = doc(db, 'products', productId);
    const snap = await withTimeout(getDoc(docRef));
    if (!snap.exists()) return null;
    const currentData = snap.data();
    let reviews = currentData.reviews || [];
    reviews = reviews.filter(r => r._id !== reviewId && r.id !== reviewId);

    await withTimeout(updateDoc(docRef, { reviews }));
    cacheInvalidate('products_raw');
    return await getProductById(productId);
  } catch (err) {
    console.error('[FIREBASE ERROR] deleteProductReview failed. Using fallback:', err.message);
    const idx = mockProducts.findIndex(p => p._id === productId || p.id === productId);
    if (idx !== -1) {
      if (mockProducts[idx].reviews) {
        mockProducts[idx].reviews = mockProducts[idx].reviews.filter(r => r._id !== reviewId && r.id !== reviewId);
      }
      return mockProducts[idx];
    }
    throw err;
  }
}

export async function toggleReviewFeatured(productId, reviewId, featured) {
  await ensureSeeded();
  if (!firebaseAvailable) {
    const idx = mockProducts.findIndex(p => p._id === productId || p.id === productId);
    if (idx === -1) return null;
    if (mockProducts[idx].reviews) {
      mockProducts[idx].reviews = mockProducts[idx].reviews.map((r) =>
        r._id === reviewId || r.id === reviewId ? { ...r, featured: !!featured } : r
      );
    }
    cacheInvalidate('products_raw');
    return mockProducts[idx];
  }

  try {
    const docRef = doc(db, 'products', productId);
    const snap = await withTimeout(getDoc(docRef));
    if (!snap.exists()) return null;
    const currentData = snap.data();
    let reviews = currentData.reviews || [];
    reviews = reviews.map((r) =>
      r._id === reviewId || r.id === reviewId ? { ...r, featured: !!featured } : r
    );

    await withTimeout(updateDoc(docRef, { reviews }));
    cacheInvalidate('products_raw');
    return await getProductById(productId);
  } catch (err) {
    console.error('[FIREBASE ERROR] toggleReviewFeatured failed. Using fallback:', err.message);
    const idx = mockProducts.findIndex(p => p._id === productId || p.id === productId);
    if (idx !== -1) {
      if (mockProducts[idx].reviews) {
        mockProducts[idx].reviews = mockProducts[idx].reviews.map((r) =>
          r._id === reviewId || r.id === reviewId ? { ...r, featured: !!featured } : r
        );
      }
      return mockProducts[idx];
    }
    throw err;
  }
}

export async function getFeaturedReviews() {
  await ensureSeeded();
  let featuredList = [];

  if (!firebaseAvailable) {
    mockProducts.forEach((p) => {
      if (p.reviews) {
        p.reviews.forEach((r) => {
          if (r.featured) {
            featuredList.push({
              ...r,
              productId: p._id || p.id,
              productName: p.name,
            });
          }
        });
      }
    });
    return featuredList;
  }

  try {
    const q = query(collection(db, 'products'));
    const snap = await withTimeout(getDocs(q));
    snap.forEach((docSnap) => {
      const data = docToObj(docSnap);
      if (data.reviews) {
        data.reviews.forEach((r) => {
          if (r.featured) {
            featuredList.push({
              ...r,
              productId: data._id || data.id,
              productName: data.name,
            });
          }
        });
      }
    });
    return featuredList;
  } catch (err) {
    console.error('getFeaturedReviews failed:', err);
    return [];
  }
}
