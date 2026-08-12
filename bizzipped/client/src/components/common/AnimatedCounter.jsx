import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';

export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    startRef.current = null;
    fromRef.current = display;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t;
    const elapsed = t - startRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const next = fromRef.current + (value - fromRef.current) * eased;
    setDisplay(next);
  });

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('en-NG');

  return (
    <motion.span className="mono">
      {prefix}
      {decimals > 0 ? Number(formatted).toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : formatted}
      {suffix}
    </motion.span>
  );
}
