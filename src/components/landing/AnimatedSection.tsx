"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: Readonly<{ children: ReactNode; className?: string; delay?: number }>) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}