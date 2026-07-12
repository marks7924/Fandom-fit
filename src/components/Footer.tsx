'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import BrandLogo from './BrandLogo';

function FacebookIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const locale = useLocale();


  const currentYear = new Date().getFullYear();

  const socialLinks = {
    instagram: "https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv",
    tiktok: "https://www.tiktok.com/@fandom._.fit?_r=1&_t=ZS-97n8CR3c4or",
    facebook: "https://www.facebook.com/share/1GmUSwSQRE/"
  };

  return (
    <footer id="contact" className="bg-black text-[#EDE0D0] border-t-4 border-black py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Logo & Info column */}
          <div className="flex flex-col gap-4">
            <a href="#home" className="inline-block select-none">
              <BrandLogo color="#EDE0D0" scale={0.6} />
            </a>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE0D0]/60 font-handwriting leading-relaxed max-w-xs">
              {locale === 'ar' 
                ? 'علامة تجارية مصرية تجمع بين حب الفاندوم وثقافة ملابس الشارع الكاجوال.' 
                : 'Combining streetwear elements with the fandoms you cherish. Premium Egyptian apparel.'}
            </p>
          </div>

          {/* Navigation Links Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#EDE0D0]/40 mb-4">
              {locale === 'ar' ? 'الروابط السريعة' : 'QUICK LINKS'}
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="#home" className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors">
                {tn('home')}
              </a>
              <a href="#collections" className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors">
                {tn('collections')}
              </a>
              <a href="#custom-design" className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors">
                {tn('custom_design')}
              </a>
              <a href="#about" className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors">
                {tn('about')}
              </a>
              <a href="#faq" className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors">
                {tn('faq')}
              </a>
            </div>
          </div>

          {/* Social Links Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#EDE0D0]/40 mb-4">
              {locale === 'ar' ? 'تابعنا' : 'SOCIAL MEDIA'}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors flex items-center gap-2"
              >
                <InstagramIcon size={14} />
                Instagram
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.7 4.08 1.1 1.08 2.62 1.62 4.14 1.57v3.96c-1.52.03-3.02-.38-4.28-1.23-.33-.23-.64-.49-.93-.78v7.07c.07 1.95-.69 3.88-2.07 5.25-1.5 1.5-3.64 2.29-5.78 2.1-2.43-.17-4.66-1.56-5.83-3.72-1.3-2.38-1.07-5.46.54-7.59 1.4-1.89 3.73-2.92 6.09-2.73v4.03c-1.22-.1-2.45.31-3.23 1.25-.8.95-.9 2.37-.24 3.42.63 1.05 1.86 1.68 3.09 1.55 1.22-.09 2.22-1.04 2.33-2.26.02-1.21.01-8.58.01-11.8v-7.1z"/>
                </svg>
                TikTok
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors flex items-center gap-2"
              >
                <FacebookIcon size={14} />
                Facebook
              </a>
            </div>
          </div>

          {/* Stamp / Made in Egypt column */}
          <div className="flex flex-col items-start md:items-end">
            <div className="px-5 py-3 border-2 border-dashed border-[#EDE0D0]/30 rounded-xl flex flex-col items-center rotate-[3deg] text-center w-full max-w-[180px]">
              <span className="text-[9px] font-black tracking-widest text-[#EDE0D0]/40 uppercase">AUTHENTIC</span>
              <span className="text-sm font-black text-brand-accent mt-1 uppercase">MADE IN EGYPT</span>
              <span className="text-[10px] font-bold text-[#EDE0D0]/60 font-handwriting mt-0.5">100% Fine Cotton</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#EDE0D0]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EDE0D0]/40">
            {t('copyright', { year: currentYear })}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider text-brand-accent">
            {t('rights')}
          </span>
        </div>

      </div>
    </footer>
  );
}
