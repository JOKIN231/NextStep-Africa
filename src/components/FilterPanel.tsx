import { X, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  oppTypeFilter: string;
  setOppTypeFilter: (val: string) => void;
  locationTypeFilter: string;
  setLocationTypeFilter: (val: string) => void;
  regionFilter: string;
  setRegionFilter: (val: string) => void;
  resultCount: number;
}

const CATEGORIES = ['All', 'Fellowship', 'Internship', 'Job', 'Funding', 'Scholarship', 'Conference'];
const LOCATION_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'];

export default function FilterPanel({
  open,
  onClose,
  oppTypeFilter,
  setOppTypeFilter,
  locationTypeFilter,
  setLocationTypeFilter,
  regionFilter,
  setRegionFilter,
  resultCount,
}: FilterPanelProps) {
  const hasActiveFilters = oppTypeFilter !== 'All' || locationTypeFilter !== 'All' || regionFilter.trim() !== '';

  const clearAll = () => {
    setOppTypeFilter('All');
    setLocationTypeFilter('All');
    setRegionFilter('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="filter-panel-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Filter opportunities"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-void-deep/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:h-full sm:w-96 bg-glass/95 backdrop-blur-md border-t sm:border-t-0 sm:border-l border-white/15 rounded-t-3xl sm:rounded-none shadow-2xl shadow-indigo-500/10 max-h-[85vh] sm:max-h-none flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <h3 className="font-display font-bold text-lg text-frost">Filter Opportunities</h3>
              <button
                id="filter-panel-close"
                onClick={onClose}
                aria-label="Close filters"
                className="text-frost-dim hover:text-frost p-1.5 rounded-full hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-7">
              {/* Category */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-frost-dim uppercase tracking-widest font-mono">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      id={`filter-category-${cat}`}
                      key={cat}
                      onClick={() => setOppTypeFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                        oppTypeFilter === cat
                          ? 'bg-pulse/15 border border-pulse/40 text-pulse'
                          : 'bg-white/5 border border-white/10 text-frost-dim hover:text-frost hover:bg-white/10'
                      }`}
                    >
                      {cat === 'Funding' ? 'Funding / Grant' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Type */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-frost-dim uppercase tracking-widest font-mono">Location Type</p>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_TYPES.map((loc) => (
                    <button
                      id={`filter-location-${loc}`}
                      key={loc}
                      onClick={() => setLocationTypeFilter(loc)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                        locationTypeFilter === loc
                          ? 'bg-glow-indigo/15 border border-glow-indigo/40 text-glow-indigo'
                          : 'bg-white/5 border border-white/10 text-frost-dim hover:text-frost hover:bg-white/10'
                      }`}
                    >
                      {loc === 'All' ? 'All Settings' : loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region / Country */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-frost-dim uppercase tracking-widest font-mono">Region / Country</p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-frost-dim" />
                  <input
                    id="filter-region-input"
                    type="text"
                    placeholder="e.g. Kenya, West Africa, Nairobi..."
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-frost placeholder-frost-dim/60 focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50 focus:border-amber-signal/50 transition-all duration-300 ease-out"
                  />
                </div>
                <p className="text-[10px] text-frost-dim/70 leading-relaxed">
                  Matches against each listing's location text — try a country, city, or "remote."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 shrink-0 space-y-2.5">
              <div className="text-center text-xs font-mono text-frost-dim">
                <span className="text-pulse font-bold">{resultCount}</span> opportunities match
              </div>
              <div className="flex gap-2.5">
                {hasActiveFilters && (
                  <button
                    id="filter-panel-clear"
                    onClick={clearAll}
                    className="flex items-center justify-center gap-1.5 flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-frost-dim hover:text-frost text-xs font-bold py-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  id="filter-panel-apply"
                  onClick={onClose}
                  className="flex-1 bg-pulse hover:bg-pulse-hover text-void text-xs font-bold py-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer active:scale-95"
                >
                  Show Results
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
