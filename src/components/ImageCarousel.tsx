import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Opportunity } from '../types';

interface Slide {
  imageUrl: string;
  fallbackGradient: string;
  badge: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
}

// Curated, real, hotlink-safe Unsplash photos — wide/landscape framing
// suited to a hero-adjacent banner. Distinct set from SmartImage's card
// fallback pool so the page doesn't repeat the same images twice.
const BACKGROUND_POOL = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=1600',
];

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #0B132B 0%, #141B3A 60%, #0B132B 100%)',
  'linear-gradient(135deg, #141B3A 0%, #0B132B 70%, #070C1C 100%)',
  'linear-gradient(135deg, #0B132B 0%, #1e2a52 60%, #0B132B 100%)',
  'linear-gradient(135deg, #070C1C 0%, #141B3A 65%, #0B132B 100%)',
  'linear-gradient(135deg, #141B3A 0%, #0B132B 55%, #1e2a52 100%)',
];

const GENERIC_SLIDES: Omit<Slide, 'imageUrl' | 'fallbackGradient'>[] = [
  {
    badge: 'Gateway Spotlight',
    headline: 'Fellowships built for African health leaders',
    subtext: 'Fully funded programs at Africa CDC, WHO, and global health institutions.',
    ctaLabel: 'Browse Opportunities',
  },
  {
    badge: 'New This Week',
    headline: 'Research grants for disease surveillance',
    subtext: 'Funding for African-led public health research and innovation.',
    ctaLabel: 'View Grants',
  },
  {
    badge: 'Career Growth',
    headline: 'Internships at regional health agencies',
    subtext: 'Hands-on experience with WHO Africa and continental health bodies.',
    ctaLabel: 'Explore Internships',
  },
  {
    badge: 'Academic Path',
    headline: 'Postgraduate scholarships across the continent',
    subtext: 'Fully funded Masters and PhD placements in public health fields.',
    ctaLabel: 'See Scholarships',
  },
  {
    badge: 'Stay Sharp',
    headline: 'Guides written by fellowship alumni',
    subtext: 'Real application strategy from people who got in.',
    ctaLabel: 'Read Insights',
  },
];

interface ImageCarouselProps {
  featuredOpportunities: Opportunity[];
  onSlideCta: (opp?: Opportunity) => void;
}

export default function ImageCarousel({ featuredOpportunities, onSlideCta }: ImageCarouselProps) {
  const slideCount = Math.min(5, Math.max(3, featuredOpportunities.length > 0 ? Math.min(5, featuredOpportunities.length) : 5));

  // Build slides: real featured opportunities drive the overlay copy where
  // available, generic branded messaging fills any remaining slots.
  const slides: (Slide & { opp?: Opportunity })[] = Array.from({ length: slideCount }).map((_, i) => {
    const opp = featuredOpportunities[i];
    const base = opp
      ? {
          badge: opp.opportunityType,
          headline: opp.title,
          subtext: `${opp.organization} — ${opp.location}`,
          ctaLabel: 'View Details',
        }
      : GENERIC_SLIDES[i % GENERIC_SLIDES.length];
    return {
      ...base,
      imageUrl: BACKGROUND_POOL[i % BACKGROUND_POOL.length],
      fallbackGradient: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
      opp,
    };
  });

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = useCallback(
    (index: number, dir: number) => {
      setDirection(dir);
      setActive(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(active + 1, 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1, -1), [active, goTo]);

  useEffect(() => {
    if (paused || prefersReducedMotion || slides.length <= 1) return;
    timerRef.current = setTimeout(next, 5500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, prefersReducedMotion, slides.length, next]);

  const current = slides[active];

  return (
    <div
      id="home-image-carousel"
      className="relative w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {failedImages[active] ? (
            <div className="absolute inset-0" style={{ background: current.fallbackGradient }} />
          ) : (
            <img
              src={current.imageUrl}
              alt={current.headline}
              loading={active === 0 ? 'eager' : 'lazy'}
              onError={() => setFailedImages((prev) => ({ ...prev, [active]: true }))}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Legibility gradient under the overlay text */}
          <div className="absolute inset-0 bg-linear-to-t from-void-deep/90 via-void-deep/20 to-transparent" />

          {/* Overlay content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 bg-amber-signal/90 text-void text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 font-mono">
              {current.badge}
            </span>
            <h3 className="font-display font-extrabold text-lg sm:text-2xl text-frost leading-snug max-w-lg line-clamp-2">
              {current.headline}
            </h3>
            <p className="text-xs sm:text-sm text-frost-dim mt-1.5 max-w-md line-clamp-1">
              {current.subtext}
            </p>
            <button
              id="carousel-cta-btn"
              onClick={() => onSlideCta(current.opp)}
              className="mt-4 w-fit flex items-center gap-1.5 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-frost text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 ease-out cursor-pointer active:scale-95"
            >
              <span>{current.ctaLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {slides.length > 1 && (
        <>
          <button
            id="carousel-prev-btn"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-void-deep/50 backdrop-blur-md border border-white/15 text-frost flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-70 transition-all duration-300 ease-out cursor-pointer hover:bg-void-deep/70"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="carousel-next-btn"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-void-deep/50 backdrop-blur-md border border-white/15 text-frost flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-70 transition-all duration-300 ease-out cursor-pointer hover:bg-void-deep/70"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                id={`carousel-dot-${i}`}
                key={i}
                onClick={() => goTo(i, i > active ? 1 : -1)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-out cursor-pointer ${
                  i === active ? 'w-5 bg-amber-signal' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
