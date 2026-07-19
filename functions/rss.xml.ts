// Cloudflare Pages Function — serves a live RSS 2.0 feed at
// https://your-site.pages.dev/rss.xml, built fresh from Supabase on every
// request, so feed readers and email tools can actually subscribe to it.

export const onRequest = async (context: any) => {
  const supabaseUrl = context.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = context.env.VITE_SUPABASE_ANON_KEY;
  const siteUrl = new URL(context.request.url).origin;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response('Supabase is not configured for this deployment.', { status: 500 });
  }

  const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` };

  const res = await fetch(
    `${supabaseUrl}/rest/v1/blogs?select=id,title,slug,excerpt,category,published_at&status=eq.published&order=published_at.desc&limit=20`,
    { headers }
  );
  const blogPosts: any[] = res.ok ? await res.json() : [];

  const escapeXml = (s: string) =>
    (s || '').replace(/[<>&'"]/g, (c) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string)
    );

  const items = blogPosts
    .map(
      (b) => `    <item>
      <title>${escapeXml(b.title)}</title>
      <link>${siteUrl}/?blogSlug=${b.slug}</link>
      <guid>${b.id}</guid>
      <pubDate>${new Date(b.published_at).toUTCString()}</pubDate>
      <description>${escapeXml(b.excerpt)}</description>
      <category>${escapeXml(b.category)}</category>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>NextStep Africa Public Health Opportunities Feed</title>
    <link>${siteUrl}</link>
    <description>Fellowships, internships, scholarships, and career guides for African public health students and professionals.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
