import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, ArrowRight } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">BriefWire</p>
            <h1 className="font-serif text-3xl font-bold text-stone-900">Welcome back</h1>
          </div>
        </div>
        <p className="mt-1 leading-7 text-stone-600">
          Access AI‑powered news analysis, bookmarks, and your archive.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Email
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 pl-11 pr-4 py-3 text-stone-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
                  placeholder="you@example.com"
                />
              </div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Password
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 pl-11 pr-4 py-3 text-stone-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
                  placeholder="••••••••"
                />
              </div>
            </label>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
            >
              <span className="text-red-500">⚠️</span>
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-red-700 px-6 py-3 text-base font-medium text-white transition hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-700/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⟳</span>
                Logging in…
              </>
            ) : (
              <>
                Login
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-stone-600 text-center">
          New to BriefWire?{' '}
          <Link to="/register" className="font-medium text-red-700 hover:text-red-800 hover:underline transition">
            Create an account
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

export default Login;