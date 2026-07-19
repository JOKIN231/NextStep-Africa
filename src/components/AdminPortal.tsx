import React, { useState, useEffect } from 'react';
import { db, isSupabaseConfigured, supabase } from '../lib/supabase';
import { Opportunity, BlogPost, Subscriber } from '../types';
import { 
  KeyRound, ShieldAlert, Plus, Edit2, Trash2, Mail, Download, Rss, Eye, Globe, 
  Settings, CheckSquare, RefreshCw, LogOut, CheckCircle2, ChevronRight, FileText, Sparkles, Sliders 
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
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
    category: 'Career Guide',
    tags: [],
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
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
    });
    setTagInput('');
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
    });
    setTagInput(opp.tags.join(', '));
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
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      },
      category: 'Career Guide',
      tags: [],
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
      featured: false,
      status: 'published',
    });
    setBlogTagInput('');
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

  if (!isLoggedIn) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-brand-navy p-6 text-white text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center mx-auto text-white font-display font-bold text-lg shadow-md mb-3">
              NS
            </div>
            <h2 className="font-display font-bold text-lg">NextStep Admin Portal</h2>
            <p className="text-xs text-slate-300 mt-1">Provide credential keys to manage Gateway content</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-3 rounded-xl leading-normal">
                <p className="font-bold mb-1">⚠️ Supabase is not configured</p>
                Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> as environment
                variables in your Cloudflare Pages project settings, then redeploy. No
                admin login is possible until this is set.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Email Address</label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@nextstepafrica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-brand-navy focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Access Token / Password</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-brand-navy focus:bg-white transition-all text-slate-800"
              />
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-navy hover:bg-brand-navy-hover text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-brand-navy/10 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Verifying access...' : 'Secure Authorization'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-layout" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-brand-navy">Gateway Publisher Workspace</h1>
            <p className="text-xs text-slate-400">Manage real-time opportunities, articles, and SEO diagnostics.</p>
          </div>
        </div>

        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit workspace</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-1">
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
            className={`text-xs font-bold px-4 py-2.5 rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-brand-orange text-brand-navy bg-white/50'
                : 'border-transparent text-slate-500 hover:text-brand-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contents based on activeAdminTab */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs min-h-[50vh]">
        
        {/* TAB 1: OPPORTUNITIES MANAGER */}
        {activeTab === 'opps' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form to Create/Edit */}
            <form onSubmit={handleOppSubmit} className="lg:col-span-5 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-display font-bold text-sm text-brand-navy border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>{editingOppId ? 'Modify Opportunity' : 'Launch New Opportunity'}</span>
                <Sparkles className="w-4 h-4 text-brand-orange" />
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Opportunity Type</label>
                  <select
                    id="opp-type-select"
                    value={oppForm.opportunityType}
                    onChange={(e) => setOppForm({ ...oppForm, opportunityType: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {['Fellowship', 'Internship', 'Job', 'Funding', 'Scholarship', 'Conference'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Location Setting</label>
                  <select
                    id="opp-loc-type-select"
                    value={oppForm.locationType}
                    onChange={(e) => setOppForm({ ...oppForm, locationType: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {['Remote', 'Hybrid', 'On-site'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Opportunity Title</label>
                <input
                  id="opp-title-input"
                  type="text"
                  required
                  placeholder="e.g. Africa CDC Health Informatics Fellowship"
                  value={oppForm.title}
                  onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Hosting Organization</label>
                  <input
                    id="opp-org-input"
                    type="text"
                    required
                    placeholder="e.g. Africa CDC"
                    value={oppForm.organization}
                    onChange={(e) => setOppForm({ ...oppForm, organization: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Location / City</label>
                  <input
                    id="opp-location-input"
                    type="text"
                    required
                    placeholder="e.g. Addis Ababa, Ethiopia"
                    value={oppForm.location}
                    onChange={(e) => setOppForm({ ...oppForm, location: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Opportunity Description</label>
                <textarea
                  id="opp-desc-input"
                  required
                  rows={3}
                  placeholder="Summarize the role and organizational impact..."
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 resize-none"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Eligibility Criteria</label>
                <textarea
                  id="opp-elig-input"
                  required
                  rows={2}
                  placeholder="Specify degrees, country requirements, and working experience..."
                  value={oppForm.eligibility}
                  onChange={(e) => setOppForm({ ...oppForm, eligibility: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 resize-none"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Benefits & Stipend Packages</label>
                <textarea
                  id="opp-benefits-input"
                  required
                  rows={2}
                  placeholder="Specify funding cap, tuition waiver, return flight, insurance..."
                  value={oppForm.benefits}
                  onChange={(e) => setOppForm({ ...oppForm, benefits: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Application Deadline</label>
                  <input
                    id="opp-deadline-input"
                    type="text"
                    required
                    placeholder="YYYY-MM-DD or 'Rolling'"
                    value={oppForm.deadline}
                    onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Direct Application URL</label>
                  <input
                    id="opp-apply-url"
                    type="url"
                    required
                    placeholder="https://africacdc.org/apply"
                    value={oppForm.applyUrl}
                    onChange={(e) => setOppForm({ ...oppForm, applyUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Keywords / Tags (Comma separated)</label>
                <input
                  id="opp-tags-input"
                  type="text"
                  placeholder="Epidemiology, Policy, Malaria, Leadership"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <input
                  id="opp-featured-check"
                  type="checkbox"
                  checked={oppForm.featured}
                  onChange={(e) => setOppForm({ ...oppForm, featured: e.target.checked })}
                  className="rounded text-brand-orange focus:ring-brand-orange"
                />
                <label className="font-bold text-slate-600">Feature this opportunity on Homepage</label>
              </div>

              <div className="flex gap-2">
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
                      });
                      setTagInput('');
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  id="opp-save-submit"
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {editingOppId ? 'Save Requirements' : 'Publish Opportunity'}
                </button>
              </div>
            </form>

            {/* List to Edit/Delete */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display font-bold text-sm text-brand-navy border-b border-slate-100 pb-1.5">
                Active Opportunities ({opportunities.length})
              </h3>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {opportunities.map(opp => (
                  <div
                    id={`admin-opp-row-${opp.id}`}
                    key={opp.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-navy/15 transition-all"
                  >
                    <div className="text-left space-y-0.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-brand-orange">
                        {opp.opportunityType}
                      </span>
                      <h4 className="font-display font-bold text-xs text-brand-navy line-clamp-1">{opp.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{opp.organization} • {opp.location}</p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-4">
                      <button
                        id={`edit-opp-row-btn-${opp.id}`}
                        onClick={() => startEditOpp(opp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title="Edit requirements"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-opp-row-btn-${opp.id}`}
                        onClick={() => onDeleteOpportunity(opp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLES WRITER MANAGER */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form to Create/Edit */}
            <form onSubmit={handleBlogSubmit} className="lg:col-span-6 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-display font-bold text-sm text-brand-navy border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>{editingBlogId ? 'Modify Blog Post' : 'Compose Insights / Article'}</span>
                <Sliders className="w-4 h-4 text-brand-orange" />
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Category</label>
                  <select
                    id="blog-cat-select"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {['Career Guide', 'Public Health News', 'Alumni Spotlight', 'Academic Resource', 'Policy & Innovation'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Publishing Status</label>
                  <select
                    id="blog-status-select"
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {['draft', 'published', 'scheduled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Article Title</label>
                <input
                  id="blog-title-input"
                  type="text"
                  required
                  placeholder="e.g. Master the epidemiology application essay"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Custom URL Slug (Leave blank for auto)</label>
                <input
                  id="blog-slug-input"
                  type="text"
                  placeholder="master-epidemiology-essay"
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500">Short Excerpt (SEO Summary)</label>
                <textarea
                  id="blog-excerpt-input"
                  required
                  rows={2}
                  placeholder="Provide a 2-sentence visual snippet to capture social feed views..."
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 resize-none"
                />
              </div>

              {/* Author info nested fields */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Author Name</label>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Author Role</label>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5"
                  />
                </div>
              </div>

              {/* Rich Body content editor */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-500 flex justify-between items-center">
                  <span>Markdown Article Body</span>
                  <span className="text-[10px] text-slate-400 font-mono">Supports H2(##), H3(###), Bullet lists(*)</span>
                </label>
                <textarea
                  id="blog-content-input"
                  required
                  rows={8}
                  placeholder="Write your article body here..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Banner Image URL</label>
                  <input
                    id="blog-img-url"
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={blogForm.imageUrl}
                    onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Tags (Comma separated)</label>
                  <input
                    id="blog-tags-input"
                    type="text"
                    placeholder="Writing, Scholarships, Internships"
                    value={blogTagInput}
                    onChange={(e) => setBlogTagInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
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
                          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                        },
                        category: 'Career Guide',
                        tags: [],
                        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
                        featured: false,
                        status: 'published',
                      });
                      setBlogTagInput('');
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  id="blog-save-submit"
                  type="submit"
                  className="flex-1 bg-brand-navy hover:bg-brand-navy-hover text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {editingBlogId ? 'Save Article' : 'Publish Article'}
                </button>
              </div>
            </form>

            {/* List to Edit/Delete */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-brand-navy border-b border-slate-100 pb-1.5">
                Published Insights ({blogs.length})
              </h3>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {blogs.map(post => (
                  <div
                    id={`admin-blog-row-${post.id}`}
                    key={post.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-navy/15 transition-all"
                  >
                    <div className="text-left space-y-0.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                      <h4 className="font-display font-bold text-xs text-brand-navy mt-1 line-clamp-1">{post.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">By {post.author.name} • {post.readTimeMin} min read</p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-4">
                      <button
                        id={`edit-blog-row-btn-${post.id}`}
                        onClick={() => startEditBlog(post)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-blog-row-btn-${post.id}`}
                        onClick={() => onDeleteBlog(post.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-brand-navy">Newsletter Signups</h3>
                <p className="text-xs text-slate-400 mt-0.5">Total subscribers receiving weekly health opportunities.</p>
              </div>
              
              <button
                id="admin-csv-download"
                onClick={downloadCSV}
                className="flex items-center space-x-1.5 text-xs font-bold text-white bg-brand-green hover:bg-brand-green-hover px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-md shadow-brand-green/10"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV List</span>
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No subcribers registered yet. Subscriptions via Footer input appear here.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table id="subscribers-table" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase font-mono font-bold border-b border-slate-200">
                      <th className="p-3.5">Email address</th>
                      <th className="p-3.5">Subscribed At</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-semibold text-slate-800">{sub.email}</td>
                        <td className="p-3.5 text-slate-500 font-mono">
                          {new Date(sub.subscribedAt).toLocaleString('en-US')}
                        </td>
                        <td className="p-3.5">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold">
                            {sub.status}
                          </span>
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
              <h3 className="font-display font-bold text-sm text-brand-navy">SEO live feeds inspector</h3>
              <p className="text-xs text-slate-400 mt-0.5">Diagnose how search engines and social cards fetch and display metadata snippets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Google Search Result Preview */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
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
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  2. Twitter Summary Card layout
                </span>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden font-sans max-w-sm mx-auto shadow-xs text-left">
                  <div className="h-40 bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200"
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
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 lg:col-span-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  3. Analytics Integration Status
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-brand-navy">Google Analytics (G-Tag)</h5>
                      <p className="text-slate-400 text-[10px] mt-0.5">Tracker code initialized client-side. Captures user search events and click counts.</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] uppercase font-mono font-bold">
                        Connected: G-N7S2PL
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-brand-navy">Google Search Console</h5>
                      <p className="text-slate-400 text-[10px] mt-0.5">Dynamic sitemap.xml structure provided for organic web indexing.</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] uppercase font-mono font-bold">
                        Active Verification: site-verification=992
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
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-sm text-brand-navy">System, RSS & Sitemap Config</h3>
              <p className="text-xs text-slate-400 mt-0.5">Execute administrative build events directly inside the client sandbox.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* RSS Generator */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Rss className="w-5 h-5 text-brand-orange" />
                    <h4 className="font-display font-bold text-sm text-brand-navy">Generate Dynamic RSS 2.0 Feed</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instantly compile published opportunities and articles into standard XML syndication format. Allows feed readers like Feedly or Mailchimp campaigns to subscribe to changes automatically.
                  </p>
                </div>

                <button
                  id="admin-rss-generate"
                  onClick={triggerRSSFeed}
                  className="bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-semibold py-2 rounded-lg cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Build & Inspect RSS XML</span>
                </button>
              </div>

              {/* Sitemap Generator */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-brand-green" />
                    <h4 className="font-display font-bold text-sm text-brand-navy">Compile XML Sitemap</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Build a structured site map listing all directory paths, slugs, and static page hierarchies. Necessary to submit to Google Search Console or Bing Webmaster for organic crawling.
                  </p>
                </div>

                <button
                  id="admin-sitemap-generate"
                  onClick={triggerSitemap}
                  className="bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-semibold py-2 rounded-lg cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Build & Inspect Sitemap.xml</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
