'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, getFabricPremium, getCartTotals } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Ticket, CheckCircle, MapPin, Phone, User, HelpCircle, Mail, Copy, Check, Tag, Share2, Gift, ArrowLeft, CreditCard, Upload, Loader2 } from 'lucide-react';

export default function CheckoutModal() {
  const t = useTranslations('checkout');
  const tp = useTranslations('products');
  const tc = useTranslations('cart');
  const locale = useLocale();

  const {
    checkoutProduct,
    setCheckoutProduct,
    checkoutSelectedSize,
    checkoutSelectedFabric,
    checkoutSelectedFit,
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    addOrder,
    validateCoupon,
    getProductEffectivePrice,
    settings,
    user,
    profile
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

  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'paymob_card' | 'paymob_fawry' | 'instapay'>('paymob_card');
  const [orderCode, setOrderCode] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copiedField, setCopiedField] = useState<'phone' | 'code' | null>(null);

  // Discount states
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // percentage (e.g. 25)
  const [discountMsg, setDiscountMsg] = useState('');
  const [discountErr, setDiscountErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [rewardCouponCode, setRewardCouponCode] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Auto-fill address details from profile if logged in
  useEffect(() => {
    if (profile) {
      if (profile.address_data) {
        setName(profile.address_data.customer_name || '');
        setPhone(profile.address_data.customer_phone || '');
        setEmail(profile.address_data.customer_email || '');
        setGovernorate(profile.address_data.governorate || 'Cairo');
        setCity(profile.address_data.city || '');
        setAddress(profile.address_data.address || '');
      } else {
        if (profile.email) setEmail(profile.email);
        if (profile.phone) setPhone(profile.phone);
      }
    }
  }, [profile]);

  // Sizing choices (only for single product checkout)
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('Standard Cotton');
  const [selectedFit, setSelectedFit] = useState<'regular' | 'oversized'>('oversized');

  // Sync state on checkoutProduct change
  useEffect(() => {
    if (checkoutProduct) {
      const defaultFit = checkoutSelectedFit || (checkoutProduct.fit_type === 'regular' ? 'regular' : 'oversized');
      setSelectedFit(defaultFit as any);
      const firstInStockSize = checkoutProduct.available_sizes.find(
        (size) => (checkoutProduct.stock_quantities?.[size] ?? 10) > 0
      ) || checkoutProduct.available_sizes?.[0] || 'M';
      setSelectedSize(checkoutSelectedSize || firstInStockSize);
      setSelectedFabric(checkoutSelectedFabric || checkoutProduct.material_options?.[0] || 'Standard Cotton');
    }
  }, [checkoutProduct, checkoutSelectedSize, checkoutSelectedFabric, checkoutSelectedFit]);

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
      
      // Auto-fill from user profile address_data or localStorage saved customer data!
      const userProfile = useStore.getState().profile;
      const addrData = userProfile?.address_data || {};
      const savedData = (() => {
        try { return JSON.parse(localStorage.getItem('ff_saved_customer_data') || '{}'); }
        catch { return {}; }
      })();

      // Priority: profile fields first, then address_data, then localStorage
      setName(userProfile?.full_name || addrData.customer_name || savedData.customer_name || '');
      setPhone(userProfile?.phone || addrData.customer_phone || savedData.customer_phone || '');
      setEmail(userProfile?.email || addrData.customer_email || savedData.customer_email || '');
      setGovernorate(addrData.governorate || savedData.governorate || 'Cairo');
      setCity(addrData.city || savedData.city || '');
      setAddress(addrData.street || addrData.address || savedData.address || '');
      setNotes('');
      setRewardCouponCode('');
      setCheckoutStep(1);
      setPaymentMethod('paymob_card');
      setOrderCode('');
      setReceiptUrl('');
      setUploadError('');
      setCopiedField(null);

      // Load coupon from localStorage if applied in Cart drawer
      const savedCoupon = localStorage.getItem('ff_applied_coupon') || '';
      const savedDiscount = Number(localStorage.getItem('ff_coupon_discount') || '0');
      
      setCouponCode(savedCoupon);
      setAppliedDiscount(savedDiscount);
      setDiscountMsg(savedCoupon && savedDiscount > 0 ? (locale === 'ar' ? 'تم تحميل الكوبون المطبق من السلة!' : 'Coupon applied from your cart!') : '');
      setReferralCode(localStorage.getItem('ff_referrer_phone') || '');
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
  let autoAppliedDiscount = 0;
  let autoAppliedOfferName = '';
  let thresholdDiscount = 0;
  let thresholdOfferName = '';
  let shippingFee = 0;

  const thresholdOffers = (() => {
    try {
      const raw = settings.threshold_offers;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  })();

  if (isSingle) {
    subtotal = singleItemPrice;
    shippingFee = subtotal > 0 ? 50 : 0;
  } else {
    const cottonEnabled = settings.cotton_reward_system_enabled !== false;
    const autoOffers = settings.auto_applied_offers || [];
    const totals = getCartTotals(cart, cottonEnabled, autoOffers, thresholdOffers);
    subtotal = totals.subtotal;
    cottonDiscount = totals.cottonDiscount;
    autoAppliedDiscount = totals.autoAppliedDiscount;
    autoAppliedOfferName = totals.autoAppliedOfferName;
    thresholdDiscount = totals.thresholdDiscount;
    thresholdOfferName = totals.thresholdOfferName;
    shippingFee = totals.shipping;
  }

  const discountAmount = Number(((subtotal * appliedDiscount) / 100).toFixed(2));
  
  const threshold = Number(settings.loyalty_orders_threshold || 5);
  const loyaltyDiscountPercent = Number(settings.loyalty_discount_percent || 20);
  const isLoyaltyEligible = profile && (profile.loyalty_points || 0) >= threshold;
  const loyaltyDiscount = isLoyaltyEligible
    ? Math.round((subtotal * loyaltyDiscountPercent) / 100)
    : 0;

  const total = Math.max(0, subtotal - cottonDiscount - autoAppliedDiscount - thresholdDiscount - discountAmount - loyaltyDiscount + shippingFee);

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

  const getFieldStatus = (fieldName: string) => {
    const defaults: Record<string, string> = {
      name: 'required',
      email: 'optional',
      phone: 'required',
      governorate: 'required',
      city: 'required',
      address: 'required',
      notes: 'optional'
    };
    
    let config = defaults;
    try {
      if (settings?.account_fields) {
        config = typeof settings.account_fields === 'string' 
          ? JSON.parse(settings.account_fields) 
          : settings.account_fields;
      }
    } catch (e) {
      console.error("Error parsing account_fields", e);
    }
    
    return config[fieldName] || defaults[fieldName] || 'optional';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(locale === 'ar' ? 'حجم الملف يتجاوز الحد الأقصى (١٠ ميجابايت)' : 'File size exceeds the 10MB limit');
      return;
    }

    // Validate format
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(fileExt)) {
      setUploadError(locale === 'ar' ? 'صيغة الملف غير مدعومة. يرجى رفع ملف JPG أو PNG أو PDF' : 'Unsupported file format. Please upload JPG, PNG, or PDF');
      return;
    }

    setUploadError('');
    setIsUploadingReceipt(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/payment/receipt-upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setReceiptUrl(data.url);
      } else {
        setUploadError(data.error || (locale === 'ar' ? 'فشل رفع الإيصال' : 'Failed to upload receipt'));
      }
    } catch (err) {
      setUploadError(locale === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const renderLabel = (fieldName: string, defaultEn: string, defaultAr: string) => {
    const status = getFieldStatus(fieldName);
    const baseText = locale === 'ar' ? defaultAr : defaultEn;
    if (status === 'required') {
      return baseText + " *";
    }
    if (status === 'optional') {
      return baseText + (locale === 'ar' ? ' (اختياري)' : ' (Optional)');
    }
    return baseText;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (getFieldStatus('name') === 'required' && !name) return;
    if (getFieldStatus('phone') === 'required' && !phone) return;
    if (getFieldStatus('email') === 'required' && !email) return;
    if (getFieldStatus('governorate') === 'required' && !governorate) return;
    if (getFieldStatus('city') === 'required' && !city) return;
    if (getFieldStatus('address') === 'required' && !address) return;
    if (getFieldStatus('notes') === 'required' && !notes) return;

    // Phone format Egyptian check if phone is visible/provided
    const cleanPhone = phone.trim();
    if (getFieldStatus('phone') !== 'hidden' && cleanPhone && !/^01[0-25]\d{8}$/.test(cleanPhone)) {
      alert(locale === 'ar' ? 'الرجاء إدخال رقم موبايل مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian mobile number (e.g. 01012345678)');
      return;
    }

    // Validate stock levels before proceeding
    if (isSingle && checkoutProduct) {
      if (checkoutProduct.is_in_stock === false) {
        alert(locale === 'ar' ? 'عذراً، هذا المنتج غير متوفر حالياً.' : 'Sorry, this product is currently out of stock.');
        return;
      }
    } else {
      // For multi-item cart orders, check if any product is marked out of stock
      const { products } = useStore.getState();
      for (const item of cart) {
        const prod = products.find(p => p.id === item.product.id);
        if (prod && prod.is_in_stock === false) {
          alert(locale === 'ar' 
            ? `عذراً، المنتج "${locale === 'ar' ? prod.name_ar : prod.name_en}" غير متوفر حالياً بالمخزن.`
            : `Sorry, product "${prod.name_en}" is currently out of stock.`
          );
          return;
        }
      }
    }

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
        return;
      }
    }

    // If step 1, generate code and transition to step 2 payment selector
    if (checkoutStep === 1) {
      const year = new Date().getFullYear();
      const count = useStore.getState().orders.length;
      const seq = 124 + count;
      const pad = (num: number, size: number) => {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
      };
      const code = `FF-${year}-${pad(seq, 5)}`;
      setOrderCode(code);
      setCheckoutStep(2);
      return;
    }

    // Step 2 Submission logic
    if (paymentMethod === 'instapay' && !receiptUrl) {
      alert(locale === 'ar' ? 'يرجى رفع إيصال الدفع أولاً لإتمام الطلب.' : 'Please upload the payment receipt to complete your order.');
      return;
    }

    setIsSubmitting(true);

    // Compile items array for database
    const orderItems = isSingle && checkoutProduct ? [{
      id: `${checkoutProduct.id}-${selectedSize}-${selectedFabric}-${selectedFit}`,
      product_id: checkoutProduct.id,
      product_name: singleItemName,
      size: selectedSize,
      fabric: selectedFabric,
      fit_type: selectedFit,
      quantity: 1,
      price: singleItemPrice,
      image: singleItemImage
    }] : cart.map(item => ({
      id: item.id,
      product_id: item.product.id,
      product_name: locale === 'ar' ? item.product.name_ar : item.product.name_en,
      size: item.size,
      fabric: item.fabric,
      fit_type: item.fitType || 'oversized',
      quantity: item.quantity,
      price: item.price,
      image: (item.product.images && item.product.images.length > 0) ? item.product.images[0] : (item.product.category_id === '4' ? '/placeholders/manga_front.jpg' : '/placeholders/arcade_front.jpg')
    }));

    const primaryProductName = isSingle && checkoutProduct
      ? `${singleItemName} (${selectedSize} - ${selectedFit === 'regular' ? 'Regular' : 'Oversized'})`
      : cart.map(item => `${locale === 'ar' ? item.product.name_ar : item.product.name_en} (${item.size} - ${item.fitType === 'regular' ? 'Regular Fit' : 'Oversized Fit'}) x${item.quantity}`).join(', ');

    const fullNotes = `[Checkout Type: Web]${isSingle ? ` | Fabric: ${selectedFabric} | Fit: ${selectedFit}` : ` | Items Spec: ${cart.map(i => `${i.product.name_en}: ${i.fabric}/${i.fitType || 'oversized'}`).join(', ')}`}${notes ? ` | Customer Note: ${notes}` : ''}${appliedDiscount > 0 ? ` | Coupon Code: ${couponCode.trim()} (${appliedDiscount}% Off)` : ''}${referralCode.trim() ? ` | Referral: ${referralCode.trim()}` : ''}`;

    const orderStatus = paymentMethod === 'instapay' ? 'pending_verification' : 'pending_payment';

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
      referral_code: referralCode.trim() || undefined,
      user_id: user?.id || null,
      order_code: orderCode,
      payment_method: paymentMethod,
      payment_receipt_url: paymentMethod === 'instapay' ? receiptUrl : undefined,
      status: orderStatus
    });

    if (result) {
      // Clear Cart and local coupon state on success
      if (!isSingle) clearCart();
      localStorage.removeItem('ff_applied_coupon');
      localStorage.removeItem('ff_coupon_discount');

      // Save address to profile if logged in and no address saved yet
      const currentProfile = useStore.getState().profile;
      const currentUser = useStore.getState().user;
      if (currentUser && currentProfile) {
        const hasAddress = currentProfile.address_data && (currentProfile.address_data.governorate || currentProfile.address_data.city || currentProfile.address_data.street);
        if (!hasAddress) {
          // Save address to profile for future autofill
          await useStore.getState().updateProfile({
            address_data: { governorate, city, street: address }
          });
        }
      } else {
        // Guest: save to localStorage for next visit
        localStorage.setItem('ff_saved_customer_data', JSON.stringify({
          customer_name: name, customer_phone: cleanPhone,
          customer_email: email.trim(), governorate, city, address
        }));
      }

      setOrderRef(orderCode);
      setRewardCouponCode(result.reward_coupon_code || '');

      // If online payment (Paymob), initiate session & redirect
      if (paymentMethod === 'paymob_card' || paymentMethod === 'paymob_fawry') {
        try {
          const initiateRes = await fetch('/api/payment/paymob/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: result.id,
              paymentMethod: paymentMethod === 'paymob_fawry' ? 'fawry' : 'card'
            })
          });
          const initiateData = await initiateRes.json();
          if (initiateData.success && initiateData.redirectUrl) {
            window.location.href = initiateData.redirectUrl;
            return;
          } else {
            alert(locale === 'ar' ? 'فشل تحويل بوابة الدفع المباشر، يرجى المحاولة مرة أخرى.' : 'Payment gateway redirection failed, please try again.');
          }
        } catch (initErr) {
          console.error("Paymob initiation error:", initErr);
          alert(locale === 'ar' ? 'حدث خطأ أثناء إعداد بوابة الدفع.' : 'An error occurred during payment gateway setup.');
        }
      } else {
        // InstaPay manual payment success
        setShowSuccess(true);
      }
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
                            <option key={s} value={s}>
                              {s}
                            </option>
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

                      {(checkoutProduct.fit_type === 'both' || !checkoutProduct.fit_type) && (
                        <div className="col-span-2 mt-2">
                          <label className="text-[9px] font-black uppercase text-black/40 block mb-1">
                            {locale === 'ar' ? 'القصة (الستايل)' : 'Fit Type'}
                          </label>
                          <select
                            value={selectedFit}
                            onChange={(e) => setSelectedFit(e.target.value as any)}
                            className="text-[10px] font-bold border-2 border-black rounded px-1.5 py-0.5 bg-white text-black w-full"
                          >
                            <option value="oversized">{locale === 'ar' ? 'قصة واسعة (Oversized)' : 'Oversized Fit'}</option>
                            <option value="regular">{locale === 'ar' ? 'قصة معتادة (Regular)' : 'Regular Fit'}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Real-time stock alerts for checkout product */}
                    <div className="mt-3">
                      {(() => {
                        if (!checkoutProduct.is_in_stock) {
                          return (
                            <span className="text-[10px] font-black text-red-600 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                              {locale === 'ar' ? '⚠️ المنتج غير متوفر حالياً' : '⚠️ Out of Stock'}
                            </span>
                          );
                        }
                        const qty = checkoutProduct.stock_quantities?.[selectedSize] ?? 10;
                        const showStockCounts = settings.show_stock_quantities !== false;
                        if (qty <= 0) {
                          return (
                            <span className="text-[10px] font-black text-green-600 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {locale === 'ar' 
                                ? (showStockCounts ? `✅ متوفر عند الطلب (المخزن: ٠)` : `✅ متوفر في المخزن`) 
                                : (showStockCounts ? `✅ Available on order (0 in stock)` : `✅ In Stock`)}
                            </span>
                          );
                        } else if (qty <= 3) {
                          return (
                            <span className="text-[10px] font-black text-amber-600 animate-pulse flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {locale === 'ar' ? `🔥 متبقي ${qty} قطع فقط من المقاس ${selectedSize}!` : `🔥 Only ${qty} left in stock for size ${selectedSize}!`}
                            </span>
                          );
                        }
                        return null;
                      })()}
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
                              {locale === 'ar' 
                                ? `مقاس ${item.size} • ${item.fitType === 'regular' ? 'قصة معتادة' : 'قصة واسعة'} • ${item.fabric === 'Standard Cotton' ? 'قطن قياسي' : 'قطن ثقيل'}` 
                                : `Size ${item.size} • ${item.fitType === 'regular' ? 'Regular' : 'Oversized'} • ${item.fabric}`} x{item.quantity}
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

                {/* Step 1 Fields */}
                {checkoutStep === 1 ? (
                  <>
                    {/* Delivery Fields Group */}
                    <div className="space-y-3">
                      {getFieldStatus('name') !== 'hidden' && (
                        <div>
                          <label className="text-xs font-black uppercase text-black/60 block mb-1">
                            {renderLabel('name', 'Full Name', 'الاسم بالكامل')}
                          </label>
                          <div className="relative flex items-center">
                            <User className="absolute left-3 text-black/40" size={14} />
                            <input
                              type="text"
                              required={getFieldStatus('name') === 'required'}
                              placeholder={t('name_placeholder')}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {getFieldStatus('phone') !== 'hidden' && (
                          <div>
                            <label className="text-xs font-black uppercase text-black/60 block mb-1">
                              {renderLabel('phone', 'Phone Number', 'رقم الهاتف')}
                            </label>
                            <div className="relative flex items-center">
                              <Phone className="absolute left-3 text-black/40" size={14} />
                              <input
                                type="tel"
                                required={getFieldStatus('phone') === 'required'}
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
                        )}

                        {getFieldStatus('email') !== 'hidden' && (
                          <div>
                            <label className="text-xs font-black uppercase text-black/60 block mb-1">
                              {renderLabel('email', 'Email Address', 'البريد الإلكتروني')}
                            </label>
                            <div className="relative flex items-center">
                              <Mail className="absolute left-3 text-black/40" size={14} />
                              <input
                                type="email"
                                required={getFieldStatus('email') === 'required'}
                                placeholder="e.g. mail@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {getFieldStatus('governorate') !== 'hidden' && (
                          <div>
                            <label className="text-xs font-black uppercase text-black/60 block mb-1">
                              {renderLabel('governorate', 'Governorate', 'المحافظة')}
                            </label>
                            <div className="relative">
                              <select
                                value={governorate}
                                onChange={(e) => setGovernorate(e.target.value)}
                                className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none appearance-none font-sans"
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
                        )}

                        {getFieldStatus('city') !== 'hidden' && (
                          <div>
                            <label className="text-xs font-black uppercase text-black/60 block mb-1">
                              {renderLabel('city', 'City / District', 'المدينة / المنطقة')}
                            </label>
                            <input
                              type="text"
                              required={getFieldStatus('city') === 'required'}
                              placeholder="e.g. Heliopolis"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none font-sans"
                            />
                          </div>
                        )}
                      </div>

                      {getFieldStatus('address') !== 'hidden' && (
                        <div>
                          <label className="text-xs font-black uppercase text-black/60 block mb-1">
                            {renderLabel('address', 'Detailed Address', 'العنوان بالتفصيل')}
                          </label>
                          <textarea
                            required={getFieldStatus('address') === 'required'}
                            rows={2}
                            placeholder={t('address_placeholder')}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none resize-none font-sans"
                          />
                        </div>
                      )}
                    </div>

                    {/* Promo Code & Referral Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10">
                      <div className={settings.referral_reward_system_enabled !== false ? "" : "sm:col-span-2"}>
                        <label className="text-[10px] font-black uppercase text-black/60 block mb-1 flex items-center gap-1">
                          <Ticket size={11} className="text-brand-accent" />
                          {t('coupon_label')}
                        </label>
                        <div className="flex gap-1.5 font-sans">
                          <input
                            type="text"
                            placeholder={t('coupon_placeholder')}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 bg-white text-black font-semibold border-2 border-black rounded-lg text-xs focus:outline-none uppercase font-sans"
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

                      {settings.referral_reward_system_enabled !== false && (
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
                            className="w-full px-3 py-1 bg-white text-black font-semibold border-2 border-black rounded-lg text-xs focus:outline-none uppercase font-sans"
                          />
                        </div>
                      )}
                    </div>

                    {/* Additional notes */}
                    {getFieldStatus('notes') !== 'hidden' && (
                      <div>
                        <label className="text-xs font-black uppercase text-black/60 block mb-1">
                          {renderLabel('notes', 'Order Notes', 'ملاحظات الطلب')}
                        </label>
                        <textarea
                          required={getFieldStatus('notes') === 'required'}
                          rows={2}
                          placeholder={t('notes_placeholder')}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none resize-none font-sans"
                        />
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="p-4 border-2 border-dashed border-black/45 bg-white/40 rounded-xl space-y-2 text-xs select-none">
                      <div className="flex justify-between items-center text-black/60 font-semibold">
                        <span>{t('price_subtotal')}</span>
                        <span>{tp('price_egp', { price: subtotal })}</span>
                      </div>
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
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-bold">
                          <span>{t('price_discount')} ({appliedDiscount}%)</span>
                          <span>-{tp('price_egp', { price: discountAmount })}</span>
                        </div>
                      )}
                      {loyaltyDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-bold">
                          <span>
                            {locale === 'ar' 
                              ? `خصم الولاء (${loyaltyDiscountPercent}٪)` 
                              : `Loyalty Reward (${loyaltyDiscountPercent}%)`}
                          </span>
                          <span>-{tp('price_egp', { price: loyaltyDiscount })}</span>
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

                    {/* Submit Button to Payment Step */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-black uppercase border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider"
                    >
                      {locale === 'ar' ? 'الاستمرار للدفع ➔' : 'Continue to Payment ➔'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Step 2: Payment options selection */}
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="flex items-center gap-1 text-xs font-black text-black/60 hover:text-black mb-4 uppercase cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      {locale === 'ar' ? 'رجوع لتفاصيل الشحن' : 'Back to Shipping'}
                    </button>

                    {/* Payment methods list */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase text-black">
                        {locale === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {/* Visa/Mastercard (Paymob) */}
                        <label className={`p-4 border-3 border-black rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${paymentMethod === 'paymob_card' ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white/50 opacity-70 hover:opacity-100'}`}>
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === 'paymob_card'}
                            onChange={() => setPaymentMethod('paymob_card')}
                            className="mt-1 accent-black"
                          />
                          <div className="flex-1">
                            <span className="font-black text-xs uppercase block text-black flex items-center gap-1.5">
                              <CreditCard size={14} className="text-zinc-600" />
                              {locale === 'ar' ? 'بطاقة ائتمان / ميزة' : 'Visa / Mastercard'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">
                              {locale === 'ar' ? 'دفع تلقائي آمن عبر بوابة Paymob' : 'Secure automatic payment via Paymob gateway'}
                            </span>
                          </div>
                        </label>

                        {/* Fawry kiosk (Paymob) */}
                        <label className={`p-4 border-3 border-black rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${paymentMethod === 'paymob_fawry' ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white/50 opacity-70 hover:opacity-100'}`}>
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === 'paymob_fawry'}
                            onChange={() => setPaymentMethod('paymob_fawry')}
                            className="mt-1 accent-black"
                          />
                          <div className="flex-1">
                            <span className="font-black text-xs uppercase block text-black flex items-center gap-1.5">
                              <Ticket size={14} className="text-zinc-600" />
                              {locale === 'ar' ? 'فوري' : 'Fawry Pay'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">
                              {locale === 'ar' ? 'ادفع في أي منفذ فوري خلال ساعة' : 'Pay at any Fawry kiosk within 1 hour'}
                            </span>
                          </div>
                        </label>

                        {/* InstaPay Manual Option */}
                        {(() => {
                          const paymentSettings = (() => {
                            try {
                              const ps = settings?.payment_settings;
                              if (!ps) return null;
                              return typeof ps === 'string' ? JSON.parse(ps) : ps;
                            } catch { return null; }
                          })();
                          if (paymentSettings?.instapay_enabled === false) return null;
                          return (
                            <label className={`p-4 border-3 border-black rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${paymentMethod === 'instapay' ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white/50 opacity-70 hover:opacity-100'}`}>
                              <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'instapay'}
                                onChange={() => setPaymentMethod('instapay')}
                                className="mt-1 accent-black"
                              />
                              <div className="flex-1">
                                <span className="font-black text-xs uppercase block text-black flex items-center gap-1.5">
                                  <Share2 size={14} className="text-zinc-600" />
                                  {locale === 'ar' ? 'انستاباي (تحويل وتأكيد يدوي)' : 'InstaPay (Manual Verification)'}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">
                                  {locale === 'ar' ? 'تحويل مباشر وسريع ثم رفع لقطة شاشة للإيصال' : 'Transfer directly and upload payment receipt'}
                                </span>
                              </div>
                            </label>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Paymob Info */}
                    {(paymentMethod === 'paymob_card' || paymentMethod === 'paymob_fawry') && (
                      <div className="p-4 bg-zinc-100 border-2 border-black rounded-xl text-xs font-semibold text-zinc-700 leading-relaxed">
                        {locale === 'ar'
                          ? 'سيتم تحويلك إلى صفحة الدفع الآمنة الخاصة بـ Paymob لإتمام عمليتك. بمجرد الدفع، سيتم تأكيد طلبك تلقائياً.'
                          : 'You will be redirected to Paymob secure checkout to complete your transaction. Your order will be confirmed automatically once paid.'}
                      </div>
                    )}

                    {/* InstaPay Details Layout */}
                    {paymentMethod === 'instapay' && (() => {
                      const paymentSettings = (() => {
                        try {
                          const ps = settings?.payment_settings;
                          if (!ps) return null;
                          return typeof ps === 'string' ? JSON.parse(ps) : ps;
                        } catch { return null; }
                      })();
                      return (
                        <div className="space-y-4 border-2 border-black p-4 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <div className="space-y-2 select-text font-mono text-xs">
                            <div className="flex justify-between items-center border-b border-black/5 pb-2">
                              <span className="font-bold text-zinc-500 uppercase">{locale === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}</span>
                              <span className="text-sm font-black text-brand-accent">{total} EGP</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-black/5 pb-2">
                              <span className="font-bold text-zinc-500 uppercase">{locale === 'ar' ? 'كود الطلب (الوصف)' : 'Order Code (Description)'}</span>
                              <div className="flex items-center gap-1.5 font-sans">
                                <span className="font-black text-black">{orderCode}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(orderCode);
                                    setCopiedField('code');
                                    setTimeout(() => setCopiedField(null), 2000);
                                  }}
                                  className="p-1 border border-black/15 rounded hover:bg-black/5 cursor-pointer"
                                >
                                  {copiedField === 'code' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>

                            {paymentSettings?.instapay_phone && (
                              <div className="flex justify-between items-center border-b border-black/5 pb-2">
                                <span className="font-bold text-zinc-500 uppercase">{locale === 'ar' ? 'رقم انستاباي' : 'InstaPay Phone'}</span>
                                <div className="flex items-center gap-1.5 font-sans">
                                  <span className="font-black text-black">{paymentSettings.instapay_phone}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(paymentSettings.instapay_phone);
                                      setCopiedField('phone');
                                      setTimeout(() => setCopiedField(null), 2000);
                                    }}
                                    className="p-1 border border-black/15 rounded hover:bg-black/5 cursor-pointer"
                                  >
                                    {copiedField === 'phone' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              </div>
                            )}

                            {paymentSettings?.instapay_name && (
                              <div className="flex justify-between items-center border-b border-black/5 pb-2">
                                <span className="font-bold text-zinc-500 uppercase">{locale === 'ar' ? 'اسم الحساب' : 'Account Name'}</span>
                                <span className="font-black text-black">{paymentSettings.instapay_name}</span>
                              </div>
                            )}
                          </div>

                          {paymentSettings?.instapay_qr_code && (
                            <div className="flex flex-col items-center justify-center border-t border-black/10 pt-3">
                              <span className="text-[10px] font-black text-zinc-400 uppercase mb-2">{locale === 'ar' ? 'امسح الرمز للدفع' : 'Scan to Pay'}</span>
                              <div className="relative border-2 border-black p-1.5 rounded-xl bg-white">
                                <img
                                  src={paymentSettings.instapay_qr_code}
                                  alt="InstaPay QR Code"
                                  width={120}
                                  height={120}
                                  className="rounded-lg object-contain"
                                />
                              </div>
                            </div>
                          )}

                          {paymentSettings?.instapay_link && (
                            <a
                              href={paymentSettings.instapay_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 border-2 border-black bg-zinc-950 text-white rounded-xl text-center font-bold text-xs uppercase hover:bg-brand-accent transition-colors block cursor-pointer"
                            >
                              {locale === 'ar' ? 'فتح في تطبيق انستاباي' : 'Open in InstaPay App'}
                            </a>
                          )}

                          {/* File Receipt upload */}
                          <div className="border-t border-black/10 pt-4 space-y-3">
                            <div className="flex flex-col select-none">
                              <span className="text-xs font-black uppercase text-black/60 flex items-center gap-1">
                                <Upload size={13} className="text-brand-accent" />
                                {locale === 'ar' ? 'رفع إيصال التحويل (مطلوب)' : 'Upload Receipt Screenshot (Required)'}
                              </span>
                              <span className="text-[9px] font-bold text-zinc-400 mt-0.5">
                                {locale === 'ar' ? 'الامتدادات المقبولة: JPG, PNG, PDF حتى ١٠ ميجابايت' : 'Accepted formats: JPG, PNG, PDF (Max 10MB)'}
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                disabled={isUploadingReceipt}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="border-2 border-dashed border-black/35 rounded-xl p-5 text-center bg-zinc-50 flex flex-col items-center justify-center gap-2 hover:bg-zinc-100 transition-colors">
                                {isUploadingReceipt ? (
                                  <>
                                    <Loader2 className="animate-spin text-brand-accent" size={24} />
                                    <span className="text-xs font-black text-black/60 uppercase">{locale === 'ar' ? 'جاري رفع الملف...' : 'Uploading receipt...'}</span>
                                  </>
                                ) : receiptUrl ? (
                                  <>
                                    <CheckCircle className="text-green-600" size={24} />
                                    <span className="text-xs font-black text-green-700 uppercase truncate max-w-[200px]">
                                      {locale === 'ar' ? 'تم رفع إيصالك بنجاح!' : 'Receipt Uploaded!'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="text-black/30" size={24} />
                                    <span className="text-xs font-black text-black/60 uppercase">{locale === 'ar' ? 'اضغط لاختيار صورة الإيصال' : 'Click to select receipt file'}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {uploadError && (
                              <p className="text-[10px] font-black text-red-500">⚠️ {uploadError}</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Price Breakdown */}
                    <div className="p-4 border-2 border-dashed border-black/45 bg-white/40 rounded-xl space-y-2 text-xs select-none">
                      <div className="flex justify-between items-center text-black/60 font-semibold">
                        <span>{t('price_subtotal')}</span>
                        <span>{tp('price_egp', { price: subtotal })}</span>
                      </div>
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
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-bold">
                          <span>{t('price_discount')} ({appliedDiscount}%)</span>
                          <span>-{tp('price_egp', { price: discountAmount })}</span>
                        </div>
                      )}
                      {loyaltyDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-bold">
                          <span>
                            {locale === 'ar' 
                              ? `خصم الولاء (${loyaltyDiscountPercent}٪)` 
                              : `Loyalty Reward (${loyaltyDiscountPercent}%)`}
                          </span>
                          <span>-{tp('price_egp', { price: loyaltyDiscount })}</span>
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || (paymentMethod === 'instapay' && !receiptUrl)}
                      className="w-full flex items-center justify-center py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-black uppercase border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin text-white" size={20} />
                      ) : paymentMethod === 'instapay' ? (
                        locale === 'ar' ? 'تأكيد الطلب ➔' : 'Confirm Order ➔'
                      ) : (
                        locale === 'ar' ? 'الذهاب للدفع الإلكتروني ➔' : 'Proceed to Pay Online ➔'
                      )}
                    </button>
                  </>
                )}

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
                        const rewardText = locale === 'ar' ? 'خصم ١٥٪ على طلبك القادم!' : '15% OFF next purchase!';
                        const rewardTitle = tc('referral_reward');

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

                {/* REFERRAL LINK SHARING TICKET FOR SIGNED-IN USERS OR SIGN-IN INCENTIVE FOR GUESTS */}
                {user && profile?.referral_code ? (
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
                      <span className="truncate flex-1 text-left">{`fandom-fit.vercel.app/?ref=${profile.referral_code}`}</span>
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/?ref=${profile.referral_code}`;
                          navigator.clipboard.writeText(link);
                          setCopiedCoupon(`link-${profile.referral_code}`);
                          setTimeout(() => setCopiedCoupon(''), 2000);
                        }}
                        className="p-1 border border-black/15 hover:bg-black/5 rounded cursor-pointer transition-colors shrink-0 ml-1.5"
                      >
                        {copiedCoupon === `link-${profile.referral_code}` ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FFFDF9] border-4 border-dashed border-black/40 p-4 rounded-2xl max-w-sm mx-auto relative overflow-hidden space-y-2">
                    <div className="flex justify-center items-center gap-1.5 text-brand-accent">
                      <Gift size={14} className="animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {locale === 'ar' ? 'كافئ نفسك وأصدقائك!' : 'Refer Friends & Save!'}
                      </span>
                    </div>
                    <p className="text-[9.5px] font-semibold text-black/75 leading-relaxed">
                      {locale === 'ar'
                        ? 'إذا قمت بإنشاء حساب أو تسجيل الدخول، ستحصل على رابط إحالة خاص بك لمشاركته مع أصدقائك لكسب كوبونات خصم ١٥٪ لكل طلب مكتمل!'
                        : 'If you sign in or create an account, you will get a personalized referral link to invite friends. You both earn 15% OFF rewards!'}
                    </p>
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
