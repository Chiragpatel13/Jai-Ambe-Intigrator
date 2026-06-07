export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export async function GET() {
  const startTime = Date.now();
  try {
    // Lightweight ping: fetch at most 1 doc from the settings collection
    const q = query(collection(db, 'settings'), limit(1));
    await getDocs(q);
    const latency = Date.now() - startTime;
    return NextResponse.json({
      connected: true,
      source: 'firestore',
      latency,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jayambe-integrators',
    });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      source: 'mock_fallback',
      error: err.message,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jayambe-integrators',
    });
  }
}
