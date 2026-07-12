'use client';

import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#EDE0D0] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Dot grid background */}
      <div className="absolute inset-0 notebook-grid opacity-40" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Brand mark — animated crown + handwriting text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <BrandLogo color="black" textSize={2.8} />
        </motion.div>

        {/* Bouncing dots */}
        <div className="flex gap-3">
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
