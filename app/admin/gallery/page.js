'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  FileVideo,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  
  // Helpers
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      } else {
        triggerToast(data.error || 'Failed to load gallery items.', 'error');
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      triggerToast('Failed to load gallery items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreateModal = () => {
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setMediaType('image');
    setIsModalOpen(true);
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Detect type
    const isVideo = file.type.startsWith('video/');
    const detectedType = isVideo ? 'video' : 'image';

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('files', file); // API expects key 'files'

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls && data.urls.length > 0) {
        setMediaUrl(data.urls[0]);
        setMediaType(detectedType);
        triggerToast('Media uploaded successfully!', 'success');
      } else {
        triggerToast(data.error || 'Failed to upload media.', 'error');
      }
    } catch (err) {
      console.error('File upload error:', err);
      triggerToast('Error uploading files.', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !mediaUrl) {
      triggerToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          mediaUrl,
          mediaType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast('Showcase item added successfully!', 'success');
        setIsModalOpen(false);
        fetchItems();
      } else {
        triggerToast(data.error || 'Operation failed.', 'error');
      }
    } catch (err) {
      console.error('Gallery form submit error:', err);
      triggerToast('Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, itemTitle) => {
    if (confirm(`Are you sure you want to delete the showcase item "${itemTitle}"?`)) {
      try {
        const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          triggerToast('Showcase item deleted successfully!', 'success');
          fetchItems();
        } else {
          triggerToast(data.error || 'Failed to delete.', 'error');
        }
      } catch (err) {
        console.error('Delete gallery item error:', err);
        triggerToast('Failed to delete item.', 'error');
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
          <h1 className="text-2xl font-black text-gray-900">Work Showcase & Gallery</h1>
          <p className="text-xs text-gray-450 mt-1">Upload images and videos of completed works for client viewing.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors shrink-0"
        >
          <Plus size={14} />
          <span>Add Gallery Item</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="large" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-video bg-gray-50 border-b border-gray-150 flex items-center justify-center overflow-hidden">
                {item.mediaType === 'video' ? (
                  <video
                    src={item.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Media Type Icon Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 text-white p-1.5 rounded-lg text-xs flex items-center gap-1">
                  {item.mediaType === 'video' ? <FileVideo size={14} /> : <ImageIcon size={14} />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.mediaType}</span>
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white text-gray-800 hover:bg-gray-100 rounded-full shadow transition-colors"
                    title="View Media File"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="p-2 bg-rose-600 text-white hover:bg-rose-750 rounded-full shadow transition-colors"
                    title="Delete Showcase Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Detail content */}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-850 text-sm leading-snug truncate">{item.title}</h3>
                  <p className="text-gray-450 text-xs mt-1.5 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold mt-3">
                  Uploaded: {new Date(item.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-20 text-center text-xs text-gray-450 border border-dashed border-gray-200 bg-white rounded-2xl">
          No works have been added to the gallery yet. Click "Add Gallery Item" to get started.
        </div>
      )}

      {/* Upload Showcase Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Gallery Showcase Item"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-655 mb-1.5">Showcase Title *</label>
            <input
              type="text"
              placeholder="e.g. CCTV Security Installation at Boisar Retail Hub"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-655 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Provide context about the project, customer satisfaction, or tech hardware used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-250 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Media File Upload */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-gray-655">Showcase Photo or Video File *</label>

            {mediaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video w-full group">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mediaUrl} alt="Showcase Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/85 text-white p-2 rounded-full shadow transition-colors"
                  title="Remove Media"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={uploadingMedia}
                  id="gallery-media-upload"
                  className="hidden"
                />
                <label
                  htmlFor="gallery-media-upload"
                  className={`w-full h-36 rounded-xl border border-dashed border-gray-350 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors ${
                    uploadingMedia ? 'opacity-55 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingMedia ? (
                    <div className="flex flex-col items-center gap-1">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="text-xs font-semibold text-gray-500">Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-xs font-bold mt-2 text-gray-700">Choose Image or Video File</span>
                      <span className="text-[10px] text-gray-400 mt-1">Images/MP4 video files supported</span>
                    </>
                  )}
                </label>
              </div>
            )}
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
              disabled={submitting || !mediaUrl}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Showcase Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
