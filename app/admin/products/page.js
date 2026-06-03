'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  Laptop,
  AlertTriangle,
  RefreshCw,
  Star,
  Loader2,
} from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

function ProductsAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('new');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(1);
  const [availability, setAvailability] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState([]);
  
  // Helpers
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        limit: '10',
      });
      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      triggerToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch categories & products
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Handle action parameter on mount (e.g. from Quick Controls "Add Product")
  useEffect(() => {
    if (actionParam === 'new') {
      handleOpenCreateModal();
      // Clear query params to prevent reopening on reloads
      router.replace('/admin/products');
    }
  }, [actionParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory(categories[0]?._id || '');
    setCondition('new');
    setDescription('');
    setStock(1);
    setAvailability(true);
    setFeatured(false);
    setImages([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setCategory(prod.category?._id || prod.category || '');
    setCondition(prod.condition || 'new');
    setDescription(prod.description || '');
    setStock(prod.stock || 0);
    setAvailability(prod.availability);
    setFeatured(prod.featured || false);
    setImages(prod.images || []);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          triggerToast(data.error || 'Failed to upload image.', 'error');
        }
      }
      triggerToast('Images uploaded successfully!', 'success');
    } catch (err) {
      console.error('File upload error:', err);
      triggerToast('Error uploading files.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !category || !description) {
      triggerToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        name,
        price: parseFloat(price),
        category,
        condition,
        description,
        stock: parseInt(stock, 10),
        availability,
        featured,
        images,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast(
          editingProduct
            ? 'Product updated successfully!'
            : 'Product created successfully!',
          'success'
        );
        setIsModalOpen(false);
        fetchProducts();
      } else {
        triggerToast(data.error || 'Operation failed.', 'error');
      }
    } catch (err) {
      console.error('Product form submit error:', err);
      triggerToast('Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, prodName) => {
    if (confirm(`Are you sure you want to delete "${prodName}" from the database forever?`)) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          triggerToast('Product deleted successfully!', 'success');
          fetchProducts();
        } else {
          triggerToast(data.error || 'Failed to delete.', 'error');
        }
      } catch (err) {
        console.error('Delete product error:', err);
        triggerToast('Failed to delete product.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Management</h1>
          <p className="text-xs text-gray-450 mt-1">Manage hardware stock, pricing, and conditions.</p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-60"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Search size={14} />
            </div>
          </form>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="large" />
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-150 text-gray-455 font-bold">
                  <th className="p-4 uppercase tracking-wider">Product Info</th>
                  <th className="p-4 uppercase tracking-wider">Category</th>
                  <th className="p-4 uppercase tracking-wider">Price</th>
                  <th className="p-4 uppercase tracking-wider text-center">Stock</th>
                  <th className="p-4 uppercase tracking-wider text-center">Featured</th>
                  <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                        {prod.images.length > 0 ? (
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Pic</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-850 truncate max-w-xs">{prod.name}</div>
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.25 rounded ${
                            prod.condition === 'new'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {prod.condition.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-semibold">
                      {prod.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      {prod.availability && prod.stock > 0 ? (
                        <span className="font-semibold text-emerald-600">
                          {prod.stock} units
                        </span>
                      ) : (
                        <span className="font-semibold text-rose-500 flex items-center justify-center gap-1">
                          <AlertTriangle size={12} /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {prod.featured ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <Star size={10} className="fill-current" /> Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-150 hover:text-indigo-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id, prod.name)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-20 text-center text-xs text-gray-450 border border-dashed border-gray-200 bg-white rounded-2xl">
          No products matched the keyword. Try clearing the search.
        </div>
      )}

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-655 mb-1.5">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Lenovo ThinkPad T480"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-655 mb-1.5">Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 24000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-655 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-gray-655 mb-1.5">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="new">Brand New</option>
                <option value="used">Used / Refurbished</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-gray-655 mb-1.5">Stock Count</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-655 mb-1.5">Description *</label>
            <textarea
              rows={4}
              placeholder="Enter product specifications, features, and condition details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span>Available in Stock</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span>Featured Product</span>
            </label>
          </div>

          {/* Images Section */}
          <div className="space-y-3 pt-2 border-t border-gray-150">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Product Images</label>

            {/* Preview row */}
            <div className="flex flex-wrap gap-2">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group shrink-0">
                  <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* Upload Loader/Input */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  id="prod-image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="prod-image-upload"
                  className={`w-16 h-16 rounded-lg border border-dashed border-gray-350 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors ${
                    uploadingImage ? 'opacity-55 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImage ? (
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                  ) : (
                    <>
                      <Upload size={16} />
                      <span className="text-[8px] font-bold mt-1">Upload</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-150 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Wrapper for search params client hydration limits
export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    }>
      <ProductsAdminContent />
    </Suspense>
  );
}
