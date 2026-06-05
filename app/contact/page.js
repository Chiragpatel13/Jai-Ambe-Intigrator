'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, MapPin, Clock, Send, Landmark, Mail } from 'lucide-react';
import Toast from '@/components/Toast';

export default function ContactPage() {
  const [settings, setSettings] = useState({
    phone: '+91 8879430925',
    whatsapp: '918879430925',
    address: 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).',
    workingHours: 'Monday - Saturday: 9:00 AM - 8:00 PM, Sunday: Closed',
    email: 'anandp4994@gmail.com',
  });

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Error loading settings in contact:', err));
  }, []);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !message) {
      triggerToast('Please fill out all fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, phone, message }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast('Your inquiry has been submitted! We will contact you shortly.', 'success');
        setCustomerName('');
        setPhone('');
        setMessage('');

        // Event tracking
        try {
          window.gtag?.('event', 'contact_inquiry_submit', {
            event_category: 'engagement',
            event_label: 'contact_page',
          });
        } catch (e) {}

        // Optionally trigger WhatsApp redirect after brief timeout
        setTimeout(() => {
          const waText = `Hello JAYAMBE INTEGRATORS,

I have sent a general inquiry from your contact page:
*Name:* ${customerName}
*Phone:* ${phone}
*Message:* ${message}

Please get back to me. Thank you.`;
          window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(waText)}`, '_blank');
        }, 2000);
      } else {
        triggerToast(data.error || 'Failed to submit inquiry.', 'error');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      triggerToast('Something went wrong. Please check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Toast Alert */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header Info */}
      <section className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Get In Touch
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Have a question about product stock or need custom diagnostics? Reach out to us.
        </p>
      </section>

      {/* Grid Layout - Details & Form */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column - Contact Details */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Store Information</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Drop by our office in Boisar to discuss your CCTV security plans, industrial automation controls, stabilizers, or consult with Er. Anand directly.
            </p>
          </div>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
              <MapPin size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-0.5">Shop Address</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {settings.address}
                </p>
              </div>
            </div>

            {/* Timings */}
            <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
              <Clock size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-0.5">Working Hours</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {settings.workingHours}
                </p>
              </div>
            </div>

            {/* Direct Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm hover:border-blue-500 transition-colors"
                >
                  <Phone size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-0.5">Call Outlet</h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">{settings.phone}</p>
                  </div>
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm hover:border-emerald-500 transition-colors"
                >
                  <MessageSquare size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-0.5">WhatsApp Chat</h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">Start Chat</p>
                  </div>
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm hover:border-blue-400 transition-colors"
                >
                  <Mail size={20} className="text-[#2b7fff] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-0.5">Email Us</h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold truncate max-w-[150px]">{settings.email}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-900 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <Landmark size={18} className="text-blue-600" />
              General Inquiry Form
            </h2>
            <p className="text-xs text-gray-500">
              Submit your request and our representatives will reach back within 24 hours.
            </p>
          </div>

          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Your Inquiry Message
              </label>
              <textarea
                rows={4}
                placeholder="What are you looking for?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send size={12} />
              <span>{submitting ? 'Submitting...' : 'Submit Form'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* WhatsApp Green Banner (Mockup Screen 5 style) */}
      {settings.whatsapp && (
        <section className="rounded-3xl bg-emerald-600 dark:bg-emerald-800 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-emerald-500/10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Chat with us on WhatsApp</h3>
              <p className="text-xs text-emerald-100 font-medium">
                Click below to start an instant discussion regarding product configurations, spares pricing, or installation bookings.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 font-bold text-xs sm:text-sm text-center shadow-md transition-all hover:scale-[1.01]"
          >
            Chat Now
          </a>
        </section>
      )}

      {/* Google Maps Embed Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shop Location Map</h2>
        <div className="w-full h-96 rounded-3xl overflow-hidden border border-gray-150 dark:border-gray-900 shadow-sm bg-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.117!2d72.7501!3d19.7925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be71e360f7bc59b%3A0xca8c6ef028681788!2sNavapur%20Rd%2C%20Boisar%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="JAYAMBE INTEGRATORS Location"
          />
        </div>
      </section>
    </div>
  );
}
