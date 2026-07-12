'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#EDE0D0] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Dot grid background */}
      <div className="absolute inset-0 notebook-grid opacity-40" />

      <div className="relative flex flex-col items-center gap-4">
        {/* Brand name — same handwriting mark as navbar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center leading-none"
        >
          <span className="text-[clamp(2.5rem,10vw,4.5rem)] font-black uppercase tracking-tight text-black">
            FANDOM
          </span>
          <motion.span
            className="font-handwriting text-[clamp(2rem,8vw,3.5rem)] text-black -mt-2"
            animate={{ rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            Fit
          </motion.span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-handwriting text-sm text-black/50 tracking-wide"
        >
          Wear What You Love.
        </motion.p>

        {/* Bouncing dots */}
        <div className="flex gap-3 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-black"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.55,
                repeat: Infinity,
                delay: i * 0.13,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
