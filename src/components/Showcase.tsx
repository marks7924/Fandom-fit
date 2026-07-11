'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import ProductCard from './ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Showcase() {
  const t = useTranslations('products');
  const locale = useLocale();
  
  const { products, categories, activeCategory, setActiveCategory } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const visibleCategories = categories.filter(c => !c.is_hidden);

  // Filter products by category & search query
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    const matchesCategory = activeCategory === 'all' || product.category_id === activeCategory || 
      // Also match by category slug if matching
      categories.find(c => c.id === product.category_id)?.slug === activeCategory;
      
    // 2. Search Query
    const name = locale === 'ar' ? product.name_ar : product.name_en;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description_ar.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch && product.is_in_stock;
  });

  // Sort: Pinned items first, then by display_order
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPinned = a.is_pinned ? 1 : 0;
    const bPinned = b.is_pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return a.display_order - b.display_order;
  });

  return (
    <section id="showcase" className="py-24 bg-[#EDE0D0] border-b-4 border-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tight text-black">
              {t('title')}
            </h2>
            <p className="mt-3 text-lg font-semibold text-black/70 font-handwriting">
              {t('subtitle')}
            </p>
          </div>

          {/* Search bar with sketchy borders */}
          <div className="relative w-full md:w-80 select-none">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن تيشيرت...' : 'Search designs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-black font-semibold border-3 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-[-1px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            />
            <Search className="absolute left-3.5 top-3.5 text-black/50" size={18} />
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-10 scrollbar-none select-none rtl:flex-row-reverse">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-3 border-black sticker cursor-pointer transition-all duration-200 shrink-0 ${
              activeCategory === 'all'
                ? 'bg-black text-[#EDE0D0] translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {t('all_categories')}
          </button>
          {visibleCategories.map((cat) => {
            const catName = locale === 'ar' ? cat.name_ar : cat.name_en;
            const isSelected = activeCategory === cat.slug || activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-3 border-black sticker cursor-pointer transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-black text-[#EDE0D0] translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-3 border-black p-12 text-center rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
            <SlidersHorizontal size={48} className="mx-auto text-black/35 mb-4 animate-pulse" />
            <h3 className="text-2xl font-black uppercase mb-2">{t('no_products')}</h3>
            <p className="text-sm font-semibold text-black/50 font-handwriting">
              {locale === 'ar' 
                ? 'جرب البحث عن شيء آخر أو تصفح فئة فاندوم مختلفة!' 
                : 'Try modifying your filters, search term, or browsing a different fandom category.'}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
