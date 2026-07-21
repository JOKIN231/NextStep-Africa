import React, { useState, useEffect } from 'react';
import { db, isSupabaseConfigured, supabase } from '../lib/supabase';
import { Opportunity, BlogPost, Subscriber } from '../types';
import {
  KeyRound, ShieldAlert, Plus, Edit2, Trash2, Mail, Download, Rss, Eye, Globe,
  Settings, CheckSquare, RefreshCw, LogOut, CheckCircle2, ChevronRight, FileText, Sparkles, Sliders,
  LayoutGrid, Users, BarChart3, Info, AlignLeft, Search as SearchIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPortalProps {
  opportunities: Opportunity[];
  blogs: BlogPost[];
  onAddOpportunity: (opp: Opportunity) => void;
  onEditOpportunity: (opp: Opportunity) => void;
  onDeleteOpportunity: (id: string) => void;
  onAddBlog: (post: BlogPost) => void;
  onEditBlog: (post: BlogPost) => void;
  onDeleteBlog: (id: string) => void;
  triggerRSSFeed: () => void;
  triggerSitemap: () => void;
}

export default function AdminPortal({
  opportunities,
  blogs,
  onAddOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onAddBlog,
  onEditBlog,
  onDeleteBlog,
  triggerRSSFeed,
  triggerSitemap,
}: AdminPortalProps) {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'opps' | 'blogs' | 'subscribers' | 'seo' | 'settings'>('opps');

  // Which section of each content-builder form is showing
  const [oppFormSection, setOppFormSection] = useState<'basic' | 'details' | 'seo'>('basic');
  const [blogFormSection, setBlogFormSection] = useState<'basic' | 'content' | 'seo'>('basic');

  // Subscriber list
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Editing Forms
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [oppForm, setOppForm] = useState<Omit<Opportunity, 'id' | 'viewsCount' | 'publishedAt'>>({
    title: '',
    organization: '',
    opportunityType: 'Fellowship',
    locationType: 'Remote',
    location: '',
    description: '',
    eligibility: '',
    benefits: '',
    deadline: '',
    applyUrl: '',
    tags: [],
    featured: false,
    imageUrl: '',
  });
  const [tagInput, setTagInput] = useState('');

  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<Omit<BlogPost, 'id' | 'viewsCount' | 'publishedAt' | 'readTimeMin'>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: {
      name: '',
      role: '',
      avatarUrl: 'https://picsum.photos/seed/nsa-default-author/200/200',
    },
    category: 'Career Guide',
    tags: [],
    imageUrl: 'https://picsum.photos/seed/nsa-default-blog/1200/800',
    featured: false,
    status: 'published',
  });
  const [blogTagInput, setBlogTagInput] = useState('');

  useEffect(() => {
    // Real Supabase Auth session — not a client-side flag, so it can't be
    // spoofed by editing localStorage, and it's what Row Level Security
    // actually checks on every read/write.
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) db.getSubscribers().then(setSubscribers);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) db.getSubscribers().then(setSubscribers);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!supabase) {
      setAuthError('Supabase is not configured on this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as environment variables in Cloudflare Pages, then redeploy.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setIsLoggedIn(true);
      }
    } catch (err) {
      setAuthError('Authentication failed. Check your network or credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  // Opportunity Save Actions
  const handleOppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    const finalOpp: Opportunity = {
      id: editingOppId || (crypto.randomUUID ? crypto.randomUUID() : `opp-${Date.now()}`),
      ...oppForm,
      tags: tagsArray.length > 0 ? tagsArray : oppForm.tags,
      publishedAt: new Date().toISOString(),
      viewsCount: editingOppId ? (opportunities.find(o => o.id === editingOppId)?.viewsCount || 0) : 0,
    };

    if (editingOppId) {
      onEditOpportunity(finalOpp);
      setEditingOppId(null);
    } else {
      onAddOpportunity(finalOpp);
    }

    // Reset Form
    setOppForm({
      title: '',
      organization: '',
      opportunityType: 'Fellowship',
      locationType: 'Remote',
      location: '',
      description: '',
      eligibility: '',
      benefits: '',
      deadline: '',
      applyUrl: '',
      tags: [],
      featured: false,
      imageUrl: '',
    });
    setTagInput('');
    setOppFormSection('basic');
  };

  const startEditOpp = (opp: Opportunity) => {
    setEditingOppId(opp.id);
    setOppForm({
      title: opp.title,
      organization: opp.organization,
      opportunityType: opp.opportunityType,
      locationType: opp.locationType,
      location: opp.location,
      description: opp.description,
      eligibility: opp.eligibility,
      benefits: opp.benefits,
      deadline: opp.deadline,
      applyUrl: opp.applyUrl,
      tags: opp.tags,
      featured: opp.featured,
      imageUrl: opp.imageUrl || '',
    });
    setTagInput(opp.tags.join(', '));
    setOppFormSection('basic');
  };

  // Blog Save Actions
  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = blogTagInput.split(',').map(t => t.trim()).filter(Boolean);
    const generatedSlug = blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalPost: BlogPost = {
      id: editingBlogId || (crypto.randomUUID ? crypto.randomUUID() : `blog-${Date.now()}`),
      ...blogForm,
      slug: blogForm.slug || generatedSlug,
      tags: tagsArray.length > 0 ? tagsArray : blogForm.tags,
      publishedAt: new Date().toISOString(),
      readTimeMin: Math.max(1, Math.ceil(blogForm.content.split(' ').length / 200)),
      viewsCount: editingBlogId ? (blogs.find(b => b.id === editingBlogId)?.viewsCount || 0) : 0,
    };

    if (editingBlogId) {
      onEditBlog(finalPost);
      setEditingBlogId(null);
    } else {
      onAddBlog(finalPost);
    }

    setBlogForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: {
        name: '',
        role: '',
        avatarUrl: 'https://picsum.photos/seed/nsa-default-author/200/200',
      },
      category: 'Career Guide',
      tags: [],
      imageUrl: 'https://picsum.photos/seed/nsa-default-blog/1200/800',
      featured: false,
      status: 'published',
    });
    setBlogTagInput('');
    setBlogFormSection('basic');
  };

  const startEditBlog = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags,
      imageUrl: post.imageUrl,
      featured: post.featured,
      status: post.status,
    });
    setBlogTagInput(post.tags.join(', '));
    setBlogFormSection('basic');
  };

  // Export Subscribers to CSV
  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["ID,Email,SubscribedAt,Status"].join("\n") + "\n"
      + subscribers.map(s => `${s.id},${s.email},${s.subscribedAt},${s.status}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nextstep_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---- Status badge helpers ----
  const isOppLive = (opp: Opportunity) => {
    if (opp.deadline.toLowerCase() === 'rolling') return true;
    const d = new Date(opp.deadline);
    return !isNaN(d.getTime()) && d >= new Date();
  };

  const StatusBadge = ({ tone, label }: { tone: 'live' | 'draft' | 'scheduled' | 'closed'; label: string }) => {
    const styles: Record<string, string> = {
      live: 'bg-pulse/15 text-pulse border-pulse/30',
      scheduled: 'bg-amber-signal/15 text-amber-signal border-amber-signal/30',
      draft: 'bg-glow-indigo/15 text-glow-indigo border-glow-indigo/30',
      closed: 'bg-white/5 text-frost-dim/60 border-white/10',
    };
    return (
      <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full border tracking-wider ${styles[tone]}`}>
        {label}
      </span>
    );
  };

  // ---- Real metrics (no mocked numbers — computed straight from live data) ----
  const totalViews = opportunities.reduce((sum, o) => sum + o.viewsCount, 0) + blogs.reduce((sum, b) => sum + b.viewsCount, 0);
  const liveOppsCount = opportunities.filter(isOppLive).length;
  const publishedBlogsCount = blogs.filter(b => b.status === 'published').length;
  const draftBlogsCount = blogs.filter(b => b.status === 'draft' || b.status === 'scheduled').length;

  if (!isLoggedIn) {
    return (
      <div id="admin-login-screen" className="bg-void-deep -mt-px py-16">
      <div className="max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-glass/70 backdrop-blur-md border border-white/15 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
          <div className="bg-void p-6 text-center border-b border-white/10">
            <div className="w-12 h-12 rounded-xl bg-glass border border-white/15 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 border-2 border-pulse rounded-xs rotate-45" />
            </div>
            <h2 className="font-display font-bold text-lg text-frost">NextStep Admin Portal</h2>
            <p className="text-xs text-frost-dim mt-1">Provide credential keys to manage Gateway content</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs p-3 rounded-xl flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="bg-amber-signal/10 border border-amber-signal/25 text-amber-signal text-[11px] p-3 rounded-xl leading-normal">
                <p className="font-bold mb-1">⚠️ Supabase is not configured</p>
                Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> as environment
                variables in your Cloudflare Pages project settings, then redeploy. No
                admin login is possible until this is set.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-frost-dim">Email Address</label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@nextstepafrica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 text-sm border border-white/10 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50 focus:border-amber-signal/50 transition-all duration-300 ease-out text-frost placeholder-frost-dim/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-frost-dim">Access Token / Password</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 text-sm border border-white/10 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-signal/50 focus:border-amber-signal/50 transition-all duration-300 ease-out text-frost placeholder-frost-dim/50"
              />
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-signal hover:bg-amber-signal-hover text-void font-bold text-xs py-3 rounded-xl shadow-md shadow-amber-signal/20 transition-all duration-300 ease-out flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Verifying access...' : 'Secure Authorization'}</span>
            </button>
          </form>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-layout" className="bg-void-deep -mt-px">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-glass/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-glass border border-white/15 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-frost">Gateway Publisher Workspace</h1>
            <p className="text-xs text-frost-dim">Manage real-time opportunities, articles, and SEO diagnostics.</p>
          </div>
        </div>

        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3.5 py-1.5 rounded-lg hover:bg-rose-500/20 transition-all duration-300 ease-out cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit workspace</span>
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Live Opportunities', value: liveOppsCount, icon: LayoutGrid, tone: 'text-pulse', dot: 'bg-pulse' },
          { label: 'Published Articles', value: publishedBlogsCount, icon: FileText, tone: 'text-glow-indigo', dot: 'bg-glow-indigo' },
          { label: 'Newsletter Subscribers', value: subscribers.length, icon: Users, tone: 'text-amber-signal', dot: 'bg-amber-signal' },
          { label: 'Total Content Views', value: totalViews, icon: BarChart3, tone: 'text-frost', dot: 'bg-frost-dim' },
        ].map((m, i) => (
          <div key={i} id={`admin-metric-${i}`} className="bg-glass/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <m.icon className={`w-4 h-4 ${m.tone}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            </div>
            <p className={`font-mono font-extrabold text-2xl ${m.tone}`}>{m.value}</p>
            <p className="text-[9px] font-bold text-frost-dim uppercase tracking-widest">{m.label}</p>
          </div>
        ))}
      </div>
      {draftBlogsCount > 0 && (
        <p className="text-[11px] text-frost-dim font-mono -mt-2">
          + {draftBlogsCount} article{draftBlogsCount !== 1 ? 's' : ''} in draft/scheduled, not counted above
        </p>
      )}

      {/* Tabs list */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-1">
        {[
          { id: 'opps', label: 'Opportunities Directory' },
          { id: 'blogs', label: 'Insights & Articles' },
          { id: 'subscribers', label: 'Email subscribers' },
          { id: 'seo', label: 'SEO & Marketing Live' },
          { id: 'settings', label: 'Feeds & System' },
        ].map(tab => (
          <button
            id={`admin-tab-btn-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-xs font-bold px-4 py-2.5 rounded-t-lg border-b-2 transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'border-amber-signal text-frost'
                : 'border-transparent text-frost-dim hover:text-frost'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contents based on activeAdminTab */}
      <div className="bg-glass/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[50vh]">

        {/* TAB 1: OPPORTUNITIES MANAGER */}
        {activeTab === 'opps' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Form to Create/Edit */}
            <form onSubmit={handleOppSubmit} className="lg:col-span-5 space-y-4 bg-white/5 p-5 rounded-2xl border border-white/10">
              <h3 className="font-display font-bold text-sm text-frost border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span>{editingOppId ? 'Modify Opportunity' : 'Launch New Opportunity'}</span>
                <Sparkles className="w-4 h-4 text-amber-signal" />
              </h3>

              {/* Section tabs */}
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg text-[11px] font-bold">
                {[
                  { id: 'basic', label: 'Basic Info', icon: Info },
                  { id: 'details', label: 'Details', icon: AlignLeft },
                  { id: 'seo', label: 'SEO & Media', icon: SearchIcon },
                ].map(sec => (
                  <button
                    id={`opp-form-section-${sec.id}`}
                    key={sec.id}
                    type="button"
                    onClick={() => setOppFormSection(sec.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md transition-all duration-300 ease-out cursor-pointer ${
                      oppFormSection === sec.id ? 'bg-pulse/15 text-pulse' : 'text-frost-dim hover:text-frost'
                    }`}
                  >
                    <sec.icon className="w-3 h-3" />
                    <span>{sec.label}</span>
                  </button>
                ))}
              </div>

              {oppFormSection === 'basic' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Opportunity Type</label>
                      <select
                        id="opp-type-select"
                        value={oppForm.opportunityType}
                        onChange={(e) => setOppForm({ ...oppForm, opportunityType: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost"
                      >
                        {['Fellowship', 'Internship', 'Job', 'Funding', 'Scholarship', 'Conference'].map(t => (
                          <option key={t} value={t} className="bg-void">{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Location Setting</label>
                      <select
                        id="opp-loc-type-select"
                        value={oppForm.locationType}
                        onChange={(e) => setOppForm({ ...oppForm, locationType: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost"
                      >
                        {['Remote', 'Hybrid', 'On-site'].map(l => (
                          <option key={l} value={l} className="bg-void">{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Opportunity Title</label>
                    <input
                      id="opp-title-input"
                      type="text"
                      required
                      placeholder="e.g. Africa CDC Health Informatics Fellowship"
                      value={oppForm.title}
                      onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Hosting Organization</label>
                      <input
                        id="opp-org-input"
                        type="text"
                        required
                        placeholder="e.g. Africa CDC"
                        value={oppForm.organization}
                        onChange={(e) => setOppForm({ ...oppForm, organization: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Location / City</label>
                      <input
                        id="opp-location-input"
                        type="text"
                        required
                        placeholder="e.g. Addis Ababa, Ethiopia"
                        value={oppForm.location}
                        onChange={(e) => setOppForm({ ...oppForm, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {oppFormSection === 'details' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Opportunity Description</label>
                    <textarea
                      id="opp-desc-input"
                      required
                      rows={3}
                      placeholder="Summarize the role and organizational impact..."
                      value={oppForm.description}
                      onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 resize-none text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Eligibility Criteria</label>
                    <textarea
                      id="opp-elig-input"
                      required
                      rows={2}
                      placeholder="Specify degrees, country requirements, and working experience..."
                      value={oppForm.eligibility}
                      onChange={(e) => setOppForm({ ...oppForm, eligibility: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 resize-none text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Benefits & Stipend Packages</label>
                    <textarea
                      id="opp-benefits-input"
                      required
                      rows={2}
                      placeholder="Specify funding cap, tuition waiver, return flight, insurance..."
                      value={oppForm.benefits}
                      onChange={(e) => setOppForm({ ...oppForm, benefits: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 resize-none text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Application Deadline</label>
                      <input
                        id="opp-deadline-input"
                        type="text"
                        required
                        placeholder="YYYY-MM-DD or 'Rolling'"
                        value={oppForm.deadline}
                        onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Direct Application URL</label>
                      <input
                        id="opp-apply-url"
                        type="url"
                        required
                        placeholder="https://africacdc.org/apply"
                        value={oppForm.applyUrl}
                        onChange={(e) => setOppForm({ ...oppForm, applyUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {oppFormSection === 'seo' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Cover Image URL (optional)</label>
                    <input
                      id="opp-image-url"
                      type="url"
                      placeholder="https://images.unsplash.com/... — leave blank to auto-use a themed placeholder"
                      value={oppForm.imageUrl}
                      onChange={(e) => setOppForm({ ...oppForm, imageUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Keywords / Tags (Comma separated)</label>
                    <input
                      id="opp-tags-input"
                      type="text"
                      placeholder="Epidemiology, Policy, Malaria, Leadership"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <input
                      id="opp-featured-check"
                      type="checkbox"
                      checked={oppForm.featured}
                      onChange={(e) => setOppForm({ ...oppForm, featured: e.target.checked })}
                      className="rounded text-amber-signal focus:ring-amber-signal"
                    />
                    <label className="font-bold text-frost-dim">Feature this opportunity on Homepage</label>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {editingOppId && (
                  <button
                    id="opp-cancel-edit"
                    type="button"
                    onClick={() => {
                      setEditingOppId(null);
                      setOppForm({
                        title: '',
                        organization: '',
                        opportunityType: 'Fellowship',
                        locationType: 'Remote',
                        location: '',
                        description: '',
                        eligibility: '',
                        benefits: '',
                        deadline: '',
                        applyUrl: '',
                        tags: [],
                        featured: false,
                        imageUrl: '',
                      });
                      setTagInput('');
                      setOppFormSection('basic');
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-frost-dim font-bold text-xs py-2 rounded-lg cursor-pointer transition-all duration-300 ease-out"
                  >
                    Cancel
                  </button>
                )}
                <button
                  id="opp-save-submit"
                  type="submit"
                  className="flex-1 bg-amber-signal hover:bg-amber-signal-hover text-void font-bold text-xs py-2.5 rounded-lg transition-all duration-300 ease-out cursor-pointer active:scale-95"
                >
                  {editingOppId ? 'Save Requirements' : 'Publish Opportunity'}
                </button>
              </div>
            </form>

            {/* List to Edit/Delete */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display font-bold text-sm text-frost border-b border-white/10 pb-1.5">
                Active Opportunities ({opportunities.length})
              </h3>

              <div className="border border-white/10 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
                <table id="admin-opps-table" className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-glass text-frost-dim uppercase font-mono font-bold border-b border-white/10">
                      <th className="p-3">Listing</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {opportunities.map(opp => (
                      <tr id={`admin-opp-row-${opp.id}`} key={opp.id} className="hover:bg-white/5 transition-colors duration-300">
                        <td className="p-3">
                          <span className="text-[9px] uppercase font-mono font-bold text-amber-signal block">
                            {opp.opportunityType}
                          </span>
                          <h4 className="font-display font-bold text-xs text-frost line-clamp-1">{opp.title}</h4>
                          <p className="text-[10px] text-frost-dim font-mono">{opp.organization} • {opp.location}</p>
                        </td>
                        <td className="p-3">
                          <StatusBadge tone={isOppLive(opp) ? 'live' : 'closed'} label={isOppLive(opp) ? 'Live' : 'Closed'} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              id={`edit-opp-row-btn-${opp.id}`}
                              onClick={() => startEditOpp(opp)}
                              className="p-1.5 rounded-lg text-frost-dim hover:text-frost hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
                              title="Edit requirements"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-opp-row-btn-${opp.id}`}
                              onClick={() => onDeleteOpportunity(opp.id)}
                              className="p-1.5 rounded-lg text-frost-dim hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300 ease-out cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLES WRITER MANAGER */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Form to Create/Edit */}
            <form onSubmit={handleBlogSubmit} className="lg:col-span-6 space-y-4 bg-white/5 p-5 rounded-2xl border border-white/10">
              <h3 className="font-display font-bold text-sm text-frost border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span>{editingBlogId ? 'Modify Blog Post' : 'Compose Insights / Article'}</span>
                <Sliders className="w-4 h-4 text-amber-signal" />
              </h3>

              {/* Section tabs */}
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg text-[11px] font-bold">
                {[
                  { id: 'basic', label: 'Basic Info', icon: Info },
                  { id: 'content', label: 'Content', icon: AlignLeft },
                  { id: 'seo', label: 'SEO & Media', icon: SearchIcon },
                ].map(sec => (
                  <button
                    id={`blog-form-section-${sec.id}`}
                    key={sec.id}
                    type="button"
                    onClick={() => setBlogFormSection(sec.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md transition-all duration-300 ease-out cursor-pointer ${
                      blogFormSection === sec.id ? 'bg-pulse/15 text-pulse' : 'text-frost-dim hover:text-frost'
                    }`}
                  >
                    <sec.icon className="w-3 h-3" />
                    <span>{sec.label}</span>
                  </button>
                ))}
              </div>

              {blogFormSection === 'basic' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Category</label>
                      <select
                        id="blog-cat-select"
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost"
                      >
                        {['Career Guide', 'Public Health News', 'Alumni Spotlight', 'Academic Resource', 'Policy & Innovation'].map(c => (
                          <option key={c} value={c} className="bg-void">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Publishing Status</label>
                      <select
                        id="blog-status-select"
                        value={blogForm.status}
                        onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost"
                      >
                        {['draft', 'published', 'scheduled'].map(s => (
                          <option key={s} value={s} className="bg-void">{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Article Title</label>
                    <input
                      id="blog-title-input"
                      type="text"
                      required
                      placeholder="e.g. Master the epidemiology application essay"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Custom URL Slug (Leave blank for auto)</label>
                    <input
                      id="blog-slug-input"
                      type="text"
                      placeholder="master-epidemiology-essay"
                      value={blogForm.slug}
                      onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 font-mono text-frost placeholder-frost-dim/50"
                    />
                  </div>
                </div>
              )}

              {blogFormSection === 'content' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Short Excerpt (SEO Summary)</label>
                    <textarea
                      id="blog-excerpt-input"
                      required
                      rows={2}
                      placeholder="Provide a 2-sentence visual snippet to capture social feed views..."
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 resize-none text-frost placeholder-frost-dim/50"
                    />
                  </div>

                  {/* Author info nested fields */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Author Name</label>
                      <input
                        id="blog-author-name"
                        type="text"
                        required
                        placeholder="Dr. Sarah K."
                        value={blogForm.author.name}
                        onChange={(e) => setBlogForm({
                          ...blogForm,
                          author: { ...blogForm.author, name: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-frost placeholder-frost-dim/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-frost-dim">Author Role</label>
                      <input
                        id="blog-author-role"
                        type="text"
                        required
                        placeholder="Epidemiologist, Africa CDC Alum"
                        value={blogForm.author.role}
                        onChange={(e) => setBlogForm({
                          ...blogForm,
                          author: { ...blogForm.author, role: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-frost placeholder-frost-dim/50"
                      />
                    </div>
                  </div>

                  {/* Rich Body content editor */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim flex justify-between items-center">
                      <span>Markdown Article Body</span>
                      <span className="text-[10px] text-frost-dim/70 font-mono">Supports H2(##), H3(###), Bullet lists(*)</span>
                    </label>
                    <textarea
                      id="blog-content-input"
                      required
                      rows={8}
                      placeholder="Write your article body here..."
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 font-sans leading-relaxed text-frost placeholder-frost-dim/50"
                    />
                  </div>
                </div>
              )}

              {blogFormSection === 'seo' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Banner Image URL</label>
                    <input
                      id="blog-img-url"
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={blogForm.imageUrl}
                      onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-frost-dim">Tags (Comma separated)</label>
                    <input
                      id="blog-tags-input"
                      type="text"
                      placeholder="Writing, Scholarships, Internships"
                      value={blogTagInput}
                      onChange={(e) => setBlogTagInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-frost placeholder-frost-dim/50"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {editingBlogId && (
                  <button
                    id="blog-cancel-edit"
                    type="button"
                    onClick={() => {
                      setEditingBlogId(null);
                      setBlogForm({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        author: {
                          name: '',
                          role: '',
                          avatarUrl: 'https://picsum.photos/seed/nsa-default-author/200/200',
                        },
                        category: 'Career Guide',
                        tags: [],
                        imageUrl: 'https://picsum.photos/seed/nsa-default-blog/1200/800',
                        featured: false,
                        status: 'published',
                      });
                      setBlogTagInput('');
                      setBlogFormSection('basic');
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-frost-dim font-bold text-xs py-2 rounded-lg cursor-pointer transition-all duration-300 ease-out"
                  >
                    Cancel
                  </button>
                )}
                <button
                  id="blog-save-submit"
                  type="submit"
                  className="flex-1 bg-glow-indigo hover:opacity-90 text-void font-bold text-xs py-2.5 rounded-lg transition-all duration-300 ease-out cursor-pointer active:scale-95"
                >
                  {editingBlogId ? 'Save Article' : 'Publish Article'}
                </button>
              </div>
            </form>

            {/* List to Edit/Delete */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-frost border-b border-white/10 pb-1.5">
                Published Insights ({blogs.length})
              </h3>

              <div className="border border-white/10 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
                <table id="admin-blogs-table" className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-glass text-frost-dim uppercase font-mono font-bold border-b border-white/10">
                      <th className="p-3">Article</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {blogs.map(post => (
                      <tr id={`admin-blog-row-${post.id}`} key={post.id} className="hover:bg-white/5 transition-colors duration-300">
                        <td className="p-3">
                          <span className="text-[9px] uppercase font-mono font-bold text-amber-signal bg-amber-signal/10 px-2 py-0.5 rounded inline-block mb-1">
                            {post.category}
                          </span>
                          <h4 className="font-display font-bold text-xs text-frost line-clamp-1">{post.title}</h4>
                          <p className="text-[10px] text-frost-dim font-mono">By {post.author.name} • {post.readTimeMin} min read</p>
                        </td>
                        <td className="p-3">
                          <StatusBadge
                            tone={post.status === 'published' ? 'live' : post.status === 'scheduled' ? 'scheduled' : 'draft'}
                            label={post.status === 'published' ? 'Live' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              id={`edit-blog-row-btn-${post.id}`}
                              onClick={() => startEditBlog(post)}
                              className="p-1.5 rounded-lg text-frost-dim hover:text-frost hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-blog-row-btn-${post.id}`}
                              onClick={() => onDeleteBlog(post.id)}
                              className="p-1.5 rounded-lg text-frost-dim hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300 ease-out cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-frost">Newsletter Signups</h3>
                <p className="text-xs text-frost-dim mt-0.5">Total subscribers receiving weekly health opportunities.</p>
              </div>

              <button
                id="admin-csv-download"
                onClick={downloadCSV}
                className="flex items-center space-x-1.5 text-xs font-bold text-void bg-pulse hover:bg-pulse-hover px-4 py-2 rounded-lg transition-all duration-300 ease-out cursor-pointer shadow-md shadow-pulse/15 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV List</span>
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div className="text-center py-12 text-frost-dim text-xs">
                No subscribers registered yet. Subscriptions via the Footer input appear here.
              </div>
            ) : (
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <table id="subscribers-table" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-glass text-frost-dim uppercase font-mono font-bold border-b border-white/10">
                      <th className="p-3.5">Email address</th>
                      <th className="p-3.5">Subscribed At</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors duration-300">
                        <td className="p-3.5 font-semibold text-frost">{sub.email}</td>
                        <td className="p-3.5 text-frost-dim font-mono">
                          {new Date(sub.subscribedAt).toLocaleString('en-US')}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge tone={sub.status === 'active' ? 'live' : 'closed'} label={sub.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SEO & LIVE PREVIEW DIAGNOSTICS */}
        {activeTab === 'seo' && (
          <div className="space-y-8 text-left">
            <div>
              <h3 className="font-display font-bold text-sm text-frost">SEO live feeds inspector</h3>
              <p className="text-xs text-frost-dim mt-0.5">Diagnose how search engines and social cards fetch and display metadata snippets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Google Search Result Preview */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                <span className="text-[10px] font-mono font-bold text-frost-dim uppercase tracking-widest block">
                  1. Google Search engine snippet (Desktop)
                </span>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 font-sans text-left shadow-xs">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <span>https://nextstepafrica.com</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>insights</span>
                  </div>
                  <h4 className="text-[16px] text-[#1a0dab] hover:underline font-semibold cursor-pointer">
                    How to Write a Winning Public Health Fellowship Essay | NextStep Africa
                  </h4>
                  <p className="text-[12px] text-[#4d5156] leading-normal line-clamp-2">
                    Stand out in highly competitive programs like Africa CDC, WHO, and global health residencies. Master the art of articulating your vision, impact, and local public health story.
                  </p>
                </div>
              </div>

              {/* Twitter Card Preview */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                <span className="text-[10px] font-mono font-bold text-frost-dim uppercase tracking-widest block">
                  2. Twitter Summary Card layout
                </span>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden font-sans max-w-sm mx-auto shadow-xs text-left">
                  <div className="h-40 bg-slate-100">
                    <img
                      src="https://picsum.photos/seed/nsa-default-blog/1200/800"
                      alt="Twitter featured card"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">nextstepafrica.com</span>
                    <h5 className="text-[12px] font-bold text-slate-800 line-clamp-1">
                      How to Write a Winning Public Health Fellowship Essay
                    </h5>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      Stand out in highly competitive programs like Africa CDC, WHO, and global health residencies...
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Analytics Integration block */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 lg:col-span-2">
                <span className="text-[10px] font-mono font-bold text-frost-dim uppercase tracking-widest block">
                  3. Analytics Integration Status
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-pulse/15 flex items-center justify-center text-pulse shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-frost">Google Analytics (G-Tag)</h5>
                      <p className="text-frost-dim text-[10px] mt-0.5">Tracker code initialized client-side. Captures pageviews, applies, signups, and article reads as events.</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-pulse/10 text-pulse rounded text-[9px] uppercase font-mono font-bold">
                        Connected: G-WC3675KHF1
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-pulse/15 flex items-center justify-center text-pulse shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-frost">Google Search Console</h5>
                      <p className="text-frost-dim text-[10px] mt-0.5">Live sitemap.xml and rss.xml served at your domain root for organic web indexing.</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-pulse/10 text-pulse rounded text-[9px] uppercase font-mono font-bold">
                        /sitemap.xml — /rss.xml
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM AND RSS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-white/10 pb-3">
              <h3 className="font-display font-bold text-sm text-frost">System, RSS & Sitemap Config</h3>
              <p className="text-xs text-frost-dim mt-0.5">Preview tools only — the real, crawlable feeds are served automatically at /rss.xml and /sitemap.xml.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* RSS Generator */}
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Rss className="w-5 h-5 text-amber-signal" />
                    <h4 className="font-display font-bold text-sm text-frost">Preview RSS 2.0 Feed</h4>
                  </div>
                  <p className="text-xs text-frost-dim leading-relaxed">
                    Quick in-browser preview of what feed readers see. The live version updates automatically — nothing to run manually.
                  </p>
                </div>

                <button
                  id="admin-rss-generate"
                  onClick={triggerRSSFeed}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-frost text-xs font-semibold py-2 rounded-lg cursor-pointer flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Preview RSS XML</span>
                </button>
              </div>

              {/* Sitemap Generator */}
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-pulse" />
                    <h4 className="font-display font-bold text-sm text-frost">Preview XML Sitemap</h4>
                  </div>
                  <p className="text-xs text-frost-dim leading-relaxed">
                    Quick in-browser preview of your sitemap structure. Submit the live /sitemap.xml URL to Google Search Console — not this preview.
                  </p>
                </div>

                <button
                  id="admin-sitemap-generate"
                  onClick={triggerSitemap}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-frost text-xs font-semibold py-2 rounded-lg cursor-pointer flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Preview Sitemap.xml</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
