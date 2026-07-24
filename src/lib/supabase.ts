import { createClient } from '@supabase/supabase-js';
import { Opportunity, BlogPost, Subscriber, SavedOpportunity } from '../types';

// Read Supabase environment variables from import.meta.env.
// Defensively strip accidental wrapping quotes/whitespace — a very common
// mistake when pasting a value like VITE_SUPABASE_URL="https://..." into a
// dashboard field that doesn't want the quote marks included.
function cleanEnvValue(v: string | undefined): string {
  return (v || '').trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = cleanEnvValue((import.meta as any).env?.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

export let isSupabaseConfigured = false;
export let supabase: ReturnType<typeof createClient> | null = null;

// A malformed URL/key used to throw here at module-load time and take the
// entire app down with it (a blank white screen, with the real reason only
// visible in a browser console the user has no way to open). Never let a
// bad env var value do that again — fail into "not configured" instead.
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConfigured = true;
  }
} catch (err) {
  console.error(
    'Failed to initialize Supabase client. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Cloudflare Pages -> Settings -> Environment variables for typos or stray quote marks:',
    err
  );
  supabase = null;
  isSupabaseConfigured = false;
}

// ==========================================
// Row <-> App model mapping
// Postgres columns are snake_case; the app's TS models are camelCase.
// ==========================================

function rowToOpportunity(row: any): Opportunity {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    opportunityType: row.opportunity_type,
    locationType: row.location_type,
    location: row.location,
    description: row.description,
    eligibility: row.eligibility,
    benefits: row.benefits,
    deadline: row.deadline,
    applyUrl: row.apply_url,
    tags: row.tags || [],
    featured: !!row.featured,
    publishedAt: row.published_at,
    viewsCount: row.views_count ?? 0,
    imageUrl: row.image_url || undefined,
  };
}

function opportunityToRow(opp: Opportunity) {
  return {
    id: opp.id,
    title: opp.title,
    organization: opp.organization,
    opportunity_type: opp.opportunityType,
    location_type: opp.locationType,
    location: opp.location,
    description: opp.description,
    eligibility: opp.eligibility,
    benefits: opp.benefits,
    deadline: opp.deadline,
    apply_url: opp.applyUrl,
    tags: opp.tags,
    featured: opp.featured,
    published_at: opp.publishedAt,
    views_count: opp.viewsCount,
    image_url: opp.imageUrl || null,
  };
}

function rowToBlog(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    category: row.category,
    tags: row.tags || [],
    imageUrl: row.image_url,
    featured: !!row.featured,
    status: row.status,
    publishedAt: row.published_at,
    scheduledFor: row.scheduled_for || undefined,
    viewsCount: row.views_count ?? 0,
    readTimeMin: row.read_time_min ?? 3,
  };
}

function blogToRow(post: BlogPost) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    category: post.category,
    tags: post.tags,
    image_url: post.imageUrl,
    featured: post.featured,
    status: post.status,
    published_at: post.publishedAt,
    scheduled_for: post.scheduledFor || null,
    views_count: post.viewsCount,
    read_time_min: post.readTimeMin,
  };
}

// ==========================================
// Local read cache
// Opportunities/blogs are cached in localStorage purely so the UI has
// something to paint instantly on repeat visits. Supabase is always the
// source of truth — every mutation writes through to Supabase first, and
// refreshOpportunities()/refreshBlogs() re-populate this cache from there.
// ==========================================
const CACHE_KEYS = {
  OPPORTUNITIES: 'nextstep_cache_opportunities',
  BLOGS: 'nextstep_cache_blogs',
  SAVED_OPPS: 'nextstep_saved_opps',
};

