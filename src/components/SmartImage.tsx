import { useState, useMemo } from 'react';
import { ImageOff } from 'lucide-react';

// Curated, real, hotlink-safe Unsplash photos used as default artwork when
// an opportunity/article has no image_url set yet. This deliberately does
// NOT use source.unsplash.com — that no-key random-image service was fully
// shut down by Unsplash in mid-2024. These are specific real photos on
// Unsplash's own CDN, grouped by theme.
const FALLBACK_POOLS = {
  health: [
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
  ],
  africa: [
    'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1516834474-48c0abc2a902?auto=format&fit=crop&q=80&w=1200',
  ],
  education: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
  ],
  research: [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
  ],
  professional: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200',
  ],
} as const;

type PoolKey = keyof typeof FALLBACK_POOLS;

const CATEGORY_POOL_MAP: Record<string, PoolKey> = {
  Fellowship: 'health',
  Internship: 'professional',
  Job: 'professional',
  Funding: 'research',
  Scholarship: 'education',
  Conference: 'research',
  'Career Guide': 'professional',
  'Public Health News': 'health',
  'Alumni Spotlight': 'education',
  'Academic Resource': 'research',
  'Policy & Innovation': 'africa',
};

// Deterministic so the same item always gets the same fallback photo
// instead of changing on every re-render.
function hashToIndex(seed: string, length: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

interface SmartImageProps {
  /** The real image URL from the database, if one was set. */
  src?: string;
  /** Stable id (e.g. the row's id) used to pick a consistent fallback photo. */
  seed: string;
  /** Opportunity type or blog category — used to pick a relevant fallback theme. */
  category?: string;
  alt: string;
  className?: string;
}

export default function SmartImage({ src, seed, category, alt, className = '' }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const fallbackUrl = useMemo(() => {
    const poolKey = (category && CATEGORY_POOL_MAP[category]) || 'health';
    const pool = FALLBACK_POOLS[poolKey] || FALLBACK_POOLS.health;
    return pool[hashToIndex(seed, pool.length)];
  }, [seed, category]);

  const resolvedSrc = !src || primaryFailed ? fallbackUrl : src;

  return (
    <div className={`relative overflow-hidden bg-glass ${className}`}>
      {!loaded && !fallbackFailed && (
        <div className="absolute inset-0 overflow-hidden bg-white/5">
          <div className="h-full w-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

      {fallbackFailed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-frost-dim/50 bg-void">
          <ImageOff className="w-6 h-6" />
          <span className="text-[9px] font-mono uppercase tracking-wider">No image</span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!primaryFailed) {
              setPrimaryFailed(true);
            } else {
              setFallbackFailed(true);
            }
          }}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
