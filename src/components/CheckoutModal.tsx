'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, getFabricPremium, getCartTotals } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Ticket, CheckCircle, MapPin, Phone, User, HelpCircle, Mail, Copy, Check, Tag, Share2 } from 'lucide-react';

export default function CheckoutModal() {
  const t = useTranslations('checkout');
  const tp = useTranslations('products');
  const tc = useTranslations('cart');
  const locale = useLocale();

  const {
    checkoutProduct,
    setCheckoutProduct,
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    addOrder,
    validateCoupon,
    getProductEffectivePrice
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState('Cairo');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Discount states
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // percentage (e.g. 25)
  const [discountMsg, setDiscountMsg] = useState('');
  const [discountErr, setDiscountErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [rewardCouponCode, setRewardCouponCode] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Sizing choices (only for single product checkout)
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

  const isSingle = !!checkoutProduct;
  const isOpen = isSingle || isCheckoutOpen;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form on open
      setName('');
      setPhone('');
      setEmail('');
      setCity('');
      setAddress('');
      setNotes('');
      setReferralCode('');
      setRewardCouponCode('');

      // Load coupon from localStorage if applied in Cart drawer
      const savedCoupon = localStorage.getItem('ff_applied_coupon') || '';
      const savedDiscount = Number(localStorage.getItem('ff_coupon_discount') || '0');
      
      setCouponCode(savedCoupon);
      setAppliedDiscount(savedDiscount);
      setDiscountMsg(savedCoupon && savedDiscount > 0 ? (locale === 'ar' ? 'تم تحميل الكوبون المطبق من السلة!' : 'Coupon applied from your cart!') : '');
      setDiscountErr('');
      setShowSuccess(false);

      if (isSingle && checkoutProduct) {
        setSelectedSize(checkoutProduct.available_sizes?.[0] || 'M');
        setSelectedFabric(checkoutProduct.material_options?.[0] || 'Standard Cotton');
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, checkoutProduct, isSingle]);

  if (!isOpen) return null;

  // Single Item Calculations
  let singleItemPrice = 0;
  let singleItemName = '';
  let singleItemImage = '';
  
  if (isSingle && checkoutProduct) {
    singleItemName = locale === 'ar' ? checkoutProduct.name_ar : checkoutProduct.name_en;
    const { discountedPrice } = getProductEffectivePrice(checkoutProduct);
    const premium = getFabricPremium(selectedFabric);
    singleItemPrice = discountedPrice + premium;
    singleItemImage = (checkoutProduct.images && checkoutProduct.images.length > 0) 
      ? checkoutProduct.images[0] 
      : (checkoutProduct.category_id === '4' ? '/placeholders/manga_front.jpg' : '/placeholders/arcade_front.jpg');
  }

  // Pricing Calculations using getCartTotals for cart promotion
  let subtotal = 0;
  let cottonDiscount = 0;
  let shippingFee = 0;

  if (isSingle) {
    subtotal = singleItemPrice;
    shippingFee = subtotal > 0 ? 50 : 0;
  } else {
    const totals = getCartTotals(cart);
    subtotal = totals.subtotal;
    cottonDiscount = totals.cottonDiscount;
    shippingFee = totals.shipping;
  }

  const discountAmount = Number(((subtotal * appliedDiscount) / 100).toFixed(2));
  const total = subtotal - cottonDiscount - discountAmount + shippingFee;

  const handleApplyCoupon = async () => {
    setDiscountErr('');
    setDiscountMsg('');
    const code = couponCode.trim();

    if (!code) return;

    const res = await validateCoupon(code, phone || 'guest', subtotal);

    if (!res.isValid) {
      let errMsg = t('coupon_invalid');
      if (res.error === 'limit_reached') {
        errMsg = locale === 'ar' ? 'لقد انتهت صلاحية هذا الكوبون (وصل للحد الأقصى للاستخدام)' : 'This coupon has reached its maximum usage limit.';
      } else if (res.error === 'user_limit_reached') {
        errMsg = locale === 'ar' ? 'لقد استخدمت هذا الكوبون الحد الأقصى المسموح به' : 'You have already reached the maximum usage limit for this coupon.';
      } else if (res.error === 'min_order_not_met') {
        errMsg = locale === 'ar' ? 'لم يتم الوصول للحد الأدنى المطلوب لتطبيق الكوبون' : 'Minimum order amount not met for this coupon.';
      } else if (res.error === 'expired') {
        errMsg = locale === 'ar' ? 'كود الخصم منتهي الصلاحية' : 'This coupon code has expired.';
      } else if (res.error === 'phone_mismatch') {
        errMsg = locale === 'ar' ? 'عذراً، هذا الكوبون مرتبط برقم هاتف آخر ولا يمكن استخدامه برقمك الحالي.' : 'Sorry, this coupon is bound to a different phone number and cannot be used with your current phone.';
      }
      setDiscountErr(errMsg);
      setAppliedDiscount(0);
      return;
    }

    const pct = res.discountPercent || 10;
    setAppliedDiscount(pct);
    setDiscountMsg(t('coupon_success', { discount: `${pct}%` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !governorate || !city || !address) return;

    // Phone format Egyptian check
    const cleanPhone = phone.trim();
    if (!/^01[0-25]\d{8}$/.test(cleanPhone)) {
      alert(locale === 'ar' ? 'الرجاء إدخال رقم موبايل مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian mobile number (e.g. 01012345678)');
      return;
    }

    setIsSubmitting(true);

    // Re-verify coupon limits
    if (couponCode.trim()) {
      const res = await validateCoupon(couponCode, cleanPhone, subtotal);
      if (!res.isValid) {
        let errMsg = locale === 'ar' ? 'الكوبون المطبق غير صالح أو منتهي الصلاحية' : 'The applied coupon is invalid or expired.';
        if (res.error === 'phone_mismatch') {
          errMsg = locale === 'ar' ? 'عذراً، هذا الكوبون مرتبط برقم هاتف آخر ولا يمكن استخدامه برقمك الحالي.' : 'Sorry, this coupon is bound to a different phone number and cannot be used with your current phone.';
        }
        alert(errMsg);
        setAppliedDiscount(0);
        setIsSubmitting(false);
        return;
      }
    }

    // Compile items array for database
    const orderItems = isSingle && checkoutProduct ? [{
      id: `${checkoutProduct.id}-${selectedSize}-${selectedFabric}`,
      product_id: checkoutProduct.id,
      product_name: singleItemName,
      size: selectedSize,
      fabric: selectedFabric,
      quantity: 1,
      price: singleItemPrice,
      image: singleItemImage
    }] : cart.map(item => ({
      id: item.id,
      product_id: item.product.id,
      product_name: locale === 'ar' ? item.product.name_ar : item.product.name_en,
      size: item.size,
      fabric: item.fabric,
      quantity: item.quantity,
      price: item.price,
      image: (item.product.images && item.product.images.length > 0) ? item.product.images[0] : (item.product.category_id === '4' ? '/placeholders/manga_front.jpg' : '/placeholders/arcade_front.jpg')
    }));

    const primaryProductName = isSingle && checkoutProduct
      ? `${singleItemName} (${selectedSize})`
      : cart.map(item => `${locale === 'ar' ? item.product.name_ar : item.product.name_en} (${item.size}) x${item.quantity}`).join(', ');

    const fullNotes = `[Checkout Type: Web]${isSingle ? ` | Fabric: ${selectedFabric}` : ''}${notes ? ` | Customer Note: ${notes}` : ''}${appliedDiscount > 0 ? ` | Coupon Code: ${couponCode.trim()} (${appliedDiscount}% Off)` : ''}${referralCode.trim() ? ` | Referral: ${referralCode.trim()}` : ''}`;

    const result = await addOrder({
      product_id: isSingle && checkoutProduct ? checkoutProduct.id : null,
      product_name: primaryProductName,
      price: total,
      customer_name: name,
      customer_phone: cleanPhone,
      location: `${governorate} - ${city} - ${address}`,
      notes: fullNotes,
      items: orderItems,
      customer_email: email.trim() || undefined,
      governorate,
      city,
      address,
      coupon_code: couponCode.trim() || undefined,
      referral_code: referralCode.trim() || undefined
    });

    setIsSubmitting(false);

    if (result) {
      // Clear Cart and local coupon state on success
      if (!isSingle) clearCart();
      localStorage.removeItem('ff_applied_coupon');
      localStorage.removeItem('ff_coupon_discount');

      const shortCode = result.id.split('-')[0].toUpperCase();
      setOrderRef(shortCode);
      setRewardCouponCode(result.reward_coupon_code || '');
      setShowSuccess(true);
    } else {
      alert(locale === 'ar' ? 'فشل إتمام الطلب، الرجاء المحاولة مرة أخرى' : 'Failed to place order. Please try again.');
    }
  };

  const handleClose = () => {
    if (isSingle) {
      setCheckoutProduct(null);
    } else {
      setIsCheckoutOpen(false);
    }
    setShowSuccess(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: locale === 'ar' ? '-100%' : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: locale === 'ar' ? '-100%' : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-[#EDE0D0] border-l-4 border-black flex flex-col shadow-[[-8px_0px_0px_0px_rgba(0,0,0,1)]] rtl:border-l-0 rtl:border-r-4 z-50"
        >
          {/* Header */}
          <div className="p-5 border-b-4 border-black bg-white flex justify-between items-center relative">
            <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[radial-gradient(circle,transparent_20%,#000_20%,#000_40%,transparent_40%,transparent_60%,#000_60%)] bg-[length:12px_10px] pointer-events-none"></div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent block">
                {t('ticket_header')}
              </span>
              <h3 className="text-xl font-black uppercase text-black">
                {t('title')}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 border-2 border-black rounded-lg hover:bg-black/5 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {!showSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Product Summary Box */}
                {isSingle && checkoutProduct ? (
                  <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#F2CC8F]/30 rounded-full blur-xl pointer-events-none"></div>
                    
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 border-2 border-black rounded-lg overflow-hidden shrink-0 relative bg-[#EDE0D0]/30 flex items-center justify-center">
                        <Image
                          src={singleItemImage}
                          alt={singleItemName}
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
                          {singleItemName}
                        </h4>
                        <div className="mt-1 text-xs font-black text-brand-accent">
                          {tp('price_egp', { price: singleItemPrice })}
                        </div>
                      </div>
                    </div>

                    {/* Quick Sizing triggers directly in checkout */}
                    <div className="mt-4 pt-3 border-t border-black/10 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-black/40 block mb-1">
                          {tp('sizes')}
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="text-[10px] font-bold border-2 border-black rounded px-1.5 py-0.5 bg-white text-black w-full"
                        >
                          {checkoutProduct.available_sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase text-black/40 block mb-1">
                          {tp('material')}
                        </label>
                        <select
                          value={selectedFabric}
                          onChange={(e) => setSelectedFabric(e.target.value)}
                          className="text-[10px] font-bold border-2 border-black rounded px-1.5 py-0.5 bg-white text-black w-full"
                        >
                          {checkoutProduct.material_options.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Cart Summary */
                  <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2">
                    <h4 className="text-xs font-black uppercase text-black/50 pb-2 border-b border-black/10">
                      {locale === 'ar' ? 'ملخص المنتجات' : 'Cart Items Summary'}
                    </h4>
                    <div className="max-h-36 overflow-y-auto divide-y divide-black/10 pr-1 space-y-2 pt-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs pt-1 pb-1">
                          <div className="min-w-0">
                            <span className="font-black text-black block truncate uppercase">{locale === 'ar' ? item.product.name_ar : item.product.name_en}</span>
                            <span className="text-[9px] text-black/60 font-semibold block uppercase">
                              {locale === 'ar' ? `مقاس ${item.size} • ${item.fabric === 'Standard Cotton' ? 'قطن قياسي' : 'قطن ثقيل'}` : `Size ${item.size} • ${item.fabric}`} x{item.quantity}
                            </span>
                          </div>
                          <span className="font-black text-brand-accent shrink-0">
                            {tp('price_egp', { price: item.price * item.quantity })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Fields Group */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-black uppercase text-black/60 block mb-1">
                      {t('name_label')}
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 text-black/40" size={14} />
                      <input
                        type="text"
                        required
                        placeholder={t('name_placeholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black uppercase text-black/60 block mb-1">
                        {t('phone_label')}
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3 text-black/40" size={14} />
                        <input
                          type="tel"
                          required
                          placeholder={t('phone_placeholder')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                        />
                      </div>
                      <p className="text-[9px] text-[#D84A2A] font-bold mt-1">
                        {locale === 'ar' ? '⚠️ هام: كوبونات المكافآت ترتبط برقم الهاتف هذا. لا تغير رقمك لاحقاً للاستفادة منها.' : '⚠️ Note: Reward coupons are bound to this phone number. Do not change it later.'}
                      </p>
                      {phone.trim().length >= 10 && (() => {
                        const userCoupons = useStore.getState().offers.filter(o => o.bound_phone && o.bound_phone.trim() === phone.trim() && o.is_active);
                        if (userCoupons.length === 0) return null;
                        return (
                          <div className="mt-2 p-2 bg-green-50 border border-green-500 rounded-lg text-[10px] flex justify-between items-center animate-pulse">
                            <div className="font-bold text-green-800">
                              {locale === 'ar' 
                                ? `لديك كوبون مكافأة غير مستخدم: ${userCoupons[0].code} (${userCoupons[0].discount_percent}%)` 
                                : `Unused reward coupon found: ${userCoupons[0].code} (${userCoupons[0].discount_percent}%)`}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCouponCode(userCoupons[0].code);
                                setAppliedDiscount(userCoupons[0].discount_percent);
                                setDiscountMsg(locale === 'ar' ? 'تم تطبيق كوبون المكافأة!' : 'Reward coupon applied!');
                                setDiscountErr('');
                              }}
                              className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded font-black text-[9px] cursor-pointer"
                            >
                              {locale === 'ar' ? 'تطبيق' : 'Apply'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-black/60 block mb-1">
                        {locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 text-black/40" size={14} />
                        <input
                          type="email"
                          placeholder="e.g. mail@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black uppercase text-black/60 block mb-1">
                        {t('governorate_label')}
                      </label>
                      <div className="relative">
                        <select
                          value={governorate}
                          onChange={(e) => setGovernorate(e.target.value)}
                          className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none appearance-none"
                        >
                          {governorates.map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-black/60 block mb-1">
                        {locale === 'ar' ? 'المدينة / المنطقة' : 'City / District'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Heliopolis"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-black/60 block mb-1">
                      {t('address_label')}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder={t('address_placeholder')}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Promo Code & Referral Group */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/10">
                  <div>
                    <label className="text-[10px] font-black uppercase text-black/60 block mb-1 flex items-center gap-1">
                      <Ticket size={11} className="text-brand-accent" />
                      {t('coupon_label')}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder={t('coupon_placeholder')}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1 bg-white text-black font-semibold border-2 border-black rounded-lg text-xs focus:outline-none uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-2 py-1 bg-black text-[#EDE0D0] hover:bg-brand-accent hover:text-white border-2 border-black rounded-lg font-black uppercase text-[10px] cursor-pointer shrink-0 transition-colors"
                      >
                        {t('coupon_apply')}
                      </button>
                    </div>
                    {discountMsg && (
                      <p className="text-[9px] font-black text-green-600 mt-0.5">{discountMsg}</p>
                    )}
                    {discountErr && (
                      <p className="text-[9px] font-black text-red-500 mt-0.5">⚠️ {discountErr}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-black/60 block mb-1 flex items-center gap-1">
                      <HelpCircle size={11} className="text-brand-accent" />
                      {locale === 'ar' ? 'كود الإحالة (اختياري)' : 'Referral Code (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REFER-MARK82"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full px-3 py-1 bg-white text-black font-semibold border-2 border-black rounded-lg text-xs focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Additional notes */}
                <div>
                  <label className="text-xs font-black uppercase text-black/60 block mb-1">
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
                  <div className="flex justify-between items-center text-black/60 font-semibold">
                    <span>{t('price_subtotal')}</span>
                    <span>{tp('price_egp', { price: subtotal })}</span>
                  </div>
                  {cottonDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 font-bold">
                      <span>{locale === 'ar' ? 'عرض القطن (خصم ٢٥٪ على القطعة الثانية)' : 'Cotton Promo (25% off 2nd Item)'}</span>
                      <span>-{tp('price_egp', { price: cottonDiscount })}</span>
                    </div>
                  )}
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 font-bold">
                      <span>{t('price_discount')} ({appliedDiscount}%)</span>
                      <span>-{tp('price_egp', { price: discountAmount })}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-black/60 font-semibold">
                    <span>{t('price_shipping')}</span>
                    <span>{tp('price_egp', { price: shippingFee })}</span>
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
              <div className="text-center py-6 space-y-6">
                
                {/* Floating Success Ticket */}
                <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-w-sm mx-auto overflow-hidden rotate-[1deg]">
                  <div className="absolute top-1/2 left-[-12px] w-6 h-6 bg-[#EDE0D0] border-2 border-black rounded-full transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-[-12px] w-6 h-6 bg-[#EDE0D0] border-2 border-black rounded-full transform -translate-y-1/2"></div>
                  
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-3 animate-bounce" />
                  
                  <h4 className="text-xl font-black uppercase text-black">
                    {t('success_title')}
                  </h4>
                  
                  <p className="text-xs font-semibold text-black/70 leading-relaxed font-handwriting mt-2 mb-4 px-2">
                    {t('success_desc')}
                  </p>

                  <div className="p-2.5 bg-[#EDE0D0]/30 border-2 border-dashed border-black/40 rounded-xl">
                    <span className="text-[9px] uppercase font-black text-black/45 block mb-0.5">
                      {t('order_ref')}
                    </span>
                    <span className="text-lg font-black tracking-widest text-brand-accent block">
                      #{orderRef}
                    </span>
                  </div>
                </div>

                {/* EARNED REWARDS TICKET SECTION */}
                {rewardCouponCode && (
                  <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm mx-auto relative overflow-hidden -rotate-[1deg] space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E07A5F]"></div>
                    <div className="flex justify-center items-center gap-1.5 text-brand-accent">
                      <Tag size={16} className="animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {tc('reward_earned')}
                      </span>
                    </div>

                    <div className="divide-y divide-black/10 space-y-3">
                      {rewardCouponCode.split(',').map((codeSegment, index) => {
                        const code = codeSegment.trim();
                        const isCotton = code.startsWith('COTTON-');
                        const rewardText = isCotton 
                          ? (locale === 'ar' ? 'خصم ٢٥٪ على طلبك القادم!' : '25% OFF next purchase!')
                          : (locale === 'ar' ? 'خصم ١٥٪ على طلبك القادم!' : '15% OFF next purchase!');
                        const rewardTitle = isCotton 
                          ? tc('cotton_reward') 
                          : tc('referral_reward');

                        return (
                          <div key={index} className="pt-2">
                            <span className="text-[10px] font-black uppercase text-black/50 block">
                              {rewardTitle}
                            </span>
                            <span className="text-sm font-black text-brand-accent block mt-0.5">
                              {rewardText}
                            </span>
                            
                            <div className="mt-2 flex items-center justify-between bg-[#EDE0D0] border-2 border-black rounded-lg px-3 py-1.5 font-mono text-xs font-black text-black">
                              <span>{code}</span>
                              <button
                                onClick={() => handleCopyCode(code)}
                                className="p-1 border border-black/15 hover:bg-black/5 rounded cursor-pointer transition-colors"
                              >
                                {copiedCoupon === code ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                            <span className="text-[9px] font-bold text-black/40 block mt-1 leading-none">
                              {locale === 'ar' ? '* الكود سيتفعل تلقائياً بعد استلام طلبك الحالي' : '* Activates automatically once your order is Completed'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* REFERRAL LINK SHARING TICKET */}
                {phone.trim() && (
                  <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm mx-auto relative overflow-hidden rotate-[1deg] space-y-2">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#457B9D]"></div>
                    <div className="flex justify-center items-center gap-1.5 text-[#457B9D]">
                      <Share2 size={14} className="animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {locale === 'ar' ? 'شارك الموقع مع أصدقائك واكسب!' : 'Invite Friends & Earn!'}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-black/60 leading-tight">
                      {locale === 'ar' 
                        ? 'انسخ رابط الإحالة الخاص بك وأرسله لأصدقائك. عندما يطلبون، ستحصل تلقائياً على كود خصم ١٥٪!' 
                        : 'Share your referral link. When they place an order, you will instantly earn a 15% OFF coupon!'}
                    </p>
                    <div className="flex items-center justify-between bg-[#EDE0D0] border-2 border-black rounded-lg px-3 py-1.5 font-mono text-[9px] font-black text-black">
                      <span className="truncate flex-1 text-left">{`fandom-fit.vercel.app/?ref=${phone.trim()}`}</span>
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/?ref=${phone.trim()}`;
                          navigator.clipboard.writeText(link);
                          setCopiedCoupon(`link-${phone}`);
                          setTimeout(() => setCopiedCoupon(''), 2000);
                        }}
                        className="p-1 border border-black/15 hover:bg-black/5 rounded cursor-pointer transition-colors shrink-0 ml-1.5"
                      >
                        {copiedCoupon === `link-${phone}` ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-black text-[#EDE0D0] hover:bg-brand-accent hover:text-white border-3 border-black rounded-xl font-black uppercase text-xs tracking-wider sticker cursor-pointer transition-all duration-300"
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
