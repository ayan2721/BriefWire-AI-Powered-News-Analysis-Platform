import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronUp, Shield, Zap, CheckCircle, TrendingUp } from 'lucide-react';

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show scroll to top button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <footer className="bg-slate-900 text-stone-300 border-t border-stone-800 mt-16 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer – only brand & description */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-600/20 group-hover:shadow-red-600/40 transition-all duration-300 group-hover:scale-105">
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
                <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-red-400 transition-colors">
                  Brief<span className="text-red-500">Wire</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium">
                  Daily Intelligence
                </span>
              </span>
            </Link>
            <p className="text-stone-400 leading-relaxed text-sm max-w-sm">
              AI-powered news intelligence delivering credible, summarized, 
              and bias-aware reporting from trusted sources worldwide.
            </p>
          </div>

          {/* Trust Badge – moved to the right side */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-stone-600">
            <span className="flex items-center gap-2 hover:text-stone-400 transition-colors">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              99.9% Uptime
            </span>
            <span className="flex items-center gap-2 hover:text-stone-400 transition-colors">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              AI-Powered
            </span>
            <span className="flex items-center gap-2 hover:text-stone-400 transition-colors">
              <CheckCircle className="w-3.5 h-3.5 text-yellow-500" />
              Fact-Checked
            </span>
            <span className="flex items-center gap-2 hover:text-stone-400 transition-colors">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              Ad-Free
            </span>
          </div>
        </div>

        {/* Footer Bottom – copyright, date/time, links, meet developer, back to top */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-stone-500">
            <span>
              © {new Date().getFullYear()} BriefWire. All rights reserved.
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <span className="text-stone-400">🕒</span>
              {formattedDate} • {formattedTime}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/privacy" className="text-stone-500 hover:text-white transition-colors duration-200">
              Privacy
            </Link>
            <span className="text-stone-700">•</span>
            <Link to="/terms" className="text-stone-500 hover:text-white transition-colors duration-200">
              Terms
            </Link>
            <span className="text-stone-700">•</span>
            <Link to="/cookies" className="text-stone-500 hover:text-white transition-colors duration-200">
              Cookies
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Meet the Developer */}
            <a
              href="https://portfolio-eight-black-87.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-white hover:underline transition-colors duration-200 text-sm font-medium"
            >
              Meet the Developer
            </a>
            <button
              onClick={scrollToTop}
              className="text-stone-500 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
              aria-label="Back to top"
            >
              <ChevronUp className="w-4 h-4" />
              Back to top
            </button>
          </div>
        </div>

        {/* Floating Back to Top (appears on scroll) */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/50 transition-all duration-300 hover:scale-110 z-50 group"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;