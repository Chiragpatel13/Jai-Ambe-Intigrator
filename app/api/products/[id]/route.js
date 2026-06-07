export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('GET product details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product details.' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateProduct(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product.' },
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

    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
