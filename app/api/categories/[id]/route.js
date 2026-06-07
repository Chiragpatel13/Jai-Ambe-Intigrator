export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCategories, updateCategory, deleteCategory, getProducts, updateProduct } from '@/lib/dbFirebase';
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
    const body = await req.json();
    const { name } = body;
    // Accept slug from body if provided, otherwise auto-generate from name
    const slug = body.slug ? body.slug.trim() : generateSlug(name);

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required.' },
        { status: 400 }
      );
    }
    if (!slug) {
      return NextResponse.json(
        { error: 'Category slug is required.' },
        { status: 400 }
      );
    }

    // Check if another category has the same slug
    const categories = await getCategories();
    const existing = categories.find((c) => c.slug === slug && c._id !== id);
    if (existing) {
      return NextResponse.json(
        { error: 'Another category with this name already exists.' },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, { name: name.trim(), slug });

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

    // Attempt to unlink products — non-blocking, errors are logged only
    try {
      const productsRes = await getProducts({ limit: 1000 });
      const usingProducts = productsRes.products.filter(
        (p) => p.categoryId === id || p.category?._id === id
      );
      for (const prod of usingProducts) {
        try {
          await updateProduct(prod._id, { categoryId: '' });
        } catch (err) {
          console.error(`Failed to unlink product ${prod._id} from category ${id}:`, err);
        }
      }
    } catch (unlinkErr) {
      // Don't block deletion if product fetch fails
      console.warn('Could not unlink products before deleting category:', unlinkErr.message);
    }

    // Always attempt the delete regardless of unlink outcome
    try {
      const deleted = await deleteCategory(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      return NextResponse.json({ error: err.message || 'Failed to delete category.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('DELETE category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category. Please try again.' },
      { status: 500 }
    );
  }
}

