'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import Image from 'next/image';
import { useState } from 'react';

// SVG Doodle Components for Scrapbook Style
const GameControllerDoodle = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-dark opacity-40">
    <rect x="2" y="6" width="20" height="12" rx="6" />
    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
    <circle cx="16" cy="11" r="1" fill="currentColor" />
    <circle cx="18" cy="13" r="1" fill="currentColor" />
    <path d="M6 12h4M8 10v4" />
  </svg>
);

const FilmStripDoodle = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-accent opacity-30">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 13h4M17 13h4M3 18h4M17 18h4" />
  </svg>
);

const MusicNoteDoodle = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-green opacity-40">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="currentColor" />
    <circle cx="18" cy="16" r="3" fill="currentColor" />
  </svg>
);

const HeartDoodle = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 opacity-40">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const StarDoodle = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-yellow opacity-60">
    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
  </svg>
);

const LightningDoodle = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 opacity-50">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);

export default function Hero() {
  const t = useTranslations('hero');
  const [bannerError, setBannerError] = useState(false);

  // Floating animations configs
  const floatAnimation = (delay: number) => ({
    y: [0, -12, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: "reverse" as const,
      delay: delay,
      ease: "easeInOut" as const
    }
  });

  return (
    <section id="home" className="relative min-h-[95vh] flex items-center pt-28 pb-16 overflow-hidden notebook-grid clip-ripped-bottom border-b-4 border-black">
      {/* Absolute Decorative Grid Elements */}
      <motion.div animate={floatAnimation(0)} className="absolute top-[18%] left-[10%] pointer-events-none hidden sm:block">
        <GameControllerDoodle />
      </motion.div>
      <motion.div animate={floatAnimation(0.5)} className="absolute bottom-[20%] left-[6%] pointer-events-none hidden sm:block">
        <FilmStripDoodle />
      </motion.div>
      <motion.div animate={floatAnimation(1)} className="absolute top-[14%] right-[15%] pointer-events-none hidden sm:block">
        <MusicNoteDoodle />
      </motion.div>
      <motion.div animate={floatAnimation(1.5)} className="absolute top-[45%] left-[15%] pointer-events-none">
        <HeartDoodle />
      </motion.div>
      <motion.div animate={floatAnimation(2)} className="absolute bottom-[15%] right-[10%] pointer-events-none hidden sm:block">
        <StarDoodle />
      </motion.div>
      <motion.div animate={floatAnimation(2.5)} className="absolute top-[60%] right-[22%] pointer-events-none">
        <LightningDoodle />
      </motion.div>

      {/* Decorative Scrapbook Masking Tapes — hidden on mobile to avoid covering headline */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 px-8 py-1.5 masking-tape z-10 select-none hidden sm:block">
        #MADE_IN_EGYPT
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Typography Context */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left rtl:lg:text-right">
            
            {/* Animated Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none text-black select-none">
              <span className="block">{t('title_part1')}</span>
              <span className="font-handwriting block text-brand-accent transform rotate-[-2deg] my-2 select-text">
                {t('title_part2')}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl font-medium text-black/75 max-w-xl leading-relaxed">
              {t('subtitle')}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="#collections"
                className="flex items-center justify-center gap-2 px-8 py-4 text-base font-black uppercase text-white bg-black hover:bg-[#3D405B] border-3 border-black rounded-xl sticker cursor-pointer transition-all duration-200"
              >
                {t('browse_collection')}
                <ArrowRight size={18} />
              </a>

              <a
                href="#showcase"
                className="flex items-center justify-center gap-2 px-8 py-4 text-base font-black uppercase bg-[#F2CC8F] hover:bg-[#F2CC8F]/80 text-black border-3 border-black rounded-xl sticker cursor-pointer transition-all duration-200"
              >
                {t('order_instagram')}
              </a>
            </div>

            {/* Handwritten Tag */}
            <div className="mt-6 font-handwriting text-2xl text-black/60 rotate-[-1deg]">
              ~ Egyptian crafted statement apparel. Ordered directly, delivered to your door.
            </div>
          </div>

          {/* Hero Media Showcase */}
          <div className="lg:col-span-5 flex justify-center relative select-none">
            {/* Overlapping Card / Picture frame style */}
            <motion.div 
              initial={{ rotate: -3 }}
              whileHover={{ rotate: -1, scale: 1.02 }}
              className="relative bg-white border-4 border-black p-4 pb-12 w-[310px] sm:w-[350px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg rotate-[-3deg]"
            >
              {/* Decorative Red pushpin / tape */}
              <div className="absolute -top-3 left-[40%] w-16 h-6 bg-[#E07A5F]/85 border-2 border-black/40 rotate-[15deg] shadow-sm"></div>
              
              <div className="bg-[#EDE0D0] border-3 border-black overflow-hidden relative aspect-[4/5] rounded-md flex items-center justify-center">
                {!bannerError ? (
                  <Image
                    src="/banners/hero_featured.jpg"
                    alt="Featured Fandom Tee"
                    fill
                    sizes="(max-width: 640px) 280px, 320px"
                    priority
                    onError={() => setBannerError(true)}
                    className="object-cover"
                  />
                ) : (
                  // Custom Illustrated visual mockup
                  <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                    <span className="font-handwriting text-5xl text-brand-accent">Fandom Drops</span>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-black/50 mt-2">Streetwear Obsession</span>
                    
                    {/* SVG shirt drawing */}
                    <svg viewBox="0 0 100 100" className="w-32 h-32 mt-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 30 L35 15 L45 22 L55 22 L65 15 L80 30 L72 50 L72 90 L28 90 L28 50 Z" />
                      <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.1" />
                      <text x="50" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">FIT</text>
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                <span className="font-handwriting text-xl text-black">New Season Drop</span>
                <span className="text-xs font-black uppercase px-2 py-0.5 bg-black text-white rounded">Premium</span>
              </div>
            </motion.div>

            {/* Overlapping secondary sticker */}
            <motion.div 
              initial={{ rotate: 12 }}
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="absolute -bottom-4 -left-6 bg-[#81B29A] text-black border-3 border-black px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg font-handwriting text-lg rotate-[12deg] cursor-pointer"
            >
              🎮 100% Egyptian Cotton!
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
