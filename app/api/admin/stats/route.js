import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Inquiry from '@/models/Inquiry';
import { verifyAdminSession } from '@/utils/auth';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();

    // Aggregate counts
    const totalProducts = await Product.countDocuments();
    const newProducts = await Product.countDocuments({ condition: 'new' });
    const usedProducts = await Product.countDocuments({ condition: 'used' });
    const totalInquiries = await Inquiry.countDocuments();
    const pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });

    // Fetch 5 most recent inquiries
    const recentInquiries = await Inquiry.find({})
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch 5 most recent products
    const recentProducts = await Product.find({})
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        newProducts,
        usedProducts,
        totalInquiries,
        pendingInquiries,
      },
      recentInquiries,
      recentProducts,
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to compile dashboard statistics.' },
      { status: 500 }
    );
  }
}
