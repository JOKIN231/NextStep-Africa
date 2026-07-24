import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, X, Facebook, Twitter, Linkedin, Link2, BookOpen } from 'lucide-react';
import { BlogPost } from '../types';
import { db } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import SmartImage from './SmartImage';

// Posts written with the rich text editor are stored as real HTML. Posts
// published before that editor existed still use the old ##/* shortcut
// format — this tells the two apart so both keep rendering correctly.
function isHtmlContent(content: string): boolean {
  return /^\s*<[a-z][\s\S]*>/i.test(content.trim());
}

// Content only ever comes from the single authenticated admin account, so
// this is a light safety net rather than a full sanitizer — just strips
// anything that could execute script, nothing else.
function sanitizeForDisplay(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '');
}

interface BlogCardProps {
  key?: string;
  post: BlogPost;
  onReadPost?: (post: BlogPost) => void;
  onTagClick?: (tag: string) => void;
}

export default function BlogCard({ post, onReadPost }: BlogCardProps) {
  const [showFullPost, setShowFullPost] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePost, setActivePost] = useState(post);

  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const categoryStyles = (cat: string) => {
    switch (cat) {
      case 'Career Guide':
        return 'bg-glow-indigo/10 text-glow-indigo border-glow-indigo/25';
      case 'Public Health News':
        return 'bg-amber-signal/10 text-amber-signal border-amber-signal/25';
      case 'Alumni Spotlight':
        return 'bg-pulse/10 text-pulse border-pulse/25';
      case 'Academic Resource':
        return 'bg-purple-400/10 text-purple-300 border-purple-400/25';
      default:
        return 'bg-white/10 text-frost-dim border-white/15';
    }
  };

  const handleShare = (platform: 'fb' | 'tw' | 'li' | 'copy') => {
    const shareUrl = `${window.location.origin}/?blogSlug=${activePost.slug}`;
    const text = `Read "${activePost.title}" on NextStep Africa`;

    if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'tw') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'li') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find related articles of same category
  const allBlogs = db.getBlogs();
  const relatedBlogs = allBlogs
    .filter(b => b.category === activePost.category && b.id !== activePost.id && b.status === 'published')
    .slice(0, 2);

  // Generate JSON-LD Schema structured data dynamically for Google SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": activePost.title,
    "image": [activePost.imageUrl],
    "datePublished": activePost.publishedAt,
    "author": [{
      "@type": "Person",
      "name": activePost.author.name,
      "jobTitle": activePost.author.role
    }],
    "publisher": {
      "@type": "Organization",
      "name": "NextStep Africa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1516549655169-df83a0774514"
      }
    },
    "description": activePost.excerpt
  };

  return (
    <>
      {/* Blog Item Grid Card */}
      <motion.div
        id={`blog-card-${post.id}`}
        layout
        whileHover={{ y: -6 }}
        className="group bg-glass/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:border-white/25 hover:shadow-2xl hover:shadow-emerald-500/10"
      >
        <div>
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden bg-glass">
            <SmartImage
              src={post.imageUrl}
              seed={post.id}
              category={post.category}
              alt={post.title}
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span
                id={`blog-card-cat-${post.id}`}
                className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${categoryStyles(post.category)}`}
              >
                {post.category}
              </span>
            </div>
          </div>

          {/* Padding Contents */}
          <div className="p-5">
            {/* Metadata Line */}
            <div className="flex items-center space-x-3 text-[10px] font-mono text-frost-dim font-semibold mb-3">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-frost-dim" />
                {formattedDate(post.publishedAt)}
              </span>
              <span className="text-white/15">•</span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-frost-dim" />
                {post.readTimeMin} min read
              </span>
            </div>

            {/* Title & Excerpt */}
            <h3 className="font-display font-bold text-base text-frost leading-snug line-clamp-2 mb-2 group-hover:text-amber-signal transition-colors duration-300">
              {post.title}
            </h3>
            <p className="text-xs text-frost-dim line-clamp-3 leading-relaxed mb-4">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Card bottom footer */}
        <div className="px-5 pb-5 pt-0">
          <div className="flex items-center justify-between border-t border-white/10 pt-3.5">
            <div className="flex items-center space-x-2">
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-white/15"
              />
              <div className="text-left">
                <p className="text-[10px] font-bold text-frost leading-tight line-clamp-1">{post.author.name}</p>
                <p className="text-[9px] text-frost-dim line-clamp-1">{post.author.role.split(',')[0]}</p>
              </div>
            </div>

            <button
              id={`blog-read-btn-${post.id}`}
              onClick={() => {
                setActivePost(post);
                setShowFullPost(true);
                if (onReadPost) onReadPost(post);
              }}
              className="flex items-center space-x-1 text-xs font-bold text-frost hover:text-amber-signal transition-colors duration-300 cursor-pointer group/btn"
            >
              <span>Read article</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full Article Reader Screen */}
      <AnimatePresence>
        {showFullPost && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-void-deep/80 backdrop-blur-xs flex justify-end">

            {/* Inject JSON-LD Schema for search bots dynamically in window */}
            <script type="application/ld+json">
              {JSON.stringify(jsonLdSchema)}
            </script>

            <motion.div
              id={`blog-reader-${activePost.id}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-void w-full max-w-3xl min-h-screen shadow-2xl relative flex flex-col justify-between overflow-x-hidden"
            >
              {/* Reader Top Sticky Bar */}
              <div className="sticky top-0 z-20 bg-void/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryStyles(activePost.category)}`}>
                    {activePost.category}
                  </span>
                  <span className="text-white/15">|</span>
                  <span className="text-[10px] text-frost-dim font-mono flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-frost-dim" />
                    {activePost.readTimeMin} min read
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    id={`reader-close-${activePost.id}`}
                    onClick={() => setShowFullPost(false)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-frost-dim hover:text-frost transition-all duration-300 ease-out cursor-pointer"
                    title="Close Reader"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress scrollbar */}
              <div className="h-1 w-full bg-white/10 absolute top-[57px] left-0 right-0 z-30">
                <div className="h-full bg-amber-signal w-3/5"></div>
              </div>

              {/* Scrollable Reader Body */}
              <div className="p-6 md:p-10 space-y-8 flex-1">

                {/* Title and date */}
                <div className="space-y-3">
                  <h1 className="font-display font-extrabold text-2xl md:text-3xl text-frost leading-tight">
                    {activePost.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-frost-dim font-mono">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Published on {formattedDate(activePost.publishedAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      {activePost.viewsCount} views
                    </span>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden h-64 md:h-80 border border-white/10 shadow-sm">
                  <SmartImage
                    src={activePost.imageUrl}
                    seed={activePost.id}
                    category={activePost.category}
                    alt={activePost.title}
                    className="w-full h-full"
                  />
                </div>

                {/* Grid layout for Article Body & Share Side Rail */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                  {/* Share Rail (Left Side on Desktop) */}
                  <div className="lg:col-span-1 flex lg:flex-col lg:items-center justify-start gap-3 border-r border-white/10 lg:pr-4">
                    <span className="text-[10px] font-bold text-frost-dim uppercase tracking-widest font-mono hidden lg:block mb-1">
                      Share
                    </span>
                    <button
                      id={`share-fb-${activePost.id}`}
                      onClick={() => handleShare('fb')}
                      className="p-2 rounded-full bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all duration-300 ease-out cursor-pointer"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      id={`share-tw-${activePost.id}`}
                      onClick={() => handleShare('tw')}
                      className="p-2 rounded-full bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-all duration-300 ease-out cursor-pointer"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      id={`share-li-${activePost.id}`}
                      onClick={() => handleShare('li')}
                      className="p-2 rounded-full bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all duration-300 ease-out cursor-pointer"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button
                      id={`share-copy-${activePost.id}`}
                      onClick={() => handleShare('copy')}
                      className="p-2 rounded-full bg-white/10 text-frost-dim hover:bg-white/15 transition-all duration-300 ease-out cursor-pointer relative"
                      title="Copy Article Link"
                    >
                      <Link2 className="w-4 h-4" />
                      {copiedLink && (
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-void border border-white/15 text-frost text-[9px] px-1.5 py-0.5 rounded font-mono z-50 mb-1">
                          Copied
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Real Content Body */}
                  <div className="lg:col-span-11 max-w-none text-frost-dim">
                    {isHtmlContent(activePost.content) ? (
                      // New editor output — real HTML, safe here because only the
                      // single authenticated admin can ever write this content.
                      <div
                        className="rendered-article-content text-sm"
                        dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(activePost.content) }}
                      />
                    ) : (
                      // Older posts published before the rich text editor existed,
                      // still using the old ## / * shortcut format.
                      <div className="markdown-body">
                        {activePost.content.split('\n\n').map((para, i) => {
                          if (para.startsWith('### ')) {
                            return <h3 key={i} className="text-lg font-bold text-frost mt-6 mb-3">{para.replace('### ', '')}</h3>;
                          } else if (para.startsWith('## ')) {
                            return <h2 key={i} className="text-xl font-bold text-frost mt-8 mb-4 border-b border-white/10 pb-2">{para.replace('## ', '')}</h2>;
                          } else if (para.startsWith('* ')) {
                            return (
                              <ul key={i} className="list-disc pl-5 my-3 text-sm space-y-1 marker:text-amber-signal">
                                {para.split('\n').map((li, idx) => (
                                  <li key={idx}>{li.replace('* ', '')}</li>
                                ))}
                              </ul>
                            );
                          } else if (para.match(/^\d+\./)) {
                            return (
                              <ol key={i} className="list-decimal pl-5 my-3 text-sm space-y-1 marker:text-amber-signal marker:font-bold">
                                {para.split('\n').map((li, idx) => (
                                  <li key={idx}>{li.replace(/^\d+\.\s*/, '')}</li>
                                ))}
                              </ol>
                            );
                          }
                          return <p key={i} className="text-sm leading-relaxed mb-4">{para}</p>;
                        })}
                      </div>
                    )}

                    {/* Author Box */}
                    <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <img
                        src={activePost.author.avatarUrl}
                        alt={activePost.author.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/15 shadow-sm"
                      />
                      <div className="text-left space-y-1">
                        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-frost-dim">
                          About the Author
                        </span>
                        <h4 className="font-display font-bold text-sm text-frost">
                          {activePost.author.name}
                        </h4>
                        <p className="text-xs text-frost-dim leading-tight">
                          {activePost.author.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Articles Suggestions */}
                {relatedBlogs.length > 0 && (
                  <div className="border-t border-white/10 pt-10 space-y-4">
                    <h4 className="font-display font-bold text-base text-frost flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-amber-signal" />
                      Recommended Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedBlogs.map((relPost) => (
                        <div
                          key={relPost.id}
                          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07] transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer"
                          onClick={() => {
                            setActivePost(relPost);
                            window.scrollTo({ top: 0 });
                          }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold text-amber-signal bg-amber-signal/10 px-2 py-0.5 rounded">
                              {relPost.category}
                            </span>
                            <h5 className="font-display font-bold text-xs text-frost mt-1.5 leading-snug line-clamp-2">
                              {relPost.title}
                            </h5>
                          </div>
                          <span className="text-[10px] text-frost-dim font-mono mt-3 block">
                            {relPost.readTimeMin} min read
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reader Bottom Sticky Bar */}
              <div className="p-4 bg-void border-t border-white/10 flex items-center justify-between sticky bottom-0 z-20">
                <span className="text-xs text-frost-dim font-mono">
                  Read from NextStep Africa
                </span>
                <button
                  id={`reader-bottom-close-${activePost.id}`}
                  onClick={() => setShowFullPost(false)}
                  className="bg-amber-signal hover:bg-amber-signal-hover text-void text-xs font-bold px-4 py-1.5 rounded-lg transition-all duration-300 ease-out cursor-pointer active:scale-95"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
