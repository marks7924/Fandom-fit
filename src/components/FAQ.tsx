'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const t = useTranslations('faq_section');
  const locale = useLocale();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqItems = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('q3_ans') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q6'), a: t('a6') }
  ];

  return (
    <section id="faq" className="py-24 bg-[#EDE0D0] border-b-4 border-black relative select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black flex items-center justify-center gap-3">
            <HelpCircle className="text-brand-accent" size={32} />
            {t('title')}
          </h2>
          <p className="mt-4 text-lg font-semibold text-black/70 font-handwriting">
            {t('subtitle')}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            
            return (
              <div
                key={idx}
                className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {/* Header Toggle */}
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left rtl:text-right font-black uppercase text-sm sm:text-base text-black hover:bg-black/[0.02] cursor-pointer"
                >
                  <span className="pr-4">{item.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* Animated Drawer Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-black/10"
                    >
                      <div className="p-5 text-xs sm:text-sm font-semibold text-black/75 leading-relaxed font-handwriting bg-[#EDE0D0]/10">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
