import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { db } from '../lib/supabase';
import { motion } from 'motion/react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    const response = await db.subscribeEmail(email);
    setSubmitting(false);
    if (response.success) {
      setStatus({ type: 'success', message: response.message });
      setEmail('');
    } else {
      setStatus({ type: 'error', message: response.message });
    }

    setTimeout(() => {
      setStatus({ type: null, message: '' });
    }, 5000);
  };

  return (
    <footer id="app-footer" className="bg-slate-50 text-slate-600 pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-200/60">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center text-white transform group-hover:scale-105 transition-transform duration-200 shrink-0 shadow-xs">
                <div className="w-5 h-5 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
                  <span className="-rotate-45 text-[10px] font-extrabold font-mono select-none">NS</span>
                </div>
              </div>
              <span className="font-display font-bold text-xl text-brand-navy tracking-tight">
                NextStep<span className="text-brand-orange">Africa</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Empowering African students and professionals to lead the future of public health. Access fellowships, scholarships, internships, research funding, and career guidance tailored for the continent.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3">
            <div>
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-widest font-mono mb-4 border-l-2 border-brand-orange pl-2">
                Gateway
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button id="footer-link-home" onClick={() => setCurrentTab('home')} className="text-slate-500 hover:text-brand-orange transition-colors cursor-pointer text-left text-sm font-semibold">
                    Featured Opportunities
                  </button>
                </li>
                <li>
                  <button id="footer-link-opps" onClick={() => setCurrentTab('opportunities')} className="text-slate-500 hover:text-brand-orange transition-colors cursor-pointer text-left text-sm font-semibold">
                    Opportunities Directory
                  </button>
                </li>
                <li>
                  <button id="footer-link-blog" onClick={() => setCurrentTab('blog')} className="text-slate-500 hover:text-brand-orange transition-colors cursor-pointer text-left text-sm font-semibold">
                    Insights & Articles
                  </button>
                </li>
                <li>
                  <button id="footer-link-tracker" onClick={() => setCurrentTab('tracker')} className="text-slate-500 hover:text-brand-orange transition-colors cursor-pointer text-left text-sm font-semibold">
                    Personal Tracker
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-widest font-mono mb-4 border-l-2 border-brand-green pl-2">
                Admin
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button id="footer-link-admin" onClick={() => setCurrentTab('admin')} className="text-slate-500 hover:text-brand-green transition-colors cursor-pointer text-left text-sm font-semibold">
                    Admin Portal
                  </button>
                </li>
                <li>
                  <a href="https://africacdc.org" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-green transition-colors flex items-center space-x-1 text-sm font-semibold">
                    <span>Africa CDC</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href="https://who.int" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-green transition-colors flex items-center space-x-1 text-sm font-semibold">
                    <span>WHO Africa</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-widest font-mono border-l-2 border-brand-orange pl-2">
              Subscribe to NextStep Dispatch
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Get hand-picked public health fellowships, internships, and scholarships delivered directly to your inbox every Thursday. No spam. Unsubscribe anytime.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="newsletter-email-input"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-sm border border-slate-200 focus:border-brand-orange rounded-lg py-2.5 pl-9 pr-3 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-brand-orange transition-all"
                  />
                </div>
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {submitting ? '...' : 'Join'}
                </button>
              </div>

              {/* Status Message */}
              {status.type && (
                <motion.div
                  id="newsletter-status-alert"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-2 p-2.5 rounded-md text-xs ${
                    status.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{status.message}</span>
                </motion.div>
              )}
            </form>
          </div>
        </div>

        {/* copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-xs text-slate-400 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} NextStep Africa. All rights reserved.
          </div>
          <div className="flex space-x-6 items-center">
            <span>Optimized for SEO & Accessibility</span>
            <span className="text-brand-orange">•</span>
            <span>Made with Care for Africa</span>
            <span className="text-slate-300">•</span>
            <button
              id="footer-admin-link"
              onClick={() => setCurrentTab('admin')}
              className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
            >
              Team
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
