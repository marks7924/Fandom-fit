'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, ChevronRight } from 'lucide-react';

interface ReferralWelcomeBannerProps {
  refCode: string;
}

export default function ReferralWelcomeBanner({ refCode }: ReferralWelcomeBannerProps) {
  const locale = useLocale();
  const [visible, setVisible] = useState(true);
  const [clicked, setClicked] = useState(false);
  const { trackReferralClick } = useStore();

  const handleClaim = async () => {
    if (clicked) return;
    setClicked(true);
    await trackReferralClick(refCode);
    // keep visible for 1.5s to show success state, then dismiss
    setTimeout(() => setVisible(false), 1500);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  const isAr = locale === 'ar';

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
            onClick={handleDismiss}
          />

          {/* Banner Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="fixed inset-0 z-[1001] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="pointer-events-auto w-full max-w-md bg-[#EDE0D0] border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">

              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-brand-accent/20 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-brand-accent/10 rounded-full pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg border-2 border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer z-10"
              >
                <X size={14} />
              </button>

              {/* Header */}
              <div className="bg-black px-8 pt-8 pb-6 text-center relative">
                <div className="flex justify-center mb-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="w-16 h-16 bg-brand-accent rounded-2xl border-3 border-white/30 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  >
                    <Gift size={32} className="text-white" />
                  </motion.div>
                </div>
                <h2 className="text-white font-black text-2xl uppercase tracking-tight leading-tight">
                  {isAr ? '🎉 مرحباً بك في فاندوم فيت!' : '🎉 Welcome to Fandom Fit!'}
                </h2>
                <p className="text-white/60 text-xs font-semibold mt-1">
                  {isAr ? 'وصلت عبر رابط دعوة صديق' : "You arrived via a friend's invite link"}
                </p>
              </div>

              {/* Body */}
              <div className="px-8 py-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-brand-accent" />
                  <p className="text-sm font-black text-black uppercase tracking-wide">
                    {isAr ? 'أنت على بُعد خطوة من عرض خاص!' : "You're one step from a special deal!"}
                  </p>
                  <Sparkles size={16} className="text-brand-accent" />
                </div>

                <p className="text-xs font-semibold text-black/70 leading-relaxed">
                  {isAr
                    ? 'صديقك دعاك للانضمام لمجتمع فاندوم فيت. أتمّ طلبك الأول لتحصل كلاكما على مكافأة خصم ١٥٪!'
                    : 'Your friend invited you to join Fandom Fit! Complete your first order and you both get rewarded with 15% OFF!'}
                </p>

                {/* Reward steps */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 text-left rtl:text-right space-y-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  {[
                    { emoji: '🛍️', en: 'Browse & pick your favorite items', ar: 'تصفح واختر منتجاتك المفضلة' },
                    { emoji: '📦', en: 'Place your first order', ar: 'أتمّ طلبك الأول' },
                    { emoji: '🎁', en: 'Your friend gets 15% OFF instantly!', ar: 'صديقك يحصل على خصم ١٥٪ فوراً!' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-lg">{step.emoji}</span>
                      <span className="text-xs font-bold text-black">{isAr ? step.ar : step.en}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleClaim}
                  disabled={clicked}
                  className={`w-full py-4 rounded-2xl border-3 border-black font-black uppercase text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                    clicked
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-brand-accent text-white hover:bg-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                  }`}
                >
                  {clicked ? (
                    <>✅ {isAr ? 'تم التسجيل! استمتع بتسوقك 🛍️' : "You're in! Happy shopping 🛍️"}</>
                  ) : (
                    <>
                      {isAr ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
                      <ChevronRight size={16} className={isAr ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>

                <p className="text-[9px] font-bold text-black/40 uppercase tracking-wider">
                  {isAr ? 'بالنقر فأنت تؤكد وصولك عبر رابط الدعوة' : 'Clicking confirms your arrival via invite link'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
