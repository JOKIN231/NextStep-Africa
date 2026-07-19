import React, { useState } from 'react';
import { Calendar, User, Clock, ArrowRight, X, Facebook, Twitter, Linkedin, Link2, BookOpen, MessageSquare } from 'lucide-react';
import { BlogPost } from '../types';
import { db } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface BlogCardProps {
  key?: string;
  post: BlogPost;
  onReadPost?: (post: BlogPost) => void;
  onTagClick?: (tag: string) => void;
}

export default function BlogCard({ post, onReadPost, onTagClick }: BlogCardProps) {
  const [showFullPost, setShowFullPost] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
        return 'bg-brand-navy/10 text-brand-navy border-brand-navy/10';
      case 'Public Health News':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/10';
      case 'Alumni Spotlight':
        return 'bg-brand-green/10 text-brand-green border-brand-green/10';
      case 'Academic Resource':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleShare = (platform: 'fb' | 'tw' | 'li' | 'copy') => {
    const shareUrl = `${window.location.origin}/?blogSlug=${post.slug}`;
    const text = `Read "${post.title}" on NextStep Africa`;
    
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
    .filter(b => b.category === post.category && b.id !== post.id && b.status === 'published')
    .slice(0, 2);

  // Generate JSON-LD Schema structured data dynamically for Google SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.imageUrl],
    "datePublished": post.publishedAt,
    "author": [{
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    }],
    "publisher": {
      "@type": "Organization",
      "name": "NextStep Africa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1516549655169-df83a0774514"
      }
    },
    "description": post.excerpt
  };

  return (
    <>
      {/* Blog Item Grid Card */}
      <motion.div
        id={`blog-card-${post.id}`}
        layout
        whileHover={{ y: -6, boxShadow: '0 16px 32px -12px rgba(13, 71, 161, 0.12)' }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col justify-between group transition-all duration-350 hover:border-brand-navy/40"
      >
        <div>
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              id={`blog-image-${post.id}`}
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span
                id={`blog-card-cat-${post.id}`}
                className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-sm ${categoryStyles(post.category)} bg-white/95 backdrop-blur-xs`}
              >
                {post.category}
              </span>
            </div>
          </div>

          {/* Padding Contents */}
          <div className="p-5">
            {/* Metadata Line */}
            <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 font-semibold mb-3">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-slate-300" />
                {formattedDate(post.publishedAt)}
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-slate-300" />
                {post.readTimeMin} min read
              </span>
            </div>

            {/* Title & Excerpt */}
            <h3 className="font-display font-bold text-base text-brand-navy leading-snug line-clamp-2 mb-2 hover:text-brand-orange transition-colors">
              {post.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Card bottom footer */}
        <div className="px-5 pb-5 pt-0">
          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
            <div className="flex items-center space-x-2">
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-100"
              />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-1">{post.author.name}</p>
                <p className="text-[9px] text-slate-400 line-clamp-1">{post.author.role.split(',')[0]}</p>
              </div>
            </div>

            <button
              id={`blog-read-btn-${post.id}`}
              onClick={() => {
                setShowFullPost(true);
                if (onReadPost) onReadPost(post);
              }}
              className="flex items-center space-x-1 text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <span>Read article</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full Article Reader Screen */}
      <AnimatePresence>
        {showFullPost && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end">
            
            {/* Inject JSON-LD Schema for search bots dynamically in window */}
            <script type="application/ld+json">
              {JSON.stringify(jsonLdSchema)}
            </script>

            <motion.div
              id={`blog-reader-${post.id}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-white w-full max-w-3xl min-h-screen shadow-2xl relative flex flex-col justify-between overflow-x-hidden"
            >
              {/* Reader Top Sticky Bar */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryStyles(post.category)}`}>
                    {post.category}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {post.readTimeMin} min read
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    id={`reader-close-${post.id}`}
                    onClick={() => setShowFullPost(false)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Close Reader"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress scrollbar */}
              <div className="h-1 w-full bg-slate-100 absolute top-[57px] left-0 right-0 z-30">
                <div className="h-full bg-brand-orange w-3/5"></div> {/* Visual progress bar */}
              </div>

              {/* Scrollable Reader Body */}
              <div className="p-6 md:p-10 space-y-8 flex-1">
                
                {/* Title and date */}
                <div className="space-y-3">
                  <h1 className="font-display font-extrabold text-2xl md:text-3xl text-brand-navy leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Published on {formattedDate(post.publishedAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      {post.viewsCount} views
                    </span>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden h-64 md:h-80 bg-slate-100 border border-slate-100 shadow-sm">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Grid layout for Article Body & Share Side Rail */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Share Rail (Left Side on Desktop) */}
                  <div className="lg:col-span-1 flex lg:flex-col lg:items-center justify-start gap-3 border-r border-slate-50 lg:pr-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono hidden lg:block mb-1">
                      Share
                    </span>
                    <button
                      id={`share-fb-${post.id}`}
                      onClick={() => handleShare('fb')}
                      className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      id={`share-tw-${post.id}`}
                      onClick={() => handleShare('tw')}
                      className="p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      id={`share-li-${post.id}`}
                      onClick={() => handleShare('li')}
                      className="p-2 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button
                      id={`share-copy-${post.id}`}
                      onClick={() => handleShare('copy')}
                      className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer relative"
                      title="Copy Article Link"
                    >
                      <Link2 className="w-4 h-4" />
                      {copiedLink && (
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-mono z-50 mb-1">
                          Copied
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Real Content Body */}
                  <div className="lg:col-span-11 prose prose-slate max-w-none text-slate-700">
                    <div className="markdown-body">
                      {post.content.split('\n\n').map((para, i) => {
                        if (para.startsWith('### ')) {
                          return <h3 key={i} className="text-lg font-bold text-brand-navy mt-6 mb-3">{para.replace('### ', '')}</h3>;
                        } else if (para.startsWith('## ')) {
                          return <h2 key={i} className="text-xl font-bold text-brand-navy mt-8 mb-4 border-b border-slate-100 pb-2">{para.replace('## ', '')}</h2>;
                        } else if (para.startsWith('* ')) {
                          return (
                            <ul key={i} className="list-disc pl-5 my-3 text-sm space-y-1">
                              {para.split('\n').map((li, idx) => (
                                <li key={idx}>{li.replace('* ', '')}</li>
                              ))}
                            </ul>
                          );
                        } else if (para.match(/^\d+\./)) {
                          return (
                            <ol key={i} className="list-decimal pl-5 my-3 text-sm space-y-1">
                              {para.split('\n').map((li, idx) => (
                                <li key={idx}>{li.replace(/^\d+\.\s*/, '')}</li>
                              ))}
                            </ol>
                          );
                        }
                        return <p key={i} className="text-sm leading-relaxed mb-4">{para}</p>;
                      })}
                    </div>

                    {/* Author Box */}
                    <div className="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="text-left space-y-1">
                        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-400">
                          About the Author
                        </span>
                        <h4 className="font-display font-bold text-sm text-brand-navy">
                          {post.author.name}
                        </h4>
                        <p className="text-xs text-slate-500 leading-tight">
                          {post.author.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Articles Suggestions */}
                {relatedBlogs.length > 0 && (
                  <div className="border-t border-slate-100 pt-10 space-y-4">
                    <h4 className="font-display font-bold text-base text-brand-navy flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-brand-orange" />
                      Recommended Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedBlogs.map((relPost) => (
                        <div
                          key={relPost.id}
                          className="p-4 rounded-xl border border-slate-200/60 bg-white hover:border-brand-navy/20 transition-all flex flex-col justify-between cursor-pointer"
                          onClick={() => {
                            setShowFullPost(false);
                            // Settimeout to let exit animation play, then open next
                            setTimeout(() => {
                              post = relPost;
                              setShowFullPost(true);
                            }, 300);
                          }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded">
                              {relPost.category}
                            </span>
                            <h5 className="font-display font-bold text-xs text-brand-navy mt-1.5 leading-snug line-clamp-2">
                              {relPost.title}
                            </h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-3 block">
                            {relPost.readTimeMin} min read
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reader Bottom Sticky Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-20">
                <span className="text-xs text-slate-500 font-mono">
                  Read from NextStep Africa
                </span>
                <button
                  id={`reader-bottom-close-${post.id}`}
                  onClick={() => setShowFullPost(false)}
                  className="bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
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
