import { NextResponse } from 'next/server';
import { deleteGalleryItem } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function DELETE(req, { params }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    await deleteGalleryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE gallery item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item.' },
      { status: 500 }
    );
  }
}
