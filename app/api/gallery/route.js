import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WorkGallery from '@/models/WorkGallery';
import { verifyAdminSession } from '@/utils/auth';

export async function GET() {
  try {
    await connectDB();
    const items = await WorkGallery.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('GET gallery items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { title, description, mediaUrl, mediaType } = body;

    if (!title || !mediaUrl || !mediaType) {
      return NextResponse.json(
        { error: 'Title, mediaUrl, and mediaType are required fields.' },
        { status: 400 }
      );
    }

    const item = await WorkGallery.create({
      title,
      description: description || '',
      mediaUrl,
      mediaType,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error('POST gallery item error:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item.' },
      { status: 500 }
    );
  }
}
