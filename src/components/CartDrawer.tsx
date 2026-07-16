'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, getFabricPremium, getCartTotals } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Ticket, Tag } from 'lucide-react';

export default function CartDrawer() {
  const locale = useLocale();
  const t = useTranslations('cart');
  const tp = useTranslations('products');
  const tc = useTranslations('checkout');

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    setIsCheckoutOpen,
    validateCoupon,
    settings,
    updateCartItemSpecs,
    setIsSizeChartOpen,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoErr, setPromoErr] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  if (!isCartOpen) return null;

  // Subtotal & Cotton Promotion Calculations
  const cottonEnabled = settings.cotton_reward_system_enabled !== false;
  const autoOffers = settings.auto_applied_offers || [];
  const thresholdOffers = (() => {
    try {
      const raw = settings.threshold_offers;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  })();
  const { 
    subtotal, 
    cottonDiscount, 
    autoAppliedDiscount, 
    autoAppliedOfferName, 
    thresholdDiscount,
    thresholdOfferName,
    shipping, 
    finalTotal 
  } = getCartTotals(cart, cottonEnabled, autoOffers, thresholdOffers);
  const shippingFee = shipping;

  // Discount Calculation
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const finalTotalWithPromo = Math.max(0, subtotal - cottonDiscount - autoAppliedDiscount - thresholdDiscount - discountAmount + shippingFee);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidating(true);
    setPromoErr('');
    setPromoSuccess('');

    // Fetch phone number for validation check (fallback to guest)
    const res = await validateCoupon(promoCode, 'guest', subtotal);
    setIsValidating(false);

    if (res.isValid) {
      setDiscountPercent(res.discountPercent || 0);
      setAppliedPromo(promoCode.trim());
      setPromoSuccess(locale === 'ar' ? 'تم تطبيق الخصم بنجاح!' : 'Coupon applied successfully!');
      
      // Store in session/local storage for Checkout Modal
      localStorage.setItem('ff_applied_coupon', promoCode.trim());
      localStorage.setItem('ff_coupon_discount', String(res.discountPercent || 0));
    } else {
      let errMsg = locale === 'ar' ? 'كود خصم غير صالح' : 'Invalid coupon code';
      if (res.error === 'expired') {
        errMsg = locale === 'ar' ? 'هذا الكود منتهي الصلاحية' : 'This coupon has expired';
      } else if (res.error === 'limit_reached') {
        errMsg = locale === 'ar' ? 'تم الوصول للحد الأقصى لاستخدام الكود' : 'Coupon usage limit reached';
      } else if (res.error === 'min_order_not_met') {
        errMsg = locale === 'ar' ? 'لم يتم الوصول للحد الأدنى للطلب' : 'Minimum order amount not met';
      }
      setPromoErr(errMsg);
      setDiscountPercent(0);
      setAppliedPromo('');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscountPercent(0);
    setAppliedPromo('');
    setPromoSuccess('');
    setPromoErr('');
    localStorage.removeItem('ff_applied_coupon');
    localStorage.removeItem('ff_coupon_discount');
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Drawer Body */}
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
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-brand-accent" size={24} />
              <h3 className="text-xl font-black uppercase text-black">
                {locale === 'ar' ? 'حقيبة التسوق' : 'Shopping Cart'}
              </h3>
              <span className="bg-brand-accent text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 border-2 border-black rounded-lg hover:bg-black/5 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length > 0 && (
              <div className="flex justify-between items-center bg-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-black uppercase text-black/55">
                  {locale === 'ar' ? 'هل تحتاج إلى مساعدة في المقاسات؟' : 'Need help with sizes?'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="px-3 py-1 bg-amber-100 hover:bg-amber-200 border-2 border-black text-black rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  📐 {locale === 'ar' ? 'دليل المقاسات' : 'Size Guide'}
                </button>
              </div>
            )}
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-24 h-24 border-3 border-dashed border-black/30 rounded-full flex items-center justify-center text-black/30 animate-pulse">
                  <ShoppingBag size={48} />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase text-black/60">
                    {locale === 'ar' ? 'سلتك فارغة' : 'Your Cart is Empty'}
                  </h4>
                  <p className="text-xs font-semibold text-black/40 font-handwriting mt-1">
                    {locale === 'ar' ? 'أضف بعض القطع الفاخرة لتبدأ!' : 'Add some premium drop items to get started!'}
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-black text-[#EDE0D0] hover:bg-brand-accent hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs transition-colors cursor-pointer"
                >
                  {locale === 'ar' ? 'تصفح المعروضات' : 'Go Shopping'}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const name = locale === 'ar' ? item.product.name_ar : item.product.name_en;
                const defaultPlaceholder =
                  item.product.category_id === '4'
                    ? '/placeholders/manga_front.jpg'
                    : '/placeholders/arcade_front.jpg';
                const imageSrc =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images[0]
                    : defaultPlaceholder;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-3 relative overflow-hidden"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 border-2 border-black rounded-lg overflow-hidden shrink-0 relative bg-[#EDE0D0]/30 flex items-center justify-center">
                      <Image
                        src={imageSrc}
                        alt={name}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black text-black uppercase truncate flex-1">
                            {name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-black/40 hover:text-red-500 cursor-pointer shrink-0 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {/* Size & Fabric Tagging Dropdowns */}
                        <div className="flex flex-wrap gap-2 mt-1.5 select-none">
                          {/* Size selector dropdown */}
                           <select
                            value={item.size}
                            onChange={(e) => updateCartItemSpecs(item.id, e.target.value, item.fabric, item.fitType)}
                            className="text-[9px] font-black uppercase bg-[#EDE0D0] px-1 py-0.5 rounded border border-black focus:outline-none cursor-pointer"
                          >
                            {(item.product.available_sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((s) => {
                              const qty = item.product.stock_quantities?.[s] ?? 10;
                              const isOutOfStock = qty <= 0;
                              return (
                                <option key={s} value={s} disabled={isOutOfStock}>
                                  {locale === 'ar' ? `مقاس ${s}` : `Size ${s}`} {isOutOfStock ? `(${locale === 'ar' ? 'غير متوفر' : 'Out of stock'})` : ''}
                                </option>
                              );
                            })}
                          </select>

                          {/* Fabric selector dropdown */}
                          <select
                            value={item.fabric}
                            onChange={(e) => updateCartItemSpecs(item.id, item.size, e.target.value, item.fitType)}
                            className="text-[9px] font-black uppercase bg-[#EDE0D0] px-1 py-0.5 rounded border border-black focus:outline-none cursor-pointer"
                          >
                            {(item.product.material_options || ['Standard Cotton', 'Premium Cotton']).map((f) => (
                              <option key={f} value={f}>
                                {f === 'Standard Cotton' ? (locale === 'ar' ? 'قطن قياسي' : 'Standard Cotton') : (locale === 'ar' ? 'قطن مميز' : f)}
                              </option>
                            ))}
                          </select>

                          {/* Fit selector dropdown or badge */}
                          {item.product.fit_type === 'both' || !item.product.fit_type ? (
                            <select
                              value={item.fitType || 'oversized'}
                              onChange={(e) => updateCartItemSpecs(item.id, item.size, item.fabric, e.target.value as any)}
                              className="text-[9px] font-black uppercase bg-[#EDE0D0] px-1 py-0.5 rounded border border-black focus:outline-none cursor-pointer"
                            >
                              <option value="oversized">{locale === 'ar' ? 'قصة واسعة' : 'Oversized'}</option>
                              <option value="regular">{locale === 'ar' ? 'قصة معتادة' : 'Regular'}</option>
                            </select>
                          ) : (
                            <span className="text-[9px] font-black uppercase bg-zinc-200 text-zinc-700 px-1 py-0.5 rounded border border-zinc-300">
                              {item.fitType === 'regular' ? (locale === 'ar' ? 'قصة معتادة' : 'Regular Fit') : (locale === 'ar' ? 'قصة واسعة' : 'Oversized Fit')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex justify-between items-center mt-2">
                        {/* Adjusters */}
                        <div className="flex items-center border-2 border-black rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-black/5 cursor-pointer text-black"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-2 text-xs font-black text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-black/5 cursor-pointer text-black"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-xs font-black text-brand-accent">
                          {tp('price_egp', { price: item.price * item.quantity })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer (Pricing Summary) */}
          {cart.length > 0 && (
            <div className="p-4 border-t-4 border-black bg-white space-y-4">
              {/* Promo Code Input */}
              <div>
                <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                  {locale === 'ar' ? 'كود الخصم (كوبون)' : 'Apply Promo Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'أدخل الكود هنا' : 'e.g. PREMIUM25'}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromo}
                    className="flex-1 px-3 py-1.5 bg-white text-black font-semibold border-2 border-black rounded-lg text-xs focus:outline-none disabled:bg-gray-100 uppercase"
                  />
                  {appliedPromo ? (
                    <button
                      onClick={handleRemovePromo}
                      className="px-3 py-1.5 bg-red-500 text-white border-2 border-black rounded-lg font-black uppercase text-[10px] transition-colors cursor-pointer"
                    >
                      {locale === 'ar' ? 'حذف' : 'Remove'}
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      disabled={isValidating}
                      className="px-3 py-1.5 bg-black text-[#EDE0D0] hover:bg-[#E07A5F] hover:text-white border-2 border-black rounded-lg font-black uppercase text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isValidating ? (locale === 'ar' ? 'جاري التحقق...' : 'Checking...') : (locale === 'ar' ? 'تطبيق' : 'Apply')}
                    </button>
                  )}
                </div>
                {promoErr && (
                  <p className="text-[9px] font-black text-red-500 mt-1">⚠️ {promoErr}</p>
                )}
                {promoSuccess && (
                  <p className="text-[9px] font-black text-green-600 mt-1">✓ {promoSuccess}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-3 border-2 border-dashed border-black/30 bg-[#EDE0D0]/10 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-black/60 font-semibold">
                  <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{tp('price_egp', { price: subtotal })}</span>
                </div>
                {cottonDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-bold">
                    <span>{locale === 'ar' ? 'عرض القطن (خصم ٢٥٪ على القطعة الثانية)' : 'Cotton Promo (25% off 2nd Item)'}</span>
                    <span>-{tp('price_egp', { price: cottonDiscount })}</span>
                  </div>
                )}
                {autoAppliedDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-bold">
                    <span>
                      {locale === 'ar' 
                        ? `خصم تلقائي: ${autoAppliedOfferName}` 
                        : `Auto Offer: ${autoAppliedOfferName}`}
                    </span>
                    <span>-{tp('price_egp', { price: autoAppliedDiscount })}</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-bold">
                    <span>{locale === 'ar' ? `الخصم (${discountPercent}%)` : `Discount (${discountPercent}%)`}</span>
                    <span>-{tp('price_egp', { price: discountAmount })}</span>
                  </div>
                )}
                {thresholdDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>🎁 {thresholdOfferName || (locale === 'ar' ? 'خصم على المبلغ' : 'Order Discount')}</span>
                    <span>-{tp('price_egp', { price: thresholdDiscount })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-black/60 font-semibold">
                  <span>{locale === 'ar' ? 'الشحن' : 'Shipping'}</span>
                  <span>{shippingFee === 0 ? (locale === 'ar' ? '🎉 مجاني!' : '🎉 Free!') : tp('price_egp', { price: shippingFee })}</span>
                </div>
                <div className="flex justify-between items-center text-black border-t border-black/10 pt-1.5 font-black text-sm">
                  <span>{locale === 'ar' ? 'المجموع النهائي' : 'Final Total'}</span>
                  <span className="text-brand-accent">{tp('price_egp', { price: finalTotalWithPromo })}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-black uppercase border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <span>{locale === 'ar' ? 'الدفع وإتمام الطلب' : 'Proceed to Checkout'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
