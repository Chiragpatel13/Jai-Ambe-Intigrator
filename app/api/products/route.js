import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { verifyAdminSession } from '@/utils/auth';

export async function GET(req) {
  try {
    await connectDB();
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

    const query = {};

    // 1. Search Query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Category Filter
    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) {
        query.category = cat._id;
      } else {
        // If category slug is not found, return empty results
        return NextResponse.json({
          success: true,
          products: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        });
      }
    }

    // 3. Condition Filter
    if (condition && (condition === 'new' || condition === 'used')) {
      query.condition = condition;
    }

    // 4. Featured Filter
    if (featured === 'true') {
      query.featured = true;
    }

    // 5. Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // 6. Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // 7. Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('category')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      products,
      total,
      totalPages,
      currentPage: page,
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

    await connectDB();
    const body = await req.json();
    const { name, price, condition, description, images, category, stock, availability, featured } = body;

    // Validate required fields
    if (!name || !price || !condition || !description || !category) {
      return NextResponse.json(
        { error: 'Name, price, condition, description, and category are required.' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Selected category does not exist.' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      price: parseFloat(price),
      condition,
      description,
      images: images || [],
      category,
      stock: stock !== undefined ? parseInt(stock, 10) : 1,
      availability: availability !== undefined ? availability : true,
      featured: featured !== undefined ? featured : false,
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
