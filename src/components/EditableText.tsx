'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useLocale } from 'next-intl';
import { Edit3, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableTextProps {
  textKey: string;
  defaultEn: string;
  defaultAr: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export default function EditableText({
  textKey,
  defaultEn,
  defaultAr,
  className = '',
  as = 'span'
}: EditableTextProps) {
  const locale = useLocale();
  const { settings, saveSettings, isAdminViewMode } = useStore();
  const [isEditing, setIsEditing] = useState(false);

  // Retrieve current translations from settings overrides
  const overrides = settings.text_overrides || {};
  const enVal = overrides[`${textKey}_en`] ?? defaultEn;
  const arVal = overrides[`${textKey}_ar`] ?? defaultAr;

  // Local input states for edit popup
  const [inputEn, setInputEn] = useState(enVal);
  const [inputAr, setInputAr] = useState(arVal);

  const activeText = locale === 'ar' ? arVal : enVal;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOverrides = {
      ...overrides,
      [`${textKey}_en`]: inputEn.trim(),
      [`${textKey}_ar`]: inputAr.trim()
    };

    await saveSettings({ text_overrides: updatedOverrides });
    setIsEditing(false);
  };

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputEn(enVal);
    setInputAr(arVal);
    setIsEditing(true);
  };

  const Component = as;

  // Normal view mode (for visitors or when Admin View is off)
  if (!isAdminViewMode) {
    return <Component className={className}>{activeText}</Component>;
  }

  return (
    <span className="relative inline-block group/edit select-text">
      {/* Visual outline and edit trigger on hover */}
      <span className="absolute -inset-1.5 border-2 border-dashed border-transparent group-hover/edit:border-brand-accent group-hover/edit:bg-brand-accent/5 rounded-lg transition-all duration-200 pointer-events-none z-10"></span>
      
      {/* Edit trigger pen icon */}
      <button
        onClick={handleOpenEdit}
        className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-brand-accent text-white border-2 border-black rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200 z-20 cursor-pointer"
        title="Edit Text Inline"
      >
        <Edit3 size={11} />
      </button>

      <Component 
        onDoubleClick={handleOpenEdit}
        className={`${className} cursor-text`}
      >
        {activeText}
      </Component>

      {/* Editor Modal Popup */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
            {/* Backdrop cancel trigger */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsEditing(false)} />

            {/* Editing Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#EDE0D0] border-4 border-black p-5 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10"
            >
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Edit3 size={13} />
                  Edit Translations / تعديل الترجمة
                </h4>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1 border border-black/15 hover:bg-black/5 rounded cursor-pointer text-black"
                >
                  <X size={12} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                    English Text
                  </label>
                  <textarea
                    required
                    value={inputEn}
                    onChange={(e) => setInputEn(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl text-xs focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-black/50 block mb-1">
                    الترجمة العربية
                  </label>
                  <textarea
                    required
                    value={inputAr}
                    onChange={(e) => setInputAr(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white text-black font-semibold border-2 border-black rounded-xl text-xs focus:outline-none resize-none text-right"
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-white hover:bg-black/5 text-black border-2 border-black rounded-xl font-black uppercase text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-accent hover:bg-brand-accent/95 text-white border-2 border-black rounded-xl font-black uppercase text-[10px] cursor-pointer flex justify-center items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-0.5"
                  >
                    <Check size={12} />
                    Save Overrides
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </span>
  );
}
