import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import { verifyAdminSession } from '@/utils/auth';
import { mockSettings } from '@/lib/mockData';

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ success: true, settings: mockSettings });
  }
  try {
    await connectDB();
    let settings = await Setting.findOne({});
    if (!settings) {
      // Create defaults if not present
      settings = await Setting.create({
        shopName: 'JAYAMBE INTEGRATORS',
        ownerName: 'Er. Anand',
        designation: 'EXTC ENGINEER',
        email: 'anandp4994@gmail.com',
        phone: '+91 8879430925',
        whatsapp: '918879430925',
        address: 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).',
        workingHours: 'Monday - Saturday: 9:00 AM - 8:00 PM, Sunday: Closed',
        banners: [
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        ],
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop settings.' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create(body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, body, {
        new: true,
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update shop settings.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  return PUT(req);
}
