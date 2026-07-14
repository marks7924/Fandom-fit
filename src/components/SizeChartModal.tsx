'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table } from 'lucide-react';
import Image from 'next/image';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  const locale = useLocale();
  
  const { settings } = useStore();

  if (!isOpen) return null;

  // Retrieve configured assets or fallback
  const sizeChartImgEn = settings.size_chart_img_en;
  const sizeChartImgAr = settings.size_chart_img_ar;
  
  const currentChartImg = locale === 'ar' ? (sizeChartImgAr || sizeChartImgEn) : sizeChartImgEn;

  // Default size chart table data
  const defaultTableHeaders = locale === 'ar' 
    ? ['المقاس', 'العرض (محيط الصدر - سم)', 'الطول (سم)', 'طول الكم (سم)']
    : ['Size', 'Width (Chest - cm)', 'Length (cm)', 'Sleeve (cm)'];

  const defaultTableRows = [
    ['S', '52', '70', '21'],
    ['M', '55', '72', '22'],
    ['L', '58', '74', '23'],
    ['XL', '61', '76', '24'],
    ['XXL', '64', '78', '25'],
  ];

  // Retrieve customized table data from settings if available
  let tableHeaders = defaultTableHeaders;
  let tableRows = defaultTableRows;
  
  if (settings.size_chart_table) {
    try {
      const customData = typeof settings.size_chart_table === 'string'
        ? JSON.parse(settings.size_chart_table)
        : settings.size_chart_table;
        
      if (customData && customData.headers && customData.rows) {
        tableHeaders = customData.headers;
        tableRows = customData.rows;
      }
    } catch (e) {
      console.error('Error parsing custom size chart table:', e);
    }
  }

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
                ? 'قارن مقاساتك للحصول على المقاس المثالي (التيشيرتات مريحة وواسعة)' 
                : 'Check sizing details below. Our graphic tees feature a boxy, relaxed fit.'}
            </p>
          </div>

          {/* Render image size chart if configured */}
          {currentChartImg ? (
            <div className="relative aspect-[4/3] w-full border-3 border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Image
                src={currentChartImg}
                alt="Size Chart"
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          ) : (
            /* Render table fallback size chart if no image */
            <div className="overflow-x-auto border-3 border-black bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <table className="w-full text-center border-collapse font-mono text-xs text-black">
                <thead className="bg-[#EDE0D0] border-b-2 border-black font-extrabold uppercase text-[10px]">
                  <tr>
                    {tableHeaders.map((header: string, i: number) => (
                      <th key={i} className="p-3 border-r-2 border-black last:border-r-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {tableRows.map((row: string[], ri: number) => (
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

          {/* Bottom tips */}
          <div className="mt-5 text-[10px] font-bold text-zinc-500 leading-relaxed bg-white/40 p-3 border-2 border-dashed border-black/15 rounded-xl uppercase">
            {locale === 'ar' ? (
              <span>
                💡 نصيحة المقاس: التيشيرتات مصممة لتكون كاجوال فضفاضة (Oversized). إذا كنت تفضل مقاساً مضبوطاً، ننصح باختيار مقاس أصغر بمرتبة واحدة من مقاسك المعتاد.
              </span>
            ) : (
              <span>
                💡 Sizing Tip: Our streetwear drop tees are oversized by design. If you prefer a regular fit, we recommend selecting one size smaller than your usual.
              </span>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
