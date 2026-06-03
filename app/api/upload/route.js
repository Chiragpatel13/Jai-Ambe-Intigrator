import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { verifyAdminSession } from '@/utils/auth';

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
      const buffer = Buffer.from(arrayBuffer);
      // Stream to Cloudinary
      return uploadToCloudinary(buffer);
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images. Check Cloudinary settings.' },
      { status: 500 }
    );
  }
}
