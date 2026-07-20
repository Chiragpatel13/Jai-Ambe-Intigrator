import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { seedFirebaseDatabase } from '@/lib/seedFirebase';

export async function GET(req) {
  try {
    // 1. Delete all products
    const productCol = collection(db, 'products');
    const productSnap = await getDocs(productCol);
    for (const docSnap of productSnap.docs) {
      await deleteDoc(docSnap.ref);
    }

    // 2. Clear catalogVersion in settings
    const settingsDocRef = doc(db, 'settings', 'global_settings');
    await setDoc(settingsDocRef, { catalogVersion: 0 }, { merge: true });

    // 3. Trigger seeding
    await seedFirebaseDatabase();

    // 4. Verify count
    const finalProductSnap = await getDocs(productCol);

    return new Response(JSON.stringify({
      success: true,
      message: 'Purged and re-seeded successfully with reviews',
      count: finalProductSnap.size
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
