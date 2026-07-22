import { Opportunity } from '../types';

interface MetricBannerProps {
  opportunities: Opportunity[];
  loading: boolean;
}

export default function MetricBanner({ opportunities, loading }: MetricBannerProps) {
  const now = new Date();

  const active = opportunities.filter((o) => {
    const d = new Date(o.deadline);
    return !isNaN(d.getTime()) && d >= now;
  });

  const activeFellowships = active.filter((o) => o.opportunityType === 'Fellowship').length;
  const totalGrants = active.filter((o) => o.opportunityType === 'Funding').length;

  // "Major" deadline = the soonest one among featured listings; if none are
  // featured, fall back to the soonest across everything active.
  const featuredActive = active.filter((o) => o.featured);
  const deadlinePool = featuredActive.length > 0 ? featuredActive : active;
  const nextDeadlineMs =
    deadlinePool.length > 0
      ? Math.min(...deadlinePool.map((o) => new Date(o.deadline).getTime()))
      : null;
  const daysUntilNext =
    nextDeadlineMs !== null
      ? Math.max(0, Math.ceil((nextDeadlineMs - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  const stats = [
    {
      value: loading ? '—' : String(activeFellowships),
      label: 'Active Fellowships',
      tone: 'text-pulse',
      dot: 'bg-pulse',
    },
    {
      value: loading ? '—' : String(totalGrants),
      label: 'Grants Available',
      tone: 'text-frost',
      dot: 'bg-frost-dim',
    },
    {
      value: loading ? '—' : daysUntilNext === null ? 'None open' : `${daysUntilNext}d`,
      label: 'Next Major Deadline',
      tone: 'text-amber-signal',
      dot: 'bg-amber-signal',
      urgent: daysUntilNext !== null && daysUntilNext <= 7,
    },
  ];

  return (
    <div id="metric-banner" className="relative bg-void border-b border-white/10 overflow-hidden">
      {/* Signature: a soft trace sweeping the seam between nav and content,
          like a live monitor — one appearance per page, nothing more. */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/5 overflow-hidden">
        <div className="h-full w-1/3 bg-linear-to-r from-transparent via-pulse/70 to-transparent animate-pulse-line" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-white/10">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-center gap-3 py-4 sm:py-5">
              <span
                className={`relative w-2 h-2 rounded-full ${s.dot} shrink-0 ${
                  s.urgent ? 'animate-pulse-slow' : ''
                }`}
              >
                {s.urgent && (
                  <span className={`absolute inset-0 rounded-full ${s.dot} animate-ping opacity-75`} />
                )}
              </span>
              <div className="leading-tight text-center sm:text-left">
                <p className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight ${s.tone}`}>{s.value}</p>
                <p className="text-[8px] sm:text-[9px] font-bold text-frost-dim uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
