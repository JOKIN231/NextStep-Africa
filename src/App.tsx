import React, { useState, useEffect } from 'react';
import { db } from './lib/supabase';
import { Opportunity, BlogPost, SavedOpportunity } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OpportunityCard from './components/OpportunityCard';
import BlogCard from './components/BlogCard';
import Dashboard from './components/Dashboard';
import AdminPortal from './components/AdminPortal';
import { 
  Award, Compass, MapPin, Search, Sparkles, Filter, RefreshCw, ChevronLeft, 
  ChevronRight, Calendar, Building, X, BookOpen, Heart, Landmark, CheckCircle, Rss 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation & Core Data State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [oppTypeFilter, setOppTypeFilter] = useState<string>('All');
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>('All');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>('All');

  // Pagination
  const [oppPage, setOppPage] = useState(1);
  const oppsPerPage = 6;

  // Custom RSS & Sitemap XML Previews
  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);

  // Global Alerts (Toast)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Whether the initial Supabase fetch has completed (avoids flashing an
  // empty state while the very first request is in flight).
  const [dataLoading, setDataLoading] = useState(true);

  // Load Data on Mount
  useEffect(() => {
    // Paint instantly from whatever was cached on a previous visit...
    setOpportunities(db.getOpportunities());
    setBlogs(db.getBlogs());

    // ...then refresh from Supabase, which is the real source of truth.
    (async () => {
      const [freshOpps, freshBlogs] = await Promise.all([
        db.refreshOpportunities(),
        db.refreshBlogs(),
      ]);
      setOpportunities(freshOpps);
      setBlogs(freshBlogs);
      setDataLoading(false);
    })();

    // Sync bookmarked opportunity IDs (visitor-local, no backend involved)
    const saved = db.getSavedOpportunities();
    setSavedOppIds(saved.map(s => s.opportunityId));
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Toggle saving to tracking workspace
  const handleToggleSave = (opp: Opportunity) => {
    const savedList = db.getSavedOpportunities();
    const isSaved = savedList.some(s => s.opportunityId === opp.id);

    if (isSaved) {
      db.removeOpportunityFromTracker(opp.id);
      setSavedOppIds(prev => prev.filter(id => id !== opp.id));
      triggerToast(`Removed from application tracker.`, 'info');
    } else {
      db.saveOpportunityToTracker({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        opportunityId: opp.id,
        savedAt: new Date().toISOString(),
        status: 'Interested',
        notes: ''
      });
      setSavedOppIds(prev => [...prev, opp.id]);
      triggerToast(`Saved to "My Career Tracker"! Update stages there.`);
    }
  };

  const handleRemoveBookmarkDirect = (oppId: string) => {
    db.removeOpportunityFromTracker(oppId);
    setSavedOppIds(prev => prev.filter(id => id !== oppId));
    triggerToast(`Removed from tracker.`, 'info');
  };

  // Admin mutation callbacks — each writes through to Supabase first,
  // then refreshes local state from the real data so every open tab/device
  // stays in sync. Errors (e.g. missing RLS policy, network issue) surface
  // as a toast instead of silently disappearing.
  const handleAddOpportunity = async (opp: Opportunity) => {
    try {
      await db.saveOpportunity(opp);
      setOpportunities(await db.refreshOpportunities());
      triggerToast('New opportunity published successfully!');
    } catch (err: any) {
      triggerToast(`Failed to publish opportunity: ${err.message || err}`, 'info');
    }
  };

  const handleEditOpportunity = async (opp: Opportunity) => {
    try {
      await db.saveOpportunity(opp);
      setOpportunities(await db.refreshOpportunities());
      triggerToast('Opportunity requirements updated.');
    } catch (err: any) {
      triggerToast(`Failed to update opportunity: ${err.message || err}`, 'info');
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      await db.deleteOpportunity(id);
      setOpportunities(await db.refreshOpportunities());
      triggerToast('Opportunity listing removed from directory.', 'info');
    } catch (err: any) {
      triggerToast(`Failed to delete opportunity: ${err.message || err}`, 'info');
    }
  };

  const handleAddBlog = async (post: BlogPost) => {
    try {
      await db.saveBlog(post);
      setBlogs(await db.refreshBlogs());
      triggerToast('New article published to Gateway Insights!');
    } catch (err: any) {
      triggerToast(`Failed to publish article: ${err.message || err}`, 'info');
    }
  };

  const handleEditBlog = async (post: BlogPost) => {
    try {
      await db.saveBlog(post);
      setBlogs(await db.refreshBlogs());
      triggerToast('Article content updated successfully.');
    } catch (err: any) {
      triggerToast(`Failed to update article: ${err.message || err}`, 'info');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      await db.deleteBlog(id);
      setBlogs(await db.refreshBlogs());
      triggerToast('Article removed from blog publication.', 'info');
    } catch (err: any) {
      triggerToast(`Failed to delete article: ${err.message || err}`, 'info');
    }
  };

  // Build simulated RSS 2.0 Dynamic Feed XML
  const generateRSSXML = () => {
    const itemsXML = blogs.slice(0, 5).map(b => `
    <item>
      <title>${b.title}</title>
      <link>${window.location.origin}/?blogSlug=${b.slug}</link>
      <guid>${b.id}</guid>
      <pubDate>${new Date(b.publishedAt).toUTCString()}</pubDate>
      <description>${b.excerpt}</description>
      <category>${b.category}</category>
    </item>`).join('');

    const oppsXML = opportunities.slice(0, 5).map(o => `
    <item>
      <title>[${o.opportunityType}] ${o.title} at ${o.organization}</title>
      <link>${o.applyUrl}</link>
      <guid>${o.id}</guid>
      <pubDate>${new Date(o.publishedAt).toUTCString()}</pubDate>
      <description>${o.description}</description>
    </item>`).join('');

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>NextStep Africa Public Health Opportunities Feed</title>
    <link>${window.location.origin}</link>
    <description>Gateway feeds of health fellowships, internships, scholarships, and expert guides.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXML}
    ${oppsXML}
  </channel>
</rss>`;
  };

  // Build simulated Sitemap XML
  const generateSitemapXML = () => {
    const blogsXML = blogs.map(b => `  <url>
    <loc>${window.location.origin}/?blogSlug=${b.slug}</loc>
    <lastmod>${b.publishedAt.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${window.location.origin}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${window.location.origin}/?tab=opportunities</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${window.location.origin}/?tab=blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
${blogsXML}
</urlset>`;
  };

  // Filter logic for Opportunities page
  const filteredOpps = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = oppTypeFilter === 'All' || opp.opportunityType === oppTypeFilter;
    const matchesLoc = locationTypeFilter === 'All' || opp.locationType === locationTypeFilter;

    return matchesSearch && matchesType && matchesLoc;
  });

  // Filter logic for Blogs page
  const filteredBlogs = blogs.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = blogCategoryFilter === 'All' || post.category === blogCategoryFilter;

    return matchesSearch && matchesCat && post.status === 'published';
  });

  // Paginated Opportunities
  const totalOppPages = Math.ceil(filteredOpps.length / oppsPerPage);
  const paginatedOpps = filteredOpps.slice(
    (oppPage - 1) * oppsPerPage,
    oppPage * oppsPerPage
  );

  return (
    <div id="nextstep-africa-app" className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      {/* Dynamic Toast banner */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            id="global-toast-alert"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-full shadow-xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-900'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          // Auto scroll to top on tab transitions
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearch={(query) => {
          setSearchQuery(query);
          if (currentTab === 'home') {
            setCurrentTab('opportunities');
          }
        }}
      />

      {/* Main Body Stage Router */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME PAGE */}
          {currentTab === 'home' && (
            <motion.div
              id="home-tab-content"
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              {/* Premium Hero Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <section className="relative overflow-hidden bg-brand-navy rounded-3xl py-12 px-6 sm:px-12 text-left text-white shadow-lg border border-brand-navy">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-radial-[circle_600px_at_100%_50%] from-white via-transparent to-transparent pointer-events-none hidden md:block"></div>
                  
                  <div className="max-w-3xl space-y-6 relative z-10">
                    <div className="inline-flex items-center space-x-1.5 bg-brand-green px-3 py-1 rounded-full text-[10px] font-mono font-extrabold tracking-widest text-white uppercase shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Featured Gateway</span>
                    </div>

                    <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight max-w-2xl">
                      Opportunities for the Next Generation of <span className="text-brand-orange">African Health Leaders</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed font-medium">
                      Access fully funded fellowships, scholarships, internships, and research grants at Africa CDC, WHO, and global health organizations. Built specifically for African students and professionals.
                    </p>

                    {/* Main Hero Directory search box */}
                    <div className="max-w-xl bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 flex items-center space-x-2 px-3 py-1.5">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <input
                          id="hero-search-input"
                          type="text"
                          placeholder="Search fellowships, epidemiology, scholarships..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setCurrentTab('opportunities');
                            }
                          }}
                          className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400 font-medium"
                        />
                      </div>
                      <button
                        id="hero-search-btn"
                        onClick={() => setCurrentTab('opportunities')}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all shadow-xs shrink-0"
                      >
                        Browse Gateway
                      </button>
                    </div>

                    {/* Credibility Counter Statistics */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-xl text-left font-mono">
                      <div>
                        <p className="text-xl sm:text-2xl font-extrabold font-display text-white">6,000+</p>
                        <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">Students Guided</p>
                      </div>
                      <div className="border-x border-white/10 px-4">
                        <p className="text-xl sm:text-2xl font-extrabold font-display text-white">140+</p>
                        <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">Institutions</p>
                      </div>
                      <div>
                        <p className="text-xl sm:text-2xl font-extrabold font-display text-brand-orange">54</p>
                        <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">African Nations</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Six Visual Hub Category Pills */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="text-center md:text-left">
                  <h2 className="font-display font-extrabold text-xl text-brand-navy tracking-tight">Explore opportunities by Type</h2>
                  <p className="text-xs text-slate-400">Discover programs specifically designed for your career step.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { type: 'Fellowship', label: 'Fellowships', desc: 'Mid-career & leadership', color: 'border-l-4 border-brand-navy' },
                    { type: 'Internship', label: 'Internships', desc: 'WHO & Africa regional hubs', color: 'border-l-4 border-brand-green' },
                    { type: 'Funding', label: 'Research Funding', desc: 'Malaria & disease grants', color: 'border-l-4 border-cyan-500' },
                    { type: 'Scholarship', label: 'Scholarships', desc: 'Postgrad & Masters support', color: 'border-l-4 border-purple-500' },
                    { type: 'Job', label: 'Jobs & Careers', desc: 'Ministry & NGO placements', color: 'border-l-4 border-amber-500' },
                    { type: 'Conference', label: 'Conferences', desc: 'Youth advocacy summits', color: 'border-l-4 border-rose-500' }
                  ].map((cat, i) => (
                    <div
                      id={`home-cat-card-${i}`}
                      key={i}
                      onClick={() => {
                        setOppTypeFilter(cat.type);
                        setCurrentTab('opportunities');
                      }}
                      className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-brand-orange/30 hover:-translate-y-1 cursor-pointer transition-all ${cat.color} text-left flex flex-col justify-between h-28`}
                    >
                      <h3 className="font-display font-extrabold text-sm text-brand-navy leading-snug">{cat.label}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-2 mt-2">{cat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Outstanding Featured Listings section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="text-left">
                    <h2 className="font-display font-extrabold text-xl text-brand-navy tracking-tight flex items-center">
                      <Award className="w-5 h-5 mr-2 text-brand-orange" />
                      Featured Opportunities
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Selected highly funded programs with upcoming deadlines.</p>
                  </div>
                  <button
                    id="featured-see-all"
                    onClick={() => {
                      setOppTypeFilter('All');
                      setCurrentTab('opportunities');
                    }}
                    className="text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors flex items-center cursor-pointer"
                  >
                    <span>View all opportunities</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {opportunities.filter(o => o.featured).map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={savedOppIds.includes(opp.id)}
                      onToggleSave={() => handleToggleSave(opp)}
                    />
                  ))}
                </div>
              </section>

              {/* Recent Blog advice section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="text-left">
                    <h2 className="font-display font-extrabold text-xl text-brand-navy tracking-tight flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-brand-green" />
                      Latest Insights & Application Guides
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Written by alumni and public health technical directors.</p>
                  </div>
                  <button
                    id="blog-see-all"
                    onClick={() => setCurrentTab('blog')}
                    className="text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors flex items-center cursor-pointer"
                  >
                    <span>Read more guides</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {blogs.slice(0, 3).map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      onReadPost={(p) => {
                        // View analytics counter simulated
                        db.incrementBlogViews(p).catch(() => {});
                      }}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 2: OPPORTUNITIES DIRECTORY */}
          {currentTab === 'opportunities' && (
            <motion.div
              id="opportunities-tab-content"
              key="opportunities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in"
            >
              <div className="text-left space-y-1">
                <h1 className="font-display font-extrabold text-2xl text-brand-navy">Opportunities Directory</h1>
                <p className="text-xs text-slate-400">Search and filter active programs across international health agencies.</p>
              </div>

              {/* Horizontal filters */}
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
                {/* Search query box inside directory */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    id="directory-search-input"
                    type="text"
                    placeholder="Search titles, skills, keywords..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setOppPage(1); }}
                    className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-3 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-brand-navy"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400 font-bold font-mono uppercase">Category:</span>
                    <select
                      id="directory-category-filter"
                      value={oppTypeFilter}
                      onChange={(e) => { setOppTypeFilter(e.target.value); setOppPage(1); }}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2 py-1.5 rounded-md focus:outline-hidden"
                    >
                      <option value="All">All Categories</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Internship">Internship</option>
                      <option value="Job">Job</option>
                      <option value="Funding">Funding / Grant</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Conference">Conference</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400 font-bold font-mono uppercase">Location:</span>
                    <select
                      id="directory-location-filter"
                      value={locationTypeFilter}
                      onChange={(e) => { setLocationTypeFilter(e.target.value); setOppPage(1); }}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2 py-1.5 rounded-md focus:outline-hidden"
                    >
                      <option value="All">All Settings</option>
                      <option value="Remote">Remote Only</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site only</option>
                    </select>
                  </div>

                  {/* Reset button */}
                  {(oppTypeFilter !== 'All' || locationTypeFilter !== 'All' || searchQuery !== '') && (
                    <button
                      id="directory-reset-btn"
                      onClick={() => {
                        setOppTypeFilter('All');
                        setLocationTypeFilter('All');
                        setSearchQuery('');
                        setOppPage(1);
                      }}
                      className="text-brand-orange hover:text-brand-orange-hover font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Counters */}
              <div className="text-left text-xs font-mono font-bold text-slate-400">
                SHOWING {filteredOpps.length} OPPORTUNITIES MATCHING CRITERIA
              </div>

              {/* Opportunity grid list */}
              {dataLoading ? (
                <div className="text-center py-16 text-slate-400 text-xs font-mono">Loading live opportunities...</div>
              ) : paginatedOpps.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Filter className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">No results match your criteria</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Try resetting the drop-down filters or expanding your spelling search keyword.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedOpps.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        isSaved={savedOppIds.includes(opp.id)}
                        onToggleSave={() => handleToggleSave(opp)}
                      />
                    ))}
                  </div>

                  {/* Directory Pagination buttons */}
                  {totalOppPages > 1 && (
                    <div className="flex justify-center items-center gap-3.5 pt-4 text-xs">
                      <button
                        id="prev-page-btn"
                        onClick={() => setOppPage(prev => Math.max(1, prev - 1))}
                        disabled={oppPage === 1}
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4 mr-0.5" />
                        <span>Previous</span>
                      </button>

                      <span className="font-mono font-semibold text-slate-500">
                        Page {oppPage} of {totalOppPages}
                      </span>

                      <button
                        id="next-page-btn"
                        onClick={() => setOppPage(prev => Math.min(totalOppPages, prev + 1))}
                        disabled={oppPage === totalOppPages}
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center disabled:opacity-40"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: INSIGHTS & ARTICLE READING HUB */}
          {currentTab === 'blog' && (
            <motion.div
              id="blog-tab-content"
              key="blog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in"
            >
              <div className="text-left space-y-1">
                <h1 className="font-display font-extrabold text-2xl text-brand-navy">Insights & Guides</h1>
                <p className="text-xs text-slate-400 font-sans">Empowering resources, alumni dialogues, and essay workshops to strengthen your submissions.</p>
              </div>

              {/* Horizontal category filtering pills */}
              <div className="flex overflow-x-auto gap-2 border-b border-slate-100 pb-2">
                {[
                  { id: 'All', label: 'All Articles' },
                  { id: 'Career Guide', label: 'Career Guides' },
                  { id: 'Public Health News', label: 'Public Health News' },
                  { id: 'Alumni Spotlight', label: 'Alumni Spotlights' },
                  { id: 'Academic Resource', label: 'Academic Resources' },
                ].map((pill) => (
                  <button
                    id={`blog-category-btn-${pill.id}`}
                    key={pill.id}
                    onClick={() => setBlogCategoryFilter(pill.id)}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                      blogCategoryFilter === pill.id
                        ? 'bg-brand-navy text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Blog listings display */}
              {filteredBlogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No articles available matching the selected category.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      onReadPost={(p) => {
                        db.incrementBlogViews(p).catch(() => {});
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE APPLICATION DEADLINES TRACKER */}
          {currentTab === 'tracker' && (
            <motion.div
              id="tracker-tab-content"
              key="tracker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard
                opportunities={opportunities}
                onRemoveBookmark={handleRemoveBookmarkDirect}
                setCurrentTab={setCurrentTab}
              />
            </motion.div>
          )}

          {/* TAB 5: SECURE PUBLISHER BACKOFFICE PORTAL */}
          {currentTab === 'admin' && (
            <motion.div
              id="admin-tab-content"
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPortal
                opportunities={opportunities}
                blogs={blogs}
                onAddOpportunity={handleAddOpportunity}
                onEditOpportunity={handleEditOpportunity}
                onDeleteOpportunity={handleDeleteOpportunity}
                onAddBlog={handleAddBlog}
                onEditBlog={handleEditBlog}
                onDeleteBlog={handleDeleteBlog}
                triggerRSSFeed={() => setRssModalOpen(true)}
                triggerSitemap={() => setSitemapModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Brand global Footer */}
      <Footer 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* RSS compiled Modal Preview overlay */}
      <AnimatePresence>
        {rssModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              id="rss-modal-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Rss className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-display font-bold text-sm text-brand-navy">Active RSS 2.0 Syndication Feed</h3>
                </div>
                <button
                  id="rss-modal-close"
                  onClick={() => setRssModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable XML pre code container */}
              <div className="p-6 bg-slate-950 overflow-auto flex-1 font-mono text-[11px] text-emerald-400 leading-normal text-left">
                <pre>{generateRSSXML()}</pre>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  id="rss-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(generateRSSXML());
                    triggerToast('RSS XML Feed copied to clipboard!');
                  }}
                  className="bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Copy Feed XML
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sitemap compiled Modal Preview overlay */}
      <AnimatePresence>
        {sitemapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              id="sitemap-modal-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-brand-green" />
                  <h3 className="font-display font-bold text-sm text-brand-navy">Dynamic sitemap.xml indexing structure</h3>
                </div>
                <button
                  id="sitemap-modal-close"
                  onClick={() => setSitemapModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable sitemap code container */}
              <div className="p-6 bg-slate-950 overflow-auto flex-1 font-mono text-[11px] text-emerald-400 leading-normal text-left">
                <pre>{generateSitemapXML()}</pre>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  id="sitemap-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSitemapXML());
                    triggerToast('Sitemap.xml copied to clipboard!');
                  }}
                  className="bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Copy Sitemap XML
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
