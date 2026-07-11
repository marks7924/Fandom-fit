'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { Menu, X, Globe } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  const navItems = [
    { name: t('home'), href: '#home' },
    { name: t('collections'), href: '#collections' },
    { name: t('custom_design'), href: '#custom-design' },
    { name: t('about'), href: '#about' },
    { name: t('faq'), href: '#faq' },
    { name: t('contact'), href: '#contact' },
  ];

  const announcement = useStore((state) => state.announcement);

  return (
    <nav
      className={`fixed ${announcement && !isScrolled ? 'top-10' : 'top-0'} left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#EDE0D0]/95 backdrop-blur-md border-b-3 border-black py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#home" className="flex items-center gap-2">
              {!logoError ? (
                <Image
                  src="/logo/logo.png"
                  alt="Fandom Fit"
                  width={140}
                  height={45}
                  onError={() => setLogoError(true)}
                  className="h-10 w-auto object-contain"
                  priority
                />
              ) : (
                <span className="font-handwriting text-3xl font-bold tracking-tight text-black">
                  Fandom Fit
                </span>
              )}
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 rtl:space-x-reverse">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold tracking-wide uppercase border-b-2 border-transparent hover:border-black py-1 transition-all duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase sticker cursor-pointer"
            >
              <Globe size={14} />
              {t('switch_lang')}
            </button>

            {/* Shop Now CTA */}
            <a
              href="#showcase"
              className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase text-[#EDE0D0] bg-black hover:bg-brand-accent hover:text-white border-2 border-black rounded-lg transition-all duration-300 hover:translate-y-[-2px]"
            >
              {t('order_instagram')}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase sticker cursor-pointer"
            >
              <Globe size={12} />
              {locale === 'en' ? 'AR' : 'EN'}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 border-2 border-black rounded-lg hover:bg-black/5"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#EDE0D0] border-b-3 border-black px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-bold uppercase tracking-wider py-2 border-b border-black/10 text-center"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <a
              href="#showcase"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 py-3 text-sm font-black uppercase text-[#EDE0D0] bg-black hover:bg-brand-accent hover:text-white border-3 border-black rounded-xl transition-all duration-300"
            >
              {t('order_instagram')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
