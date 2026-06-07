'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  X,
  Laptop,
  AlertTriangle,
  RefreshCw,
  Star,
  Loader2,
  PackageSearch,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import Loader from '@/components/Loader';
import { notifyLiveSync } from '@/lib/liveSync';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

const inputCls =
  'w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('new');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(1);
  const [availability, setAvailability] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search: searchTerm, page: currentPage.toString(), limit: '10' });
      const res = await fetch(`/api/products?${query}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch {
      triggerToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.categories); });
  }, []);

  useEffect(() => { fetchProducts(); }, [currentPage]);

  useEffect(() => {
    if (actionParam === 'new') {
      handleOpenCreateModal();
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
    setName(''); setPrice(''); setCategory(categories[0]?._id || '');
    setCondition('new'); setDescription(''); setStock(1);
    setAvailability(true); setFeatured(false); setImages([]);
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
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.urls) {
        setImages((prev) => [...prev, ...data.urls]);
        triggerToast('Images uploaded!', 'success');
      } else {
        triggerToast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      triggerToast('Error uploading files.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !description) {
      triggerToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const payload = { name, price: price ? parseFloat(price) : 0, category, condition, description, stock: parseInt(stock, 10), availability, featured, images };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        triggerToast(editingProduct ? 'Product updated!' : 'Product created!', 'success');
        setIsModalOpen(false);
        fetchProducts();
        notifyLiveSync('products');
      } else {
        triggerToast(data.error || 'Operation failed.', 'error');
      }
    } catch {
      triggerToast('Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerToast('Product deleted!', 'success');
        setDeletingProduct(null);
        fetchProducts();
        notifyLiveSync('products');
      } else {
        triggerToast(data.error || 'Delete failed.', 'error');
      }
    } catch {
      triggerToast('Failed to delete.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Product Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Manage hardware stock, pricing, and conditions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchProducts}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader size="large" /></div>
      ) : products.length > 0 ? (
        <>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {products.map((prod) => (
            <div key={prod._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  {prod.images?.length > 0 ? (
                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Laptop size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 leading-snug">{prod.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        prod.condition === 'new'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {prod.condition?.toUpperCase()}
                    </span>
                    {prod.featured && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                        <Star size={8} className="fill-current" /> Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {prod.price && prod.price > 0
                      ? `₹${prod.price.toLocaleString('en-IN')}`
                      : 'Ask for Price'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Stock</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {prod.availability && prod.stock > 0 ? `${prod.stock} units` : 'Out of Stock'}
                  </p>
                </div>
              </div>
              {prod.category?.name && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <LayoutGrid size={9} />
                  {prod.category.name}
                </span>
              )}
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(prod)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingProduct(prod)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stock</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Featured</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          {prod.images?.length > 0 ? (
                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Laptop size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate max-w-[200px]">{prod.name}</p>
                          <span
                            className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              prod.condition === 'new'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {prod.condition?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {prod.category?.name ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <LayoutGrid size={9} />
                          {prod.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {prod.price && prod.price > 0
                        ? `₹${prod.price.toLocaleString('en-IN')}`
                        : <span className="text-slate-400 italic font-medium text-xs">Ask for Price</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {prod.availability && prod.stock > 0 ? (
                        <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          {prod.stock} units
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">
                          <AlertTriangle size={10} /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {prod.featured ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star size={9} className="fill-current" /> Featured
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(prod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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
            <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-600 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Shared pagination */}
        {totalPages > 1 && (
          <div className="md:hidden px-1 py-2 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-600 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <PackageSearch size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-400">No products matched your search.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing the search or add a new product.</p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={deletingProduct !== null} onClose={() => setDeletingProduct(null)} title="Delete Product">
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <p className="text-sm text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-slate-900">"{deletingProduct?.name}"</span>?
              This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeletingProduct(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirmDelete(deletingProduct._id)}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Delete Forever
            </button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input type="text" placeholder="e.g. Lenovo ThinkPad T480" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
              <input type="number" placeholder="0 = Ask for Price" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputCls}>
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputCls}>
                <option value="new">Brand New</option>
                <option value="used">Used / Refurbished</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Count</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description *</label>
            <textarea
              rows={4}
              placeholder="Enter product specifications, features, and condition details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 py-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
              Available in Stock
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
              Featured Product
            </label>
          </div>

          {/* Images */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Images</label>
            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group shrink-0">
                  <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              <div className="relative">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} id="prod-image-upload" className="hidden" />
                <label
                  htmlFor="prod-image-upload"
                  className={`w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 cursor-pointer transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadingImage ? (
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                  ) : (
                    <>
                      <Upload size={15} />
                      <span className="text-[8px] font-bold mt-0.5">Add</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <Loader size="large" />
        </div>
      }
    >
      <ProductsAdminContent />
    </Suspense>
  );
}
