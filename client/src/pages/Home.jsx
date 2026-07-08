import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import NewsCard from '../components/NewsCard.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Footer from '../components/Footer.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Sparkles, ChevronRight, Clock, Zap } from 'lucide-react';

const categories = ['world', 'business', 'technology', 'sports', 'science', 'health', 'entertainment'];

function BriefWireLogo({ className = '' }) {
  return (
    <a href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="BriefWire home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-stone-50 shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h11a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h6M7 12.5h6M7 16h4" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
          Brief<span className="text-red-700">Wire</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-stone-500">Daily Report</span>
      </span>
    </a>
  );
}

function Home() {
  const [category, setCategory] = useState('world');
  const [search, setSearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  // Handle scroll for sticky elements
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data, isLoading, isError, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['feed', category],
    queryFn: () => fetchFeed(category),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const feed = data?.feed ?? [];

  const filteredFeed = useMemo(() => {
    if (!search.trim()) return feed;
    const q = search.toLowerCase();
    return feed.filter((item) => 
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.source?.toLowerCase().includes(q)
    );
  }, [feed, search]);

  const [heroStory, ...restStories] = filteredFeed;

  const lastUpdatedLabel = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const today = new Date().toLocaleDateString([], { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Masthead */}
      <div className="mt-4 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
            {today}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Zap size={14} className="text-amber-500" />
            AI-Powered
          </span>
          <span className="w-px h-4 bg-stone-300" />
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Updated {lastUpdatedLabel || 'recently'}
          </span>
        </div>
      </div>

      {/* Breaking news ticker */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 overflow-hidden rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm text-stone-600 shadow-sm"
      >
        <span className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-red-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
          LIVE
        </span>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <span className="inline-block animate-[marquee_28s_linear_infinite]">
            {feed.slice(0, 6).map((item, i) => (
              <span key={item.link || i} className="mx-6 text-stone-500">
                {item.title}
              </span>
            ))}
          </span>
        </div>
        {lastUpdatedLabel && (
          <span className="whitespace-nowrap text-xs text-stone-400 hidden sm:inline">
            Updated {lastUpdatedLabel}
          </span>
        )}
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white to-stone-50/50 p-8 shadow-sm"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-700 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-700" />
              Breaking News
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold text-stone-900 text-balance sm:text-5xl lg:text-6xl">
              News intelligence beyond the headlines.
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-stone-600 text-lg">
              Discover trending stories, compare coverage, and analyze credibility with AI-powered insights.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link 
              to="/analyzer" 
              className="group rounded-3xl bg-red-700 px-6 py-4 text-center font-medium text-white shadow-lg shadow-red-700/20 transition-all hover:bg-red-800 hover:shadow-red-700/40 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Analyze Article
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {user ? (
              <Link 
                to="/dashboard" 
                className="rounded-3xl bg-stone-800 px-6 py-4 text-center font-medium text-white shadow-lg shadow-stone-800/20 transition-all hover:bg-stone-900 hover:shadow-stone-800/40"
              >
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${category} headlines...`}
              className="w-full rounded-2xl border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-700/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full space-y-6 lg:w-72 lg:sticky lg:top-24 lg:self-start">
          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-red-700" />
              Categories
            </h2>
            <div className="mt-4 grid gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    category === item 
                      ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' 
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:translate-x-1'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category === item && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </span>
                  {category === item && (
                    <ChevronRight size={16} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Trending */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-red-700" />
              Trending Now
            </h2>
            <ol className="mt-4 space-y-4">
              {feed.slice(0, 5).map((item, i) => (
                <li key={item.link || i} className="group flex gap-3 items-start">
                  <span className="font-serif text-lg font-bold text-red-700/60 min-w-[28px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a 
                    href={item.link || '#'} 
                    className="text-sm text-stone-600 transition hover:text-stone-900 line-clamp-2 hover:underline"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Quick Stats */}
          <div className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-red-50 to-stone-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-700">Live Feed</p>
            <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
              {filteredFeed.length}
            </p>
            <p className="text-sm text-stone-500">stories available</p>
          </div>
        </aside>

        {/* Feed */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span className="w-1 h-8 rounded-full bg-red-700" />
              {category.charAt(0).toUpperCase() + category.slice(1)} Headlines
            </h2>
            {!isLoading && !isError && (
              <span className="text-sm text-stone-400">
                {filteredFeed.length} {filteredFeed.length === 1 ? 'story' : 'stories'}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isLoading && <Loader label="Loading latest headlines..." />}
            
            {isError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-red-300 bg-red-50 p-8 text-red-800 text-center"
              >
                <p className="font-semibold">Unable to load news</p>
                <p className="text-sm mt-2">Please try again later</p>
                <button 
                  onClick={() => refetch()}
                  className="mt-4 px-6 py-2 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors"
                >
                  Retry
                </button>
              </motion.div>
            )}

            {!isLoading && !isError && filteredFeed.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-stone-200 bg-white p-12 text-center text-stone-500"
              >
                <p className="text-lg font-serif">No headlines match &ldquo;{search}&rdquo;</p>
                <p className="text-sm mt-2">Try adjusting your search or category</p>
              </motion.div>
            )}

            {!isLoading && !isError && heroStory && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <NewsCard item={heroStory} featured={true} />
              </motion.div>
            )}

            {!isLoading && !isError && restStories.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid gap-6 md:grid-cols-2"
              >
                {restStories.map((item, index) => (
                  <motion.div
                    key={item.link || item.title || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NewsCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More */}
          {!isLoading && !isError && filteredFeed.length > 6 && (
            <div className="mt-8 text-center">
              <button className="px-8 py-3 rounded-full border border-stone-200 text-stone-600 hover:border-red-700 hover:text-red-700 transition-all hover:shadow-lg">
                Load More Stories
                <ChevronRight size={16} className="inline ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Home;