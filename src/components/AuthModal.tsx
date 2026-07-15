'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Phone, LogIn, UserPlus, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const EGYPT_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum',
  'Gharbia', 'Ismailia', 'Menofia', 'Minya', 'Qaliubiya', 'New Valley',
  'Suez', 'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 'Damietta',
  'Sharkia', 'South Sinai', 'Kafr El Sheikh', 'Matrouh', 'Luxor',
  'Qena', 'North Sinai', 'Sohag'
];

export default function AuthModal() {
  const locale = useLocale();
  
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signUpUser,
    signInUser,
    signInUserWithGoogle
  } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setPhone('');
    setName('');
    setGovernorate('');
    setCity('');
    setStreet('');
    setIsAddressOpen(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await signInUserWithGoogle();
    setLoading(false);
    if (res.success) {
      setSuccessMsg(locale === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
      setTimeout(() => handleClose(), 1500);
    } else {
      setErrorMsg(res.error || 'Google authentication failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) return;

    if (!isLogin && !name.trim()) {
      setErrorMsg(locale === 'ar' ? 'الاسم مطلوب للتسجيل' : 'Your name is required to register');
      return;
    }

    if (!isLogin && !phone) {
      setErrorMsg(locale === 'ar' ? 'رقم الهاتف مطلوب للتسجيل' : 'Phone number is required for registration');
      return;
    }

    if (!isLogin && !/^01[0-25]\d{8}$/.test(phone.trim())) {
      setErrorMsg(locale === 'ar' ? 'الرجاء إدخال رقم هاتف مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian phone number (e.g. 01012345678)');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const res = await signInUser(email.trim(), password);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(locale === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
        setTimeout(() => handleClose(), 1200);
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } else {
      const address = (governorate || city || street)
        ? { governorate, city, street }
        : undefined;

      const res = await signUpUser(email.trim(), password, phone.trim(), name.trim(), address);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(locale === 'ar' ? 'تم إنشاء الحساب وتسجيل الدخول!' : 'Account created and logged in!');
        setTimeout(() => handleClose(), 1500);
      } else {
        setErrorMsg(res.error || 'Signup failed. Please try again.');
      }
    }
  };

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
          className="relative w-full max-w-md bg-[#EDE0D0] border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 border-2 border-black rounded-lg bg-white hover:bg-black/5 cursor-pointer text-black transition-colors"
          >
            <X size={16} />
          </button>

          {/* Heading */}
          <div className="text-center mb-6">
            <h3 className="text-3xl font-black uppercase text-black">
              {isLogin 
                ? (locale === 'ar' ? 'تسجيل الدخول' : 'Welcome Back')
                : (locale === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')}
            </h3>
            <p className="font-handwriting text-sm text-black/60 mt-1">
              {isLogin 
                ? (locale === 'ar' ? 'ادخل إلى عالم الفاندوم المفضل لديك' : 'Step back into your favorite fandom drop')
                : (locale === 'ar' ? 'انضم إلى عائلتنا للمميزات الحصرية والخصومات' : 'Join the drop circle for rewards & tracking')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-black text-red-600">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-100 border-2 border-green-500 rounded-xl text-xs font-black text-green-700">
                ✓ {successMsg}
              </div>
            )}

            {/* Name Input (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                  {locale === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={locale === 'ar' ? 'مثال: محمد علي' : 'e.g. Mark Hassan'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl text-xs focus:outline-none"
                  />
                  <User className="absolute left-3 top-2.5 text-black/40" size={14} />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. mark@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl text-xs focus:outline-none"
                />
                <Mail className="absolute left-3 top-2.5 text-black/40" size={14} />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                {locale === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl text-xs focus:outline-none"
                />
                <Lock className="absolute left-3 top-2.5 text-black/40" size={14} />
              </div>
            </div>

            {/* Phone Input (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                  {locale === 'ar' ? 'رقم الهاتف (رقم مصري) *' : 'Phone Number (Egyptian) *'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl text-xs focus:outline-none"
                  />
                  <Phone className="absolute left-3 top-2.5 text-black/40" size={14} />
                </div>
                
                {/* Note about phone number lock */}
                <p className="text-[9px] font-extrabold text-brand-accent uppercase mt-2 bg-amber-50 p-2 border border-brand-accent/30 rounded-lg leading-relaxed">
                  {locale === 'ar'
                    ? '⚠️ ملحوظة هامة: يجب إدخال رقم الهاتف بشكل صحيح، ولا يمكن تغييره لاحقاً!'
                    : '⚠️ IMPORTANT: Your phone number CANNOT be changed later!'}
                </p>
              </div>
            )}

            {/* Optional Address (Sign Up Only) - Collapsible */}
            {!isLogin && (
              <div className="border-2 border-black/20 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsAddressOpen(!isAddressOpen)}
                  className="w-full flex items-center justify-between p-3 bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-brand-accent" />
                    <span className="text-[10px] font-black uppercase text-black/70">
                      {locale === 'ar' ? 'عنوان التوصيل (اختياري)' : 'Delivery Address (Optional)'}
                    </span>
                  </div>
                  {isAddressOpen ? <ChevronUp size={14} className="text-black/50" /> : <ChevronDown size={14} className="text-black/50" />}
                </button>

                <AnimatePresence>
                  {isAddressOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-3 space-y-3 bg-white/50"
                    >
                      <p className="text-[9px] font-bold text-black/50 uppercase">
                        {locale === 'ar' ? 'يمكن تعديل العنوان لاحقاً من ملفك الشخصي' : 'You can edit your address later from your profile'}
                      </p>

                      {/* Governorate */}
                      <div>
                        <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                          {locale === 'ar' ? 'المحافظة' : 'Governorate'}
                        </label>
                        <select
                          value={governorate}
                          onChange={(e) => setGovernorate(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-black font-semibold border-2 border-black/30 rounded-xl text-xs focus:outline-none"
                        >
                          <option value="">{locale === 'ar' ? 'اختر المحافظة' : 'Select Governorate'}</option>
                          {EGYPT_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>

                      {/* City */}
                      <div>
                        <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                          {locale === 'ar' ? 'المدينة / الحي' : 'City / District'}
                        </label>
                        <input
                          type="text"
                          placeholder={locale === 'ar' ? 'مثال: مدينة نصر' : 'e.g. Nasr City'}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-black font-semibold border-2 border-black/30 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      {/* Street */}
                      <div>
                        <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                          {locale === 'ar' ? 'العنوان التفصيلي (شارع، مبنى، شقة)' : 'Street Address (Street, Building, Apt)'}
                        </label>
                        <input
                          type="text"
                          placeholder={locale === 'ar' ? 'مثال: ٥ شارع الوحدة، عمارة ٣، شقة ٧' : 'e.g. 5 Wahda St, Bldg 3, Apt 7'}
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-black font-semibold border-2 border-black/30 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-black text-[#EDE0D0] hover:bg-brand-accent hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <span>{locale === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
              ) : (
                <>
                  {isLogin ? <LogIn size={14} /> : <UserPlus size={14} />}
                  <span>
                    {isLogin 
                      ? (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In') 
                      : (locale === 'ar' ? 'إنشاء حساب جديد' : 'Register Now')}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-5 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/15"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-[#EDE0D0] px-2 text-black/50">
                {locale === 'ar' ? 'أو سجل عبر' : 'Or sign in with'}
              </span>
            </div>
          </div>

          {/* Google OAuth button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-white text-black hover:bg-black/5 border-2 border-black rounded-xl font-black uppercase text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
          >
            {/* Google G icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{locale === 'ar' ? 'سجل عبر Google' : 'Google Account'}</span>
          </button>

          {/* Toggle link */}
          <div className="text-center mt-5 text-xs font-bold text-black/75 select-none">
            {isLogin ? (
              <span>
                {locale === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
                <button
                  onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                  className="text-brand-accent hover:underline uppercase font-extrabold cursor-pointer"
                >
                  {locale === 'ar' ? 'سجل الآن' : 'Sign Up'}
                </button>
              </span>
            ) : (
              <span>
                {locale === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                <button
                  onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                  className="text-brand-accent hover:underline uppercase font-extrabold cursor-pointer"
                >
                  {locale === 'ar' ? 'سجل دخولك' : 'Log In'}
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
