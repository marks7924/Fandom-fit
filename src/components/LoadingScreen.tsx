'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function LoadingScreen() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#EDE0D0] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Dot grid background */}
      <div className="absolute inset-0 notebook-grid opacity-40" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Smart Object Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          {/* Animated concentric ring around the logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 border-2 border-dashed border-black/30 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-36 h-36 border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center p-3"
          >
            {!imgError ? (
              <Image
                src="/logo/logo.jpg"
                alt="Fandom Fit Logo"
                fill
                priority
                unoptimized
                onError={() => setImgError(true)}
                className="object-contain p-2"
              />
            ) : (
              <span className="font-handwriting text-2xl font-bold tracking-tight text-black">
                Fandom Fit
              </span>
            )}
          </motion.div>
        </motion.div>

        {/* Brand name and taglines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col items-center leading-none mt-2"
        >
          <span className="text-xl font-black uppercase tracking-widest text-black">
            FANDOM FIT
          </span>
          <motion.span
            className="font-handwriting text-sm text-black/60 mt-1.5"
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Wear What You Love.
          </motion.span>
        </motion.div>

        {/* Bouncing dots loader */}
        <div className="flex gap-2.5 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-black"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
