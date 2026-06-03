'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Mail,
  PlusCircle,
  Settings,
  HelpCircle,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Loader from '@/components/Loader';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentInquiries(data.recentInquiries);
          setRecentProducts(data.recentProducts);
        }
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Laptop,
      color: 'bg-blue-500 text-white',
      link: '/admin/products',
    },
    {
      title: 'New Hardware',
      value: stats?.newProducts || 0,
      icon: TrendingUp,
      color: 'bg-emerald-500 text-white',
      link: '/admin/products?condition=new',
    },
    {
      title: 'Used / Refurbished',
      value: stats?.usedProducts || 0,
      icon: Layers,
      color: 'bg-amber-500 text-white',
      link: '/admin/products?condition=used',
    },
    {
      title: 'Pending Inquiries',
      value: stats?.pendingInquiries || 0,
      icon: Mail,
      color: 'bg-indigo-500 text-white',
      link: '/admin/inquiries',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-xs text-gray-450 mt-1">Real-time status of your store inventory and visitor inquiries.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            href={card.link}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">
                {card.title}
              </span>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon size={22} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Launch Panel */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Controls</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/products?action=new"
            className="flex items-center gap-2.5 p-4 rounded-xl border border-gray-150 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
          >
            <PlusCircle size={16} className="text-indigo-600" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2.5 p-4 rounded-xl border border-gray-150 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
          >
            <Layers size={16} className="text-indigo-600" />
            <span>Manage Categories</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 p-4 rounded-xl border border-gray-150 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
          >
            <Settings size={16} className="text-indigo-600" />
            <span>Update Store Settings</span>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-4 rounded-xl border border-gray-150 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
          >
            <ArrowRight size={16} className="text-indigo-600" />
            <span>View Public Site</span>
          </a>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <Mail size={16} className="text-indigo-500" />
              Recent Inquiries
            </h3>
            <Link
              href="/admin/inquiries"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <div key={inq._id} className="p-5 hover:bg-gray-50 transition-colors space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{inq.customerName}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{inq.phone}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        inq.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {inq.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 italic">"{inq.message}"</p>
                  {inq.productId && (
                    <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                      <span>Item:</span>
                      <span className="underline">{inq.productId.name}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-xs text-gray-400">No recent inquiries.</div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <Laptop size={16} className="text-indigo-500" />
              Recently Added Products
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProducts.length > 0 ? (
              recentProducts.map((prod) => (
                <div key={prod._id} className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-55 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {prod.images.length > 0 ? (
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Pic</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-800 truncate">{prod.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.25 rounded ${
                          prod.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {prod.condition.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-xs text-gray-400">No products in catalog.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
