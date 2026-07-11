'use client';

import { useTranslations, useLocale } from 'next-intl';
import { MapPin, ShieldCheck, Compass } from 'lucide-react';

export default function Shipping() {
  const t = useTranslations('shipping');
  const locale = useLocale();

  return (
    <section className="py-24 bg-[#EDE0D0] border-b-4 border-black relative overflow-hidden">
      {/* Notebook line effect on this section */}
      <div className="absolute inset-0 notebook-lines opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 select-none">
          
          {/* Left Text Block */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center border-b-3 lg:border-b-0 lg:border-r-3 border-black">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-brand-accent tracking-widest mb-4">
              <MapPin size={16} />
              {locale === 'ar' ? 'تغطية الشحن بالكامل' : 'EGYPT DELIVERY COVERAGE'}
            </span>

            <h2 className="text-4xl font-black uppercase text-black leading-tight">
              {t('title')}
            </h2>

            <p className="mt-4 text-lg font-semibold text-black/75 font-handwriting">
              {t('subtitle')}
            </p>

            <div className="mt-8 space-y-4">
              {/* Point 1 */}
              <div className="flex gap-3">
                <div className="p-2 bg-[#81B29A] text-black border-2 border-black rounded-lg h-fit">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-black">{t('governorates')}</h4>
                  <p className="text-xs font-semibold text-black/50 font-handwriting mt-0.5">
                    {locale === 'ar' ? 'القاهرة، الجيزة، الإسكندرية، محافظات الدلتا، القناة، والصعيد.' : 'Cairo, Giza, Alexandria, Delta governorates, Canal, and Upper Egypt.'}
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex gap-3">
                <div className="p-2 bg-[#F2CC8F] text-black border-2 border-black rounded-lg h-fit">
                  <Compass className="text-black" size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-black">{t('duration')}</h4>
                  <p className="text-xs font-semibold text-black/50 font-handwriting mt-0.5">
                    {locale === 'ar' ? 'نشحن مباشرة لباب منزلك خلال ٣ إلى ٥ أيام عمل.' : 'Shipped direct to your doorstep in 3 to 5 business days.'}
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex gap-3">
                <div className="p-2 bg-[#E07A5F] text-white border-2 border-black rounded-lg h-fit">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-black">{t('packaging')}</h4>
                  <p className="text-xs font-semibold text-black/50 font-handwriting mt-0.5">
                    {locale === 'ar' ? 'تغليف متين ومقاوم للمياه يحمي ملابسك تماماً.' : 'Water-resistant solid boxes protecting your custom apparel.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Blueprint Vector Map Area */}
          <div className="lg:col-span-6 bg-[#3D405B] p-8 sm:p-12 flex items-center justify-center relative">
            {/* Illustrated Blueprint Egypt map */}
            <div className="text-center w-full max-w-sm flex flex-col items-center">
              <svg viewBox="0 0 120 120" className="w-48 h-48 text-[#EDE0D0] opacity-80" fill="none" stroke="currentColor" strokeWidth="1.5">
                {/* Clean Geometric Outline of Egypt */}
                <path d="M15 15 L105 15 L105 95 L90 105 L75 105 L60 95 L40 105 L30 95 L15 80 Z" strokeDasharray="3,3" />
                <path d="M15 15 L105 15 L105 95 L90 105 L75 105 L60 95 L40 105 L30 95 L15 80 Z" />
                {/* River Nile line */}
                <path d="M60 15 L62 25 L65 35 L68 45 L62 55 L58 65 L60 75 L63 85 L65 95 L68 105 L62 115" strokeWidth="2.5" />
                {/* Mappin on Cairo */}
                <circle cx="63" cy="30" r="3.5" fill="#E07A5F" stroke="#000" strokeWidth="1" className="animate-bounce" />
                <text x="63" y="24" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#EDE0D0">CAIRO</text>
                {/* Delta lines */}
                <path d="M60 15 L50 5 M60 15 L70 5" />
                <circle cx="50" cy="5" r="2" fill="#81B29A" />
                <circle cx="70" cy="5" r="2" fill="#81B29A" />
              </svg>
              
              <div className="mt-6 border-2 border-dashed border-[#EDE0D0]/30 p-4 rounded-xl text-center w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F2CC8F] block">
                  {locale === 'ar' ? 'أسعار الشحن:' : 'FLAT SHIPPING RATE'}
                </span>
                <span className="text-xl font-black text-[#EDE0D0] mt-1 block">
                  {locale === 'ar' ? '٥٠ جنيه فقط لجميع المحافظات!' : 'Only 50 EGP Egypt-wide!'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
