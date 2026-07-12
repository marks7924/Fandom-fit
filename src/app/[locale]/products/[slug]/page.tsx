'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, getFabricPremium } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Share2, ClipboardCheck, Tag, Loader2 } from 'lucide-react';
import InstagramIcon from '@/components/InstagramIcon';
import CheckoutModal from '@/components/CheckoutModal';
import CartDrawer from '@/components/CartDrawer';
import LoadingScreen from '@/components/LoadingScreen';
import TrackOrderModal from '@/components/TrackOrderModal';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const t = useTranslations('product_detail');
  const tp = useTranslations('products');
  const locale = useLocale();
  const { products, categories, fetchInitialData, setCheckoutProduct, isLoading } = useStore();
  
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('Standard Cotton');
  const [shareCopied, setShareCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetchInitialData();
    }
  }, [products, fetchInitialData]);

  const product = products.find((p) => p.slug === slug);

  // Still fetching — show branded loader instead of premature "not found"
  if (isLoading && !product) {
    return <LoadingScreen />;
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none">
          <span className="font-handwriting text-5xl text-brand-accent mb-4">Drop Not Found</span>
          <p className="text-sm font-semibold text-black/60 mb-6">
            The collection drop you are looking for might have been archived or hidden.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white rounded-xl border-3 border-black font-black uppercase sticker cursor-pointer"
          >
            {t('back')}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const description = locale === 'ar' ? product.description_ar : product.description_en;
  const getProductEffectivePrice = useStore((state) => state.getProductEffectivePrice);
  const { hasDiscount, originalPrice, discountedPrice } = getProductEffectivePrice(product);
  const premium = getFabricPremium(selectedFabric);

  const defaultPlaceholder = 
    product.category_id === '4' ? '/placeholders/manga_front.jpg' : 
    '/placeholders/arcade_front.jpg';
    
  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : [defaultPlaceholder];

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    setIsCopying(true);
    setTimeout(() => {
      navigator.clipboard.writeText(window.location.href);
      setIsCopying(false);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }, 600);
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

  // Related products (same category, excluding current product)
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.is_in_stock)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 notebook-grid select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 font-black uppercase text-xs sm:text-sm text-black border-2 border-black bg-white px-4 py-2 rounded-xl sticker cursor-pointer"
          >
            <ArrowLeft size={16} />
            {t('back')}
          </Link>

          {/* Main Info Box */}
          <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
            {/* Scrapbook pushpins/tapes */}
            <div className="absolute top-[-10px] left-[15%] w-24 h-6 bg-[#81B29A]/90 border-2 border-black/40 rotate-[-3deg]"></div>
            
            {/* Left Image block */}
            <div className="lg:col-span-6">
              <div className="relative aspect-square border-3 border-black rounded-2xl overflow-hidden bg-[#EDE0D0]/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Image
                  src={images[activeImageIdx] || defaultPlaceholder}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 500px"
                  className={`object-contain p-4 ${!product.is_in_stock ? 'blur-[3px] opacity-60' : ''}`}
                />
                {!product.is_in_stock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 select-none pointer-events-none">
                    <span className="px-4 py-2 border-3 border-black bg-zinc-900 text-[#EDE0D0] text-xs font-black uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]">
                      {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-20 border-2 border-black rounded-xl overflow-hidden transition-all ${
                        activeImageIdx === idx 
                          ? 'ring-3 ring-brand-accent scale-95 shadow-sm' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`thumb-${idx}`} fill className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right details block */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              
              <div>
                {/* Unisex Fit */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-widest bg-black text-[#EDE0D0] px-3 py-1 rounded-full uppercase border border-white/20">
                    {tp('unisex')}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] font-black tracking-wider uppercase bg-brand-accent text-white px-3 py-1 rounded-full border-2 border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                      <span>🔥</span>
                      {locale === 'ar' ? `خصم ${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}٪` : `${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF`}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl font-black uppercase text-black mt-3 leading-none">
                  {name}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  {hasDiscount ? (
                    <>
                      <span className="text-lg line-through text-black/40 font-extrabold">
                        {tp('price_egp', { price: originalPrice + premium })}
                      </span>
                      <span className="text-3xl font-black text-brand-accent">
                        {tp('price_egp', { price: discountedPrice + premium })}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-black">
                      {tp('price_egp', { price: originalPrice + premium })}
                    </span>
                  )}
                </div>

                <p className="mt-6 text-sm font-semibold text-black/75 leading-relaxed border-t border-black/10 pt-6">
                  {description}
                </p>

                {/* Size Choice */}
                <div className="mt-6">
                  <label className="text-xs font-black uppercase tracking-wider text-black/60 block mb-2">
                    {t('select_size')}
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {product.available_sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 text-sm font-black rounded-xl border-3 border-black flex items-center justify-center transition-all ${
                          selectedSize === size
                            ? 'bg-black text-[#EDE0D0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]'
                            : 'bg-white text-black hover:bg-black/5'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material Choice */}
                <div className="mt-6">
                  <label className="text-xs font-black uppercase tracking-wider text-black/60 block mb-2">
                    {t('material_options')}
                  </label>
                  <div className="flex flex-col gap-2 max-w-sm">
                    {product.material_options.map((fabric) => (
                      <label
                        key={fabric}
                        onClick={() => setSelectedFabric(fabric)}
                        className={`flex items-center justify-between p-3.5 border-3 border-black rounded-xl cursor-pointer transition-all ${
                          selectedFabric === fabric
                            ? 'bg-black text-[#EDE0D0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]'
                            : 'bg-white text-black hover:bg-black/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="fabric-select"
                            checked={selectedFabric === fabric}
                            onChange={() => {}}
                            className="accent-black border-2 border-black"
                          />
                          <span className="text-xs font-black">
                            {fabric === 'Standard Cotton' ? tp('standard_cotton') : tp('premium_cotton')}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order actions */}
              <div className="mt-8 pt-6 border-t border-black/10 flex flex-col sm:flex-row gap-4">
                
                {/* Order Direct Web Checkout */}
                {product.is_in_stock ? (
                  <button
                    onClick={() => setCheckoutProduct(product)}
                    className="flex-grow flex items-center justify-center gap-2 py-4 text-sm font-black uppercase text-white bg-black hover:bg-brand-accent border-3 border-black rounded-xl sticker cursor-pointer transition-colors"
                  >
                    {tp('order_now')}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-grow flex items-center justify-center gap-2 py-4 text-sm font-black uppercase bg-zinc-400 text-zinc-100 border-3 border-zinc-500 rounded-xl cursor-not-allowed"
                  >
                    {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
                  </button>
                )}

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  disabled={isCopying}
                  className="flex items-center justify-center gap-2 px-6 py-4 text-sm font-black uppercase bg-white text-black border-3 border-black rounded-xl sticker cursor-pointer disabled:opacity-80"
                >
                  {isCopying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="font-handwriting normal-case text-base">Fandom Fit<span className="animate-pulse">...</span></span>
                    </>
                  ) : shareCopied ? (
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

              {/* Notice */}
              <p className="text-[10px] font-bold text-black/40 mt-3 font-handwriting">
                * {t('how_to_order_info')}
              </p>

            </div>
          </div>

          {/* Related Fandom Drops */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h3 className="text-3xl font-black uppercase text-black mb-8 border-b-3 border-black pb-3 select-none">
                {t('related_products')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
      <CheckoutModal />
      <CartDrawer />
      <TrackOrderModal />
    </>
  );
}
