import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, Bookmark, Share2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function NewsCard({ item, featured = false, onBookmark, onShare }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    item.image ||
    item.imageUrl ||
    item.urlToImage ||
    item.thumbnail ||
    item.image_url ||
    '/news-placeholder.png';

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!content) return '2 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime <= 1 ? '1 min read' : `${readTime} min read`;
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark(item, !isBookmarked);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(item);
    } else if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description || item.excerpt || '',
        url: item.link || item.url || window.location.href,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      const url = item.link || item.url || window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        // You could show a toast notification here
        console.log('Link copied to clipboard');
      }).catch(() => {});
    }
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-stone-300 ${
        featured ? 'lg:col-span-2 lg:row-span-2' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-100 to-stone-200 animate-pulse" />
        )}
        
        <img
          src={imageError ? '/news-placeholder.png' : imageUrl}
          alt={item.title || 'News article image'}
          loading="lazy"
          crossOrigin="anonymous"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-red-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg">
          {item.category || item.section || 'General'}
        </span>

        {/* Featured Badge */}
        {featured && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="font-semibold uppercase tracking-[0.15em] text-red-600">
            {item.source || item.publisher || 'News'}
          </span>
          <span className="w-px h-3 bg-stone-300" />
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(item.publishedAt || item.date || item.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className={`mt-2 font-serif font-bold leading-snug text-stone-900 line-clamp-2 ${
          featured ? 'text-2xl' : 'text-lg'
        }`}>
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm leading-6 text-stone-600 line-clamp-3">
          {item.description || item.excerpt || item.summary || item.content?.slice(0, 150)}
        </p>

        {/* Read time */}
        <div className="mt-3 flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {calculateReadTime(item.content || item.description || item.excerpt)}
          </span>
          {item.author && (
            <>
              <span className="w-px h-3 bg-stone-300" />
              <span>By {item.author}</span>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-stone-100">
          <Link
            to={item.link || item.url || '#'}
            target={item.link || item.url ? "" : ""}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 transition-all hover:text-red-700 group-hover:gap-2"
          >
            Read Article
            <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <div className="flex items-center gap-1">
            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark 
                size={18} 
                className={`transition-all duration-200 ${
                  isBookmarked ? 'fill-red-600 text-red-600' : ''
                }`}
              />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              aria-label="Share article"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default NewsCard;