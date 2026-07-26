'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, getFabricPremium } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import ProductQuickPreview from '@/components/ProductQuickPreview';
import CartDrawer from '@/components/CartDrawer';
import { 
  Trophy, Copy, Check, LogOut, Settings, Package, Lock, 
  Mail, Phone, User, MapPin, Eye, EyeOff, ShoppingBag, 
  ArrowRight, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountPage() {
  const t = useTranslations('checkout'); // Reuse translations where possible
  const locale = useLocale();
  
  // Zustand Store hooks
  const { 
    user, 
    profile, 
    products,
    orders,
    settings,
    fetchInitialData,
    syncUserProfile,
    signUpUser, 
    signInUser, 
    signInUserWithGoogle,
    signOutUser, 
    updateProfile, 
    fetchOrdersByPhone,
    fetchAccountOrders,
    toggleFavorite,
    setPreviewProduct,
    isLoading
  } = useStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication mode states
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guest lookup state
  const [guestPhone, setGuestPhone] = useState('');
  const [guestOrders, setGuestOrders] = useState<any[]>([]);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [guestSearched, setGuestSearched] = useState(false);

  // Logged-in profile editing states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [addrGovernorate, setAddrGovernorate] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Orders list state
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Address lookup options
  const governorates = [
    { en: 'Cairo', ar: 'القاهرة' },
    { en: 'Giza', ar: 'الجيزة' },
    { en: 'Alexandria', ar: 'الإسكندرية' },
    { en: 'Qalyubia', ar: 'القليوبية' },
    { en: 'Gharbia', ar: 'الغربية' },
    { en: 'Dakahlia', ar: 'الدقهلية' },
    { en: 'Sharqia', ar: 'الشرقية' },
    { en: 'Monufia', ar: 'المنوفية' },
    { en: 'Beheira', ar: 'البحيرة' },
    { en: 'Damietta', ar: 'دمياط' },
    { en: 'Port Said', ar: 'بورسعيد' },
    { en: 'Ismailia', ar: 'الإسماعيلية' },
    { en: 'Suez', ar: 'السويس' },
    { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
    { en: 'Fayoum', ar: 'الفيوم' },
    { en: 'Beni Suef', ar: 'بني سويف' },
    { en: 'Minya', ar: 'المنيا' },
    { en: 'Assiut', ar: 'أسيوط' },
    { en: 'Sohag', ar: 'سوهاج' },
    { en: 'Qena', ar: 'قنا' },
    { en: 'Luxor', ar: 'الأقصر' },
    { en: 'Aswan', ar: 'أسوان' },
    { en: 'Red Sea', ar: 'البحر الأحمر' },
    { en: 'New Valley', ar: 'الوادي الجديد' },
    { en: 'Matrouh', ar: 'مطروح' },
    { en: 'North Sinai', ar: 'شمال سيناء' },
    { en: 'South Sinai', ar: 'جنوب سيناء' }
  ];

  // Initial load to restore session
  useEffect(() => {
    fetchInitialData().then(() => {
      syncUserProfile();
    });
  }, [fetchInitialData, syncUserProfile]);

  // Fetch logged in orders
  useEffect(() => {
    if (user) {
      setIsLoadingOrders(true);
      fetchAccountOrders(user.id, profile?.phone || undefined).then(fetched => {
        setUserOrders(fetched || []);
        setIsLoadingOrders(false);
      });
      // Populate fields
      if (profile) {
        setEditName(profile.full_name || '');
        setEditPhone(profile.phone || '');
        const ad = profile.address_data || {};
        setAddrGovernorate(ad.governorate || '');
        setAddrCity(ad.city || '');
        setAddrStreet(ad.street || '');
      }
    } else {
      setUserOrders([]);
    }
  }, [user, profile, fetchAccountOrders]);

  if (!mounted || isLoading) {
    return <LoadingScreen />;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const res = await signInUser(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Invalid credentials');
        }
      } else if (authMode === 'signup') {
        if (!/^01[0-25]\d{8}$/.test(phone.trim())) {
          setAuthError(locale === 'ar' ? 'الرجاء إدخال رقم موبايل مصري صحيح' : 'Invalid Egyptian phone number');
          setIsSubmitting(false);
          return;
        }
        const res = await signUpUser(email, password, phone, name);
        if (!res.success) {
          setAuthError(res.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      const res = await signInUserWithGoogle();
      if (!res.success) {
        setAuthError(res.error || 'Google Login failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsGuestLoading(true);
    setGuestSearched(false);

    if (!/^01[0-25]\d{8}$/.test(guestPhone.trim())) {
      setAuthError(locale === 'ar' ? 'الرجاء إدخال رقم موبايل مصري صحيح' : 'Invalid Egyptian phone number');
      setIsGuestLoading(false);
      return;
    }

    try {
      const fetched = await fetchOrdersByPhone(guestPhone.trim());
      setGuestOrders(fetched || []);
      setGuestSearched(true);
      // Save guest phone locally so live chat widget can automatically pick it up
      if (typeof window !== 'undefined') {
        localStorage.setItem('ff_chat_phone', guestPhone.trim());
      }
    } catch (err) {
      setAuthError('Failed to retrieve orders');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccess(false);

    if (!/^01[0-25]\d{8}$/.test(editPhone.trim())) {
      alert(locale === 'ar' ? 'الرجاء إدخال رقم موبايل مصري صحيح' : 'Invalid Egyptian phone number');
      setIsSavingProfile(false);
      return;
    }

    try {
      const address_data = {
        governorate: addrGovernorate,
        city: addrCity,
        street: addrStreet
      };
      await updateProfile({
        full_name: editName,
        phone: editPhone.trim(),
        address_data
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const activeProfile = profile || {
    loyalty_points: 0,
    referral_code: user ? `REF-${user.id.replace('u-', '').substring(0, 5).toUpperCase()}` : '',
    phone: ''
  };

  const loyaltyThreshold = Number(settings.loyalty_orders_threshold || 5);
  const loyaltyDiscountPercent = Number(settings.loyalty_discount_percent || 20);
  const userPoints = activeProfile.loyalty_points || 0;
  const isRewardUnlocked = userPoints >= loyaltyThreshold;

  // Referral Calculations
  const host = typeof window !== 'undefined' ? window.location.origin : 'https://fandom-fit.vercel.app';
  const referralLink = `${host}/?ref=${activeProfile.referral_code}`;

  // Resolve favorite items from user profile
  const favoriteProducts = products.filter(p => profile?.favorites?.includes(p.id));

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'processing':
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE0D0] flex flex-col font-sans text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-28 pb-12 select-none">
        <AnimatePresence mode="wait">
          {!user ? (
            /* ================= GUEST / AUTH ENTRIES ================= */
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden my-8"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-brand-accent"></div>

              {/* Title Tabs */}
              <div className="flex border-b-2 border-black mb-6">
                <button
                  onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-colors ${authMode === 'signin' ? 'bg-black text-[#EDE0D0]' : 'hover:bg-black/5 text-black'}`}
                >
                  {locale === 'ar' ? 'دخول الأعضاء' : 'Sign In'}
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-colors ${authMode === 'signup' ? 'bg-black text-[#EDE0D0]' : 'hover:bg-black/5 text-black'}`}
                >
                  {locale === 'ar' ? 'عضوية جديدة' : 'Sign Up'}
                </button>
                <button
                  onClick={() => { setAuthMode('guest'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-colors ${authMode === 'guest' ? 'bg-black text-[#EDE0D0]' : 'hover:bg-black/5 text-black'}`}
                >
                  {locale === 'ar' ? 'تتبع الزوار' : 'Guest Orders'}
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                  <span>⚠️</span> {authError}
                </div>
              )}

              {/* AUTH MODES FORMS */}
              {authMode === 'signin' && (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                      {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                        placeholder="yourname@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                      {locale === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer mt-2 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
                    <ArrowRight size={14} />
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-black/10"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-black uppercase text-black/45">
                      {locale === 'ar' ? 'أو' : 'Or'}
                    </span>
                    <div className="flex-grow border-t border-black/10"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white hover:bg-black/5 text-black border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
                  >
                    <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.7 14.93 1 12 1 7.37 1 3.4 3.66 1.48 7.55l3.8 2.95C6.18 7.15 8.87 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.45 12.3c0-.82-.07-1.6-.22-2.3H12v4.4h6.42c-.28 1.47-1.12 2.7-2.38 3.54l3.7 2.87c2.16-2 3.4-4.94 3.4-8.5z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.5c-.23-.68-.36-1.42-.36-2.18s.13-1.5.36-2.18l-3.8-2.95C.52 9.07 0 10.48 0 12s.52 2.93 1.48 4.82l3.8-2.95z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.13 0-5.82-2.11-6.77-5.07l-3.8 2.95C3.4 20.34 7.37 23 12 23z"
                      />
                    </svg>
                    {locale === 'ar' ? 'متابعة باستخدام Google' : 'Google Account'}
                  </button>
                </form>
              )}

              {authMode === 'signup' && (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                      {locale === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                        placeholder="Ahmed Ali"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                      {locale === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                        placeholder="ahmed@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                      {locale === 'ar' ? 'رقم موبايل مصري *' : 'Egyptian Mobile Number *'}
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                        placeholder="e.g. 01012345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                      {locale === 'ar' ? 'كلمة المرور *' : 'Create Password *'}
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer mt-2 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (locale === 'ar' ? 'جاري إنشاء الحساب...' : 'Signing Up...') : (locale === 'ar' ? 'تسجيل كعضو' : 'Register Account')}
                    <ShieldCheck size={15} />
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-black/10"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-black uppercase text-black/45">
                      {locale === 'ar' ? 'أو' : 'Or'}
                    </span>
                    <div className="flex-grow border-t border-black/10"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white hover:bg-black/5 text-black border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
                  >
                    <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.7 14.93 1 12 1 7.37 1 3.4 3.66 1.48 7.55l3.8 2.95C6.18 7.15 8.87 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.45 12.3c0-.82-.07-1.6-.22-2.3H12v4.4h6.42c-.28 1.47-1.12 2.7-2.38 3.54l3.7 2.87c2.16-2 3.4-4.94 3.4-8.5z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.5c-.23-.68-.36-1.42-.36-2.18s.13-1.5.36-2.18l-3.8-2.95C.52 9.07 0 10.48 0 12s.52 2.93 1.48 4.82l3.8-2.95z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.13 0-5.82-2.11-6.77-5.07l-3.8 2.95C3.4 20.34 7.37 23 12 23z"
                      />
                    </svg>
                    {locale === 'ar' ? 'متابعة باستخدام Google' : 'Google Account'}
                  </button>
                </form>
              )}

              {authMode === 'guest' && (
                <div className="space-y-6">
                  <form onSubmit={handleGuestLookup} className="space-y-4">
                    <div>
                      <p className="text-[11px] text-black/60 font-semibold mb-3 leading-relaxed">
                        {locale === 'ar' 
                          ? 'زوار الموقع الذين قاموا بعمليات شراء أو طلبات تفصيل مسبقة بدون حساب، يمكنهم استعراض تفاصيل طلباتهم بسهولة عبر إدخال رقم الهاتف.'
                          : 'Guests who ordered or submitted design requests without logging in can retrieve their order logs and track statuses using their phone number.'}
                      </p>
                      <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                        {locale === 'ar' ? 'رقم موبايل مصري *' : 'Egyptian Mobile Number *'}
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                          placeholder="e.g. 01012345678"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGuestLoading}
                      className="w-full py-3 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
                    >
                      {isGuestLoading ? (locale === 'ar' ? 'جاري البحث...' : 'Searching...') : (locale === 'ar' ? 'بحث عن الطلبات' : 'Retrieve Orders')}
                      <Package size={15} />
                    </button>
                  </form>

                  {/* Guest Lookup Results */}
                  {guestSearched && (
                    <div className="border-t-2 border-black/10 pt-4 mt-4 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-tight text-black flex items-center gap-1.5">
                        <ShoppingBag size={14} />
                        {locale === 'ar' ? 'نتائج الطلبات العثور عليها' : 'Found Guest Orders'} ({guestOrders.length})
                      </h4>

                      {guestOrders.length === 0 ? (
                        <p className="text-[10px] font-bold text-red-500 text-center py-2">
                          {locale === 'ar' ? '⚠️ لم يتم العثور على أي طلبات مرتبطة بهذا الرقم.' : '⚠️ No orders found matching this phone number.'}
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                          {guestOrders.map((o: any) => (
                            <div key={o.id} className="p-3 bg-[#EDE0D0]/20 border border-black/15 rounded-xl text-left select-text">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-black uppercase text-black/50">ID: {o.id.toUpperCase()}</span>
                                <span className={`text-[8px] font-black px-2 py-0.5 border border-black/10 rounded-full uppercase ${getStatusBadgeColor(o.status)}`}>
                                  {o.status}
                                </span>
                              </div>
                              <p className="text-[10px] font-black text-black mt-1.5 truncate">
                                {o.items.map((i: any) => i.product?.name_en || i.product_name).join(', ')}
                              </p>
                              <div className="flex items-center justify-between text-[9px] font-extrabold text-black/60 mt-1">
                                <span>{new Date(o.created_at).toLocaleDateString()}</span>
                                <span className="text-black font-black">{o.price} EGP</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            /* ================= LOGGED IN INTERFACE ================= */
            <motion.div
              key="account-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header profile greeting bar */}
              <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-brand-accent"></div>
                <div className="flex items-center gap-4 text-center md:text-left rtl:md:text-right">
                  <div className="w-16 h-16 bg-brand-accent border-3 border-black rounded-full flex items-center justify-center text-white text-3xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] select-none">
                    {editName ? editName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black">
                      {locale === 'ar' ? 'مرحباً، ' : 'Welcome back, '}
                      <span className="text-brand-accent font-black">{editName || 'Fandom Fit Member'}</span>
                    </h2>
                    <p className="text-[10px] font-black text-black/55 uppercase mt-0.5 tracking-wider font-mono">
                      {email} {editPhone && `| ${editPhone}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => signOutUser()}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={14} />
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                </button>
              </div>

              {/* Main Contents Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Loyalty & Referral Progress (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Loyalty Points Progress */}
                  <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative">
                    <h3 className="text-base font-black uppercase tracking-tight text-black border-b-2 border-black/10 pb-2 mb-4 flex items-center gap-2">
                      <Trophy className="text-amber-500" size={20} />
                      {locale === 'ar' ? 'دائرة المكافآت والولاء' : 'Loyalty Circle'}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[10px] font-black text-black/50 uppercase block">
                            {locale === 'ar' ? 'مستواك الحالي' : 'Current Member Tier'}
                          </span>
                          <span className="text-lg font-black text-black uppercase">
                            {userPoints >= 10 ? '👑 Platinum' : userPoints >= 5 ? '⭐ Gold' : '💎 Silver'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-brand-accent">{userPoints}</span>
                          <span className="text-xs font-black text-black/60"> / {loyaltyThreshold}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#EDE0D0] border-2 border-black rounded-full h-5 overflow-hidden p-0.5">
                        <div 
                          className="bg-brand-accent h-full rounded-full border-r border-black/30 transition-all duration-500 shadow-[inset_-2px_0px_2px_rgba(0,0,0,0.2)]"
                          style={{ width: `${Math.min(100, (userPoints / loyaltyThreshold) * 100)}%` }}
                        ></div>
                      </div>

                      {isRewardUnlocked ? (
                        <div className="p-3 bg-amber-100 border-2 border-amber-400 rounded-xl text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2">
                          <span className="text-[10px] font-black uppercase text-amber-800 block">
                            {locale === 'ar' ? 'تهانينا! لقد حصلت على خصمك' : 'Congratulations! Reward Unlocked'}
                          </span>
                          <p className="text-xs font-black text-black mt-1">
                            {locale === 'ar' 
                              ? `لقد تأهلت للحصول على خصم ${loyaltyDiscountPercent}٪ على طلبك القادم تلقائياً!` 
                              : `You will get ${loyaltyDiscountPercent}% OFF your next order automatically at checkout!`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-black/55 leading-relaxed">
                          {locale === 'ar'
                            ? `كل طلب مكتمل يضيف نقطة واحدة لدائرتك. اكمل ${loyaltyThreshold - userPoints} طلبات إضافية للحصول على كود خصم ${loyaltyDiscountPercent}٪.`
                            : `Earn 1 point per completed order. Complete ${loyaltyThreshold - userPoints} more orders to receive a auto-applied ${loyaltyDiscountPercent}% OFF coupon.`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Referral Link Generator */}
                  <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-base font-black uppercase tracking-tight text-black border-b-2 border-black/10 pb-2 mb-4 flex items-center gap-2">
                      <User className="text-blue-500" size={20} />
                      {locale === 'ar' ? 'دعوة الأصدقاء' : 'Invite Friends'}
                    </h3>

                    <div className="space-y-4 text-left">
                      <p className="text-[10px] font-semibold text-black/60 leading-relaxed">
                        {locale === 'ar'
                          ? 'شارك رابط الإحالة مع أصدقائك. عندما يقوم صديق بأول عملية شراء مستخدماً الرابط، ستحصل أنت فوراً على كود خصم ١٥٪!'
                          : 'Share your referral code. When a friend places their first order using your referral link, you instantly get a 15% OFF discount code!'}
                      </p>

                      <div className="p-3 bg-[#EDE0D0]/40 border-2 border-black/10 rounded-2xl">
                        <span className="text-[9px] font-black text-black/50 uppercase block mb-1">
                          {locale === 'ar' ? 'رابط الإحالة الخاص بك:' : 'Your unique referral link:'}
                        </span>

                        <div className="flex items-center justify-between bg-white border border-black/20 rounded-xl p-2.5 font-mono text-[9px] font-black text-black">
                          <span className="truncate flex-1 select-all">{referralLink}</span>
                          <button
                            onClick={handleCopyReferral}
                            className="p-1 border border-black/20 hover:bg-black/5 rounded cursor-pointer transition-colors ml-2"
                          >
                            {copiedCode ? (
                              <Check size={14} className="text-green-600 font-black" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/10 space-y-3">
                        <span className="text-[10px] font-black text-black/50 uppercase block">
                          {locale === 'ar' ? 'مؤشر تقدم المكافأة (٥ زيارات أو ١ طلب مكتمل):' : 'Referral Reward Progress (5 clicks OR 1 order):'}
                        </span>

                        {/* Progress visual metrics */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-[#EDE0D0]/30 border border-black rounded-xl p-2">
                            <span className="text-sm font-black text-brand-accent block">
                              {activeProfile.referral_clicks || 0} / 5
                            </span>
                            <span className="text-[8px] font-bold text-black/60 uppercase block mt-0.5">
                              {locale === 'ar' ? 'زيارات الرابط' : 'Clicks (Entries)'}
                            </span>
                          </div>
                          
                          <div className="bg-[#EDE0D0]/30 border border-black rounded-xl p-2">
                            <span className="text-sm font-black text-brand-accent block">
                              {activeProfile.referral_orders || 0} / 1
                            </span>
                            <span className="text-[8px] font-bold text-black/60 uppercase block mt-0.5">
                              {locale === 'ar' ? 'طلبات مكتملة' : 'Referred Orders'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar (clicks) */}
                        <div>
                          <div className="flex justify-between text-[8px] font-black text-black/50 uppercase mb-1">
                            <span>{locale === 'ar' ? 'هدف الزيارات (٥ زيارات)' : 'Clicks Target (5 Clicks)'}</span>
                            <span>{Math.round(Math.min(100, ((activeProfile.referral_clicks || 0) / 5) * 100))}%</span>
                          </div>
                          <div className="w-full bg-[#EDE0D0] border border-black rounded-full h-3 overflow-hidden p-0.5">
                            <div 
                              className="bg-brand-accent h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, ((activeProfile.referral_clicks || 0) / 5) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Unlocked banner if either is achieved */}
                        {((activeProfile.referral_clicks || 0) >= 5 || (activeProfile.referral_orders || 0) >= 1) ? (
                          <div className="p-2 bg-green-50 border border-green-500 rounded-xl text-center text-[9px] font-black text-green-800 animate-pulse">
                            🎉 {locale === 'ar' ? 'تم فتح المكافأة! تفقد قائمة كوبونات الهاتف عند الدفع.' : 'Goal met! 15% OFF reward coupon bound to your phone number!'}
                          </div>
                        ) : (
                          <p className="text-[8px] font-extrabold text-[#E07A5F] leading-tight text-center">
                            {locale === 'ar' ? '💡 احصل على ٥ زيارات أو طلب صديق واحد لتفعيل الخصم الخاص بك!' : '💡 Unlock 15% off once you hit 5 link clicks OR 1 referred purchase!'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* My Favorites Section */}
                  <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-base font-black uppercase tracking-tight text-black border-b-2 border-black/10 pb-2 mb-4 flex items-center gap-2">
                      <span className="text-red-500 text-lg">❤️</span>
                      {locale === 'ar' ? 'منتجاتي المفضلة' : 'My Favorites'}
                    </h3>

                    {favoriteProducts.length === 0 ? (
                      <div className="text-center py-6">
                        <span className="text-2xl opacity-60">💔</span>
                        <p className="text-[10px] font-black text-black/55 mt-2 leading-relaxed">
                          {locale === 'ar' 
                            ? 'لم تقم بإضافة أي منتجات للمفضلة بعد! ابدأ بالتصفح وإضافتها.' 
                            : 'No favorite items yet! Start exploring the shop to fill this space.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                        {favoriteProducts.map((p) => {
                          const name = locale === 'ar' ? p.name_ar : p.name_en;
                          const defaultPlaceholder = p.category_id === '4' ? '/placeholders/manga_front.jpg' : '/placeholders/arcade_front.jpg';
                          const image = (p.images && p.images.length > 0) ? p.images[0] : defaultPlaceholder;
                          
                          return (
                            <div key={p.id} className="flex items-center gap-3 p-2 bg-[#EDE0D0]/20 border-2 border-black rounded-2xl">
                              <div className="relative w-12 h-12 bg-white border border-black rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                <img src={image} alt={name} className="w-full h-full object-contain p-0.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-black truncate uppercase">{name}</h4>
                                <span className="text-[10px] font-mono font-black text-brand-accent mt-0.5 block">{p.price} EGP</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => setPreviewProduct(p)}
                                  className="px-2.5 py-1 bg-black hover:bg-brand-accent text-white text-[9px] font-black uppercase rounded-lg border border-black transition-colors cursor-pointer"
                                >
                                  {locale === 'ar' ? 'عرض' : 'View'}
                                </button>
                                <button
                                  onClick={() => toggleFavorite(p.id)}
                                  className="p-1 hover:bg-black/5 rounded-lg border border-black/10 transition-colors text-red-500 cursor-pointer"
                                  title={locale === 'ar' ? 'حذف من المفضلة' : 'Remove'}
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: Profile Settings & Order History (7 cols) */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Order History */}
                  <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-base font-black uppercase tracking-tight text-black border-b-2 border-black/10 pb-2 mb-4 flex items-center gap-2">
                      <Package className="text-brand-accent" size={20} />
                      {locale === 'ar' ? 'سجل طلباتك' : 'Order History'}
                    </h3>

                    {isLoadingOrders ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-4xl">🛍️</span>
                        <p className="text-xs font-black text-black/55 mt-2">
                          {locale === 'ar' ? 'لا يوجد طلبات سابقة مسجلة في هذا الحساب بعد.' : 'No orders recorded in this account yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {userOrders.map((o: any) => (
                          <div key={o.id} className="border-3 border-black bg-[#EDE0D0]/10 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white transition-colors">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[10px] font-black text-black/40 block uppercase font-mono">
                                  ID: {o.id.substring(0, 8).toUpperCase()}
                                </span>
                                <span className="text-[9px] font-bold text-black/60">
                                  {new Date(o.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <span className={`text-[9px] font-black px-2.5 py-0.5 border-2 border-black/15 rounded-full uppercase ${getStatusBadgeColor(o.status)}`}>
                                {o.status}
                              </span>
                            </div>

                            {/* Items List */}
                            <div className="border-y border-black/10 py-2.5">
                              {o.items && o.items.map((i: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] font-bold text-black mb-1 last:mb-0">
                                  <span className="truncate flex-1">
                                    {i.product?.name_en || i.product_name} <span className="text-[9px] font-black text-zinc-400">({i.size} - {i.fabric})</span>
                                  </span>
                                  <span className="shrink-0 font-mono ml-4 text-black/70">
                                    x{i.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center text-xs font-black">
                              <span className="text-black/60">{locale === 'ar' ? 'الإجمالي الكلي:' : 'Total Amount:'}</span>
                              <span className="text-brand-accent text-sm font-black">{o.price} EGP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile Edit Settings */}
                  <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-base font-black uppercase tracking-tight text-black border-b-2 border-black/10 pb-2 mb-4 flex items-center gap-2">
                      <Settings className="text-zinc-600" size={20} />
                      {locale === 'ar' ? 'تعديل بيانات الحساب' : 'Edit Profile Details'}
                    </h3>

                    {saveSuccess && (
                      <div className="p-3 bg-green-100 border-2 border-green-400 text-green-700 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                        <span>✅</span> {locale === 'ar' ? 'تم تحديث البيانات بنجاح!' : 'Profile updated successfully!'}
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                            {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                          </label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                            {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                          </label>
                          <input
                            type="tel"
                            required
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Address Data Sub-form */}
                      <div className="border-t border-black/10 pt-4 mt-2">
                        <h4 className="text-xs font-black uppercase text-black/50 mb-3 flex items-center gap-1">
                          <MapPin size={13} />
                          {locale === 'ar' ? 'العنوان الافتراضي للتوصيل' : 'Default Delivery Address'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                              {locale === 'ar' ? 'المحافظة' : 'Governorate'}
                            </label>
                            <select
                              value={addrGovernorate}
                              onChange={(e) => setAddrGovernorate(e.target.value)}
                              className="w-full px-3 py-2 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                            >
                              <option value="">{locale === 'ar' ? '-- اختر المحافظة --' : '-- Select Governorate --'}</option>
                              {governorates.map((gov, i) => (
                                <option key={i} value={gov.en}>{locale === 'ar' ? gov.ar : gov.en}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                              {locale === 'ar' ? 'المدينة / المنطقة' : 'City / Area'}
                            </label>
                            <input
                              type="text"
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              className="w-full px-3 py-2 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                              placeholder="e.g. Nasr City"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                            {locale === 'ar' ? 'اسم الشارع / رقم العقار والمنزل' : 'Street Name / Building & Floor'}
                          </label>
                          <input
                            type="text"
                            value={addrStreet}
                            onChange={(e) => setAddrStreet(e.target.value)}
                            className="w-full px-3 py-2 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                            placeholder="e.g. 15 El-Tahrir St, 3rd Floor, Appt 5"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full py-2.5 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer mt-2"
                      >
                        {isSavingProfile ? (locale === 'ar' ? 'جاري حفظ التعديلات...' : 'Saving Changes...') : (locale === 'ar' ? 'حفظ البيانات والتعديلات' : 'Save Details')}
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      {/* Quick Preview overlay */}
      <ProductQuickPreview />
      {/* Cart Drawer overlay */}
      <CartDrawer />
    </div>
  );
}
