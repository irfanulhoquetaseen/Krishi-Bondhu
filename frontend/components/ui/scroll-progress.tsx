"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-forest-950/20 z-[100] pointer-events-none">
      <motion.div
        className="h-full bg-amber origin-left shadow-amberGlow"
        style={{ scaleX }}
      />
    </div>
  );
}
