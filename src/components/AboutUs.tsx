'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function AboutUs() {
  const t = useTranslations('about_section');
  const locale = useLocale();
  const [photoError1, setPhotoError1] = useState(false);
  const [photoError2, setPhotoError2] = useState(false);

  return (
    <section id="about" className="py-24 bg-[#EDE0D0] border-b-4 border-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Story Column */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left rtl:lg:text-right">
            
            {/* Scrapbook Badge */}
            <span className="px-4 py-1.5 bg-[#81B29A] text-black border-2 border-black rounded-lg font-handwriting text-lg rotate-[-2deg] mb-6">
              {t('badge')}
            </span>

            <h2 className="text-5xl font-black uppercase tracking-tight text-black leading-tight">
              {t('title')}
            </h2>

            <p className="mt-6 text-base font-bold text-black/75 leading-relaxed">
              {t('p1')}
            </p>

            <p className="mt-4 text-sm font-semibold text-black/60 leading-relaxed font-handwriting">
              {t('p2')}
            </p>

            {/* Handwritten Quote Block */}
            <div className="mt-8 border-l-4 rtl:border-l-0 rtl:border-r-4 border-brand-accent pl-4 pr-4 font-handwriting text-2xl text-brand-accent italic rotate-[-1deg]">
              {t('quote')}
            </div>
          </div>

          {/* Collage Graphic Column */}
          <div className="lg:col-span-6 flex justify-center relative min-h-[420px] select-none">
            
            {/* Polaroid Photo 1 */}
            <motion.div
              initial={{ rotate: -6 }}
              whileHover={{ rotate: -2, scale: 1.03, zIndex: 30 }}
              className="absolute top-4 left-6 sm:left-12 bg-white border-3 border-black p-3 pb-10 w-[240px] sm:w-[260px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg rotate-[-6deg] z-10"
            >
              {/* Pushpin / Tape */}
              <div className="absolute -top-3 left-[30%] w-12 h-5 bg-[#F2CC8F]/80 border border-black/30 rotate-[25deg]"></div>
              
              <div className="bg-[#EDE0D0] aspect-square border-2 border-black rounded overflow-hidden relative flex items-center justify-center">
                {!photoError1 ? (
                  <Image
                    src="/placeholders/about_1.jpg"
                    alt="Apparel Printing"
                    fill
                    onError={() => setPhotoError1(true)}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-4xl">🇪🇬</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/40 mt-1">Fine Egyptian Fabric</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2.5 left-3 font-handwriting text-sm text-black/70">
                Premium Cotton Grade
              </div>
            </motion.div>

            {/* Polaroid Photo 2 */}
            <motion.div
              initial={{ rotate: 8 }}
              whileHover={{ rotate: 3, scale: 1.03, zIndex: 30 }}
              className="absolute bottom-4 right-6 sm:right-12 bg-white border-3 border-black p-3 pb-10 w-[230px] sm:w-[250px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg rotate-[8deg] z-20"
            >
              {/* Pushpin / Tape */}
              <div className="absolute -top-3 right-[25%] w-14 h-5 bg-[#E07A5F]/85 border border-black/35 rotate-[-15deg]"></div>
              
              <div className="bg-[#EDE0D0] aspect-square border-2 border-black rounded overflow-hidden relative flex items-center justify-center">
                {!photoError2 ? (
                  <Image
                    src="/placeholders/about_2.jpg"
                    alt="Streetwear Fit"
                    fill
                    onError={() => setPhotoError2(true)}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-4xl">🎨</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/40 mt-1">Screen Distressed Prints</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2.5 left-3 font-handwriting text-sm text-black/70">
                Oversized Silhouette
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
