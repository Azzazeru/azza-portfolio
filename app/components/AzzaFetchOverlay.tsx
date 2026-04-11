'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const infoRows = [
  { label: 'user', value: 'azzazeru' },
  { label: 'role', value: 'Full Stack Developer' },
  { label: 'focus', value: 'Backend / Cloud / DevOps' },
  { label: 'location', value: 'Santiago, Chile' },
  { label: 'status', value: 'Coding / lf job' },
];

export default function AzzaFetchOverlay() {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero-section');

    // Pages without Hero should keep the overlay visible on large screens.
    if (!hero) {
      const timer = window.setTimeout(() => {
        setShowOverlay(true);
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowOverlay(!entry.isIntersecting);
      },
      { threshold: 0.18 }
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {showOverlay ? (
        <>
          <motion.aside
            key="azzafetch-profile"
            aria-hidden="true"
            className="pointer-events-none fixed bottom-5 left-5 z-[30] hidden h-[196px] w-[280px] rounded-xl border border-green-500/30 bg-black/90 p-3.5 font-mono text-[11px] text-green-200 shadow-2xl shadow-black/50 lg:block"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -40, y: 8, scale: 0.98 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.9 }
                : { opacity: [0.86, 0.95, 0.86], x: 0, y: [0, -2, 0], scale: 1 }
            }
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -32, y: 6, scale: 0.985 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.18 }
                : {
                  opacity: { duration: 0.4 },
                  x: { duration: 0.45, ease: 'easeOut' },
                  y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 0.45, ease: 'easeOut' },
                }
            }
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/10 via-transparent to-blue-400/10" />
            <div className="relative flex h-full flex-col">
              <p className="mb-1.5 text-[10px] text-green-400/90">$ azzafetch --profile</p>
              <pre className="mb-2 text-[9px] leading-3.5 text-green-300/85">{`+-------------------------+
|        azzafetch        |
+-------------------------+`}</pre>

              <div className="space-y-1">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex items-start gap-1.5">
                    <span className="w-14 flex-shrink-0 text-green-400/80">{row.label}</span>
                    <span className="text-green-100/95">: {row.value}</span>
                  </div>
                ))}
              </div>

              <motion.div
                className="mt-auto h-px w-full bg-gradient-to-r from-transparent via-green-400/60 to-transparent"
                animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.95, 0.3] }}
                transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.aside>

          <motion.aside
            key="azzafetch-highlights"
            aria-hidden="true"
            className="pointer-events-none fixed bottom-5 right-5 z-[30] hidden h-[196px] w-[280px] rounded-xl border border-cyan-400/25 bg-black/85 p-3.5 font-mono text-[11px] text-cyan-100 shadow-xl shadow-black/40 lg:block"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 40, y: 8, scale: 0.98 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.9 }
                : { opacity: [0.78, 0.9, 0.78], x: 0, y: [0, -1, 0], scale: 1 }
            }
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 32, y: 6, scale: 0.985 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.18 }
                : {
                  opacity: { duration: 0.4 },
                  x: { duration: 0.45, ease: 'easeOut' },
                  y: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 0.45, ease: 'easeOut' },
                }
            }
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/8 via-transparent to-emerald-400/8" />
            <div className="relative flex h-full flex-col">
              <p className="text-[10px] text-cyan-300/90">$ azzafetch --xp</p>
              <div className="mt-2 space-y-1.5">
                <pre className="mb-2 text-[9px] leading-3.5 text-green-300/85">{`+-------------------------+
|        azzafetch        |
+-------------------------+`}</pre>
                <p className="text-cyan-100/90">learning... 2022 - Date.now()</p>
                <p className="text-cyan-100/80">fullstack dev 06/25 - 12/25</p>
                <p className="text-cyan-100/80">backend dev 02/25 - 10/25</p>
                <p className="text-cyan-100/80">ing informatica 2022 - 2025</p>
              </div>
              <motion.div
                className="mt-auto flex items-center gap-1"
                animate={prefersReducedMotion ? { opacity: 0.7 } : { opacity: [0.45, 1, 0.45] }}
                transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </motion.div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
