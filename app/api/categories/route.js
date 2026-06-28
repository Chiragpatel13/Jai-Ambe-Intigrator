export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCategories, createCategory, getProducts } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hasProductsOnly = searchParams.get('hasProducts') === 'true';

    let categories = await getCategories();

    if (hasProductsOnly) {
      const { products } = await getProducts({ limit: 10000 });
      const categoryIdsWithProducts = new Set(
        products.map((p) => p.categoryId || p.category?._id || p.category?.id)
      );
      categories = categories.filter(
        (c) => categoryIdsWithProducts.has(c._id) || categoryIdsWithProducts.has(c.id)
      );
    }

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

    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check for existing slug
    const categories = await getCategories();
    const existing = categories.find((c) => c.slug === slug);
    if (existing) {
      return NextResponse.json(
        { error: 'A category with this name already exists.' },
        { status: 400 }
      );
    }

    const category = await createCategory({
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
