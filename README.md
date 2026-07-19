# NextStep Africa — Public Health Opportunities Gateway

NextStep Africa is a digital publication and opportunities directory for
African students and healthcare professionals — fellowships, scholarships,
internships, research grants, and career guides focused on public health
leadership across the continent.

Built with **Vite**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**,
backed by **Supabase** (Postgres + Auth) and deployed on **Cloudflare Pages**.

---

## How data works here

- **Opportunities, blog posts, and newsletter subscribers live in Supabase.**
  Every visitor sees the same live content, and every admin edit is
  immediately visible to everyone.
- **The personal "Application Tracker"** (saving/bookmarking opportunities)
  is intentionally local to each visitor's browser — there's no visitor
  account system, so this is stored on-device, not in Supabase.
- **The admin portal requires a real Supabase Auth login.** There is no
  fallback password. If Supabase isn't configured, the login screen tells
  you so instead of offering a demo login.

---

## 🚀 Setup — entirely from a phone browser

You do not need a laptop, Git, or Node.js installed anywhere for this. Every
step below happens in Safari/Chrome on your phone, across three dashboards:
**GitHub**, **Supabase**, and **Cloudflare**.

### 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up/log in → **New project**.
2. Once it's created, go to **SQL Editor** → **New query**.
3. Open `supabase-schema.sql` from this repo, copy its entire contents, paste
   into the SQL editor, and click **Run**. This creates all three tables and
   the security policies in one go.
4. *(Optional)* Your tables are now empty, so the site will look blank until
   you publish something. If you'd like a few example opportunities and
   articles live immediately, run `supabase-seed-optional.sql` the same way
   — you can edit or delete this content from the admin panel any time.
5. Go to **Authentication → Users → Add user → Create new user**. Give it
   your real email and a strong password. This is the *only* account that
   should ever be created here — the app's security model assumes exactly
   one admin.
6. Go to **Settings → API**. Copy the **Project URL** and the **anon public**
   key — you'll need both in step 3 below.

### 2. Upload this code to GitHub (no `git` needed)

1. On [github.com](https://github.com), create a **New repository** (e.g.
   `nextstep-africa`).
2. On the new repo's page, tap **uploading an existing file** (or **Add
   file → Upload files**).
3. The most reliable way to preserve the folder structure from a phone is
   **one file at a time via "Create new file"** rather than a bulk drag-drop:
   tap **Add file → Create new file**, and in the name field type the full
   path — e.g. `src/lib/supabase.ts` — GitHub creates the folders
   automatically. Paste that file's content, commit. Repeat for each file in
   this project.
   - Alternatively, if your phone's file picker supports multi-select,
     **Add file → Upload files** and select everything at once — GitHub's
     upload UI generally preserves relative paths from a folder selection on
     recent mobile browsers, but double-check the resulting file tree
     matches this project afterward.
4. You do **not** need to upload `node_modules` (doesn't exist here) or
   `bun.lock` — Cloudflare will install fresh dependencies from
   `package.json` during the build.

### 3. Connect Cloudflare Pages

1. On the [Cloudflare dashboard](https://dash.cloudflare.com), go to
   **Workers & Pages → Create → Pages → Connect to Git**.
2. Select your `nextstep-africa` repository.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Before deploying, expand **Environment variables** and add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
5. Click **Save and Deploy**. Every future push to `main` redeploys
   automatically — including if you edit a file directly on github.com from
   your phone.

That's it — no `npm install`, no `git clone`, no terminal.

---

## 📈 SEO — sitemap and RSS

Real, crawlable endpoints are served automatically once deployed:

- `https://your-site.pages.dev/sitemap.xml`
- `https://your-site.pages.dev/rss.xml`

Submit the sitemap URL to Google Search Console directly — no manual
copy-paste needed. (The **Build & Inspect** buttons in the admin panel still
exist as a quick in-browser preview, but the URLs above are the real,
crawler-reachable files.)

Once you're ready for a custom domain, buy `nextstepafrica.org` or
`.africa` (~$10–15/yr) and connect it under **Workers & Pages → your
project → Custom domains**. Nothing else about the setup changes.

---

## 🔒 Security notes

- Only ever create **one** Supabase Auth user for this project. The write
  policies grant full access to *any* signed-in user — that's fine for a
  single-admin site, but don't enable public sign-ups.
- The Supabase anon key is meant to be public (it's embedded in the client
  bundle by design) — access control is enforced entirely by the Row Level
  Security policies in `supabase-schema.sql`, not by hiding the key.
