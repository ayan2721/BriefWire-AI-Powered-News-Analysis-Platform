import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, ChevronDown, LogOut, Home, Newspaper, BarChart3, LayoutDashboard, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/article', label: 'Explore', icon: Newspaper },
    { to: '/analyzer', label: 'Analyzer', icon: BarChart3 },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        {/* Top strip */}
        <div className="border-b border-stone-100 bg-stone-50/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-stone-500 lg:px-8">
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs">{today}</span>
            </span>
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium">
              Clear signal, less noise
            </span>
            <span className="hidden sm:inline text-[10px] text-stone-400">
              {user ? `Welcome, ${user.name}` : 'Stay Informed'}
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-600/20 group-hover:shadow-red-600/40 transition-all duration-300 group-hover:scale-105">
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
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                Brief<span className="text-red-600">Wire</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium hidden sm:block">
                Daily Intelligence
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-stone-600">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.to)
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <link.icon size={16} className={isActive(link.to) ? 'text-red-600' : 'text-stone-400'} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Auth + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-stone-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 bg-white shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium">{user.name}</span>
                  <ChevronDown
                    size={16}
                    className={`text-stone-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-100 py-1 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-stone-400" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-stone-100"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block rounded-full border border-stone-200 px-5 py-2 text-sm text-stone-700 transition-all hover:border-stone-400 hover:bg-stone-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={22} className="text-stone-700" />
            </button>
          </div>
        </div>
      </header>

      {/* ========== MOBILE MENU (portaled outside header to avoid z-index stacking) ========== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[101] md:hidden flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <Link to="/" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 22V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                      <path d="M18 8h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4" />
                      <path d="M8 6h6" />
                      <path d="M8 10h6" />
                      <path d="M8 14h4" />
                    </svg>
                  </span>
                  <span className="font-serif text-xl font-bold text-stone-900">
                    Brief<span className="text-red-600">Wire</span>
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} className="text-stone-600" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        isActive(link.to)
                          ? 'bg-red-50 text-red-700 font-semibold border border-red-100'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isActive(link.to)
                          ? 'bg-red-100'
                          : 'bg-stone-100'
                      }`}>
                        <link.icon size={18} className={isActive(link.to) ? 'text-red-600' : 'text-stone-500'} />
                      </span>
                      <span className="text-[15px]">{link.label}</span>
                      {isActive(link.to) && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* Analyze CTA */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="pt-3"
                >
                  <Link
                    to="/analyzer"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <span className="text-[15px] font-semibold block">AI Analysis</span>
                      <span className="text-[11px] text-red-200">Check any article's credibility</span>
                    </div>
                  </Link>
                </motion.div>

                {/* Auth Section */}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="pt-5 mt-4 border-t border-stone-100 space-y-2.5"
                  >
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="pt-5 mt-4 border-t border-stone-100"
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-red-600/20">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                      className="flex items-center gap-3 w-full mt-2.5 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </nav>

              {/* Panel Footer */}
              <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50">
                <p className="text-[11px] text-stone-400 text-center">
                  © {new Date().getFullYear()} BriefWire · Daily Intelligence
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;