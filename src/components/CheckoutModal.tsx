'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Ticket, CheckCircle, MapPin, Phone, User, HelpCircle } from 'lucide-react';

export default function CheckoutModal() {
  const t = useTranslations('checkout');
  const tp = useTranslations('products');
  const locale = useLocale();

  const { checkoutProduct, setCheckoutProduct, offers, addOrder, validateCoupon, getProductEffectivePrice } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('Cairo');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Discount details
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // as percentage (e.g. 15)
  const [discountMsg, setDiscountMsg] = useState('');
  const [discountErr, setDiscountErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  // Sizing choices (to put in notes automatically)
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('Standard Cotton');

  // Governorates Lists
  const governoratesEn = [
    'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Suez', 'Port Said', 'Ismailia',
    'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Asyut', 'Sohag', 'Fayoum',
    'Hurghada', 'Sharm El Sheikh', 'Other Governorates'
  ];

  const governoratesAr = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'السويس', 'بور سعيد', 'الإسماعيلية',
    'الأقصر', 'أسوان', 'المنصورة', 'طنطا', 'أسيوط', 'سوهاج', 'الفيوم',
    'الغردقة', 'شرم الشيخ', 'محافظات أخرى'
  ];

  const governorates = locale === 'ar' ? governoratesAr : governoratesEn;

  useEffect(() => {
    if (checkoutProduct) {
      document.body.style.overflow = 'hidden';
      // Reset form on open
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setCouponCode('');
      setAppliedDiscount(0);
      setDiscountMsg('');
      setDiscountErr('');
      setShowSuccess(false);
      setSelectedSize(checkoutProduct.available_sizes?.[0] || 'M');
      setSelectedFabric(checkoutProduct.material_options?.[0] || 'Standard Cotton');
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [checkoutProduct]);

  if (!checkoutProduct) return null;

  const productName = locale === 'ar' ? checkoutProduct.name_ar : checkoutProduct.name_en;
  
  const { hasDiscount, originalPrice: basePrice, discountedPrice } = getProductEffectivePrice(checkoutProduct);
  const originalPrice = discountedPrice; 

  // Apply Coupon
  const handleApplyCoupon = async () => {
    setDiscountErr('');
    setDiscountMsg('');
    const code = couponCode.trim();

    if (!code) return;

    const res = await validateCoupon(code, phone);

    if (!res.isValid) {
      if (res.error === 'limit_reached') {
        setDiscountErr(locale === 'ar' ? 'لقد انتهت صلاحية هذا الكوبون (وصل للحد الأقصى للاستخدام)' : 'This coupon has reached its maximum usage limit.');
      } else if (res.error === 'user_limit_reached') {
        setDiscountErr(locale === 'ar' ? 'لقد استخدمت هذا الكوبون الحد الأقصى المسموح به' : 'You have already reached the maximum usage limit for this coupon.');
      } else {
        setDiscountErr(t('coupon_invalid'));
      }
      setAppliedDiscount(0);
      return;
    }

    const pct = res.discountPercent || 10;
    setAppliedDiscount(pct);
    setDiscountMsg(t('coupon_success', { discount: `${pct}%` }));
  };

  // Prices calculation
  const subtotal = originalPrice;
  const discountAmount = Number(((subtotal * appliedDiscount) / 100).toFixed(2));
  const shippingFee = 50; // Flat 50 EGP for Egypt
  const total = subtotal - discountAmount + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    // Validate phone: Egyptian numbers have 11 digits starting with 01
    const cleanPhone = phone.trim();
    if (!/^01[0-25]\d{8}$/.test(cleanPhone)) {
      alert(locale === 'ar' ? 'الرجاء إدخال رقم موبايل مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian mobile number (e.g. 01012345678)');
      return;
    }

    setIsSubmitting(true);

    // Double-check coupon validity with the entered phone number
    if (couponCode.trim()) {
      const res = await validateCoupon(couponCode, cleanPhone);
      if (!res.isValid) {
        let errMsg = locale === 'ar' ? 'الكوبون غير صالح' : 'Invalid coupon code';
        if (res.error === 'limit_reached') {
          errMsg = locale === 'ar' ? 'لقد انتهت صلاحية هذا الكوبون (وصل للحد الأقصى للاستخدام)' : 'This coupon has reached its maximum usage limit.';
        } else if (res.error === 'user_limit_reached') {
          errMsg = locale === 'ar' ? 'لقد استخدمت هذا الكوبون الحد الأقصى المسموح به' : 'You have already reached the maximum usage limit for this coupon.';
        }
        alert(errMsg);
        setAppliedDiscount(0);
        setIsSubmitting(false);
        return;
      }
    }

    const sizeNotes = `Size: ${selectedSize} | Fabric: ${selectedFabric}`;
    const fullNotes = `${sizeNotes}${notes ? ` | Customer Note: ${notes}` : ''}${appliedDiscount > 0 ? ` | Coupon Code: ${couponCode} (${appliedDiscount}% Off)` : ''}`;

    const result = await addOrder({
      product_id: checkoutProduct.id,
      product_name: `${productName} (${selectedSize})`,
      price: total,
      customer_name: name,
      customer_phone: cleanPhone,
      location: `${governorate} - ${address}`,
      notes: fullNotes
    });

    setIsSubmitting(false);

    if (result) {
      const shortCode = result.id.split('-')[0].toUpperCase();
      setOrderRef(shortCode);
      setShowSuccess(true);
    } else {
      alert(locale === 'ar' ? 'فشل إتمام الطلب، الرجاء المحاولة مرة أخرى' : 'Failed to place order. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end select-none">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCheckoutProduct(null)}
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
          {/* Scrollable container */}
          <div className="p-6 sm:p-8 flex-1">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-handwriting text-2xl text-black/60 rotate-[-1deg] flex items-center gap-1.5">
                <Ticket size={20} className="rotate-[-5deg]" />
                {t('title')}
              </span>
              <button
                onClick={() => setCheckoutProduct(null)}
                className="p-1.5 border-2 border-black bg-white rounded-lg hover:bg-black hover:text-[#EDE0D0] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {!showSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Product Summary Box */}
                <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#F2CC8F]/30 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 border-2 border-black rounded-lg overflow-hidden shrink-0 relative bg-[#EDE0D0]/30 flex items-center justify-center">
                      <Image
                        src={(checkoutProduct.images && checkoutProduct.images.length > 0) ? checkoutProduct.images[0] : (checkoutProduct.category_id === '4' ? '/placeholders/manga_front.jpg' : '/placeholders/arcade_front.jpg')}
                        alt={productName}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-black/50 block mb-0.5">
                        {tp('unisex')}
                      </span>
                      <h4 className="text-sm font-black text-black uppercase leading-tight">
                        {productName}
                      </h4>
                      <div className="mt-1 text-xs font-black text-brand-accent">
                        {tp('price_egp', { price: originalPrice })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Sizing triggers directly in checkout */}
                  <div className="mt-3.5 pt-3.5 border-t border-black/10 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-black/50 block mb-1">
                        Size Selection
                      </span>
                      <div className="flex gap-1.5">
                        {checkoutProduct.available_sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`w-7 h-7 text-[10px] font-black rounded border-2 border-black flex items-center justify-center transition-all ${
                              selectedSize === size
                                ? 'bg-black text-[#EDE0D0] scale-95 shadow-sm'
                                : 'bg-[#EDE0D0]/20 text-black hover:bg-black/5'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-black/50 block mb-1">
                        Fabric Selection
                      </span>
                      <select
                        value={selectedFabric}
                        onChange={(e) => setSelectedFabric(e.target.value)}
                        className="text-[10px] font-bold border-2 border-black rounded px-1.5 py-0.5 bg-white text-black w-full"
                      >
                        {checkoutProduct.material_options.map((m) => (
                          <option key={m} value={m}>
                            {m === 'Standard Cotton' ? 'Standard 100%' : 'Premium Heavy'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-black/55" />
                    {t('name_label')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5 flex items-center gap-1.5">
                    <Phone size={14} className="text-black/55" />
                    {t('phone_label')}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder={t('phone_placeholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Governorate & Address */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-black uppercase text-black/60 block mb-1.5 flex items-center gap-1.5">
                      <MapPin size={14} className="text-black/55" />
                      {t('governorate_label')}
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                    >
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                      {t('address_label')}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder={t('address_placeholder')}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Discount Code Section */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                    {t('coupon_label')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('coupon_placeholder')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-black text-[#EDE0D0] hover:bg-[#E07A5F] hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs transition-colors cursor-pointer"
                    >
                      {t('coupon_apply')}
                    </button>
                  </div>
                  {discountMsg && (
                    <p className="text-[10px] font-black text-green-600 mt-1">{discountMsg}</p>
                  )}
                  {discountErr && (
                    <p className="text-[10px] font-black text-red-500 mt-1">⚠️ {discountErr}</p>
                  )}
                </div>

                {/* Additional notes */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1.5">
                    {t('notes_label')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t('notes_placeholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none resize-none"
                  />
                </div>

                {/* Price Breakdown */}
                <div className="p-4 border-2 border-dashed border-black/45 bg-white/40 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-black/60">
                    <span className="font-bold">{t('price_subtotal')}</span>
                    <span className="font-black">{tp('price_egp', { price: subtotal })}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 font-bold">
                      <span>{t('price_discount')} ({appliedDiscount}%)</span>
                      <span>-{tp('price_egp', { price: discountAmount })}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-black/60">
                    <span className="font-bold">{t('price_shipping')}</span>
                    <span className="font-black">{tp('price_egp', { price: shippingFee })}</span>
                  </div>
                  <div className="flex justify-between items-center text-black border-t border-black/10 pt-2 text-sm font-black">
                    <span>{t('price_total')}</span>
                    <span className="text-brand-accent">{tp('price_egp', { price: total })}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-black uppercase border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider"
                >
                  {isSubmitting ? t('submitting') : t('submit_btn')}
                </button>

              </form>
            ) : (
              /* Success Screen */
              <div className="text-center py-10 space-y-6">
                
                {/* Floating Success Ticket */}
                <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-w-sm mx-auto overflow-hidden rotate-[1deg]">
                  {/* Decorative Ticket Edges */}
                  <div className="absolute top-1/2 left-[-10px] w-6 h-6 bg-[#EDE0D0] border-2 border-black rounded-full transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-[-10px] w-6 h-6 bg-[#EDE0D0] border-2 border-black rounded-full transform -translate-y-1/2"></div>
                  
                  <CheckCircle size={56} className="mx-auto text-green-600 mb-4 animate-bounce" />
                  
                  <h4 className="text-2xl font-black uppercase text-black">
                    {t('success_title')}
                  </h4>
                  
                  <p className="text-xs font-semibold text-black/70 leading-relaxed font-handwriting mt-3 mb-5 px-3">
                    {t('success_desc')}
                  </p>

                  <div className="p-3 bg-[#EDE0D0]/30 border-2 border-dashed border-black/40 rounded-xl">
                    <span className="text-[10px] uppercase font-black text-black/45 block mb-1">
                      {t('order_ref')}
                    </span>
                    <span className="text-lg font-black tracking-widest text-brand-accent block">
                      #{orderRef}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutProduct(null)}
                  className="px-8 py-3 bg-black text-[#EDE0D0] hover:bg-black/90 border-3 border-black rounded-xl font-black uppercase text-xs tracking-wider sticker cursor-pointer transition-colors"
                >
                  {t('close_btn')}
                </button>

              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
