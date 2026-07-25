'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { useLocale } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';

interface VisualSectionWrapperProps {
  sectionId: string;
  labelEn: string;
  labelAr: string;
  children: React.ReactNode;
}

export default function VisualSectionWrapper({
  sectionId,
  labelEn,
  labelAr,
  children
}: VisualSectionWrapperProps) {
  const locale = useLocale();
  const { settings, saveSettings, isAdminViewMode } = useStore();

  const hiddenSections = settings.hidden_sections || [];
  const isHidden = hiddenSections.includes(sectionId);

  const toggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (isHidden) {
      updated = hiddenSections.filter((id: string) => id !== sectionId);
    } else {
      updated = [...hiddenSections, sectionId];
    }
    await saveSettings({ hidden_sections: updated });
  };

  const label = locale === 'ar' ? labelAr : labelEn;

  // 1. If not admin view mode and section is hidden, do not render at all
  if (!isAdminViewMode) {
    if (isHidden) return null;
    return <>{children}</>;
  }

  // 2. If admin view mode, render with visual toggle headers and status styling
  return (
    <div 
      className={`relative group/section transition-all duration-300 ${
        isHidden 
          ? 'opacity-50 bg-red-500/5 border-4 border-red-500 border-dashed rounded-3xl m-3' 
          : 'border-4 border-transparent hover:border-brand-accent/50 rounded-3xl'
      }`}
    >
      {/* Admin control bar on hover or if hidden */}
      <div className="absolute top-2 right-4 z-40 bg-black text-[#EDE0D0] border-2 border-black rounded-lg px-2.5 py-1 text-[10px] font-black uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <span>{label}</span>
        <button
          onClick={toggleVisibility}
          className="p-1 border border-white/20 hover:bg-white/10 rounded cursor-pointer transition-colors text-white"
          title={isHidden ? 'Show Section / عرض القسم' : 'Hide Section / إخفاء القسم'}
        >
          {isHidden ? <EyeOff size={12} className="text-red-400" /> : <Eye size={12} />}
        </button>
      </div>

      {isHidden && (
        <div className="absolute top-2 left-4 z-40 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow">
          {locale === 'ar' ? '⚠️ قسم مخفي عن العملاء' : '⚠️ Hidden from Customers'}
        </div>
      )}

      {children}
    </div>
  );
}
