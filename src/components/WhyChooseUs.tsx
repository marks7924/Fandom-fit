'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Heart, Truck, Shirt, Compass, Sparkles, Scissors, Layers, CheckSquare 
} from 'lucide-react';

export default function WhyChooseUs() {
  const t = useTranslations('why_choose_us');

  const reasons = [
    {
      id: 1,
      title: t('egypt_made'),
      desc: t('egypt_made_desc'),
      icon: <Compass className="text-black" size={24} />,
      colorClass: 'bg-[#F2CC8F]'
    },
    {
      id: 2,
      title: t('ships_egypt'),
      desc: t('ships_egypt_desc'),
      icon: <Truck className="text-black" size={24} />,
      colorClass: 'bg-[#81B29A]'
    },
    {
      id: 3,
      title: t('premium_quality'),
      desc: t('premium_quality_desc'),
      icon: <Sparkles className="text-black" size={24} />,
      colorClass: 'bg-[#E07A5F]'
    },
    {
      id: 4,
      title: t('inspired_fandoms'),
      desc: t('inspired_fandoms_desc'),
      icon: <Heart className="text-black" size={24} />,
      colorClass: 'bg-[#3D405B]'
    },
    {
      id: 5,
      title: t('custom_available'),
      desc: t('custom_available_desc'),
      icon: <Scissors className="text-black" size={24} />,
      colorClass: 'bg-[#F2CC8F]'
    },
    {
      id: 6,
      title: t('unisex_clothing'),
      desc: t('unisex_clothing_desc'),
      icon: <Shirt className="text-black" size={24} />,
      colorClass: 'bg-[#81B29A]'
    },
    {
      id: 7,
      title: t('two_fabrics'),
      desc: t('two_fabrics_desc'),
      icon: <Layers className="text-black" size={24} />,
      colorClass: 'bg-[#E07A5F]'
    },
    {
      id: 8,
      title: t('multiple_sizes'),
      desc: t('multiple_sizes_desc'),
      icon: <CheckSquare className="text-black" size={24} />,
      colorClass: 'bg-[#3D405B]'
    }
  ];

  return (
    <section className="py-24 bg-[#EDE0D0] border-b-4 border-black relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-5xl font-black uppercase tracking-tight text-black">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg font-semibold text-black/70 font-handwriting">
            {t('subtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, idx) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform duration-200 flex flex-col items-center text-center"
            >
              {/* Icon Sticker */}
              <div className={`p-4 border-2 border-black rounded-full mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${reason.colorClass} ${reason.id % 4 === 0 ? 'text-white' : 'text-black'}`}>
                {/* Override svg colour if needed */}
                <span className={reason.id % 4 === 0 ? 'text-white [&>svg]:text-white' : '[&>svg]:text-black'}>
                  {reason.icon}
                </span>
              </div>

              <h3 className="text-lg font-black uppercase text-black">
                {reason.title}
              </h3>
              
              <p className="mt-2 text-xs font-semibold text-black/60 font-handwriting leading-relaxed">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
