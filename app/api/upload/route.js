import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { verifyAdminSession } from '@/utils/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded.' },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const bytesPayload = new Uint8Array(arrayBuffer);
      
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${cleanFileName}`;

      try {
        // Try uploading to Firebase Storage first
        const fileRef = ref(storage, `products/${filename}`);
        await uploadBytes(fileRef, bytesPayload, {
          contentType: file.type || 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(fileRef);
        return downloadUrl;
      } catch (fbErr) {
        console.warn('[UPLOAD WARNING] Firebase Storage failed. Falling back to local disk storage:', fbErr.message);
        
        // Local Disk Storage fallback (perfect for local development without billing plan)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));
        
        return `/uploads/${filename}`;
      }
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images.' },
      { status: 500 }
    );
  }
}
