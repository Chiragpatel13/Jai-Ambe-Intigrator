export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getGalleryItems, createGalleryItem } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function GET() {
  try {
    const items = await getGalleryItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('GET gallery error:', error);
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

    const body = await req.json();
    const { title, description, mediaUrl, mediaType } = body;

    if (!title || !mediaUrl) {
      return NextResponse.json(
        { error: 'Title and media URL are required.' },
        { status: 400 }
      );
    }

    const item = await createGalleryItem({
      title: title.trim(),
      description: description ? description.trim() : '',
      mediaUrl,
      mediaType: mediaType || 'image',
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error('POST gallery error:', error);
    return NextResponse.json(
      { error: 'Failed to add gallery item.' },
      { status: 500 }
    );
  }
}
