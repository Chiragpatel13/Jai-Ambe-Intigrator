export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getProducts, createProduct, getCategoryById } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const featured = searchParams.get('featured') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const daysLimit = searchParams.get('daysLimit') || '';

    const result = await getProducts({
      search,
      category: categorySlug,
      condition,
      featured,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
      daysLimit,
    });

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products.' },
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

    const body = await req.json();
    const { name, price, condition, description, images, category, stock, availability, featured, brand, warranty, location } = body;

    // Validate required fields
    if (!name || !condition || !description || !category) {
      return NextResponse.json(
        { error: 'Name, condition, description, and category are required.' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await getCategoryById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Selected category does not exist.' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name,
      price: price ? parseFloat(price) : 0,
      condition,
      description,
      images: images || [],
      categoryId: category,
      stock: stock !== undefined ? parseInt(stock, 10) : 1,
      availability: availability !== undefined ? availability : true,
      featured: featured !== undefined ? featured : false,
      brand: brand || '',
      warranty: warranty || '',
      location: location || '',
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product.' },
      { status: 500 }
    );
  }
}
