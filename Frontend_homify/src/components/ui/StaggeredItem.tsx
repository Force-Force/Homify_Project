import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StaggeredItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function StaggeredItem({ children, index = 0, className = '' }: StaggeredItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggeredGrid({ children, className = '' }: StaggeredGridProps) {
  return <div className={className}>{children}</div>;
}
