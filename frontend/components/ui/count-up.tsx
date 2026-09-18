"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatNumber?: boolean;
  className?: string;
  rangeTo?: number; // Optional for ranges like 20-30%
}

export function CountUp({
  to,
  from = 0,
  duration = 2,
  prefix = "",
  suffix = "",
  formatNumber = false,
  className = "",
  rangeTo,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState<number>(from);
  const [rangeDisplayValue, setRangeDisplayValue] = useState<number>(rangeTo ? from : 0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Gentle ease-out
      onUpdate: (latest) => {
        setDisplayValue(Math.floor(latest));
      },
    });

    let rangeControls: { stop: () => void } | undefined;
    if (rangeTo !== undefined) {
      rangeControls = animate(from, rangeTo, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setRangeDisplayValue(Math.floor(latest));
        },
      });
    }

    return () => {
      controls.stop();
      if (rangeControls) rangeControls.stop();
    };
  }, [isInView, from, to, duration, rangeTo]);

  const format = (val: number) => {
    if (formatNumber) {
      return val.toLocaleString();
    }
    return val.toString();
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(displayValue)}
      {rangeTo !== undefined && `–${format(rangeDisplayValue)}`}
      {suffix}
    </span>
  );
}
