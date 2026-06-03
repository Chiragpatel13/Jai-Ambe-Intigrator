import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { verifyAdminSession } from '@/utils/auth';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();
    const inquiries = await Inquiry.find({})
      .populate('productId')
      .sort({ createdAt: -1 });

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
    await connectDB();
    const body = await req.json();
    const { customerName, phone, message, productId } = body;

    if (!customerName || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, contact number, and inquiry message are required.' },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      message: message.trim(),
      productId: productId || undefined,
      status: 'pending',
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
