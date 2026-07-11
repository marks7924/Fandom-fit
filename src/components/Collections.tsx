'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Gamepad2, Film, Tv, Sparkles, Trophy, Music, Shuffle, Paintbrush } from 'lucide-react';

interface CategoryItem {
  slug: string;
  nameKey: string;
  descKey: string;
  icon: React.ReactNode;
  themeClass: string;
  hoverDecorations?: React.ReactNode;
}

export default function Collections() {
  const t = useTranslations('categories');
  const locale = useLocale();
  const { activeCategory, setActiveCategory } = useStore();

  const getLocalizedName = (slug: string) => {
    // Falls back to direct translations keys
    if (slug === 'games') return t('games');
    if (slug === 'movies') return t('movies');
    if (slug === 'tv-shows') return t('tv_shows');
    if (slug === 'anime') return t('anime');
    if (slug === 'football') return t('football');
    if (slug === 'music') return t('music');
    if (slug === 'random') return t('random');
    if (slug === 'custom') return t('custom_designs');
    return slug;
  };

  const getLocalizedDesc = (slug: string) => {
    if (slug === 'games') return t('games_desc');
    if (slug === 'movies') return t('movies_desc');
    if (slug === 'tv-shows') return t('tv_shows_desc');
    if (slug === 'anime') return t('anime_desc');
    if (slug === 'football') return t('football_desc');
    if (slug === 'music') return t('music_desc');
    if (slug === 'random') return t('random_desc');
    if (slug === 'custom') return t('custom_designs_desc');
    return '';
  };

  const collections: CategoryItem[] = [
    {
      slug: 'games',
      nameKey: 'games',
      descKey: 'games_desc',
      icon: <Gamepad2 size={28} />,
      themeClass: 'hover:bg-black hover:text-[#39FF14] hover:pixel-grid hover:border-[#39FF14] group-hover:scale-105',
    },
    {
      slug: 'movies',
      nameKey: 'movies',
      descKey: 'movies_desc',
      icon: <Film size={28} />,
      themeClass: 'hover:bg-zinc-950 hover:text-white hover:film-grain hover:border-white',
    },
    {
      slug: 'tv-shows',
      nameKey: 'tv_shows',
      descKey: 'tv_shows_desc',
      icon: <Tv size={28} />,
      themeClass: 'hover:bg-[#FFFDF0] hover:text-black hover:notebook-lines hover:border-amber-700',
    },
    {
      slug: 'anime',
      nameKey: 'anime',
      descKey: 'anime_desc',
      icon: <Sparkles size={28} />,
      themeClass: 'hover:bg-white hover:text-black hover:manga-speed hover:border-black',
    },
    {
      slug: 'football',
      nameKey: 'football',
      descKey: 'football_desc',
      icon: <Trophy size={28} />,
      themeClass: 'hover:bg-[#4E6C50] hover:text-white hover:field-grass hover:border-[#E9DAC1]',
    },
    {
      slug: 'music',
      nameKey: 'music',
      descKey: 'music_desc',
      icon: <Music size={28} />,
      themeClass: 'hover:bg-zinc-900 hover:text-white hover:border-black overflow-visible relative group',
      hoverDecorations: (
        <div className="absolute right-[-40px] top-[15%] w-24 h-24 vinyl-disk opacity-0 group-hover:opacity-100 group-hover:rotate-[360deg] transition-all duration-700 pointer-events-none z-[-1] hidden sm:block"></div>
      )
    },
    {
      slug: 'random',
      nameKey: 'random',
      descKey: 'random_desc',
      icon: <Shuffle size={28} />,
      themeClass: 'hover:bg-[#F2CC8F] hover:text-black hover:border-black hover:rotate-[1deg]',
    },
    {
      slug: 'custom',
      nameKey: 'custom_designs',
      descKey: 'custom_designs_desc',
      icon: <Paintbrush size={28} />,
      themeClass: 'bg-white text-black border-dashed hover:bg-black hover:text-white hover:border-solid',
    }
  ];

  const handleCategorySelect = (slug: string) => {
    if (slug === 'custom') {
      const el = document.getElementById('custom-design');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveCategory(slug);
      const el = document.getElementById('showcase');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="collections" className="py-10 sm:py-24 bg-[#EDE0D0] border-b-4 border-black relative">
      {/* Decorative scrap tape */}
      <div className="absolute -top-3 right-[10%] px-6 py-1 masking-tape rotate-3 z-10 text-sm">
        ★ CHOOSE YOUR FANDOM ★
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
            {t('title')}
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-black/70 font-handwriting">
            {t('subtitle')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 select-none">
          {collections.map((item, idx) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCategorySelect(item.slug)}
              className={`relative bg-white border-3 border-black p-3 sm:p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 cursor-pointer flex flex-col justify-between aspect-square sm:aspect-[1.1] z-20 ${item.themeClass}`}
            >
              {item.hoverDecorations}
              
              {/* Icon / Head */}
              <div className="flex justify-between items-start">
                <div className="p-3 border-2 border-black rounded-lg bg-[#EDE0D0]/30">
                  {item.icon}
                </div>
                <span className="font-handwriting text-2xl text-black/40 group-hover:text-inherit">
                  #0{idx + 1}
                </span>
              </div>

              {/* Title / Description */}
              <div className="mt-3 sm:mt-8">
                <h3 className="text-base sm:text-2xl font-black uppercase tracking-tight">
                  {getLocalizedName(item.slug)}
                </h3>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-85 mt-1 sm:mt-2 hidden sm:block">
                  {getLocalizedDesc(item.slug)}
                </p>
              </div>

              {/* Decorative notebook staples / stickers */}
              {item.slug === 'games' && (
                <div className="absolute top-2 right-2 text-[10px] font-mono opacity-40">SYSTEM: OK</div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
