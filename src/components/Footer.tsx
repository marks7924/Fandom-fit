'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Globe, X } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import BrandLogo from './BrandLogo';
import EditableText from './EditableText';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { settings } = useStore();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const socialLinks = {
    instagram: settings.instagram_url || "https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv",
    tiktok: settings.tiktok_url || "https://www.tiktok.com/@fandom._.fit?_r=1&_t=ZS-97n8CR3c4or",
    facebook: settings.facebook_url || "https://www.facebook.com/share/1GmUSwSQRE/"
  };

  const navItems = [
    { key: 'home', defaultEn: 'Home', defaultAr: 'الرئيسية', href: '#home' },
    { key: 'collections', defaultEn: 'Collections', defaultAr: 'التشكيلات', href: '#collections' },
    { key: 'custom_design', defaultEn: 'Custom Design', defaultAr: 'تصميم خاص', href: '#custom-design' },
    { key: 'about', defaultEn: 'About', defaultAr: 'من نحن', href: '#about' },
    { key: 'faq', defaultEn: 'FAQ', defaultAr: 'الأسئلة الشائعة', href: '#faq' },
  ];

  return (
    <footer id="contact" className="bg-black text-[#EDE0D0] border-t-4 border-black py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Logo & Info column */}
          <div className="flex flex-col gap-4">
            <a href="#home" className="inline-block select-none">
              <BrandLogo color="#EDE0D0" textSize={1.6} />
            </a>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE0D0]/60 font-handwriting leading-relaxed max-w-xs">
              <EditableText
                textKey="footer_tagline"
                defaultEn="Combining streetwear elements with the fandoms you cherish. Premium Egyptian apparel."
                defaultAr="علامة تجارية مصرية تجمع بين حب الفاندوم وثقافة ملابس الشارع الكاجوال."
              />
            </p>
          </div>

          {/* Navigation Links Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#EDE0D0]/40 mb-4">
              {locale === 'ar' ? 'الروابط السريعة' : 'QUICK LINKS'}
            </h4>
            <div className="flex flex-col gap-2.5">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-xs font-bold uppercase tracking-wider hover:text-brand-accent transition-colors"
                >
                  <EditableText
                    textKey={`nav_${item.key}`}
                    defaultEn={item.defaultEn}
                    defaultAr={item.defaultAr}
                  />
                </a>
              ))}
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
              <span className="text-[9px] font-black tracking-widest text-[#EDE0D0]/40 uppercase">
                <EditableText textKey="footer_stamp_badge" defaultEn="AUTHENTIC" defaultAr="أصلي" />
              </span>
              <span className="text-sm font-black text-brand-accent mt-1 uppercase">
                <EditableText textKey="footer_stamp_title" defaultEn="MADE IN EGYPT" defaultAr="صنع في مصر" />
              </span>
              <span className="text-[10px] font-bold text-[#EDE0D0]/60 font-handwriting mt-0.5">
                <EditableText textKey="footer_stamp_desc" defaultEn="100% Fine Cotton" defaultAr="قطن مصري ممتاز ١٠٠٪" />
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#EDE0D0]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EDE0D0]/40">
            <EditableText 
              textKey="footer_copyright" 
              defaultEn={`© ${currentYear} Fandom Fit. All rights reserved.`} 
              defaultAr={`© ${currentYear} فاندوم فيت. جميع الحقوق محفوظة.`} 
            />
          </span>
          <button 
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="text-[10px] font-black uppercase tracking-widest text-[#EDE0D0]/45 hover:text-brand-accent transition-colors cursor-pointer border-b border-[#EDE0D0]/20 pb-0.5"
          >
            {locale === 'ar' ? 'الشروط والسياسات' : 'Terms & Policies'}
          </button>
          <span className="text-[9px] font-black uppercase tracking-wider text-brand-accent">
            <EditableText
              textKey="footer_rights"
              defaultEn="Wear What You Love"
              defaultAr="ارتدِ ما تحب"
            />
          </span>
        </div>

      </div>

      {/* Terms & Policies Modal Overlay */}
      <AnimatePresence>
        {isTermsOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsTermsOpen(false)} />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#EDE0D0] border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
                <h3 className="text-lg font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  📜 {locale === 'ar' ? 'الشروط والسياسات' : 'Terms & Policies'}
                </h3>
                <button 
                  onClick={() => setIsTermsOpen(false)}
                  className="p-1 border-2 border-black rounded-lg hover:bg-black/5 cursor-pointer text-black"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Terms Content */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-semibold text-black/80 font-mono leading-relaxed text-left rtl:text-right select-text">
                {(() => {
                  const defaultTermsEn = `FANDOM FIT - TERMS & POLICIES\n\n1. Return & Exchange Policy\n- Returns and exchanges are accepted within 14 days of delivery.\n- Items must be unused, in their original packaging, and with all tags attached.\n- To initiate a return or exchange, contact our customer support team directly via our Instagram handle.\n- Shipping fees for returns and exchanges are paid by the customer unless the product is defective or incorrect.\n\n2. Custom Design Requests Policy\n- Custom apparel is specially made to order based on your inputs.\n- No returns or exchanges are accepted for custom designs unless there is a clear manufacturing defect or a size mismatch caused by our team.\n- Pricing for custom requests is decided after review and is final once accepted and checked out.\n\n3. Payment & Delivery\n- Cash on Delivery (COD) orders require a 50% upfront payment for custom requests.\n- Paymob credit/debit card transactions are processed securely.\n- Standard shipping takes 3-5 business days across Egypt.`;

                  const defaultTermsAr = `فاندوم فيت - الشروط والسياسات\n\n١. سياسة الاسترجاع والاستبدال\n- يُقبل الاسترجاع والاستبدال خلال ١٤ يوماً من تاريخ استلام الطلب.\n- يجب أن تكون المنتجات غير مستخدمة، في تغليفها الأصلي، ومع جميع الملصقات التابعة لها.\n- لبدء عملية الإرجاع أو الاستبدال، يرجى التواصل مع خدمة العملاء عبر حسابنا على إنستغرام.\n- يتحمل العميل مصاريف الشحن للاسترجاع والاستبدال إلا في حالة وجود عيب مصنعي في المنتج.\n\n٢. سياسة طلبات التفصيل الخاصة\n- يتم تصنيع طلبات التفصيل الخاصة بناءً على اختياراتك ومواصفاتك الفردية.\n- لا يُقبل استرجاع أو استبدال منتجات التفصيل الخاصة إلا في حالة وجود عيب مصنعي واضح أو اختلاف في المقاسات ناتج عن فريقنا.\n- يتم تحديد أسعار التصاميم الخاصة بعد مراجعتها وتعتبر نهائية بمجرد الدفع.\n\n٣. الدفع والتوصيل\n- تتطلب طلبات الدفع عند الاستلام (COD) للتفصيل الخاص دفع ٥٠٪ مقدماً.\n- يتم معالجة جميع معاملات بطاقات الائتمان عبر بوابة Paymob بأمان تام.\n- يستغرق التوصيل العادي من ٣ إلى ٥ أيام عمل لجميع المحافظات المصرية.`;

                  const text = (locale === 'ar' ? (settings.terms_ar || defaultTermsAr) : (settings.terms_en || defaultTermsEn)) as string;
                  return text.split('\n').map((line: string, i: number) => {
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    return <p key={i}>{line}</p>;
                  });
                })()}
              </div>

              {/* Footer close button */}
              <div className="mt-4 pt-3 border-t-2 border-dashed border-black/20 flex justify-end">
                <button
                  onClick={() => setIsTermsOpen(false)}
                  className="px-5 py-2 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-[10px] cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-0.5"
                >
                  {locale === 'ar' ? 'إغلاق النافذة' : 'Close Details'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
