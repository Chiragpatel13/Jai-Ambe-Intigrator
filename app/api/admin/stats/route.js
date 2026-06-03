import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Inquiry from '@/models/Inquiry';
import { verifyAdminSession } from '@/utils/auth';
import { mockProducts } from '@/lib/mockData';

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: mockProducts.length,
        newProducts: mockProducts.filter((p) => p.condition === 'new').length,
        usedProducts: mockProducts.filter((p) => p.condition === 'used').length,
        totalInquiries: 0,
        pendingInquiries: 0,
      },
      recentInquiries: [],
      recentProducts: mockProducts.slice(0, 5),
    });
  }

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
