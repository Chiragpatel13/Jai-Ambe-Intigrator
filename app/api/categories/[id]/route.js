import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { verifyAdminSession } from '@/utils/auth';

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export async function PUT(req, { params }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check if another category has the same slug
    const existing = await Category.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return NextResponse.json(
        { error: 'Another category with this name already exists.' },
        { status: 400 }
      );
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { name: name.trim(), slug },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('PUT category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category.' },
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
    await connectDB();

    // Check if category is used by any products
    const productsUsingCategory = await Product.countDocuments({ category: id });
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete category because it is assigned to products. Reassign or delete those products first.',
        },
        { status: 400 }
      );
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
