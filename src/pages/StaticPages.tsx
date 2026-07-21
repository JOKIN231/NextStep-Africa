import React, { useState } from 'react';
import { Mail, MapPin, MessageCircle, Send, CheckCircle2, AlertTriangle, Compass, Target, Users } from 'lucide-react';
import { db } from '../lib/supabase';

interface PageProps {
  setCurrentTab: (tab: string) => void;
}

function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-left animate-fade-in">
      <div className="mb-10 border-b border-white/10 pb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-frost">{title}</h1>
        <p className="text-sm text-frost-dim mt-2">{subtitle}</p>
      </div>
      <div className="space-y-6 text-sm text-frost-dim leading-relaxed">{children}</div>
    </div>
  );
}

// ---------------- About ----------------
export function AboutPage(_props: PageProps) {
  return (
    <PageShell
      title="About NextStep Africa"
      subtitle="A career directory and insights hub for African public health talent."
    >
      <p>
        NextStep Africa curates fellowships, scholarships, internships, research grants,
        and career resources for students and professionals working in public health
        across the continent. We built this gateway because opportunities like these are
        often scattered across dozens of institutional websites, mailing lists, and social
        pages — our goal is to bring them into one place that's easy to search and act on.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 py-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
          <Compass className="w-5 h-5 text-pulse" />
          <h3 className="font-display font-bold text-frost text-sm">What we do</h3>
          <p className="text-xs">Curate and organize live public health opportunities across Africa and global institutions.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
          <Target className="w-5 h-5 text-amber-signal" />
          <h3 className="font-display font-bold text-frost text-sm">Our focus</h3>
          <p className="text-xs">Public health specifically — fellowships, funding, and career guidance suited to that field.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
          <Users className="w-5 h-5 text-glow-indigo" />
          <h3 className="font-display font-bold text-frost text-sm">Who it's for</h3>
          <p className="text-xs">African students, researchers, and early-to-mid career health professionals.</p>
        </div>
      </div>

      <h2 className="font-display font-bold text-lg text-frost pt-2">Our vision</h2>
      <p>
        We want NextStep Africa to become the first place a public health student or
        professional in Africa checks when looking for their next fellowship, grant, or
        career move — a trusted, continually updated directory rather than another
        newsletter that goes stale.
      </p>

      <h2 className="font-display font-bold text-lg text-frost pt-2">Where we're based</h2>
      <p>NextStep Africa is based in Monrovia, Liberia.</p>
    </PageShell>
  );
}

