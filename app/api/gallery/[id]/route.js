import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WorkGallery from '@/models/WorkGallery';
import { verifyAdminSession } from '@/utils/auth';

export async function DELETE(req, { params }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    await connectDB();
    const deletedItem = await WorkGallery.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (error) {
    console.error('DELETE gallery item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item.' },
      { status: 500 }
    );
  }
}
