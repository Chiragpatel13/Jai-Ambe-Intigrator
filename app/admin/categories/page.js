'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Layers, RefreshCw, X, Check } from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      triggerToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name during creation/editing
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!editingId) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) {
      triggerToast('Name and slug are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast(
          editingId
            ? 'Category updated successfully!'
            : 'Category created successfully!',
          'success'
        );
        handleResetForm();
        fetchCategories();
      } else {
        triggerToast(data.error || 'Operation failed.', 'error');
      }
    } catch (err) {
      console.error('Category form error:', err);
      triggerToast('Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
  };

  const handleDeleteClick = async (id, catName) => {
    if (
      confirm(
        `Are you sure you want to delete category "${catName}"? This will unlink it from any products.`
      )
    ) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          triggerToast('Category deleted successfully!', 'success');
          fetchCategories();
        } else {
          triggerToast(data.error || 'Failed to delete category.', 'error');
        }
      } catch (err) {
        console.error('Delete category error:', err);
        triggerToast('Failed to delete category.', 'error');
      }
    }
  };

  const handleResetForm = () => {
    setName('');
    setSlug('');
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Toast notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Category Management</h1>
          <p className="text-xs text-gray-450 mt-1">Organize products into distinct groupings.</p>
        </div>
        <button
          onClick={fetchCategories}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-55 transition-colors"
          title="Refresh Categories"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form: Add/Edit */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={16} className="text-blue-500" />
            {editingId ? 'Edit Category' : 'Create Category'}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Laptops & Computers"
                value={name}
                onChange={handleNameChange}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                placeholder="e.g. laptops-computers"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-1 font-medium">Used in URL paths for filtering.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1"
              >
                {editingId ? <Check size={14} /> : <Plus size={14} />}
                <span>{editingId ? 'Update' : 'Create'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Categories List</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader size="medium" />
            </div>
          ) : categories.length > 0 ? (
            <div className="divide-y divide-gray-150">
              {categories.map((cat) => (
                <div key={cat._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-sm text-gray-850">{cat.name}</h3>
                    <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                      slug: {cat.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      title="Edit Category"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cat._id, cat.name)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-gray-450">No categories found. Build one using the form.</div>
          )}
        </div>
      </div>
    </div>
  );
}
