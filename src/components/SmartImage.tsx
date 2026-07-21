import { useState, useMemo } from 'react';
import { ImageOff } from 'lucide-react';

// Default artwork when an opportunity/article has no image_url set yet.
//
// This used to hand-pick specific Unsplash photo IDs from memory. That was
// the bug: several of those IDs didn't resolve to real photos, and there
// was no way to verify them without fetching each one individually. Lorem
// Picsum (picsum.photos) needs no ID guessing at all — its seed-based URLs
// deterministically return a real, working photo for any seed string, with
// no key and no lookup required. Confirmed still active and stable in 2026.
function fallbackImageUrl(seed: string, category?: string): string {
  const seedKey = `nsa-${category || 'default'}-${seed}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seedKey)}/900/600`;
}

interface SmartImageProps {
  /** The real image URL from the database, if one was set. */
  src?: string;
  /** Stable id (e.g. the row's id) used to pick a consistent fallback photo. */
  seed: string;
  /** Opportunity type or blog category — used to vary the fallback seed. */
  category?: string;
  alt: string;
  className?: string;
}

export default function SmartImage({ src, seed, category, alt, className = '' }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const fallbackUrl = useMemo(() => fallbackImageUrl(seed, category), [seed, category]);

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
          referrerPolicy="no-referrer"
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

