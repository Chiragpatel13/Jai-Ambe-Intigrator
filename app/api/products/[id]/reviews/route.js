export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { addProductReview, deleteProductReview, toggleReviewFeatured } from '@/lib/dbFirebase';
import { verifyAdminSession } from '@/utils/auth';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, rating, comment } = body;

    if (!name || !rating || !comment) {
      return NextResponse.json(
        { error: 'Name, rating, and comment are required.' },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5.' },
        { status: 400 }
      );
    }

    const updated = await addProductReview(id, {
      name: name.trim(),
      rating: ratingNum,
      comment: comment.trim(),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reviews: updated.reviews || [] });
  } catch (error) {
    console.error('POST review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review.' },
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
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
    }

    const updated = await deleteProductReview(id, reviewId);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reviews: updated.reviews || [] });
  } catch (error) {
    console.error('DELETE review error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review.' },
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
    const { reviewId, featured } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
    }

    const updated = await toggleReviewFeatured(id, reviewId, featured);
    if (!updated) {
      return NextResponse.json({ error: 'Product or review not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reviews: updated.reviews || [] });
  } catch (error) {
    console.error('PUT review featured error:', error);
    return NextResponse.json(
      { error: 'Failed to update review status.' },
      { status: 500 }
    );
  }
}
