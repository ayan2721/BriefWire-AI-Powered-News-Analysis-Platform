import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Loader2, Newspaper, Sparkles, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function Loader({ label = 'Loading stories...', variant = 'default', fullScreen = false }) {
  const [loadingTips, setLoadingTips] = useState(0);
  
  const tips = [
    'AI is analyzing news sources...',
    'Curating the latest headlines...',
    'Fact-checking articles...',
    'Summarizing key stories...',
    'Fetching credible sources...',
    'Preparing your daily briefing...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTips((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    default: {
      spinner: 'border-t-red-700',
      bg: 'border-stone-200 bg-white',
      textColor: 'text-stone-500'
    },
    dark: {
      spinner: 'border-t-red-500',
      bg: 'border-stone-700 bg-stone-800',
      textColor: 'text-stone-400'
    },
    gradient: {
      spinner: 'border-t-red-500',
      bg: 'border-transparent bg-gradient-to-br from-red-50 to-stone-50',
      textColor: 'text-stone-600'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <LoaderContent 
          label={label} 
          variant={currentVariant} 
          tips={tips} 
          loadingTips={loadingTips} 
        />
      </div>
    );
  }

  return (
    <div className={`flex min-h-[240px] items-center justify-center rounded-2xl border ${currentVariant.bg} p-8 text-stone-700 shadow-sm`}>
      <LoaderContent 
        label={label} 
        variant={currentVariant} 
        tips={tips} 
        loadingTips={loadingTips} 
      />
    </div>
  );
}

function LoaderContent({ label, variant, tips, loadingTips }) {
  return (
    <div className="space-y-6 text-center max-w-sm">
      {/* Animated Logo/Icon */}
      <motion.div 
        className="relative mx-auto w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className={`absolute inset-0 rounded-full border-4 border-stone-200 ${variant.spinner}`}></div>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          <Newspaper className="w-8 h-8 text-red-700" />
        </div>
      </motion.div>

      {/* Loading Text with Typing Animation */}
      <div className="space-y-2">
        <motion.p 
          className={`font-serif text-lg font-semibold ${variant.textColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {label}
        </motion.p>
        
        <motion.p 
          className="text-sm text-stone-400"
          key={loadingTips}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {tips[loadingTips]}
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mx-auto">
        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "ease-in-out" }}
          />
        </div>
      </div>

      {/* Brand Link */}
      <Link to="/" className="inline-flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-700 text-stone-50 shadow-sm group-hover:shadow-md transition-shadow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 22V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <path d="M18 8h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4" />
            <path d="M8 6h6" />
            <path d="M8 10h6" />
            <path d="M8 14h4" />
          </svg>
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Brief<span className="text-red-700">Wire</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
            Daily Report
          </span>
        </span>
      </Link>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-4 text-xs text-stone-400">
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          AI Powered
        </span>
        <span className="w-px h-3 bg-stone-200" />
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Just a moment
        </span>
      </div>
    </div>
  );
}

// Additional loading variants for specific use cases
export function SkeletonLoader({ count = 3, type = 'card' }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm animate-pulse">
          <div className="aspect-[16/9] w-full bg-stone-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-stone-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-stone-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function MiniLoader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Loader2 className="w-5 h-5 animate-spin text-red-700" />
      <span className="text-sm text-stone-500">{label}</span>
    </div>
  );
}

export function DotLoader() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-red-700"
          animate={{
            y: ["0%", "-100%", "0%"],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default Loader;