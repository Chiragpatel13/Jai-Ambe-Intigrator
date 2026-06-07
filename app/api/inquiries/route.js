export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getInquiries, createInquiry } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('GET inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerName, phone, message, productId } = body;

    if (!customerName || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, contact number, and inquiry message are required.' },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry({
      customerName: customerName.trim(),
      phone: phone.trim(),
      message: message.trim(),
      productId: productId || '',
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error('POST inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry.' },
      { status: 500 }
    );
  }
}
