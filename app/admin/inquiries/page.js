'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, Trash2, Eye, RefreshCw, X, MessageSquare } from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/inquiries${query}`);
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      triggerToast('Failed to load inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast(`Inquiry marked as ${nextStatus}!`, 'success');
        
        // Update local state to prevent full reload
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, status: nextStatus } : inq))
        );

        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: nextStatus });
        }
      } else {
        triggerToast(data.error || 'Failed to update status.', 'error');
      }
    } catch (err) {
      console.error('Status update error:', err);
      triggerToast('Something went wrong.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this inquiry forever?')) {
      try {
        const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          triggerToast('Inquiry deleted successfully!', 'success');
          setSelectedInquiry(null);
          fetchInquiries();
        } else {
          triggerToast(data.error || 'Failed to delete inquiry.', 'error');
        }
      } catch (err) {
        console.error('Delete inquiry error:', err);
        triggerToast('Failed to delete.', 'error');
      }
    }
  };

  const handleWhatsAppContact = (inq) => {
    const messageText = `Hello ${inq.customerName}, this is regarding your inquiry about "${inq.productId?.name || 'our products'}".`;
    window.open(`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Inquiry Management</h1>
          <p className="text-xs text-gray-450 mt-1">Review and manage lead queries submitted by visitors.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Tabs */}
          <div className="flex p-1 bg-gray-150 rounded-xl">
            {[
              { label: 'All', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchInquiries}
            className="p-2 rounded-lg border border-gray-255 hover:bg-gray-50 transition-colors"
            title="Refresh Inquiries"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Inquiry Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="large" />
        </div>
      ) : inquiries.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-150 text-gray-450 font-bold">
                  <th className="p-4 uppercase tracking-wider">Customer</th>
                  <th className="p-4 uppercase tracking-wider">Product Interest</th>
                  <th className="p-4 uppercase tracking-wider">Date</th>
                  <th className="p-4 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-850">{inq.customerName}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">{inq.phone}</div>
                    </td>
                    <td className="p-4">
                      {inq.productId ? (
                        <div className="font-semibold text-gray-800 line-clamp-1">
                          {inq.productId.name}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">General Inquiry</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 font-medium">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleUpdateStatus(inq._id, inq.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.75 rounded-full text-[10px] font-bold border transition-colors ${
                          inq.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                        }`}
                      >
                        {inq.status === 'pending' ? <Clock size={10} /> : <CheckCircle size={10} />}
                        <span>{inq.status.toUpperCase()}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-150 hover:text-indigo-600 transition-colors"
                          title="View Inquiry details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inq._id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Inquiry"
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
        </div>
      ) : (
        <div className="p-20 text-center text-xs text-gray-450 border border-dashed border-gray-200 bg-white rounded-2xl">
          No inquiries found matching this status filter.
        </div>
      )}

      {/* Inquiry View Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title="Customer Inquiry Details"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Customer Name
                </span>
                <p className="text-sm font-bold text-gray-800">{selectedInquiry.customerName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Phone Number
                </span>
                <p className="text-sm font-bold text-indigo-650">{selectedInquiry.phone}</p>
              </div>
            </div>

            {selectedInquiry.productId && (
              <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Product of Interest
                </span>
                <div className="flex gap-3 items-center mt-1">
                  {selectedInquiry.productId.images?.length > 0 && (
                    <img
                      src={selectedInquiry.productId.images[0]}
                      alt={selectedInquiry.productId.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {selectedInquiry.productId.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      Price: ₹{selectedInquiry.productId.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Inquiry Message
              </span>
              <p className="text-xs text-gray-650 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150 whitespace-pre-line italic">
                "{selectedInquiry.message}"
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-150">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedInquiry._id, selectedInquiry.status)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    selectedInquiry.status === 'pending'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-150 text-gray-700'
                  }`}
                >
                  {selectedInquiry.status === 'pending' ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Mark Completed</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} />
                      <span>Re-open to Pending</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleWhatsAppContact(selectedInquiry)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={14} />
                  <span>Reply on WhatsApp</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="p-2 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Delete Inquiry"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
