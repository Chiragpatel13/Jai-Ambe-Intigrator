'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Settings states
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [banners, setBanners] = useState([]);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setShopName(s.shopName || '');
          setEmail(s.email || '');
          setPhone(s.phone || '');
          setWhatsapp(s.whatsapp || '');
          setAddress(s.address || '');
          setWorkingHours(s.workingHours || '');
          setBanners(s.banners || []);
        }
      })
      .catch((err) => {
        console.error('Settings fetch error:', err);
        triggerToast('Failed to load settings.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setBanners((prev) => [...prev, data.url]);
        triggerToast('Banner image uploaded successfully!', 'success');
      } else {
        triggerToast(data.error || 'Failed to upload image.', 'error');
      }
    } catch (err) {
      console.error('Upload banner error:', err);
      triggerToast('Error uploading banner file.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddBannerUrl = () => {
    if (!newBannerUrl) return;
    setBanners((prev) => [...prev, newBannerUrl]);
    setNewBannerUrl('');
    triggerToast('Added banner URL successfully!', 'success');
  };

  const handleRemoveBanner = (indexToRemove) => {
    setBanners((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    triggerToast('Banner removed. Remember to save changes.', 'info');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!shopName || !phone || !whatsapp) {
      triggerToast('Shop Name, Phone and WhatsApp are required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          email,
          phone,
          whatsapp,
          address,
          workingHours,
          banners,
        }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast('Shop settings updated successfully!', 'success');
      } else {
        triggerToast(data.error || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      triggerToast('Failed to save settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    );
  }

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Shop Settings</h1>
          <p className="text-xs text-gray-450 mt-1">Configure global store details, branding, contacts, and homepage slide images.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <Settings size={16} className="text-blue-500" />
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-255 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-255 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp Number (e.g. 919890254321)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-255 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Store Physical Address</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-255 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Working Hours Timings</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-255 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              <span>{submitting ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Banners Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <ImageIcon size={16} className="text-blue-500" />
            Homepage Banners
          </h2>

          {/* Banner list */}
          <div className="space-y-3">
            {banners.length > 0 ? (
              banners.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                  <img src={url} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveBanner(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                No custom banners added. Add one below.
              </div>
            )}
          </div>

          {/* Add banner controls */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {/* Direct URL */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Image URL"
                value={newBannerUrl}
                onChange={(e) => setNewBannerUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddBannerUrl}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                title="Add URL"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* File Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                id="banner-file"
                className="hidden"
                disabled={uploadingImage}
              />
              <label
                htmlFor="banner-file"
                className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-600 cursor-pointer transition-colors ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-gray-500" />
                    <span>Upload Image File</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
