import { useState, useEffect, useRef } from 'react';
import { Mail, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

const DISMISS_KEY = 'nsa_newsletter_modal_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DELAY_MS = 60000; // 60 seconds

interface NewsletterModalProps {
  currentTab: string;
}

export default function NewsletterModal({ currentTab }: NewsletterModalProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const initialTabRef = useRef<string | null>(null);
  const suppressedRef = useRef(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
      suppressedRef.current = true;
      return;
    }

    initialTabRef.current = currentTab;

    const timer = setTimeout(() => {
      if (!suppressedRef.current && !shownRef.current) {
        shownRef.current = true;
        setVisible(true);
      }
    }, DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Second trigger: navigating to a second page/section.
  useEffect(() => {
    if (initialTabRef.current === null) {
      initialTabRef.current = currentTab;
      return;
    }
    if (currentTab !== initialTabRef.current && !suppressedRef.current && !shownRef.current) {
      shownRef.current = true;
      setVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setSubmitting(true);
    const response = await db.subscribeEmail(email);
    setSubmitting(false);

    if (response.success) {
      trackEvent('newsletter_signup', { source: 'popup_modal' });
      setStatus({ type: 'success', message: "You're in! Check your inbox soon." });
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      setTimeout(() => setVisible(false), 2200);
    } else {
      setStatus({ type: 'error', message: response.message });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="newsletter-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Subscribe to the newsletter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-void-deep/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:w-[26rem] bg-glass/95 backdrop-blur-md border border-white/15 rounded-3xl shadow-2xl shadow-emerald-500/10 p-7 text-center"
          >
            <button
              id="newsletter-modal-dismiss"
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-3 right-3 text-frost-dim hover:text-frost p-1.5 rounded-full hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-signal/15 border border-amber-signal/25 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-amber-signal" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-frost leading-snug">
              Never Miss a High-Value Opportunity!
            </h3>
            <p className="text-xs text-frost-dim mt-2 leading-relaxed max-w-xs mx-auto">
              Get the latest public health fellowships, funding grants, and career insights delivered straight to your inbox every week.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
              <input
                id="newsletter-modal-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-frost placeholder-frost-dim/60 text-center focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50 focus:border-amber-signal/50 transition-all duration-300 ease-out"
              />
              <button
                id="newsletter-modal-submit"
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-signal hover:bg-amber-signal-hover text-void font-extrabold text-xs py-3 rounded-xl shadow-md shadow-amber-signal/20 transition-all duration-300 ease-out cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {submitting ? 'Submitting...' : 'Get Weekly Updates'}
              </button>
            </form>

            <p className="text-[10px] text-frost-dim/70 mt-3">No spam. Unsubscribe anytime.</p>

            {status.type && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-center gap-1.5 mt-3 p-2 rounded-lg text-xs border ${
                  status.type === 'success'
                    ? 'bg-pulse/10 text-pulse border-pulse/25'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{status.message}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
