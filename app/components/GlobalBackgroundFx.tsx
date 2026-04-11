'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function GlobalBackgroundFx() {
  const prefersReducedMotion = useReducedMotion();
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(pointer: fine)');
    const updateEnabled = () => setEnabled(media.matches);
    updateEnabled();

    media.addEventListener('change', updateEnabled);

    const onMove = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      media.removeEventListener('change', updateEnabled);
    };
  }, []);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-green-600/20 to-blue-600/20 opacity-10"
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        animate={
          prefersReducedMotion
            ? { backgroundColor: 'rgba(34,197,94,0.08)' }
            : {
              background: [
                'rgba(34,197,94,0.08)',
                'rgba(59,130,246,0.08)',
                'rgba(34,197,94,0.08)',
              ],
            }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </motion.div>
      {enabled && !prefersReducedMotion ? (
        <motion.div
          aria-hidden="true"
          className="site-cursor-glow"
          animate={{ x: cursor.x - 70, y: cursor.y - 70 }}
          transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.45 }}
        />
      ) : null}
    </>
  );
}
