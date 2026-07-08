import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ChevronUp, Shield, Zap, CheckCircle, TrendingUp, 
  Mail, Heart, ArrowUpRight, Sparkles,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/article', label: 'Explore' },
    { to: '/analyzer', label: 'Analyzer' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  const resourceLinks = [
    { label: 'How It Works', href: '#' },
    { label: 'API Documentation', href: '#' },
    { label: 'Source Methodology', href: '#' },
    { label: 'Bias Detection', href: '#' },
  ];

  const legalLinks = [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/cookies', label: 'Cookie Policy' },
  ];

  const trustBadges = [
    { icon: Shield, label: '99.9% Uptime', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Zap, label: 'AI-Powered', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: CheckCircle, label: 'Fact-Checked', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: TrendingUp, label: 'Ad-Free', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      {/* Main footer background */}
      <div className="bg-stone-950 relative">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Section */}
          <div className="py-10 border-b border-stone-800/60">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10">
                    <Mail className="h-4 w-4 text-red-500" />
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">Stay Informed</h3>
                </div>
                <p className="text-sm text-stone-400 max-w-md leading-relaxed">
                  Get daily AI-curated news briefs delivered to your inbox. No spam, just signal.
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-72">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl bg-stone-900 border border-stone-700/50 px-4 py-2.5 text-sm text-white placeholder:text-stone-500 outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 hover:shadow-red-600/30 whitespace-nowrap flex items-center gap-2"
                >
                  {subscribed ? (
                    <>
                      <CheckCircle size={14} />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Subscribe
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>

          {/* Main Grid */}
          <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-5">
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20 group-hover:shadow-red-600/40 transition-all duration-300 group-hover:scale-105">
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
                  <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-medium">
                    Daily Intelligence
                  </span>
                </span>
              </Link>
              <p className="text-stone-400 leading-relaxed text-sm max-w-xs">
                AI-powered news intelligence delivering credible, summarized,
                and bias-aware reporting from trusted sources worldwide.
              </p>


            </div>

            {/* Navigation Column */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mb-4 flex items-center gap-2">
                <span className="h-px w-3 bg-red-600" />
                Navigate
              </h4>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-stone-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="h-1 w-1 rounded-full bg-stone-700 group-hover:bg-red-500 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mb-4 flex items-center gap-2">
                <span className="h-px w-3 bg-red-600" />
                Resources
              </h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="h-1 w-1 rounded-full bg-stone-700 group-hover:bg-red-500 transition-colors" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust & Status Column */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mb-4 flex items-center gap-2">
                <span className="h-px w-3 bg-red-600" />
                Platform Status
              </h4>
              <div className="space-y-2.5">
                {trustBadges.map((badge) => (
                  <div
                    key={badge.label}
                    className={`flex items-center gap-3 rounded-xl ${badge.bg} border border-stone-800/50 px-3.5 py-2.5 transition-colors hover:border-stone-700`}
                  >
                    <badge.icon className={`w-4 h-4 ${badge.color}`} />
                    <span className="text-sm text-stone-300 font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-stone-800/60 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Copyright & Date */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-stone-500">
                <span>© {new Date().getFullYear()} BriefWire. All rights reserved.</span>
                <span className="hidden sm:inline text-stone-700">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={11} className="text-stone-600" />
                  {formattedDate} · {formattedTime}
                </span>
                <span className="hidden sm:inline text-stone-700">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-medium">All systems operational</span>
                </span>
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {legalLinks.map((link, idx) => (
                  <span key={link.to} className="flex items-center gap-4">
                    <Link
                      to={link.to}
                      className="text-stone-500 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                    {idx < legalLinks.length - 1 && (
                      <span className="text-stone-800">·</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Meet Developer & Back to top */}
              <div className="flex items-center gap-4">
                <a
                  href="https://portfolio-eight-black-87.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-400 transition-colors duration-200 group"
                >
                  <Heart size={12} className="text-red-600 group-hover:animate-pulse" />
                  <span>Made by</span>
                  <span className="font-medium text-stone-400 group-hover:text-red-400 transition-colors">
                    Ayan
                  </span>
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <button
                  onClick={scrollToTop}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-white transition-colors duration-200 group rounded-lg border border-stone-800 px-3 py-1.5 hover:border-stone-600 hover:bg-stone-900"
                  aria-label="Back to top"
                >
                  <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                  Top
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top (appears on scroll) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/50 transition-all duration-300 hover:scale-110 z-50 group border border-red-500/20"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;