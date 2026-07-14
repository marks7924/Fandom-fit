'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore, Product } from '@/lib/store';
import Image from 'next/image';
import { Eye, Tag, Heart } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const locale = useLocale();
  const setPreviewProduct = useStore((state) => state.setPreviewProduct);
  const setCheckoutProduct = useStore((state) => state.setCheckoutProduct);
  const addToCart = useStore((state) => state.addToCart);

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const getProductEffectivePrice = useStore((state) => state.getProductEffectivePrice);
  const { hasDiscount, originalPrice, discountedPrice } = getProductEffectivePrice(product);

  const { user, profile, toggleFavorite, setIsAuthModalOpen } = useStore();
  const isFav = profile?.favorites?.includes(product.id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      toggleFavorite(product.id);
    }
  };

  // Parse tags to separate default list from positioned tags
  const parsedTags = (product.tags || []).map(t => {
    try {
      if (t.startsWith('{')) {
        return JSON.parse(t);
      }
    } catch (err) {}
    return { name: t, color: '', textColor: '', posX: null, posY: null };
  });

  const defaultTags = parsedTags.filter(tag => tag.posX === null || tag.posY === null);
  const positionedTags = parsedTags.filter(tag => tag.posX !== null && tag.posY !== null);

  // Image fallback strategy
  const defaultPlaceholder = 
    product.category_id === '4' ? '/placeholders/manga_front.jpg' : 
    '/placeholders/arcade_front.jpg';
    
  const initialImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : defaultPlaceholder;

  const [imgSrc, setImgSrc] = useState(initialImage);

  const getInstagramDMUrl = () => {
    const text = encodeURIComponent(
      locale === 'ar' 
        ? `مرحباً فاندوم فيت! أود طلب المنتج: ${name} (المقاس: L)` 
        : `Hey Fandom Fit! I want to order the product: ${name} (Size: L)`
    );
    return `https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv&text=${text}`;
  };

  return (
    <div className="group bg-white border-3 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col justify-between relative">
      
      {/* Absolute Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-brand-accent text-white border-2 border-black rounded-md rotate-[2deg] shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center gap-1">
            <span className="text-[9px]">🔥</span>
            {locale === 'ar' ? `خصم ${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}٪` : `${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF`}
          </span>
        )}
        {product.is_new_arrival && (
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-[#81B29A] text-black border-2 border-black rounded-md rotate-[-2deg]">
            {t('new')}
          </span>
        )}
        {product.is_trending && (
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-[#F2CC8F] text-black border-2 border-black rounded-md rotate-[1deg]">
            {t('trending')}
          </span>
        )}
        {product.is_limited_edition && (
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-[#E07A5F] text-white border-2 border-black rounded-md rotate-[-1deg]">
            {t('limited')}
          </span>
        )}
        {product.is_best_seller && (
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-[#3D405B] text-[#EDE0D0] border-2 border-black rounded-md rotate-[2deg]">
            {t('best_seller')}
          </span>
        )}
        {!product.is_in_stock && (
          <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-red-600 text-white border-2 border-black rounded-md">
            {t('out_of_stock')}
          </span>
        )}
      </div>

      {/* Unisex Badge (Top Right) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none flex items-center gap-1.5">
        {product.is_pinned && (
          <span className="text-[15px] transform rotate-[15deg] drop-shadow-sm select-none" title="Pinned Collection">
            📌
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
          {t('unisex')}
        </span>
      </div>

      {/* Product Image Area */}
      <div className="relative aspect-square bg-[#EDE0D0]/40 overflow-hidden border-b-3 border-black cursor-pointer flex items-center justify-center">
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setImgSrc(defaultPlaceholder)}
          className={`object-contain p-2 group-hover:scale-105 transition-transform duration-500 ${!product.is_in_stock ? 'blur-[3px] opacity-50' : ''}`}
        />

        {/* Positioned Visual Tags Overlay */}
        {positionedTags.map((tag, i) => (
          <span
            key={i}
            className="absolute z-20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] select-none pointer-events-none"
            style={{
              left: `${tag.posX}%`,
              top: `${tag.posY}%`,
              backgroundColor: tag.color || '#F2CC8F',
              color: tag.textColor || '#000000',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {tag.name}
          </span>
        ))}

        {/* Favorites Heart Button (Bottom Left of Photo) */}
        <button
          onClick={handleFavoriteClick}
          className="absolute bottom-3 left-3 z-30 p-1.5 bg-white border-2 border-black rounded-lg hover:bg-black/5 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 pointer-events-auto"
          title={isFav ? (locale === 'ar' ? 'حذف من المفضلة' : 'Remove from Favorites') : (locale === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites')}
        >
          <Heart size={12} className={isFav ? 'text-red-500 fill-red-500' : 'text-black'} />
        </button>

        {/* Out of Stock visual label */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 select-none">
            <span className="px-4 py-2 border-3 border-black bg-zinc-900 text-[#EDE0D0] text-xs font-black uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]">
              {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
            </span>
          </div>
        )}

        {/* Quick View Hover Overlay */}
        <div className={`absolute inset-0 bg-black/25 opacity-0 ${product.is_in_stock ? 'group-hover:opacity-100' : 'pointer-events-none'} transition-opacity duration-300 flex items-center justify-center gap-2`}>
          <button
            onClick={() => setPreviewProduct(product)}
            className="flex items-center gap-1 px-4 py-2 text-xs font-black uppercase bg-white text-black border-2 border-black rounded-lg hover:bg-[#EDE0D0] transition-colors"
          >
            <Eye size={14} />
            {t('quick_preview')}
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Custom Tags List */}
          {defaultTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5 pointer-events-none">
              {defaultTags.map((tag, i) => (
                <span key={i} className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-black/5 border border-black/15 text-black/60 rounded">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {/* Name & Prices */}
          <div className="flex justify-between items-start gap-2">
            <h4 
              onClick={() => setPreviewProduct(product)}
              className="text-lg font-black uppercase text-black hover:text-brand-accent transition-colors break-words cursor-pointer"
            >
              {name}
            </h4>
            <div className="flex flex-col items-end">
              {hasDiscount ? (
                <>
                  <span className="text-xs line-through text-black/40 font-bold">
                    {t('price_egp', { price: originalPrice })}
                  </span>
                  <span className="text-sm font-black text-brand-accent">
                    {t('price_egp', { price: discountedPrice })}
                  </span>
                </>
              ) : (
                <span className="text-sm font-black text-black">
                  {t('price_egp', { price: originalPrice })}
                </span>
              )}
            </div>
          </div>

          {/* Available Sizes */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase text-black/50">{t('sizes')}:</span>
            <div className="flex gap-1 flex-wrap">
              {product.available_sizes.map((size) => (
                <span 
                  key={size}
                  className="text-[9px] font-black border border-black/25 px-1.5 py-0.5 rounded bg-black/5"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* Fabric Type */}
          <div className="mt-2 text-[10px] font-bold text-black/60 flex items-center gap-1.5">
            <Tag size={10} className="text-black/45" />
            <span className="line-clamp-1">{product.material_options.join(' / ')}</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-4 pt-3 border-t border-black/10">
          {product.is_in_stock ? (
            <button
              onClick={() => addToCart(product, 'M', 'Standard Cotton')}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase bg-black text-[#EDE0D0] hover:bg-brand-accent hover:text-white transition-all duration-300 border-2 border-black rounded-lg cursor-pointer"
            >
              {t('add_to_cart') || 'Add to Cart'}
            </button>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase bg-zinc-400 text-zinc-100 border-2 border-zinc-500 rounded-lg cursor-not-allowed"
            >
              {locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
