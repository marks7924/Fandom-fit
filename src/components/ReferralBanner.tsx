'use client';

import { useStore } from '@/lib/store';
import { useLocale } from 'next-intl';
import { Share2, Gift } from 'lucide-react';

export default function ReferralBanner() {
  const locale = useLocale();
  const { settings, setIsInviteOpen } = useStore();

  const isReferralEnabled = settings.referral_reward_system_enabled !== false;

  if (!isReferralEnabled) return null;

  return (
    <section className="py-12 bg-white/40 border-y-3 border-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EDE0D0] border-4 border-black rounded-3xl p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-w-4xl mx-auto overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-accent/10 rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10 text-center md:text-left rtl:md:text-right">
            <div className="w-16 h-16 bg-brand-accent text-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 animate-bounce">
              <Gift size={32} />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight leading-none">
                {locale === 'ar' ? 'ادعُ أصدقاءك واكسب خصم ١٥٪!' : 'Invite Friends & Get 15% OFF!'}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-black/70 font-handwriting leading-relaxed">
                {locale === 'ar'
                  ? 'شارك رابط الإحالة الخاص بك مع أصدقائك. بمجرد قيامهم بالطلب الأول، ستحصل فوراً على كوبون خصم ١٥٪ مرتبط برقم هاتفك لاستخدامه في أي وقت!'
                  : 'Share your referral link with friends. Once they complete their first order, you will instantly receive a 15% OFF coupon bound to your mobile phone to apply on your next order!'}
              </p>
            </div>

            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-6 py-3.5 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-3 border-black rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-300 hover:translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] cursor-pointer shrink-0"
            >
              {locale === 'ar' ? 'احصل على رابط الإحالة' : 'Get Referral Link'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
