import { createClient } from '@supabase/supabase-js';
import { Opportunity, BlogPost, Subscriber, SavedOpportunity } from '../types';

// Read Supabase environment variables from import.meta.env
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Real Supabase Client (only initialized if variables exist)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// fallback local persistence database
// ==========================================
const LOCAL_STORAGE_KEYS = {
  OPPORTUNITIES: 'nextstep_opportunities',
  BLOGS: 'nextstep_blogs',
  SUBSCRIBERS: 'nextstep_subscribers',
  SAVED_OPPS: 'nextstep_saved_opps',
  SESSION: 'nextstep_session',
};

// Seed mock data if empty. Let's define seeds.
import { initialOpportunities, initialBlogs } from '../data/mockData';

export const db = {
  getOpportunities: (): Opportunity[] => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.OPPORTUNITIES);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(initialOpportunities));
      return initialOpportunities;
    }
    return JSON.parse(raw);
  },

  saveOpportunity: (opp: Opportunity): Opportunity => {
    const opps = db.getOpportunities();
    const existingIndex = opps.findIndex(o => o.id === opp.id);
    if (existingIndex > -1) {
      opps[existingIndex] = opp;
    } else {
      opps.unshift(opp);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opps));
    return opp;
  },

  deleteOpportunity: (id: string): void => {
    const opps = db.getOpportunities();
    const updated = opps.filter(o => o.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(updated));
  },

  getBlogs: (): BlogPost[] => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.BLOGS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BLOGS, JSON.stringify(initialBlogs));
      return initialBlogs;
    }
    return JSON.parse(raw);
  },

  saveBlog: (post: BlogPost): BlogPost => {
    const blogs = db.getBlogs();
    const existingIndex = blogs.findIndex(b => b.id === post.id);
    if (existingIndex > -1) {
      blogs[existingIndex] = post;
    } else {
      blogs.unshift(post);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    return post;
  },

  deleteBlog: (id: string): void => {
    const blogs = db.getBlogs();
    const updated = blogs.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.BLOGS, JSON.stringify(updated));
  },

  getSubscribers: (): Subscriber[] => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS);
    return raw ? JSON.parse(raw) : [];
  },

  subscribeEmail: (email: string): { success: boolean; message: string } => {
    const subscribers = db.getSubscribers();
    const exists = subscribers.some(s => s.email.toLowerCase() === email.toLowerCase() && s.status === 'active');
    if (exists) {
      return { success: false, message: 'You are already subscribed to our newsletter!' };
    }

    const newSub: Subscriber = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      email,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };

    subscribers.unshift(newSub);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    return { success: true, message: 'Thank you for subscribing to NextStep Africa!' };
  },

  getSavedOpportunities: (): SavedOpportunity[] => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_OPPS);
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
    localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_OPPS, JSON.stringify(savedOpps));
    return saved;
  },

  removeOpportunityFromTracker: (oppId: string): void => {
    const savedOpps = db.getSavedOpportunities();
    const updated = savedOpps.filter(s => s.opportunityId !== oppId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_OPPS, JSON.stringify(updated));
  },

  // Auth helper
  getAdminSession: (): { email: string } | null => {
    const session = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  loginAdmin: (email: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify({ email }));
  },

  logoutAdmin: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION);
  }
};
