export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  opportunityType: 'Fellowship' | 'Internship' | 'Job' | 'Funding' | 'Scholarship' | 'Conference';
  locationType: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  description: string;
  eligibility: string;
  benefits: string;
  deadline: string; // ISO date string or "Rolling"
  applyUrl: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  viewsCount: number;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
    bio?: string;
  };
  category: 'Career Guide' | 'Public Health News' | 'Alumni Spotlight' | 'Academic Resource' | 'Policy & Innovation';
  tags: string[];
  imageUrl: string;
  featured: boolean;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string;
  scheduledFor?: string;
  viewsCount: number;
  readTimeMin: number;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  preferences?: string[];
}

export interface SavedOpportunity {
  id: string;
  opportunityId: string;
  savedAt: string;
  status: 'Drafting' | 'Submitted' | 'Interview' | 'Accepted' | 'Rejected' | 'Interested';
  targetDeadline?: string;
  notes?: string;
}
