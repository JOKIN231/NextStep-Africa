# NextStep Africa — Public Health Opportunities Gateway

NextStep Africa is a premium digital publication and opportunities directory designed to empower African students and healthcare professionals. The application lists fully funded fellowships, scholarships, internships, research grants, and career guides, with a focus on building public health leadership across the continent.

This repository features a fully responsive, mobile-first React application built using **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**, with backend data persistence powered by **Supabase** (authentication, PostgreSQL, storage) and optimized for deployment on **Cloudflare Pages**.

---

## 🚀 Key Features

*   **Public Opportunities Directory:** Live search, category pills (Fellowship, Internship, Job, Scholarship, Funding, Conference), location filtering (Remote, Hybrid, On-site), and clean pagination.
*   **Active Blog & Insights Hub:** Categorized editorial guides (Career Guide, Public Health News, Alumni Spotlight, Academic Resource) complete with author profiles, related reading suggestions, social sharing hooks, and pre-injected JSON-LD schemas.
*   **Interactive Application Tracker:** Personal kanban-style pipeline allowing users to bookmark opportunities, update submission stages (*Interested*, *Drafting*, *Submitted*, *Interview*, *Accepted/Rejected*), configure personal deadlines, and write checklists.
*   **Newsletter Dispatch System:** Email capture form with real-time subscription validation.
*   **Dynamic RSS 2.0 & Sitemap XML:** Instant dynamic generation of `sitemap.xml` and RSS feed structures directly within the system for organic web spiders and email aggregators.
*   **Secure administrative Backoffice:** Protected dashboard allowing publishers to manage database records, write markdown articles, track subscribers, and analyze SEO previews across Google, Twitter, and Facebook.

---

## 🛠️ Architecture & Tech Stack

*   **Frontend Framework:** React 19 + Vite (Type-stripped TypeScript compiler).
*   **Styling Engine:** Tailwind CSS v4 (Using fluid variables, display font pairings, and responsive typography).
*   **Animations:** Framer Motion (Optimized layout transitions and stagger elements).
*   **Data Layer:** Supabase Client SDK (`@supabase/supabase-js`) with a seamless `localStorage` fallback wrapper. If environment keys are missing, the app operates in **interactive Sandbox mode** utilizing rich mock datasets.
*   **Infrastructure Hosting:** Optimized for free deployment via GitHub Actions and Cloudflare Pages.

---

## 📦 Local Development Setup

To boot the application locally on your workstation, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <your-repository-url>
cd nextstep-africa

# Install npm packages
npm install
```

### 3. Setup Environment variables
Create a `.env` file in the root directory and copy the parameters from `.env.example`:
```env
# Supabase Database credentials (Get from Supabase Dashboard -> Project Settings -> API)
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key-string"

# Production App URL (Used for sitemaps and callbacks)
VITE_APP_URL="https://nextstepafrica.com"
```

### 4. Launch Development Server
Launch the local Hot-Module-Replacement development server on port `3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🗄️ Supabase Backend Configuration

To connect this application to your production Supabase database, execute the following configurations:

### 1. Database Schemas (PostgreSQL DDL)
Run these statements inside the **Supabase SQL Editor** to bootstrap your tables:

```sql
-- 1. Create Opportunities Directory Table
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Fellowship', 'Internship', 'Job', 'Funding', 'Scholarship', 'Conference')),
    location_type TEXT NOT NULL CHECK (location_type IN ('Remote', 'Hybrid', 'On-site')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    benefits TEXT NOT NULL,
    deadline TEXT NOT NULL,
    apply_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now(),
    views_count INTEGER DEFAULT 0
);

-- 2. Create Blog Articles Table
CREATE TABLE public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author JSONB NOT NULL, -- Structure: {"name": "...", "role": "...", "avatarUrl": "..."}
    category TEXT NOT NULL CHECK (category IN ('Career Guide', 'Public Health News', 'Alumni Spotlight', 'Academic Resource', 'Policy & Innovation')),
    tags TEXT[] DEFAULT '{}',
    image_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at TIMESTAMPTZ DEFAULT now(),
    views_count INTEGER DEFAULT 0,
    read_time_min INTEGER DEFAULT 3
);

-- 3. Create Newsletter Subscribers Table
CREATE TABLE public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 5. Establish Public Read Access Policies
CREATE POLICY "Allow public read-only opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public read-only blogs" ON public.blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
```

### 2. Authentication Rules
1.  Go to the **Supabase Dashboard -> Authentication -> Users**.
2.  Click **Add User** -> **Create User**.
3.  Add an administrator email (e.g., `publisher@nextstepafrica.com`) and assign a secure password.
4.  Use these credentials to log in to the administrative portal in production.

---

## ☁️ Automated Cloudflare Pages Deployment

Cloudflare Pages provides blazing-fast, serverless hosting directly connected to your GitHub repository.

### Step-by-Step Hosting Connection:
1.  Log in to the **Cloudflare Dashboard** and navigate to **Workers & Pages**.
2.  Click **Create Application** -> **Pages** tab -> **Connect to Git**.
3.  Select your GitHub account and select your `nextstep-africa` repository.
4.  Configure the **Build Settings**:
    *   **Framework Preset:** `Vite` (or None)
    *   **Build Command:** `npm run build`
    *   **Build Output Directory:** `dist`
5.  Expand **Environment Variables (Advanced)** and define your Supabase secret parameters:
    *   `VITE_SUPABASE_URL` = `https://your-supabase-project.supabase.co`
    *   `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key-string`
6.  Click **Save and Deploy**. Cloudflare will compile and deploy your web app. Every subsequent push or merge to your main branch will trigger a production deployment automatically.

---

## 📈 Long-term SEO & Site Maintenance

To keep the application highly rankable and healthy:

1.  **Sitemap Updates:** Each time you publish a new fellowship or article via the administrative backoffice, click **XML Sitemap** in the footer and copy the updated map to submit to **Google Search Console**.
2.  **Schema Quality:** Ensure all blog posts use precise titles and summaries. The application automatically generates structured `JSON-LD` schemas at runtime, signaling metadata to crawling bots.
3.  **Newsletter Exports:** Regularly access the admin panel, select the **Email Subscribers** tab, and click **Export CSV List** to backup subscriber lists or sync with email dispatch platforms (such as Mailchimp or Brevo).
