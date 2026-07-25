'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';

export default function InviteFriendsModal() {
  const locale = useLocale();
  
  const { isInviteOpen, setIsInviteOpen, user, profile } = useStore();
  const [copied, setCopied] = useState(false);

  if (!isInviteOpen) return null;

  const host = typeof window !== 'undefined' ? window.location.origin : 'https://fandom-fit.vercel.app';
  const refCode = profile?.referral_code || (user ? `REF-${user.id.replace('u-', '').substring(0, 5).toUpperCase()}` : 'REF-CIRCLE');
  const generatedLink = `${host}/?ref=${refCode}`;

  const handleCopy = () => {
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
                  ? 'شارك رابط الإحالة الخاص بك. عندما يشتري صديقك لأول مرة، ستحصل تلقائياً على كود خصم ١٥٪!' 
                  : 'Share your referral link. When your friend places their first order, you will instantly get a 15% OFF coupon!'}
              </p>
            </div>

            {/* Success generated link screen */}
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
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-grow py-3 bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-black rounded-xl font-black uppercase text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-[1px]"
                >
                  {copied ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!') : (locale === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
