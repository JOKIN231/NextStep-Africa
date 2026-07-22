import { useState, useEffect, useRef } from 'react';
import { Download, X, Share, PlusSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DISMISS_KEY = 'nsa_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // don't re-nag for 14 days
const DELAY_MS = 30000; // 30 seconds

interface InstallPromptProps {
  /** The app's current tab/section — used to detect "clicked through to at
   * least one other page" without needing real client-side routing. */
  currentTab: string;
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
}

export default function InstallPrompt({ currentTab }: InstallPromptProps) {
  const [visible, setVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const deferredPromptRef = useRef<any>(null);
  const initialTabRef = useRef<string | null>(null);
  const eligibleRef = useRef(false);
  const suppressedRef = useRef(false); // already installed, or recently dismissed

  const tryReveal = () => {
    if (suppressedRef.current || !eligibleRef.current) return;
    // Android/Desktop only gets a banner once Chrome has actually handed us
    // a real installable event. iOS has no such event, so the delay alone
    // is enough — the button always opens the manual-steps modal there.
    if (isIOSDevice() || deferredPromptRef.current) {
      setVisible(true);
    }
  };

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (standalone) {
      suppressedRef.current = true;
      return;
    }

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
      suppressedRef.current = true;
      return;
    }

    setIsIOS(isIOSDevice());
    initialTabRef.current = currentTab;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      tryReveal();
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    const onInstalled = () => {
      suppressedRef.current = true;
      setVisible(false);
      setShowIOSModal(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    const timer = setTimeout(() => {
      eligibleRef.current = true;
      tryReveal();
    }, DELAY_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
    // Intentionally runs once — subsequent tab changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Second trigger path: navigating to at least one other section.
  useEffect(() => {
    if (initialTabRef.current === null) {
      initialTabRef.current = currentTab;
      return;
    }
    if (currentTab !== initialTabRef.current) {
      eligibleRef.current = true;
      tryReveal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
    setShowIOSModal(false);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    deferredPromptRef.current = null;
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  return (
    <>
      {/* Floating banner */}
      <AnimatePresence>
        {visible && !showIOSModal && (
          <motion.div
            id="install-prompt-banner"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[70]"
          >
            <div className="relative bg-glass/95 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl shadow-emerald-500/10 p-4 flex items-start gap-3">
              <button
                id="install-prompt-dismiss"
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-2 right-2 text-frost-dim hover:text-frost p-1 rounded-full hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="w-11 h-11 rounded-xl bg-void border border-white/15 flex items-center justify-center shrink-0">
                <div className="w-5 h-5 border-2 border-pulse rounded-xs rotate-45" />
              </div>
              <div className="flex-1 pr-4">
                <p className="font-display font-bold text-sm text-frost">Install NextStep Africa</p>
                <p className="text-xs text-frost-dim mt-0.5 leading-snug">
                  Add it to your home screen for one-tap access to new opportunities.
                </p>
                <button
                  id="install-prompt-cta"
                  onClick={handleInstallClick}
                  className="mt-3 flex items-center gap-1.5 bg-pulse hover:bg-pulse-hover text-void text-xs font-bold px-3.5 py-2 rounded-lg transition-all duration-300 ease-out active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Add to Home Screen</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS manual-steps modal */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            id="ios-install-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Install instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-void-deep/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={dismiss}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:w-96 bg-glass/95 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl shadow-emerald-500/10 p-6"
            >
              <button
                id="ios-install-modal-dismiss"
                onClick={dismiss}
                aria-label="Close"
                className="absolute top-3 right-3 text-frost-dim hover:text-frost p-1.5 rounded-full hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-void border border-white/15 flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-pulse rounded-xs rotate-45" />
              </div>

              <h3 className="font-display font-bold text-lg text-frost text-center">
                Install NextStep Africa
              </h3>
              <p className="text-xs text-frost-dim text-center mt-1.5 mb-6 leading-relaxed">
                Add this app to your Home Screen for instant, full-screen access — no App Store needed.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-pulse/20 text-pulse text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="text-xs text-frost flex items-center gap-1.5">
                    Tap the
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/15 text-frost"
                    >
                      <Share className="w-3.5 h-3.5" />
                    </motion.span>
                    Share icon in Safari's toolbar
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-pulse/20 text-pulse text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="text-xs text-frost flex items-center gap-1.5">
                    Scroll down and tap
                    <motion.span
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-frost-dim" />
                    </motion.span>
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-pulse/10 border border-pulse/25 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-pulse/20 text-pulse text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="text-xs text-frost flex items-center gap-1.5 font-semibold">
                    <PlusSquare className="w-3.5 h-3.5 text-pulse" />
                    Select "Add to Home Screen"
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