function readCache<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
function writeCache<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const db = {
  // ---------------- Opportunities ----------------
  // Synchronous read of whatever was last fetched — safe to call for
  // instant paint, but call refreshOpportunities() to get live data.
  getOpportunities: (): Opportunity[] => readCache<Opportunity>(CACHE_KEYS.OPPORTUNITIES),

  refreshOpportunities: async (): Promise<Opportunity[]> => {
    if (!supabase) return readCache<Opportunity>(CACHE_KEYS.OPPORTUNITIES);
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) {
      console.error('Failed to load opportunities:', error.message);
      return readCache<Opportunity>(CACHE_KEYS.OPPORTUNITIES);
    }
    const mapped = (data || []).map(rowToOpportunity);
    writeCache(CACHE_KEYS.OPPORTUNITIES, mapped);
    return mapped;
  },

  saveOpportunity: async (opp: Opportunity): Promise<Opportunity> => {
    if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Cloudflare Pages environment variables.');
    const { data, error } = await supabase
      .from('opportunities')
      .upsert(opportunityToRow(opp))
      .select()
      .single();
    if (error) throw error;
    return rowToOpportunity(data);
  },

  deleteOpportunity: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------------- Blogs ----------------
  // No status filter here on purpose — Row Level Security already scopes
  // what comes back (anonymous visitors only ever receive published rows;
  // a signed-in admin session receives everything, drafts included).
  getBlogs: (): BlogPost[] => readCache<BlogPost>(CACHE_KEYS.BLOGS),

  refreshBlogs: async (): Promise<BlogPost[]> => {
    if (!supabase) return readCache<BlogPost>(CACHE_KEYS.BLOGS);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) {
      console.error('Failed to load blogs:', error.message);
      return readCache<BlogPost>(CACHE_KEYS.BLOGS);
    }
    const mapped = (data || []).map(rowToBlog);
    writeCache(CACHE_KEYS.BLOGS, mapped);
    return mapped;
  },

  saveBlog: async (post: BlogPost): Promise<BlogPost> => {
    if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Cloudflare Pages environment variables.');
    const { data, error } = await supabase
      .from('blogs')
      .upsert(blogToRow(post))
      .select()
      .single();
    if (error) throw error;
    return rowToBlog(data);
  },

  deleteBlog: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
  },

  // Fire-and-forget view counter — never blocks the reading experience.
  incrementBlogViews: async (post: BlogPost): Promise<void> => {
    if (!supabase) return;
    await supabase.from('blogs').update({ views_count: post.viewsCount + 1 }).eq('id', post.id);
  },

  // ---------------- Newsletter ----------------
  subscribeEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // Brevo is the real newsletter sender — this is the call that
    // actually matters for the person receiving anything. It's routed
    // through our own server (functions/api/newsletter-subscribe.ts) so
    // the Brevo API key never reaches the browser.
    let sendResult: { success: boolean; message: string };
    try {
      const res = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      sendResult = await res.json();
    } catch {
      sendResult = { success: false, message: 'Something went wrong. Please try again.' };
    }

    // Best-effort local copy for the admin's own Subscribers tab / CSV
    // export. Never blocks or overrides the result above — the real
    // newsletter platform is the source of truth for who's subscribed.
    if (supabase) {
      supabase.from('subscribers').insert({ email: cleanEmail }).then(() => {});
    }

    return sendResult;
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (error) {
      console.error('Failed to load subscribers:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      subscribedAt: row.subscribed_at,
      status: row.status,
    }));
  },

  // ---------------- Image uploads ----------------
  uploadImage: async (file: Blob, pathPrefix: string): Promise<{ url: string | null; error?: string }> => {
    if (!supabase) return { url: null, error: 'Supabase is not configured.' };
    const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from('public-images').upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) {
      return { url: null, error: error.message };
    }
    const { data } = supabase.storage.from('public-images').getPublicUrl(fileName);
    return { url: data.publicUrl };
  },

  // ---------------- Contact form ----------------
  submitContactMessage: async (payload: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
      return { success: false, message: 'The contact form is temporarily unavailable.' };
    }
    const { error } = await supabase.from('contact_messages').insert(payload);
    if (error) {
      return { success: false, message: 'Something went wrong sending your message. Please try again or reach us on WhatsApp.' };
    }
    return { success: true, message: "Thanks — we've received your message and will get back to you soon." };
  },

  // ---------------- Personal application tracker ----------------
  // Deliberately local-only: there is no visitor account system, so a
  // per-browser bookmark list is the correct behavior here, not a bug.
  getSavedOpportunities: (): SavedOpportunity[] => {
    const raw = localStorage.getItem(CACHE_KEYS.SAVED_OPPS);
    return raw ? JSON.parse(raw) : [];
  },

  saveOpportunityToTracker: (saved: SavedOpportunity): SavedOpportunity => {
    const savedOpps = db.getSavedOpportunities();
    const existingIndex = savedOpps.findIndex(s => s.opportunityId === saved.opportunityId);
    if (existingIndex > -1) {
      savedOpps[existingIndex] = { ...savedOpps[existingIndex], ...saved };
    } else {
      savedOpps.unshift(saved);
    }
    localStorage.setItem(CACHE_KEYS.SAVED_OPPS, JSON.stringify(savedOpps));
    return saved;
  },

  removeOpportunityFromTracker: (oppId: string): void => {
    const savedOpps = db.getSavedOpportunities();
    const updated = savedOpps.filter(s => s.opportunityId !== oppId);
    localStorage.setItem(CACHE_KEYS.SAVED_OPPS, JSON.stringify(updated));
  },
};