// ---------------- Contact ----------------
export function ContactPage(_props: PageProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const response = await db.submitContactMessage(form);
    setSubmitting(false);
    setStatus({ type: response.success ? 'success' : 'error', message: response.message });
    if (response.success) setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PageShell title="Contact Us" subtitle="Questions, corrections, or an opportunity to suggest — reach out any time.">
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <a href="mailto:nextstepafricahq@gmail.com" className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/25 transition-all duration-300 ease-out">
          <Mail className="w-4 h-4 text-pulse" />
          <span className="text-xs font-bold text-frost">Email</span>
          <span className="text-[11px] font-mono break-all">nextstepafricahq@gmail.com</span>
        </a>
        <a href="https://wa.me/231778527272" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/25 transition-all duration-300 ease-out">
          <MessageCircle className="w-4 h-4 text-amber-signal" />
          <span className="text-xs font-bold text-frost">WhatsApp</span>
          <span className="text-[11px] font-mono">+231 77 852 7272</span>
        </a>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
          <MapPin className="w-4 h-4 text-glow-indigo" />
          <span className="text-xs font-bold text-frost">Location</span>
          <span className="text-[11px] font-mono">Monrovia, Liberia</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            id="contact-name" required placeholder="Your name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-frost placeholder-frost-dim/50 focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50"
          />
          <input
            id="contact-email" type="email" required placeholder="Your email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-frost placeholder-frost-dim/50 focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50"
          />
        </div>
        <input
          id="contact-subject" required placeholder="Subject" value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-frost placeholder-frost-dim/50 focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50"
        />
        <textarea
          id="contact-message" required rows={4} placeholder="Your message" value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-frost placeholder-frost-dim/50 resize-none focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50"
        />
        <button
          id="contact-submit" type="submit" disabled={submitting}
          className="flex items-center justify-center gap-2 bg-amber-signal hover:bg-amber-signal-hover text-void font-bold text-xs py-2.5 px-5 rounded-lg transition-all duration-300 ease-out cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Sending...' : 'Send Message'}</span>
        </button>

        {status.type && (
          <div className={`flex items-center gap-1.5 p-2.5 rounded-lg text-xs border ${status.type === 'success' ? 'bg-pulse/10 text-pulse border-pulse/25' : 'bg-rose-500/10 text-rose-300 border-rose-500/25'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}
      </form>
      <p className="text-xs text-frost-dim/70">We do our best to respond as quickly as we can.</p>
    </PageShell>
  );
}

// ---------------- Privacy ----------------
export function PrivacyPage(_props: PageProps) {
  return (
    <PageShell title="Privacy Policy" subtitle="Last updated: July 2026">
      <p>This policy explains what information NextStep Africa collects and how it's used.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Information we collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Your email address, if you subscribe to our newsletter or submit the contact form.</li>
        <li>Basic usage data collected automatically via Google Analytics (gtag.js) — pages viewed, general location at a city/country level, device type, and how you interact with the site.</li>
      </ul>

      <h2 className="font-display font-bold text-frost text-base pt-2">Cookies & tracking</h2>
      <p>
        We use Google Analytics to understand how visitors use the site. Google Analytics
        uses cookies for this purpose. If we enable advertising (such as Google AdSense) in
        the future, Google and its partners may also use cookies to serve ads based on your
        visits to this and other sites. You can opt out of personalized advertising through
        Google's Ads Settings, and out of Analytics tracking using the Google Analytics
        opt-out browser add-on.
      </p>

      <h2 className="font-display font-bold text-frost text-base pt-2">How we use your information</h2>
      <p>
        Newsletter emails are used only to send opportunity updates you've signed up for.
        Contact form messages are used only to respond to your inquiry. We do not sell your
        personal information to third parties.
      </p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Third-party services</h2>
      <p>
        We use Supabase to store website data securely, and Google Analytics for site
        analytics. Each of these providers has its own privacy practices governing data they
        process on our behalf.
      </p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Your choices</h2>
      <p>You can unsubscribe from our newsletter at any time using the link in any email we send, or by contacting us directly.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Children's privacy</h2>
      <p>This site is not directed at children under 13, and we do not knowingly collect information from them.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Changes to this policy</h2>
      <p>We may update this policy from time to time. Changes will be posted on this page.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Contact</h2>
      <p>Questions about this policy can be sent to nextstepafricahq@gmail.com.</p>
    </PageShell>
  );
}

// ---------------- Terms ----------------
export function TermsPage(_props: PageProps) {
  return (
    <PageShell title="Terms of Service" subtitle="Last updated: July 2026">
      <h2 className="font-display font-bold text-frost text-base">Acceptance of terms</h2>
      <p>By using NextStep Africa, you agree to these terms. If you don't agree, please don't use the site.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">About the opportunities we list</h2>
      <p>
        NextStep Africa curates and aggregates publicly available opportunities —
        fellowships, scholarships, internships, jobs, and grants — from third-party
        organizations. <strong className="text-frost">We are not the hiring body or funding
        provider for any listing on this site.</strong> Deadlines, eligibility, and
        application details can change after we publish them — always confirm current
        details directly on the hosting organization's official application page before
        applying. We do our best to keep listings accurate but cannot guarantee outcomes or
        the accuracy of third-party information at all times.
      </p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Intellectual property</h2>
      <p>The NextStep Africa name, branding, and original written content (articles, guides) belong to NextStep Africa unless otherwise noted. Opportunity details belong to their respective organizations.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Limitation of liability</h2>
      <p>NextStep Africa is provided "as is." We aren't liable for losses arising from reliance on listings or content found here, including missed deadlines or third-party application outcomes.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Changes to these terms</h2>
      <p>We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.</p>

      <h2 className="font-display font-bold text-frost text-base pt-2">Contact</h2>
      <p>Questions about these terms can be sent to nextstepafricahq@gmail.com.</p>
    </PageShell>
  );
}
