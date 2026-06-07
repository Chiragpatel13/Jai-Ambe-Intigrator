'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Save,
  Loader2,
  Phone,
  User,
  Store,
  Upload,
} from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';

const inputCls =
  'w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [ownerPhoto, setOwnerPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const loadSettings = useCallback(() => {
    setLoading(true);
    fetch('/api/settings', { cache: 'no-store', credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setShopName(s.shopName || '');
          setEmail(s.email || '');
          setPhone(s.phone || '');
          setWhatsapp(s.whatsapp || '');
          setAddress(s.address || '');
          setWorkingHours(s.workingHours || '');
          setOwnerName(s.ownerName || '');
          setDesignation(s.designation || '');
          setOwnerPhoto(s.ownerPhoto || '');
        }
      })
      .catch(() => triggerToast('Failed to load settings.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleOwnerPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      const data = await res.json();
      if (data.success && data.urls && data.urls.length > 0) {
        setOwnerPhoto(data.urls[0]);
        triggerToast('Owner photo uploaded successfully!', 'success');
      } else {
        triggerToast(data.error || 'Failed to upload photo.', 'error');
      }
    } catch (err) {
      console.error('Owner photo upload error:', err);
      triggerToast('Error uploading photo.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!shopName || !phone || !whatsapp) {
      triggerToast('Shop Name, Phone and WhatsApp are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          shopName, email, phone, whatsapp,
          address, workingHours, ownerName, designation, ownerPhoto,
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('Settings saved successfully!', 'success');
        loadSettings();
        // Broadcast to all open public tabs
        try {
          const ch = new BroadcastChannel('settings_channel');
          ch.postMessage({ type: 'SETTINGS_UPDATED' });
          ch.close();
        } catch (e) {}
      } else {
        triggerToast(data.error || 'Save failed.', 'error');
      }
    } catch {
      triggerToast('Failed to save.', 'error');
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
    <div className="space-y-6">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Header with Save */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Shop Settings</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure store details and contact information.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={submitting}
          className="self-start sm:self-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all disabled:opacity-60 w-full sm:w-auto"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {submitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* General */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Store size={13} className="text-white" />
            </div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">General Information</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shop Name *</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className={inputCls} placeholder="e.g. JayAmbe Integrators" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="contact@example.com" />
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              <User size={13} className="text-white" />
            </div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Owner Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Name</label>
                <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputCls} placeholder="e.g. Er. Anand" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Designation</label>
                <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} className={inputCls} placeholder="e.g. EXTC Engineer" />
              </div>
            </div>

            {/* Owner Photo */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                  <img
                    src={ownerPhoto || '/Anand.jpeg'}
                    alt="Owner Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOwnerPhotoUpload}
                    disabled={uploadingPhoto}
                    id="owner-photo-upload"
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <label
                      htmlFor="owner-photo-upload"
                      className={`cursor-pointer px-3.5 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 ${
                        uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 size={11} className="animate-spin text-indigo-500" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={11} />
                          <span>Choose Photo</span>
                        </>
                      )}
                    </label>
                    {ownerPhoto && ownerPhoto !== '/Anand.jpeg' && (
                      <button
                        type="button"
                        onClick={() => setOwnerPhoto('')}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-[10px] font-bold text-rose-600 bg-white hover:bg-rose-50 transition-all"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    Allowed formats: JPG, PNG, WEBP.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact — full width */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Phone size={13} className="text-white" />
            </div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Contact Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone *</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Number *</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} placeholder="919890254321" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Working Hours</label>
                <input type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} className={inputCls} placeholder="Mon–Sat, 10am–7pm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Store Address</label>
              <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputCls} resize-none`} placeholder="Shop No. 1, XYZ Complex, Boisar (W)" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
