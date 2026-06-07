'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  MessageSquare,
  X,
  Search,
} from 'lucide-react';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [counts, setCounts] = useState({ all: 0, pending: 0, completed: 0 });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', { cache: 'no-store' });
      const allData = await res.json();
      if (allData.success) {
        const all = allData.inquiries;
        // Calculate tab counts from full list
        setCounts({
          all: all.length,
          pending: all.filter((i) => i.status === 'pending').length,
          completed: all.filter((i) => i.status === 'completed').length,
        });
        // Filter client-side — reliable regardless of API query support
        if (statusFilter) {
          setInquiries(all.filter((i) => i.status === statusFilter));
        } else {
          setInquiries(all);
        }
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

        // Update the item status in state
        setInquiries((prev) => {
          const updated = prev.map((inq) =>
            inq._id === id ? { ...inq, status: nextStatus } : inq
          );
          // If a filter is active, remove items that no longer match
          if (statusFilter) {
            return updated.filter((inq) => inq.status === statusFilter);
          }
          return updated;
        });

        // Update counts live
        setCounts((prev) => {
          if (nextStatus === 'completed') {
            return { ...prev, pending: Math.max(0, prev.pending - 1), completed: prev.completed + 1 };
          } else {
            return { ...prev, completed: Math.max(0, prev.completed - 1), pending: prev.pending + 1 };
          }
        });

        // Sync detail modal if open
        if (selectedInquiry?._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: nextStatus });
        }
      } else {
        triggerToast(data.error || 'Failed to update status.', 'error');
      }
    } catch {
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
      } catch {
        triggerToast('Failed to delete.', 'error');
      }
    }
  };

  const handleWhatsAppContact = (inq) => {
    const msg = `Hello ${inq.customerName}, this is regarding your inquiry about "${inq.productId?.name || 'our products'}".`;
    window.open(
      `https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const tabs = [
    { label: 'All', value: '', count: counts.all },
    { label: 'Pending', value: 'pending', count: counts.pending },
    { label: 'Completed', value: 'completed', count: counts.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inquiry Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review and manage lead queries submitted by visitors.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors shadow-sm"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {tab.label}
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                statusFilter === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="large" />
        </div>
      ) : inquiries.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product Interest</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                          {inq.customerName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{inq.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{inq.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {inq.productId ? (
                        <span className="font-semibold text-slate-700 line-clamp-1">
                          {inq.productId.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">General Inquiry</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium text-xs">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleUpdateStatus(inq._id, inq.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                          inq.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {inq.status === 'pending' ? (
                          <><Clock size={9} /> PENDING</>
                        ) : (
                          <><CheckCircle size={9} /> DONE</>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(inq._id)}
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
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <Search size={28} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No inquiries found for this filter.</p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title="Customer Inquiry Details"
      >
        {selectedInquiry && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {selectedInquiry.customerName?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{selectedInquiry.customerName}</p>
                <p className="text-xs text-indigo-600 font-semibold">{selectedInquiry.phone}</p>
              </div>
              <span
                className={`ml-auto text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                  selectedInquiry.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {selectedInquiry.status.toUpperCase()}
              </span>
            </div>

            {selectedInquiry.productId && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5">
                  Product of Interest
                </p>
                <div className="flex gap-3 items-center">
                  {selectedInquiry.productId.images?.length > 0 && (
                    <img
                      src={selectedInquiry.productId.images[0]}
                      alt={selectedInquiry.productId.name}
                      className="w-10 h-10 object-cover rounded-lg border border-indigo-200"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selectedInquiry.productId.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {selectedInquiry.productId.price > 0
                        ? `₹${selectedInquiry.productId.price.toLocaleString('en-IN')}`
                        : 'Ask for Price'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Message
              </p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line italic">
                "{selectedInquiry.message}"
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry._id, selectedInquiry.status)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    selectedInquiry.status === 'pending'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {selectedInquiry.status === 'pending' ? (
                    <><CheckCircle size={13} /> Mark Completed</>
                  ) : (
                    <><Clock size={13} /> Re-open</>
                  )}
                </button>
                <button
                  onClick={() => handleWhatsAppContact(selectedInquiry)}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200"
                >
                  <MessageSquare size={13} />
                  WhatsApp
                </button>
              </div>
              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
