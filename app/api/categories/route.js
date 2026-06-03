import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { verifyAdminSession } from '@/utils/auth';
import { mockCategories } from '@/lib/mockData';

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ success: true, categories: mockCategories });
  }
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('GET categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories.' },
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

    await connectDB();
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check for existing slug
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'A category with this name already exists.' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('POST category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category.' },
      { status: 500 }
    );
  }
}
