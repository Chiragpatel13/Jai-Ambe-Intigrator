'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Layers, RefreshCw, X, Check, Tag } from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { notifyLiveSync } from '@/lib/liveSync';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch {
      triggerToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
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
        triggerToast(editingId ? 'Category updated!' : 'Category created!', 'success');
        handleResetForm();
        fetchCategories();
        notifyLiveSync('categories');
      } else {
        triggerToast(data.error || 'Operation failed.', 'error');
      }
    } catch {
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
    if (confirm(`Delete category "${catName}"?\n\nProducts using this category will be unlinked (set to Uncategorized).`)) {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
        const data = await res.json();
        if (data.success) {
          triggerToast('Category deleted successfully!', 'success');
          fetchCategories();
          notifyLiveSync('categories');
        } else {
          triggerToast(data.error || 'Failed to delete category.', 'error');
        }
      } catch {
        triggerToast('Network error. Failed to delete.', 'error');
      }
    }
  };

  const handleResetForm = () => {
    setName('');
    setSlug('');
    setEditingId(null);
  };

  // Color palette for category chips
  const chipColors = [
    { bg: 'rgba(99,102,241,0.1)', text: '#6366f1', border: 'rgba(99,102,241,0.2)' },
    { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
    { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
    { bg: 'rgba(236,72,153,0.1)', text: '#ec4899', border: 'rgba(236,72,153,0.2)' },
    { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
    { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  ];

  return (
    <div className="space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Category Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Organize products into distinct groupings.
          </p>
        </div>
        <button
          onClick={fetchCategories}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors shadow-sm"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Layers size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              {editingId ? 'Edit Category' : 'Create Category'}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Category Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Laptops & Computers"
                  value={name}
                  onChange={handleNameChange}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                />
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                URL Slug
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. laptops-computers"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">/</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                Auto-generated from name. Used in URL filters.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {editingId ? <Check size={13} /> : <Plus size={13} />}
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create Category'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Category List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              All Categories
            </h2>
            <span className="text-[10px] font-bold text-slate-400">
              {categories.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader size="medium" />
            </div>
          ) : categories.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {categories.map((cat, idx) => {
                const chip = chipColors[idx % chipColors.length];
                return (
                  <div
                    key={cat._id}
                    className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Color chip icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: chip.bg, border: `1px solid ${chip.border}` }}
                      >
                        <Layers size={15} style={{ color: chip.text }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{cat.name}</p>
                        <p
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 font-mono"
                          style={{ background: chip.bg, color: chip.text }}
                        >
                          /{cat.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat._id, cat.name)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              No categories yet. Create one using the form.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
