import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, User, LogOut, Home, Newspaper, BarChart3, LayoutDashboard } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const toggleButtonRef = useRef(null); // NEW: ref for toggle button

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Close menus when clicking outside (fixed: ignore toggle button)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Mobile menu: close only if click is outside both the menu AND the toggle button
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
      // User menu: close if click is outside the user menu area
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
  }, [location]);

  // Prevent scroll when mobile menu is open
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

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/article', label: 'Explore', icon: Newspaper },
    { to: '/analyzer', label: 'Analyzer', icon: BarChart3 },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-sm">
      {/* Top strip: date + tagline */}
      <div className="border-b border-stone-100 bg-stone-50/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 text-xs text-stone-500 lg:px-8">
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group flex-shrink-0"
          onClick={() => setMobileMenuOpen(false)}
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

        {/* Auth actions */}
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

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-100 py-1 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
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
                </div>
              )}
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

          {/* Mobile Menu Toggle */}
          <button
            ref={toggleButtonRef} // NEW: ref attached
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors relative z-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-stone-700" />
            ) : (
              <Menu size={24} className="text-stone-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Navigation Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        // z-index changed from z-60 to z-[60] to ensure it works
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-100">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <span className="font-serif text-xl font-bold text-stone-900">
                Brief<span className="text-red-600">Wire</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-lg hover:bg-stone-100 transition-colors -mr-2"
              aria-label="Close menu"
            >
              <X size={24} className="text-stone-700" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <link.icon size={20} className={isActive(link.to) ? 'text-red-600' : 'text-stone-400'} />
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth Actions */}
            {!user && (
              <div className="pt-4 mt-4 border-t border-stone-100 space-y-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-4 mt-4 border-t border-stone-100">
                <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                    <p className="text-xs text-stone-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full mt-2 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 text-center">
              © {new Date().getFullYear()} BriefWire. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;