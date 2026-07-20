import { NextResponse } from 'next/server';
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
      // Reject obvious placeholder / corrupt files
      if (file.size < 500) {
        throw new Error(
          `File "${file.name}" is too small (${file.size} bytes). ` +
          `It may be corrupted or not a valid image.`
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${cleanFileName}`;
      const mimeType = file.type || 'image/jpeg';

      // ── 1. Try Cloudinary (fastest CDN, ideal for production) ──────────────
      const isCloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder' &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_KEY !== 'placeholder' &&
        process.env.CLOUDINARY_API_SECRET &&
        process.env.CLOUDINARY_API_SECRET !== 'placeholder';

      if (isCloudinaryConfigured) {
        try {
          const url = await uploadToCloudinary(fileBuffer);
          console.log(`[UPLOAD] ✅ Cloudinary: ${url}`);
          return url;
        } catch (err) {
          console.warn('[UPLOAD] Cloudinary failed, trying Firebase Admin:', err.message);
        }
      }

      // ── 2. Try Firebase Admin SDK (works on Vercel, bypasses security rules) ──
      const isAdminConfigured =
        (!!process.env.FIREBASE_ADMIN_PROJECT_ID && !!process.env.FIREBASE_ADMIN_PRIVATE_KEY && !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) ||
        !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

      if (isAdminConfigured) {
        try {
          const { getAdminStorageBucket } = await import('@/lib/firebaseAdmin');
          const bucket = getAdminStorageBucket();

          const fileRef = bucket.file(`products/${filename}`);

          await fileRef.save(fileBuffer, {
            metadata: { contentType: mimeType },
            resumable: false,
          });

          // Attempt to make file public (ignore error if uniform bucket policy is enabled)
          try {
            await fileRef.makePublic();
          } catch (pubErr) {
            console.warn('[UPLOAD] makePublic warning (using public URL):', pubErr.message);
          }

          const bucketName = bucket.name || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'jayambe-integrators.firebasestorage.app';
          const publicUrl = `https://storage.googleapis.com/${bucketName}/products/${filename}`;

          console.log(`[UPLOAD] ✅ Firebase Admin Storage: ${publicUrl}`);
          return publicUrl;
        } catch (err) {
          console.warn('[UPLOAD] Firebase Admin Storage failed:', err.message);
        }
      }

      // ── 3. Try Local Disk (development environment only) ───────────────────
      if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, fileBuffer);
          console.log(`[UPLOAD] ✅ Local disk: /uploads/${filename}`);
          return `/uploads/${filename}`;
        } catch (localErr) {
          console.warn('[UPLOAD] Local disk failed, falling back to base64 Data URL:', localErr.message);
        }
      }

      // ── 4. Bulletproof Live Fallback: Base64 Data URL ──────────────────────
      // Ensures uploads in live Vercel/serverless environments NEVER throw 500 errors
      // even if Cloudinary & Firebase credentials are not provided.
      console.log(`[UPLOAD] ✅ Serverless Live Base64 Data URL created for "${file.name}"`);
      const base64String = fileBuffer.toString('base64');
      return `data:${mimeType};base64,${base64String}`;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error('[UPLOAD ERROR]', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images.' },
      { status: 500 }
    );
  }
}
