'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Share2, Clipboard, Heart, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function UserProfileModal() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const tp = useTranslations('products');
  
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    user,
    profile,
    orders,
    products,
    signOutUser,
    setPreviewProduct
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  const activeProfile = profile || {
    id: user?.id || '',
    email: user?.email || '',
    phone: '',
    loyalty_points: 0,
    favorites: [],
    referral_code: user ? `REF-${user.id.replace('u-', '').substring(0, 5).toUpperCase()}` : '',
    address_data: {}
  };

  // Filter orders by user's phone number
  useEffect(() => {
    if (activeProfile?.phone) {
      const cleanPhone = activeProfile.phone.trim();
      const filtered = orders.filter(
        (o: any) => o.customer_phone?.trim() === cleanPhone
      );
      setUserOrders(filtered);
    } else {
      setUserOrders([]);
    }
  }, [activeProfile, orders]);

  if (!isProfileModalOpen || !user) return null;

  const handleClose = () => {
    setIsProfileModalOpen(false);
  };

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${activeProfile.phone || user.id}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Calculate referral stats from database orders
  const refCode = activeProfile.phone || user.id;
  const friendOrders = orders.filter(
    (o: any) => o.referral_code?.trim() === refCode && o.customer_phone?.trim() !== activeProfile.phone?.trim()
  );
  
  const totalInvitedOrders = friendOrders.length;
  const completedInvitedOrders = friendOrders.filter((o: any) => o.status === 'completed').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-2xl bg-[#EDE0D0] border-4 border-black p-5 sm:p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-10 max-h-[85vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 border-2 border-black rounded-lg bg-white hover:bg-black/5 cursor-pointer text-black transition-colors"
          >
            <X size={16} />
          </button>

          {/* Heading */}
          <div className="border-b-4 border-black pb-4 mb-4 select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-3xl font-black uppercase text-black">
                {locale === 'ar' ? 'الملف الشخصي' : 'Member Circle'}
              </h3>
              <p className="text-xs font-semibold text-black/50 font-handwriting">
                {activeProfile.email} {activeProfile.phone && `| ${activeProfile.phone}`}
              </p>
            </div>
            
            <button
              onClick={() => {
                signOutUser();
                handleClose();
              }}
              className="px-4 py-1.5 bg-red-500 text-white border-2 border-black rounded-lg font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              {locale === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1.5">
            {/* Top Grid: Loyalty Points & Referral Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loyalty points card */}
              <div className="bg-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                <div className="p-3 border-2 border-black bg-amber-100 rounded-xl text-amber-600">
                  <Trophy size={28} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-black/45">
                    {locale === 'ar' ? 'نقاط الولاء المتراكمة' : 'Loyalty Points'}
                  </h4>
                  <span className="text-2xl font-black text-black">
                    {activeProfile.loyalty_points || 0} pts
                  </span>
                  <p className="text-[9px] font-extrabold text-[#E07A5F] uppercase mt-0.5">
                    {locale === 'ar' ? 'احصل على نقطة مقابل كل ١٠ جنيهات تدفعها' : '1 point for every 10 EGP spent'}
                  </p>
                </div>
              </div>

              {/* Referral Ticket Card */}
              <div className="bg-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-black/45 flex items-center gap-1">
                    <Share2 size={12} />
                    {locale === 'ar' ? 'برنامج مكافآت الإحالة (١٥٪ خصم)' : 'Referral Reward (15% OFF)'}
                  </h4>
                  {/* Share code display */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="flex-1 px-2.5 py-1 bg-zinc-100 border border-zinc-300 rounded text-[9px] font-mono text-zinc-600 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-1 border-2 border-black bg-black text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                      title="Copy referral link"
                    >
                      <Clipboard size={12} />
                    </button>
                  </div>
                  {copiedLink && (
                    <p className="text-[9px] font-bold text-green-600 mt-1">
                      ✓ {locale === 'ar' ? 'تم نسخ الرابط!' : 'Copied link to clipboard!'}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-3 border-t border-black/10 pt-2 text-[10px] font-bold text-black/60 uppercase">
                  <div>
                    {locale === 'ar' ? 'المرات المستخدمة:' : 'Used:'} <span className="font-black text-black">{totalInvitedOrders}</span>
                  </div>
                  <div>
                    {locale === 'ar' ? 'طلبات الأصدقاء:' : 'Orders placed:'} <span className="font-black text-green-600">{completedInvitedOrders}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Items List */}
            <div>
              <h4 className="text-sm font-black uppercase text-black mb-3 flex items-center gap-1.5 border-b-2 border-black/10 pb-1">
                <Heart className="text-red-500 fill-red-500" size={16} />
                {locale === 'ar' ? 'تصميماتك المفضلة' : 'Your Favorites'}
              </h4>
              {activeProfile.favorites && activeProfile.favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeProfile.favorites.map((favId: string) => {
                    const product = products.find(p => p.id === favId);
                    if (!product) return null;
                    const name = locale === 'ar' ? product.name_ar : product.name_en;
                    const defaultPlaceholder = product.category_id === '4' ? '/placeholders/manga_front.jpg' : '/placeholders/arcade_front.jpg';
                    const img = product.images && product.images.length > 0 ? product.images[0] : defaultPlaceholder;

                    return (
                      <div 
                        key={favId} 
                        onClick={() => {
                          setPreviewProduct(product);
                          handleClose();
                        }}
                        className="bg-white border-2 border-black p-2 rounded-xl flex items-center gap-2 hover:translate-y-[-1px] cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        <div className="w-10 h-10 border border-black/10 rounded overflow-hidden shrink-0 relative bg-[#EDE0D0]/20 flex items-center justify-center">
                          <Image src={img} alt={name} fill unoptimized className="object-contain p-0.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase truncate text-black">{name}</p>
                          <p className="text-[9px] font-black text-brand-accent">{tp('price_egp', { price: product.price })}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs font-semibold text-black/40 font-handwriting">
                  {locale === 'ar' ? 'لم تقم بإضافة أي قطع للمفضلة بعد.' : 'No favorited items yet. Click the heart on showcase cards to add.'}
                </p>
              )}
            </div>

            {/* Order History */}
            <div>
              <h4 className="text-sm font-black uppercase text-black mb-3 flex items-center gap-1.5 border-b-2 border-black/10 pb-1">
                <ShoppingBag className="text-brand-accent" size={16} />
                {locale === 'ar' ? 'سجل طلباتك' : 'Order History & Tracking'}
              </h4>
              {userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.map((order: any) => {
                    const orderDate = new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });

                    return (
                      <div key={order.id} className="bg-white border-2 border-black p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase font-mono bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
                              Ref: {order.id.split('-')[0].toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-black/45">{orderDate}</span>
                          </div>
                          
                          <p className="text-xs font-bold text-black mt-2 leading-relaxed">
                            {order.product_name}
                          </p>

                          {order.reward_coupon_code && (
                            <p className="text-[9px] font-black text-green-600 uppercase mt-1">
                              🎁 Reward Earned: <span className="font-mono bg-green-50 border border-green-200 px-1 rounded">{order.reward_coupon_code}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:flex-col sm:items-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/5">
                          <span className="text-sm font-black text-brand-accent sm:mb-1">
                            {tp('price_egp', { price: order.price })}
                          </span>

                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            order.status === 'completed' 
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-amber-100 border-amber-300 text-amber-700'
                          }`}>
                            {order.status === 'completed' ? (
                              <>
                                <CheckCircle2 size={10} />
                                {locale === 'ar' ? 'تم التوصيل' : 'Completed'}
                              </>
                            ) : (
                              <>
                                <Truck size={10} className="animate-bounce" />
                                {locale === 'ar' ? 'قيد الشحن' : 'Pending Shipping'}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs font-semibold text-black/40 font-handwriting">
                  {locale === 'ar' ? 'لم تقم بطلب أي قطعة بعد.' : 'No orders found matching your verified phone number.'}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
