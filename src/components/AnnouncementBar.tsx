'use client';

import { useStore } from '@/lib/store';
import { useLocale } from 'next-intl';

export default function AnnouncementBar() {
  const { announcement, announcement_ar } = useStore();
  const locale = useLocale();

  // Pick locale-specific text, fallback to the other language if empty
  const text = locale === 'ar'
    ? (announcement_ar || announcement)
    : (announcement || announcement_ar);

  if (!text) return null;

  return (
    <div className="bg-black text-[#EDE0D0] border-b-3 border-black py-2 overflow-hidden relative select-none z-50 h-10 flex items-center">
      <div className="w-full relative flex items-center justify-center">
        {/* Infinite CSS Marquee */}
        <div
          className="flex gap-16 whitespace-nowrap animate-[marquee_28s_linear_infinite] select-none text-[10px] sm:text-xs font-black tracking-widest uppercase"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

