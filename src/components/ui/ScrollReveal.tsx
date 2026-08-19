'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type AnimationType = 'fade' | 'pop' | 'slide-up' | 'slide-left' | 'slide-right';

export function ScrollReveal({
  children,
  animation = 'slide-up',
  delay = 0,
  duration = 0.6,
  className = '',
}: {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const variants = {
    hidden: {
      opacity: 0,
      y: animation === 'slide-up' ? 30 : 0,
      x: animation === 'slide-left' ? 30 : animation === 'slide-right' ? -30 : 0,
      scale: animation === 'pop' ? 0.9 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration, delay, ease: [0.25, 0.4, 0.25, 1] as const },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
