-- ============================================================
-- Fix: replace broken hand-picked Unsplash URLs with working Picsum ones.
-- Safe to run even if you never ran the seed script or never hit this bug —
-- every statement only touches rows matching these exact broken URLs, so
-- it will simply affect 0 rows if none exist.
-- Paste into Supabase SQL Editor -> New query -> Run.
-- ============================================================

-- Blog cover images
update public.blogs set image_url = 'https://picsum.photos/seed/nsa-default-blog/1200/800'
  where image_url like '%1434030216411-0b793f4b4173%';
update public.blogs set image_url = 'https://picsum.photos/seed/nsa-blog-2/1200/800'
  where image_url like '%1526374965328-7f61d4dc18c5%';
update public.blogs set image_url = 'https://picsum.photos/seed/nsa-blog-3/1200/800'
  where image_url like '%1516549655169-df83a0774514%';

-- Author avatars (stored inside the jsonb "author" column)
update public.blogs
  set author = jsonb_set(author, '{avatarUrl}', '"https://picsum.photos/seed/nsa-author-1/200/200"')
  where author->>'avatarUrl' like '%1534528741775-53994a69daeb%';
update public.blogs
  set author = jsonb_set(author, '{avatarUrl}', '"https://picsum.photos/seed/nsa-author-2/200/200"')
  where author->>'avatarUrl' like '%1573496359142-b8d87734a5a2%';
update public.blogs
  set author = jsonb_set(author, '{avatarUrl}', '"https://picsum.photos/seed/nsa-author-3/200/200"')
  where author->>'avatarUrl' like '%1500648767791-00dcc994a43e%';

-- In case any opportunity ended up with one of these too — clearing it lets
-- SmartImage's (now-fixed) fallback take over automatically.
update public.opportunities set image_url = null
  where image_url like '%1434030216411-0b793f4b4173%'
     or image_url like '%1526374965328-7f61d4dc18c5%'
     or image_url like '%1516549655169-df83a0774514%';
