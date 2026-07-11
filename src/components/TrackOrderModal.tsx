'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Phone, Calendar, ClipboardList, MapPin, BadgeCheck, Loader2 } from 'lucide-react';

export default function TrackOrderModal() {
  const locale = useLocale();
  const { isTrackOrderOpen, setIsTrackOrderOpen, fetchOrdersByPhone } = useStore();

  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (isTrackOrderOpen) {
      document.body.style.overflow = 'hidden';
      setPhone('');
      setOrders([]);
      setSearched(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isTrackOrderOpen]);

  if (!isTrackOrderOpen) return null;

  const texts = {
    en: {
      title: "Track My Orders",
      phone_label: "Enter Your Phone Number",
      phone_placeholder: "e.g. 01012345678",
      submit: "Search Orders",
      no_orders: "No orders found matching this phone number.",
      order_code: "Reference Code",
      status: "Status",
      date: "Order Date",
      total: "Total Price",
      location: "Delivery Address",
      notes: "Order Details",
      pending: "Pending Confirmation",
      completed: "Completed & Dispatched",
      search_prompt: "Enter your 11-digit mobile number to track the status of your fandom fit orders.",
      searching: "Searching database...",
      invalid_phone: "Please enter a valid Egyptian mobile number starting with 01"
    },
    ar: {
      title: "تتبع طلباتي",
      phone_label: "أدخل رقم هاتفك المحمول",
      phone_placeholder: "مثال: 01012345678",
      submit: "بحث عن الطلبات",
      no_orders: "لم يتم العثور على طلبات مرتبطة بهذا الرقم.",
      order_code: "كود الطلب",
      status: "حالة الطلب",
      date: "تاريخ الطلب",
      total: "إجمالي السعر",
      location: "عنوان التوصيل",
      notes: "تفاصيل الطلب",
      pending: "قيد المراجعة",
      completed: "مكتمل وتم الشحن",
      search_prompt: "أدخل رقم هاتفك المحمول المكون من 11 رقمًا لتتبع حالة طلباتك.",
      searching: "جاري البحث...",
      invalid_phone: "الرجاء إدخال رقم هاتف مصري صحيح يبدأ بـ 01"
    }
  };

  const t = locale === 'ar' ? texts.ar : texts.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!/^01[0-25]\d{8}$/.test(cleanPhone)) {
      alert(t.invalid_phone);
      return;
    }

    setIsSearching(true);
    const results = await fetchOrdersByPhone(cleanPhone);
    setOrders(results);
    setSearched(true);
    setIsSearching(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end select-none">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsTrackOrderOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: locale === 'ar' ? '-100%' : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: locale === 'ar' ? '-100%' : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg h-full bg-[#EDE0D0] border-l-4 rtl:border-l-0 rtl:border-r-4 border-black shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
        >
          {/* Main Container */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col h-full">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-handwriting text-2xl text-black/60 rotate-[-1deg] flex items-center gap-1.5">
                <ClipboardList size={22} className="rotate-[-3deg]" />
                {t.title}
              </span>
              <button
                onClick={() => setIsTrackOrderOpen(false)}
                className="p-1.5 border-2 border-black bg-white rounded-lg hover:bg-black hover:text-[#EDE0D0] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tracking query Form */}
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <p className="text-xs font-semibold text-black/70 leading-relaxed font-handwriting">
                {t.search_prompt}
              </p>
              <div>
                <label className="text-xs font-black uppercase text-black/60 block mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-black/55" />
                  {t.phone_label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder={t.phone_placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-5 py-2.5 bg-black text-[#EDE0D0] hover:bg-brand-accent hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isSearching ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                    {t.submit}
                  </button>
                </div>
              </div>
            </form>

            {/* Results Output Block */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 rtl:pr-0 rtl:pl-1">
              {isSearching && (
                <div className="text-center py-12 flex flex-col items-center justify-center text-zinc-500 font-bold text-xs uppercase tracking-wider gap-2">
                  <Loader2 size={24} className="animate-spin text-black" />
                  {t.searching}
                </div>
              )}

              {!isSearching && searched && orders.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-black/30 rounded-2xl bg-white/40 p-6">
                  <p className="text-xs font-black text-black/60 uppercase">
                    {t.no_orders}
                  </p>
                </div>
              )}

              {!isSearching && orders.length > 0 && (
                <div className="space-y-6 pb-6 select-text">
                  {orders.map((order) => {
                    const shortCode = order.id.split('-')[0].toUpperCase();
                    const formattedDate = new Date(order.created_at).toLocaleDateString(locale, {
                      year: 'numeric', month: 'long', day: 'numeric'
                    });

                    return (
                      <div 
                        key={order.id} 
                        className="bg-white border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden select-none"
                      >
                        {/* Scrapbook pin decoration */}
                        <div className="absolute top-[-4px] left-[45%] w-10 h-3 bg-[#E07A5F]/80 border border-black/30 rotate-[2deg] pointer-events-none"></div>

                        {/* Title and Code */}
                        <div className="flex justify-between items-start border-b border-black/10 pb-3.5 mb-3.5">
                          <div>
                            <span className="text-[10px] font-black uppercase text-black/55 block">
                              {t.order_code}
                            </span>
                            <span className="text-sm font-black text-brand-accent uppercase tracking-wider">
                              #{shortCode}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-black/55 block">
                              {t.status}
                            </span>
                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border-2 border-black ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-700 border-green-800' 
                                : 'bg-yellow-100 text-yellow-700 border-yellow-800'
                            }`}>
                              {order.status === 'completed' ? t.completed : t.pending}
                            </span>
                          </div>
                        </div>

                        {/* Order info details list */}
                        <div className="space-y-2.5 text-xs text-black font-semibold">
                          <div className="flex items-start gap-2">
                            <ClipboardList size={14} className="text-black/50 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-black/60 text-[10px] block uppercase leading-none mb-0.5">{t.notes}</span>
                              <span className="text-black uppercase font-black">{order.product_name}</span>
                              <p className="text-[10px] text-zinc-500 mt-1 whitespace-pre-wrap">{order.notes}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 border-t border-black/5 pt-2">
                            <Calendar size={14} className="text-black/50 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-black/60 text-[10px] block uppercase leading-none mb-0.5">{t.date}</span>
                              <span>{formattedDate}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 border-t border-black/5 pt-2">
                            <MapPin size={14} className="text-black/50 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-black/60 text-[10px] block uppercase leading-none mb-0.5">{t.location}</span>
                              <span className="text-zinc-600 font-bold">{order.location}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 border-t border-black/5 pt-2">
                            <BadgeCheck size={14} className="text-black/50 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-black/60 text-[10px] block uppercase leading-none mb-0.5">{t.total}</span>
                              <span className="text-brand-accent font-black text-sm">{order.price} EGP</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
