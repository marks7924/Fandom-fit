'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table } from 'lucide-react';
import Image from 'next/image';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productFitType?: 'regular' | 'oversized' | 'both';
}

export default function SizeChartModal({ isOpen, onClose, productFitType = 'both' }: SizeChartModalProps) {
  const locale = useLocale();
  const { settings } = useStore();
  const [activeTabId, setActiveTabId] = useState<string>('');

  // 1. Retrieve raw size charts list or build default seed charts
  const getChartsList = (): any[] => {
    let rawCharts = settings.size_charts;
    if (rawCharts) {
      try {
        const parsed = typeof rawCharts === 'string' ? JSON.parse(rawCharts) : rawCharts;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing size_charts list:', e);
      }
    }

    // Default Fallbacks
    return [
      {
        id: 'oversized',
        name_en: 'Oversized Fit Size Chart',
        name_ar: 'جدول قياسات المقاس الواسع',
        img_en: settings.size_chart_img_en || '',
        img_ar: settings.size_chart_img_ar || '',
        table: {
          headers: locale === 'ar' 
            ? ['المقاس', 'العرض (محيط الصدر - سم)', 'الطول (سم)', 'طول الكم (سم)']
            : ['Size', 'Width (Chest - cm)', 'Length (cm)', 'Sleeve (cm)'],
          rows: [
            ['S', '56', '72', '22'],
            ['M', '59', '74', '23'],
            ['L', '62', '76', '24'],
            ['XL', '65', '78', '25'],
            ['XXL', '68', '80', '26']
          ]
        }
      },
      {
        id: 'regular',
        name_en: 'Regular Fit Size Chart',
        name_ar: 'جدول قياسات المقاس المعتاد',
        img_en: '',
        img_ar: '',
        table: {
          headers: locale === 'ar'
            ? ['المقاس', 'العرض (سم)', 'الطول (سم)']
            : ['Size', 'Width (cm)', 'Length (cm)'],
          rows: [
            ['S', '50', '68'],
            ['M', '53', '70'],
            ['L', '56', '72'],
            ['XL', '59', '74'],
            ['XXL', '62', '76']
          ]
        }
      }
    ];
  };

  const allCharts = getChartsList();

  // 2. Filter charts list based on productFitType option
  const filteredCharts = allCharts.filter((chart) => {
    if (productFitType === 'regular') {
      return chart.id.toLowerCase().includes('regular') || chart.name_en.toLowerCase().includes('regular');
    }
    if (productFitType === 'oversized') {
      return chart.id.toLowerCase().includes('oversized') || chart.name_en.toLowerCase().includes('oversized') || chart.id === 'fit-1'; // fallback
    }
    return true; // show all for 'both'
  });

  // Fallback to first available chart if no match
  const activeChart = filteredCharts.find(c => c.id === activeTabId) || filteredCharts[0] || allCharts[0];

  useEffect(() => {
    if (filteredCharts.length > 0) {
      // Prefer starting on oversized if available
      const osChart = filteredCharts.find(c => c.id.toLowerCase().includes('oversized'));
      if (osChart) {
        setActiveTabId(osChart.id);
      } else {
        setActiveTabId(filteredCharts[0].id);
      }
    }
  }, [isOpen, productFitType]);

  if (!isOpen) return null;

  // Image Selection Strategy
  const imgEn = activeChart?.img_en || '';
  const imgAr = activeChart?.img_ar || '';
  const currentChartImg = locale === 'ar' ? (imgAr || imgEn) : imgEn;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#EDE0D0] border-4 border-black p-5 sm:p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 border-2 border-black rounded-lg bg-white hover:bg-black/5 cursor-pointer text-black transition-colors"
          >
            <X size={16} />
          </button>

          {/* Title */}
          <div className="mb-4">
            <h3 className="text-2xl font-black uppercase text-black flex items-center gap-2">
              <Table size={20} className="text-brand-accent" />
              {locale === 'ar' ? 'جدول القياسات والمواصفات' : 'Size Specifications'}
            </h3>
            <p className="font-handwriting text-xs text-black/60 mt-0.5">
              {locale === 'ar' 
                ? 'قارن مقاساتك للحصول على المقاس المثالي' 
                : 'Check sizing details below to find your perfect fit.'}
            </p>
          </div>

          {/* Multi-Tab Selector */}
          {filteredCharts.length > 1 && (
            <div className="flex gap-2 p-1 bg-black/5 border-2 border-black rounded-xl mb-4">
              {filteredCharts.map((chart) => {
                const isSelected = activeChart?.id === chart.id;
                const tabLabel = locale === 'ar' ? chart.name_ar : chart.name_en;
                return (
                  <button
                    key={chart.id}
                    type="button"
                    onClick={() => setActiveTabId(chart.id)}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-[#EDE0D0] shadow-sm'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Size Chart Image or Table Render */}
          {activeChart && (
            <>
              {currentChartImg ? (
                <div className="relative aspect-[4/3] w-full border-3 border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <Image
                    src={currentChartImg}
                    alt={locale === 'ar' ? activeChart.name_ar : activeChart.name_en}
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                /* Editable spreadsheet table fallback */
                <div className="overflow-x-auto border-3 border-black bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <table className="w-full text-center border-collapse font-mono text-xs text-black">
                    <thead className="bg-[#EDE0D0] border-b-2 border-black font-extrabold uppercase text-[10px]">
                      <tr>
                        {activeChart.table?.headers?.map((header: string, i: number) => (
                          <th key={i} className="p-3 border-r-2 border-black last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {activeChart.table?.rows?.map((row: string[], ri: number) => (
                        <tr key={ri} className="hover:bg-zinc-50 font-bold">
                          {row.map((val: string, ci: number) => (
                            <td key={ci} className="p-3 border-r border-black/10 last:border-r-0">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Bottom tips */}
          <div className="mt-5 text-[10px] font-bold text-zinc-500 leading-relaxed bg-white/40 p-3 border-2 border-dashed border-black/15 rounded-xl uppercase">
            {locale === 'ar' ? (
              <span>
                💡 نصيحة المقاس: تصاميمنا الفضفاضة (Oversized) تأتي بقصة مريحة وواسعة. إذا كنت تفضل القصة العادية المضبوطة، فاختر قصة "Regular Fit" أو مقاساً أصغر بدرجة.
              </span>
            ) : (
              <span>
                💡 Sizing Tip: Our streetwear drop tees are oversized by design. If you prefer a regular fit, select our "Regular Fit" option or choose one size smaller than your usual.
              </span>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
