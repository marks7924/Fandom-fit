'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useLocale } from 'next-intl';

interface AlertToast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function CustomToastProvider() {
  const [activeAlert, setActiveAlert] = useState<AlertToast | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nativeAlert = window.alert;
      
      window.alert = (message: string) => {
        console.log("Captured browser alert:", message);
        
        let type: 'success' | 'error' | 'info' = 'info';
        const msgLower = String(message).toLowerCase();
        
        if (
          msgLower.includes('success') || 
          msgLower.includes('done') || 
          msgLower.includes('تم ') || 
          msgLower.includes('تمت ') || 
          msgLower.includes('بنجاح') || 
          msgLower.includes('✅')
        ) {
          type = 'success';
        } else if (
          msgLower.includes('fail') || 
          msgLower.includes('error') || 
          msgLower.includes('خطأ') || 
          msgLower.includes('عذراً') || 
          msgLower.includes('فشل') || 
          msgLower.includes('invalid') || 
          msgLower.includes('incorrect')
        ) {
          type = 'error';
        }
        
        setActiveAlert({
          id: Math.random().toString(),
          message,
          type
        });
      };

      return () => {
        window.alert = nativeAlert;
      };
    }
  }, []);

  if (!activeAlert) return null;

  const isRtl = locale === 'ar';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 font-mono select-none">
      <div 
        className="bg-[#EDE0D0] text-[#000000] border-4 border-black p-6 rounded-3xl max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 transform scale-100 flex flex-col text-center"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Animated Icon header */}
        <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {activeAlert.type === 'success' && (
            <CheckCircle2 size={32} className="text-[#2A9D8F] stroke-[2.5]" />
          )}
          {activeAlert.type === 'error' && (
            <AlertCircle size={32} className="text-[#E07A5F] stroke-[2.5]" />
          )}
          {activeAlert.type === 'info' && (
            <Info size={32} className="text-zinc-600 stroke-[2.5]" />
          )}
        </div>

        {/* Modal Title */}
        <h3 className="text-sm font-black uppercase tracking-wider mb-2 text-[#000000] border-b-2 border-black pb-2">
          {activeAlert.type === 'success' && (isRtl ? 'عملية ناجحة' : 'Action Successful')}
          {activeAlert.type === 'error' && (isRtl ? 'تنبيه / خطأ' : 'Notification / Alert')}
          {activeAlert.type === 'info' && (isRtl ? 'إشعار' : 'Notice')}
        </h3>

        {/* Message body */}
        <p className="text-xs font-bold leading-relaxed py-2 select-text text-zinc-800 whitespace-pre-line text-center">
          {activeAlert.message}
        </p>

        {/* Action Button */}
        <button
          onClick={() => setActiveAlert(null)}
          className="mt-5 py-2.5 px-4 bg-black text-white hover:bg-zinc-800 text-xs font-black rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer border-2 border-black shadow-[3px_3px_0px_rgba(237,224,208,1)] hover:shadow-none font-mono"
        >
          {isRtl ? 'حسناً' : 'Okay'}
        </button>
      </div>
    </div>
  );
}
