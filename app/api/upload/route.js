import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { verifyAdminSession } from '@/utils/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { uploadToCloudinary } from '@/utils/cloudinary';

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

      let lastCloudinaryError = null;
      let lastFirebaseError = null;

      // Check if Cloudinary is configured
      const isCloudinaryConfigured = 
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder' &&
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_KEY !== 'placeholder' &&
        process.env.CLOUDINARY_API_SECRET && 
        process.env.CLOUDINARY_API_SECRET !== 'placeholder';

      if (isCloudinaryConfigured) {
        try {
          const fileBuffer = Buffer.from(arrayBuffer);
          const cloudinaryUrl = await uploadToCloudinary(fileBuffer);
          return cloudinaryUrl;
        } catch (cloudinaryErr) {
          console.warn('[UPLOAD WARNING] Cloudinary upload failed. Falling back to Firebase Storage:', cloudinaryErr.message);
          lastCloudinaryError = cloudinaryErr.message;
        }
      }

      try {
        // Try uploading to Firebase Storage next
        const fileRef = ref(storage, `products/${filename}`);
        await uploadBytes(fileRef, bytesPayload, {
          contentType: file.type || 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(fileRef);
        return downloadUrl;
      } catch (fbErr) {
        console.warn('[UPLOAD WARNING] Firebase Storage failed. Falling back to local disk storage:', fbErr.message);
        lastFirebaseError = fbErr.message;
        
        try {
          // Local Disk Storage fallback (perfect for local development without billing plan)
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadDir, { recursive: true });
          
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, Buffer.from(arrayBuffer));
          
          return `/uploads/${filename}`;
        } catch (localDiskErr) {
          console.error('[UPLOAD ERROR] Local disk storage fallback failed:', localDiskErr.message);
          
          let errMsg = `Upload failed for ${file.name}.`;
          if (isCloudinaryConfigured && lastCloudinaryError) {
            errMsg += ` Cloudinary error: ${lastCloudinaryError}.`;
          } else if (!isCloudinaryConfigured) {
            errMsg += ` Cloudinary is not configured in environment variables.`;
          }
          errMsg += ` Firebase Storage error: ${lastFirebaseError}.`;
          errMsg += ` Local disk fallback error: ${localDiskErr.message} (this fallback fails on read-only serverless hosts like Vercel).`;
          
          throw new Error(errMsg);
        }
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
      { error: error.message || 'Failed to upload images.' },
      { status: 500 }
    );
  }
}
