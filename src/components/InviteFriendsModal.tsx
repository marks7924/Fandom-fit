'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, HelpCircle } from 'lucide-react';

export default function InviteFriendsModal() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  
  const { isInviteOpen, setIsInviteOpen, settings } = useStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationErr, setValidationErr] = useState('');

  if (!isInviteOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr('');
    setCopied(false);

    const cleanPhone = phoneNumber.trim();
    if (!/^01[0-25]\d{8}$/.test(cleanPhone)) {
      setValidationErr(
        locale === 'ar' 
          ? 'الرجاء إدخال رقم موبايل مصري صحيح (مثال: 01012345678)' 
          : 'Please enter a valid Egyptian mobile number (e.g. 01012345678)'
      );
      return;
    }

    const host = typeof window !== 'undefined' ? window.location.origin : 'https://fandom-fit.vercel.app';
    const link = `${host}/?ref=${cleanPhone}`;
    setGeneratedLink(link);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsInviteOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#EDE0D0] border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 overflow-hidden"
        >
          {/* Header decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-brand-accent"></div>

          {/* Close button */}
          <button
            onClick={() => setIsInviteOpen(false)}
            className="absolute top-4 right-4 p-1 border-2 border-black rounded-lg hover:bg-black/5 cursor-pointer text-black"
          >
            <X size={16} />
          </button>

          {/* Body */}
          <div className="mt-2 space-y-4 text-center">
            <div className="w-14 h-14 bg-brand-accent text-white border-3 border-black rounded-full flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-bounce">
              <Share2 size={24} />
            </div>

            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black">
                {locale === 'ar' ? 'أدع صديقاً واحصل على خصم ١٥٪!' : 'Invite Friends & Get 15% OFF!'}
              </h3>
              <p className="text-xs font-semibold text-black/65 font-handwriting mt-1 leading-relaxed">
                {locale === 'ar' 
                  ? 'شارك رابط الإحالة الخاص بك. عندما يشتري صديقك لأول مرة، ستحصل تلقائياً على كود خصم ١٥٪ مرتبط برقمك!' 
                  : 'Share your referral link. When your friend places their first order, you will instantly get a 15% OFF coupon linked to your phone!'}
              </p>
            </div>

            {/* Input Form */}
            {!generatedLink ? (
              <form onSubmit={handleGenerate} className="space-y-3 pt-2">
                <div className="text-left rtl:text-right">
                  <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                    {locale === 'ar' ? 'أدخل رقم الموبايل الخاص بك' : 'Enter your mobile number'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl focus:outline-none placeholder-zinc-400 font-mono"
                  />
                  {validationErr && (
                    <p className="text-[9px] font-black text-red-500 mt-1">⚠️ {validationErr}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-xs transition-colors cursor-pointer"
                >
                  {locale === 'ar' ? 'إنشاء رابط الإحالة' : 'Generate Referral Link'}
                </button>
              </form>
            ) : (
              /* Success generated link screen */
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left">
                  <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">
                    {locale === 'ar' ? 'رابط الإحالة الخاص بك:' : 'Your personal referral link:'}
                  </span>
                  
                  <div className="flex items-center justify-between bg-[#EDE0D0]/50 border border-black/15 rounded-lg p-2 font-mono text-[10px] font-black text-black">
                    <span className="truncate flex-1 select-all">{generatedLink}</span>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 border border-black/15 hover:bg-black/10 rounded cursor-pointer transition-colors shrink-0 ml-1.5"
                    >
                      {copied ? (
                        <Check size={14} className="text-green-600 font-black" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setGeneratedLink(''); setPhoneNumber(''); }}
                    className="flex-1 py-2 bg-white hover:bg-black/5 text-black border-2 border-black rounded-xl font-black uppercase text-[10px] cursor-pointer"
                  >
                    {locale === 'ar' ? 'تعديل الرقم' : 'Change Number'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-black rounded-xl font-black uppercase text-[10px] cursor-pointer"
                  >
                    {copied ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!') : (locale === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
