export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  const startTime = Date.now();
  const status = {
    timestamp: new Date().toISOString(),
    activeSource: 'firestore',
    firestore: {
      connected: false,
      latencyMs: 0,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jayambe-integrators',
      counts: {
        products: 0,
        categories: 0,
        gallery: 0,
        inquiries: 0,
      },
    },
    mongodb: {
      configured: !!process.env.MONGODB_URI,
      connected: false,
      error: null,
      host: null,
    },
    imageStatus: {
      totalProductImages: 0,
      totalGalleryImages: 0,
    },
  };

  // 1. Check Firestore
  try {
    const [prodSnap, catSnap, galSnap, inqSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'gallery')),
      getDocs(collection(db, 'inquiries')).catch(() => ({ size: 0 })),
    ]);

    status.firestore.connected = true;
    status.firestore.latencyMs = Date.now() - startTime;
    status.firestore.counts.products = prodSnap.size;
    status.firestore.counts.categories = catSnap.size;
    status.firestore.counts.gallery = galSnap.size;
    status.firestore.counts.inquiries = inqSnap.size || 0;

    let prodImgCount = 0;
    prodSnap.forEach((doc) => {
      const data = doc.data();
      const imgs = data.images || data.image || data.imageUrl;
      if (Array.isArray(imgs)) prodImgCount += imgs.length;
      else if (typeof imgs === 'string' && imgs) prodImgCount += 1;
    });
    status.imageStatus.totalProductImages = prodImgCount;
    status.imageStatus.totalGalleryImages = galSnap.size;
  } catch (err) {
    status.firestore.connected = false;
    status.firestore.error = err.message;
  }

  // 2. Check MongoDB
  if (process.env.MONGODB_URI) {
    try {
      const hostPart = process.env.MONGODB_URI.split('@')[1] || 'configured';
      status.mongodb.host = hostPart.split('/')[0];
      const connectDB = (await import('@/lib/db')).default;
      await connectDB();
      status.mongodb.connected = true;
      status.activeSource = 'mongodb';
    } catch (err) {
      status.mongodb.connected = false;
      status.mongodb.error = err.message;
    }
  }

  return NextResponse.json({
    success: true,
    connected: status.firestore.connected || status.mongodb.connected,
    source: status.activeSource,
    latency: status.firestore.latencyMs,
    projectId: status.firestore.projectId,
    ...status,
  });
}
