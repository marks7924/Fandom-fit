'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { Ticket, Copy, Check } from 'lucide-react';

export default function Offers() {
  const t = useTranslations('offers');
  const locale = useLocale();
  const { offers } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const defaultOffers = [
    {
      id: 'o1',
      title_en: t('promo1_title'),
      title_ar: 'خصم 25% على القطن الفاخر',
      description_en: t('promo1_desc'),
      description_ar: 'احصل على خصم 25% عند الترقية إلى خامة القطن الثقيل الفاخر للقطعة الثانية.',
      code: 'PREMIUM25',
      discount_text_en: '25% OFF',
      discount_text_ar: 'خصم 25%'
    },
    {
      id: 'o2',
      title_en: t('promo2_title'),
      title_ar: 'رشح صديقاً — واحصل على 15% خصم',
      description_en: t('promo2_desc'),
      description_ar: 'منشن صديقاً في رسائلنا. ستحصلان كلاهما على خصم 15% على طباعة الفاندوم التالية.',
      code: 'FRIENDS15',
      discount_text_en: '15% OFF',
      discount_text_ar: 'خصم 15%'
    }
  ];

  const activeOffers = offers.filter(o => o.is_active && o.show_on_homepage);

  if (activeOffers.length === 0) return null;

  return (
    <section className="py-20 bg-[#EDE0D0] border-b-4 border-black relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black flex items-center justify-center gap-3">
            <Ticket className="text-brand-accent animate-pulse" size={32} />
            {t('title')}
          </h2>
          <p className="mt-4 text-lg font-semibold text-black/70 font-handwriting">
            {t('subtitle')}
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {activeOffers.map((offer) => {
            const title = locale === 'ar' ? offer.title_ar : offer.title_en;
            const description = locale === 'ar' ? offer.description_ar : offer.description_en;
            const discount = locale === 'ar' 
              ? ('discount_text_ar' in offer ? offer.discount_text_ar : 'خصم') 
              : ('discount_text_en' in offer ? offer.discount_text_en : 'SALE');

            return (
              <div
                key={offer.id}
                className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01] transition-transform duration-300 ticket-edge flex"
              >
                {/* Left Cutout Badge */}
                <div className="bg-[#E07A5F] text-white border-r-3 border-dashed border-black px-6 flex flex-col justify-center items-center text-center font-black uppercase min-w-[100px]">
                  <span className="text-2xl tracking-tighter leading-none">{discount}</span>
                  <span className="text-[10px] tracking-widest mt-1 block">LOOT</span>
                </div>

                {/* Right Info Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase text-black leading-tight">
                      {title}
                    </h3>
                    <p className="text-xs font-semibold text-black/60 font-handwriting mt-2 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Coupon Copier */}
                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-black bg-[#EDE0D0] px-2.5 py-1 rounded border border-black/20">
                      {t('coupon_code', { code: offer.code })}
                    </span>

                    <button
                      onClick={() => handleCopy(offer.code, offer.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-lg border-2 border-black transition-all cursor-pointer ${
                        copiedId === offer.id
                          ? 'bg-green-600 text-white border-green-700 shadow-none'
                          : 'bg-white text-black hover:bg-black hover:text-[#EDE0D0]'
                      }`}
                    >
                      {copiedId === offer.id ? (
                        <>
                          <Check size={14} />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          {t('copy_code')}
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
