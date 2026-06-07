import { NextResponse } from 'next/server';
import { updateInquiry, deleteInquiry } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function PUT(req, { params }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || (status !== 'pending' && status !== 'completed')) {
      return NextResponse.json(
        { error: "Status must be either 'pending' or 'completed'." },
        { status: 400 }
      );
    }

    const updated = await updateInquiry(id, { status });

    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error('PUT inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;

    const success = await deleteInquiry(id);
    if (!success) {
      return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry.' },
      { status: 500 }
    );
  }
}
