'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, getFabricPremium } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Share2, ClipboardCheck, Tag } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import SizeChartModal from './SizeChartModal';

export default function ProductQuickPreview() {
  const t = useTranslations('product_detail');
  const tp = useTranslations('products');
  const locale = useLocale();
  
  const { previewProduct, setPreviewProduct, setCheckoutProduct, getProductEffectivePrice, addToCart } = useStore();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('Standard Cotton');
  const [shareCopied, setShareCopied] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewProduct(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPreviewProduct]);

  // Lock background scroll when open
  useEffect(() => {
    if (previewProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [previewProduct]);

  if (!previewProduct) return null;

  const name = locale === 'ar' ? previewProduct.name_ar : previewProduct.name_en;
  const description = locale === 'ar' ? previewProduct.description_ar : previewProduct.description_en;
  const { hasDiscount, originalPrice, discountedPrice } = getProductEffectivePrice(previewProduct);
  const premium = getFabricPremium(selectedFabric);

  const defaultPlaceholder = 
    previewProduct.category_id === '4' ? '/placeholders/manga_front.jpg' : 
    '/placeholders/arcade_front.jpg';
    
  const images = (previewProduct.images && previewProduct.images.length > 0) 
    ? previewProduct.images 
    : [defaultPlaceholder];

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/${locale}/products/${previewProduct.slug}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const getInstagramDMUrl = () => {
    const fabricText = locale === 'ar' 
      ? (selectedFabric === 'Standard Cotton' ? 'قطن مصري قياسي' : 'قطن ثقيل فاخر')
      : selectedFabric;
    const text = encodeURIComponent(
      t('instagram_dm_text', { name, size: selectedSize, fabric: fabricText })
    );
    return `https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv&text=${text}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPreviewProduct(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: locale === 'ar' ? '-100%' : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: locale === 'ar' ? '-100%' : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl h-full bg-[#EDE0D0] border-l-4 rtl:border-l-0 rtl:border-r-4 border-black shadow-2xl flex flex-col justify-between overflow-y-auto"
        >
          
          {/* Main Content scrollable area */}
          <div className="p-6 sm:p-8">
            
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-handwriting text-2xl text-black/60 rotate-[-1deg]">
                #FANDOM_FIT_PREVIEW
              </span>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-2 border-3 border-black bg-white rounded-xl hover:bg-black hover:text-[#EDE0D0] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Images block */}
              <div>
                <div className="relative aspect-square border-3 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Image
                    src={images[activeImageIdx] || defaultPlaceholder}
                    alt={name}
                    fill
                    sizes="400px"
                    className={`object-contain p-3 ${!previewProduct.is_in_stock ? 'blur-[3px] opacity-60' : ''}`}
                  />
                  {!previewProduct.is_in_stock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 select-none pointer-events-none">
                      <span className="px-4 py-2 border-3 border-black bg-zinc-900 text-[#EDE0D0] text-xs font-black uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]">
                        {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails list */}
                {images.length > 1 && (
                  <div className="flex gap-2.5 mt-3.5">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative w-16 h-16 border-2 border-black rounded-lg overflow-hidden transition-all ${
                          activeImageIdx === idx 
                            ? 'ring-2 ring-brand-accent scale-95 shadow-sm' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image src={img} alt={`thumb-${idx}`} fill className="object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text metadata block */}
              <div className="flex flex-col justify-between">
                <div>
                  
                  {/* Badge & Title */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-black tracking-widest bg-black text-[#EDE0D0] px-2 py-0.5 rounded-full uppercase border border-white/20">
                      {tp('unisex')}
                    </span>
                    {hasDiscount && (
                      <span className="text-[9px] font-black tracking-wider uppercase bg-brand-accent text-white px-2.5 py-0.5 rounded-full border-2 border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                        <span>🔥</span>
                        {locale === 'ar' ? `خصم ${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}٪` : `${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF`}
                      </span>
                    )}
                  </div>

                  <h3 className="text-3xl font-black uppercase text-black mt-2 leading-tight">
                    {name}
                  </h3>

                  {/* Custom Tags */}
                  {previewProduct.tags && previewProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pointer-events-none">
                      {previewProduct.tags.map((tag, i) => (
                        <span key={i} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/5 border border-black/15 text-black/60 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Prices */}
                  <div className="mt-3 flex items-baseline gap-2.5">
                    {hasDiscount ? (
                      <>
                        <span className="text-base line-through text-black/40 font-extrabold">
                          {tp('price_egp', { price: originalPrice + premium })}
                        </span>
                        <span className="text-2xl font-black text-brand-accent">
                          {tp('price_egp', { price: discountedPrice + premium })}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-black">
                        {tp('price_egp', { price: originalPrice + premium })}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm font-semibold text-black/75 leading-relaxed border-t border-black/10 pt-4">
                    {description}
                  </p>

                  {/* Size Selector */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black uppercase tracking-wider text-black/60 block">
                        {t('select_size')}
                      </label>
                      <button
                        onClick={() => setIsSizeChartOpen(true)}
                        className="text-[10px] font-black uppercase tracking-wide text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        📏 {locale === 'ar' ? 'دليل المقاسات' : 'Size Chart'}
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {previewProduct.available_sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-10 text-xs font-black rounded-lg border-2 border-black flex items-center justify-center transition-all ${
                            selectedSize === size
                              ? 'bg-black text-[#EDE0D0] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]'
                              : 'bg-white text-black hover:bg-black/5'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fabric Option Radio */}
                  <div className="mt-6">
                    <label className="text-xs font-black uppercase tracking-wider text-black/60 block mb-2">
                      {t('material_options')}
                    </label>
                    <div className="flex flex-col gap-2">
                      {previewProduct.material_options.map((fabric) => (
                        <label
                          key={fabric}
                          onClick={() => setSelectedFabric(fabric)}
                          className={`flex items-center justify-between p-3 border-2 border-black rounded-xl cursor-pointer transition-all ${
                            selectedFabric === fabric
                              ? 'bg-black text-[#EDE0D0] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:bg-black/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="fabric-select"
                              checked={selectedFabric === fabric}
                              onChange={() => {}}
                              className="accent-black border-2 border-black"
                            />
                            <span className="text-xs font-bold">
                              {fabric === 'Standard Cotton' ? tp('standard_cotton') : tp('premium_cotton')}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Sticky Drawer Footer actions */}
          <div className="p-6 bg-white border-t-3 border-black flex flex-col sm:flex-row gap-3">
            
            {/* Direct Order Button */}
            {previewProduct.is_in_stock ? (
              <button
                onClick={() => {
                  addToCart(previewProduct, selectedSize, selectedFabric);
                  setPreviewProduct(null); // Close quick preview
                }}
                className="flex-grow flex items-center justify-center gap-2 py-4 text-sm font-black uppercase text-white bg-black hover:bg-brand-accent border-3 border-black rounded-xl sticker cursor-pointer transition-colors"
              >
                {tp('add_to_cart') || 'Add to Cart'}
              </button>
            ) : (
              <button
                disabled
                className="flex-grow flex items-center justify-center gap-2 py-4 text-sm font-black uppercase bg-zinc-400 text-zinc-100 border-3 border-zinc-500 rounded-xl cursor-not-allowed"
              >
                {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
              </button>
            )}

            {/* Share link button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-4 text-sm font-black uppercase bg-white text-black border-3 border-black rounded-xl sticker cursor-pointer"
            >
              {shareCopied ? (
                <>
                  <ClipboardCheck size={18} className="text-green-600" />
                  {t('share_copied')}
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  {t('share')}
                </>
              )}
            </button>

          </div>

        </motion.div>
      </div>

      {/* Sizing specifications chart modal */}
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </AnimatePresence>
  );
}
