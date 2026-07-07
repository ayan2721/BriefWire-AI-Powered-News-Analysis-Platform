import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { analyzeArticle } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, BarChart3, Search, ShieldCheck, CheckCircle2, Info, 
  Send, Sparkles, AlertCircle, Globe, BookOpen, TrendingUp,
  Award, Target, Zap, Clock, Link as LinkIcon, Type, 
  ChevronDown, ChevronUp, Copy, Check, Eye, EyeOff,
  List, LayoutGrid, Grid, Layers, PieChart, Hash, AlignLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ---------- Formatting helpers ---------- */

function humanizeKey(key) {
  return String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeMarkdownText(value) {
  if (typeof value === 'string') {
    const fence = value.trim().match(/^```(?:\w+)?\s*([\s\S]*?)\s*```$/i);
    return fence ? fence[1].trim() : value;
  }
  if (value && typeof value === 'object') {
    if (typeof value.analysis === 'string') return value.analysis;
    if (typeof value.content === 'string') return value.content;
    if (typeof value.markdown === 'string') return value.markdown;
    if (typeof value.text === 'string') return value.text;
    if (typeof value.message === 'string') return value.message;
    return objectToMarkdown(value);
  }
  return '';
}

function objectToMarkdown(val, depth = 0) {
  if (val == null) return '';
  if (typeof val !== 'object') return String(val);
  const lines = [];
  const entries = Array.isArray(val) ? val.entries() : Object.entries(val);
  for (const [k, v] of entries) {
    const label = Array.isArray(val) ? '' : `**${humanizeKey(k)}:** `;
    if (v && typeof v === 'object') {
      lines.push(`${'#'.repeat(Math.min(6, depth + 3))} ${humanizeKey(String(k))}`);
      lines.push(objectToMarkdown(v, depth + 1));
    } else {
      lines.push(`- ${label}${v}`);
    }
  }
  return lines.join('\n');
}

function parseCredibility(md) {
  if (typeof md !== 'string' || !md.trim()) return { scores: [], rest: '' };
  const lineRe =
    /^\s*(?:[-*]\s*)?(?:\*\*|__)?\s*([A-Za-z][A-Za-z0-9 /&'’-]{1,40}?)\s*(?:\*\*|__)?\s*[:：]\s*\**\s*(\d{1,3}(?:\.\d+)?)\s*(%|\/\s*100|\/\s*10|\/\s*5)?\s*\**\s*$/;
  const scoreKeyword =
    /score|rating|credibility|bias|reliab|trust|accuracy|confidence|quality|objectiv|integrity/i;

  const scores = [];
  const rest = [];
  for (const line of md.split('\n')) {
    const m = line.match(lineRe);
    if (m) {
      const label = m[1].trim();
      const num = parseFloat(m[2]);
      const suffix = (m[3] || '').replace(/\s/g, '');
      let score = null;
      if (suffix === '%' || suffix === '/100') score = num;
      else if (suffix === '/10') score = num * 10;
      else if (suffix === '/5') score = num * 20;
      else if (scoreKeyword.test(label) && num >= 0 && num <= 100) score = num;
      if (score !== null) {
        scores.push({ label, score: Math.round(Math.min(100, Math.max(0, score))) });
        continue;
      }
    }
    rest.push(line);
  }
  return { scores, rest: rest.join('\n').trim() };
}

function toneFor(score) {
  if (score >= 70)
    return {
      bar: 'bg-emerald-600',
      text: 'text-emerald-700',
      chip: 'bg-emerald-50 text-emerald-700',
      label: 'High',
      labelLower: 'high credibility',
      color: 'emerald',
      icon: CheckCircle2
    };
  if (score >= 40)
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      chip: 'bg-amber-50 text-amber-700',
      label: 'Moderate',
      labelLower: 'moderate credibility',
      color: 'amber',
      icon: AlertCircle
    };
  return {
    bar: 'bg-red-600',
    text: 'text-red-700',
    chip: 'bg-red-50 text-red-700',
    label: 'Low',
    labelLower: 'low credibility',
    color: 'red',
    icon: AlertCircle
  };
}

/* ---------- Visual components ---------- */

function ScoreBar({ label, score }) {
  const tone = toneFor(score);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-stone-800 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tone.bar}`}></span>
          {label}
        </span>
        <span className="font-serif text-lg font-bold text-stone-900">
          {score} <span className="text-sm font-normal text-stone-400">/ 100</span>
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-100">
        <motion.div 
          className={`h-full rounded-full ${tone.bar} transition-all`} 
          style={{ width: `${score}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 flex justify-between px-1 items-center">
          <span className="text-[8px] font-medium text-stone-400">0</span>
          <span className="text-[8px] font-medium text-stone-400">50</span>
          <span className="text-[8px] font-medium text-stone-400">100</span>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressBlocks({ score }) {
  const totalBlocks = 10;
  const filled = Math.round((score / 100) * totalBlocks);
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <motion.span
            key={i}
            className={`h-4 w-4 rounded-sm transition-all ${
              i < filled 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-sm' 
                : 'bg-indigo-100'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03 }}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-indigo-700">{score}%</span>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="h-5 w-1.5 rounded-full bg-red-700" />
        <Icon className="h-5 w-5 text-red-700" strokeWidth={2.25} />
        <h2 className="font-serif text-xl font-bold text-stone-900">{title}</h2>
        {badge && (
          <span className="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <span className="text-xs text-stone-400 flex items-center gap-1">
          <Clock size={12} />
          {subtitle}
        </span>
      )}
    </div>
  );
}

function StructuredContent({ children, className = '' }) {
  return (
    <div className={`prose prose-stone max-w-none ${className}`}>
      <style jsx>{`
        .prose h1, .prose h2, .prose h3, .prose h4 {
          font-family: 'Georgia', serif;
          color: #1c1917;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }
        .prose h1 { font-size: 1.5rem; }
        .prose h2 { font-size: 1.25rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
        .prose h3 { font-size: 1.1rem; color: #dc2626; }
        .prose p { 
          margin-bottom: 0.75rem; 
          line-height: 1.8;
          color: #44403c;
        }
        .prose ul, .prose ol {
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
          line-height: 1.6;
        }
        .prose li::marker {
          color: #dc2626;
        }
        .prose strong {
          color: #1c1917;
          font-weight: 600;
        }
        .prose blockquote {
          border-left: 4px solid #dc2626;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #57534e;
          font-style: italic;
        }
        .prose code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .prose pre {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 0.75rem 0;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
        }
        .prose th, .prose td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .prose th {
          background: #f9fafb;
          font-weight: 600;
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

/* ---------- Language switch ---------- */

const LANGUAGES = [
  { code: 'en', label: 'English', icon: Globe },
  { code: 'hi', label: 'हिंदी', icon: Type },
  { code: 'ur', label: 'اردو', icon: Type },
];

function LanguageSwitch({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white p-1 shadow-sm">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            value === lang.code
              ? 'bg-red-700 text-white shadow-lg shadow-red-700/20'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <lang.icon size={14} />
          {lang.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Main Component ---------- */

function Analyzer() {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetLang, setTargetLang] = useState('en');
  const [translationError, setTranslationError] = useState(null);
  const [translatedResult, setTranslatedResult] = useState({ analysis: '', credibility: '' });
  const [translatingResult, setTranslatingResult] = useState(false);
  const [inputType, setInputType] = useState('url');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    medium: true,
    detailed: false,
    credibility: true
  });
  const [viewMode, setViewMode] = useState('structured'); // 'structured' or 'raw'

  const langLabel = targetLang === 'hi' ? 'Hindi' : targetLang === 'ur' ? 'Urdu' : 'English';

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setTranslatedResult({ analysis: '', credibility: '' });
    try {
      const payload = inputType === 'url' ? { url: input } : { text: input };
      const response = await analyzeArticle(payload, token);
      setResult({
        ...response,
        analysis: normalizeMarkdownText(response?.analysis),
        credibility: normalizeMarkdownText(response?.credibility),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const translateResult = async (targetCode = targetLang) => {
    if (!result) return;
    setTranslatingResult(true);
    setTranslationError(null);
    setTranslatedResult({ analysis: '', credibility: '' });
    try {
      const translateOne = async (text) => {
        if (!text || !text.trim()) return '';
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, target: targetCode, format: 'text' }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Translation failed');
        return data.translatedText || '';
      };

      const { rest: credibilityNarrative } = parseCredibility(result.credibility);
      const [ta, tc] = await Promise.all([
        translateOne(result.analysis),
        translateOne(credibilityNarrative),
      ]);
      setTranslatedResult({ analysis: ta, credibility: tc });
    } catch (err) {
      setTranslationError(err.message || 'Translation failed');
    } finally {
      setTranslatingResult(false);
    }
  };

  const handleLangChange = (code) => {
    setTargetLang(code);
    setTranslationError(null);
    if (result) {
      void translateResult(code);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    if (url) {
      setInput(url);
      setInputType('url');
      const timer = setTimeout(() => handleAnalyze(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const credibility = result ? parseCredibility(result.credibility) : { scores: [], rest: '' };
  const overallIdx = credibility.scores.findIndex((s) =>
    /overall|credibility|trust|total/i.test(s.label)
  );
  const overall = overallIdx >= 0 ? credibility.scores[overallIdx] : null;
  const metricScores = credibility.scores.filter((_, i) => i !== overallIdx);
  const primaryScore = overall || metricScores[0] || null;
  const tone = primaryScore ? toneFor(primaryScore.score) : toneFor(0);

  const credibilityNarrative = translatedResult.credibility || credibility.rest;
  const analysisText = translatedResult.analysis || result?.analysis;

  const analysisBlocks = (() => {
    if (!analysisText) return null;
    const headingRe = /^#{1,6}\s*(short|summary|medium|detailed|detail)s?\b.*$/im;
    if (!headingRe.test(analysisText)) return null;
    const parts = analysisText.split(/^#{1,6}\s*/im).filter(Boolean);
    const map = {};
    for (const part of parts) {
      const [firstLine, ...rest] = part.split('\n');
      const key = firstLine.trim().toLowerCase();
      const body = rest.join('\n').trim();
      if (/^short|^summary/.test(key)) map.short = body;
      else if (/^medium/.test(key)) map.medium = body;
      else if (/^detail/.test(key)) map.detailed = body;
    }
    if (!map.short && !map.medium && !map.detailed) return null;
    return map;
  })();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white to-stone-50/50 p-8 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-700 text-white shadow-lg shadow-red-700/20">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">BriefWire Intelligence</p>
            <h1 className="font-serif text-3xl font-bold text-stone-900">AI News Analyzer</h1>
          </div>
        </div>
        <p className="mt-4 leading-7 text-stone-600 max-w-2xl">
          Paste a news URL or drop raw text to extract summaries, bias signals, and credibility scores powered by advanced AI.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-stone-50 p-1 border border-stone-200 max-w-xs">
          <button
            onClick={() => setInputType('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inputType === 'url' 
                ? 'bg-white text-stone-900 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <LinkIcon size={16} />
            URL
          </button>
          <button
            onClick={() => setInputType('text')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inputType === 'text' 
                ? 'bg-white text-stone-900 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Type size={16} />
            Text
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows="6"
          placeholder={inputType === 'url' ? 'Paste article URL here...' : 'Paste article text here...'}
          className="mt-4 w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-stone-800 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 resize-none"
        />
        
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-stone-500 flex items-center gap-1">
              <Globe size={16} />
              Language
            </span>
            <LanguageSwitch value={targetLang} onChange={handleLangChange} />
            {translatingResult && (
              <span className="text-sm text-stone-400 flex items-center gap-1">
                <Loader className="h-4 w-4 animate-spin" />
                Translating...
              </span>
            )}
          </div>
          <motion.button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="rounded-full bg-red-700 px-8 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-red-700/20 hover:shadow-red-700/40 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send size={18} />
                Run Analysis
              </>
            )}
          </motion.button>
        </div>
        
        {translationError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2"
          >
            <AlertCircle size={16} />
            {translationError}
          </motion.div>
        )}
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && <Loader label="Running AI analysis..." variant="gradient" />}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Credibility Assessment - Full Width Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-1.5 rounded-full bg-red-700" />
                  <ShieldCheck className="h-5 w-5 text-red-700" strokeWidth={2.25} />
                  <h2 className="font-serif text-xl font-bold text-stone-900">Credibility Assessment</h2>
                </div>
                <div className="flex items-center gap-3">
                  {targetLang !== 'en' && translatedResult.credibility && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600 flex items-center gap-1">
                      <Globe size={12} />
                      {langLabel}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone.chip}`}>
                    {tone.label} Credibility
                  </span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column - Scores */}
                <div className="space-y-4">
                  {primaryScore && (
                    <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2 mb-4">
                        <BarChart3 size={16} />
                        Signal Breakdown
                      </h3>
                      <ScoreBar 
                        label={primaryScore.label === 'Score' ? 'Overall Score' : primaryScore.label} 
                        score={primaryScore.score} 
                      />
                    </div>
                  )}

                  {metricScores.length > 0 && (metricScores[0].label !== primaryScore?.label) && (
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {metricScores.map((s, i) => (
                        <MetricCard 
                          key={i}
                          label={s.label}
                          value={`${s.score}/100`}
                          icon={BarChart3}
                          color={s.score >= 70 ? 'green' : s.score >= 40 ? 'amber' : 'red'}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Assessment Details */}
                <div className="space-y-4">
                  <div className="grid gap-3 grid-cols-2">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-semibold">Confidence</span>
                      </div>
                      <p className={`text-lg font-bold mt-1 ${tone.text}`}>{tone.label}</p>
                    </div>

                    {primaryScore && (
                      <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
                        <div className="flex items-center gap-2 text-indigo-700">
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm font-semibold">Progress</span>
                        </div>
                        <div className="mt-1">
                          <ProgressBlocks score={primaryScore.score} />
                        </div>
                      </div>
                    )}
                  </div>

                  {credibilityNarrative && (
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 max-h-48 overflow-y-auto">
                      <StructuredContent className="text-sm">
                        {credibilityNarrative}
                      </StructuredContent>
                    </div>
                  )}

                  {primaryScore && (
                    <div className="flex items-start gap-3 rounded-xl bg-sky-50 p-4 border border-sky-100">
                      <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600" strokeWidth={2.25} />
                      <div className="text-sm">
                        <p className="font-semibold text-sky-900">What this means</p>
                        <p className="text-sky-800 leading-relaxed">
                          This report has <strong>{tone.labelLower}</strong> with{' '}
                          {tone.label === 'High'
                            ? 'strong supporting signals and reliable information sources.'
                            : tone.label === 'Moderate'
                            ? 'mixed supporting signals — some claims are well sourced, others warrant a closer look.'
                            : 'weak supporting signals; treat the claims in this report with caution.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Summary & Analysis - Enhanced Structured View */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-1.5 rounded-full bg-red-700" />
                  <FileText className="h-5 w-5 text-red-700" strokeWidth={2.25} />
                  <h2 className="font-serif text-xl font-bold text-stone-900">Summary & Analysis</h2>
                  {result.analysis && (
                    <span className="ml-2 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
                      AI Generated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {targetLang !== 'en' && translatedResult.analysis && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600 flex items-center gap-1">
                      <Globe size={12} />
                      {langLabel}
                    </span>
                  )}
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {analysisBlocks ? (
                <div className="space-y-6">
                  {/* Summary Section */}
                  {analysisBlocks.short && (
                    <div className="border border-emerald-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('summary')}
                        className="w-full flex items-center justify-between bg-emerald-50 px-6 py-4 hover:bg-emerald-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                            <FileText className="h-4 w-4 text-emerald-700" />
                          </span>
                          <h3 className="font-serif text-lg font-bold text-emerald-800">Summary</h3>
                          <span className="text-xs text-emerald-600 font-medium">Key Insights</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <span className="text-xs font-medium">
                            {expandedSections.summary ? 'Collapse' : 'Expand'}
                          </span>
                          {expandedSections.summary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedSections.summary && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-white">
                              <StructuredContent>{analysisBlocks.short}</StructuredContent>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Medium Section */}
                  {analysisBlocks.medium && (
                    <div className="border border-amber-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('medium')}
                        className="w-full flex items-center justify-between bg-amber-50 px-6 py-4 hover:bg-amber-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                            <BarChart3 className="h-4 w-4 text-amber-700" />
                          </span>
                          <h3 className="font-serif text-lg font-bold text-amber-800">Medium Analysis</h3>
                          <span className="text-xs text-amber-600 font-medium">Detailed View</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600">
                          <span className="text-xs font-medium">
                            {expandedSections.medium ? 'Collapse' : 'Expand'}
                          </span>
                          {expandedSections.medium ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedSections.medium && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-white">
                              <StructuredContent>{analysisBlocks.medium}</StructuredContent>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Detailed Section */}
                  {analysisBlocks.detailed && (
                    <div className="border border-purple-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('detailed')}
                        className="w-full flex items-center justify-between bg-purple-50 px-6 py-4 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                            <Search className="h-4 w-4 text-purple-700" />
                          </span>
                          <h3 className="font-serif text-lg font-bold text-purple-800">Detailed Analysis</h3>
                          <span className="text-xs text-purple-600 font-medium">Comprehensive</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-600">
                          <span className="text-xs font-medium">
                            {expandedSections.detailed ? 'Collapse' : 'Expand'}
                          </span>
                          {expandedSections.detailed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedSections.detailed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-white">
                              <StructuredContent>{analysisBlocks.detailed}</StructuredContent>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                  <StructuredContent>{analysisText || 'No summary available.'}</StructuredContent>
                </div>
              )}
            </motion.div>

            {/* Key Metrics Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <MetricCard 
                label="Credibility Score" 
                value={`${primaryScore?.score || 0}/100`}
                icon={ShieldCheck}
                color={primaryScore?.score >= 70 ? 'green' : primaryScore?.score >= 40 ? 'amber' : 'red'}
              />
              <MetricCard 
                label="Confidence Level" 
                value={tone.label}
                icon={Award}
                color={primaryScore?.score >= 70 ? 'green' : primaryScore?.score >= 40 ? 'amber' : 'red'}
              />
              <MetricCard 
                label="Analysis Sections" 
                value={analysisBlocks ? Object.keys(analysisBlocks).length : 1}
                icon={Layers}
                color="blue"
              />
              <MetricCard 
                label="Status" 
                value={result?.analysis ? 'Complete' : 'Pending'}
                icon={CheckCircle2}
                color={result?.analysis ? 'green' : 'amber'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Analyzer;