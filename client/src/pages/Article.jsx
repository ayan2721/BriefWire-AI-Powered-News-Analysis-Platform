import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchFeed, fetchArticle } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, Calendar, Clock, User, Building2, Tag, 
  Bookmark, Share2, Copy, Check, FileText, Newspaper,
  Eye, ExternalLink, Printer, Type, Send, Link as LinkIcon,
  AlertCircle, Globe, ChevronDown, RefreshCw, Radio, X,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// News Channel Configuration
var NEWS_CHANNELS = {
  india: {
    label: '🇮🇳 India',
    channels: [
      { id: 'aajtak', name: 'Aaj Tak', logo: '🔴', url: 'https://www.aajtak.in', color: 'from-red-600 to-red-700', badge: 'LIVE' },
      { id: 'ndtv', name: 'NDTV', logo: '📺', url: 'https://www.ndtv.com', color: 'from-blue-600 to-blue-700', badge: 'TOP' },
      { id: 'news18', name: 'News18', logo: '📰', url: 'https://www.news18.com', color: 'from-purple-600 to-purple-700', badge: 'POPULAR' },
      { id: 'timesofindia', name: 'Times of India', logo: '📰', url: 'https://timesofindia.indiatimes.com', color: 'from-yellow-600 to-yellow-700', badge: 'TOP' },
    ]
  },
  usa: {
    label: '🇺🇸 USA',
    channels: [
      { id: 'cnn', name: 'CNN', logo: '🌐', url: 'https://www.cnn.com', color: 'from-red-600 to-red-700', badge: 'LIVE' },
      { id: 'bbc', name: 'BBC', logo: '🌍', url: 'https://www.bbc.com/news', color: 'from-gray-800 to-black', badge: 'TOP' },
      { id: 'reuters', name: 'Reuters', logo: '📊', url: 'https://www.reuters.com', color: 'from-orange-600 to-orange-700', badge: 'TRUSTED' },
      { id: 'apnews', name: 'AP News', logo: '📰', url: 'https://apnews.com', color: 'from-blue-600 to-blue-700', badge: 'TRUSTED' },
    ]
  },
  middleeast: {
    label: '🌙 Middle East',
    channels: [
      { id: 'aljazeera', name: 'Al Jazeera', logo: '🌙', url: 'https://www.aljazeera.com', color: 'from-red-700 to-red-800', badge: 'LIVE' },
      { id: 'arabnews', name: 'Arab News', logo: '📰', url: 'https://www.arabnews.com', color: 'from-green-700 to-green-800', badge: 'TOP' },
    ]
  },
  europe: {
    label: '🇪🇺 Europe',
    channels: [
      { id: 'theguardian', name: 'The Guardian', logo: '📰', url: 'https://www.theguardian.com', color: 'from-blue-600 to-blue-700', badge: 'TOP' },
      { id: 'skynews', name: 'Sky News', logo: '📺', url: 'https://news.sky.com', color: 'from-yellow-600 to-yellow-700', badge: 'LIVE' },
    ]
  }
};

// Trending Topics
var TRENDING_TOPICS = [
  { id: 'world', label: 'World News', icon: '🌍', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'technology', label: 'Technology', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { id: 'sports', label: 'Sports', icon: '⚽', color: 'bg-green-100 text-green-700' },
  { id: 'business', label: 'Business', icon: '📈', color: 'bg-amber-100 text-amber-700' },
  { id: 'health', label: 'Health', icon: '🏥', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-purple-100 text-purple-700' },
  { id: 'politics', label: 'Politics', icon: '🏛️', color: 'bg-red-100 text-red-700' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'bg-cyan-100 text-cyan-700' },
];

function Article() {
  var [params] = useSearchParams();
  var [article, setArticle] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState(null);
  var [readingTime, setReadingTime] = useState(0);
  var [copied, setCopied] = useState(false);
  var [bookmarked, setBookmarked] = useState(false);
  var [fontSize, setFontSize] = useState('medium');
  var [showShareMenu, setShowShareMenu] = useState(false);
  var [inputUrl, setInputUrl] = useState('');
  var [selectedRegion, setSelectedRegion] = useState('india');
  var [showChannelSelector, setShowChannelSelector] = useState(false);
  var [todayNews, setTodayNews] = useState([]);
  var [loadingNews, setLoadingNews] = useState(false);
  var [selectedTopic, setSelectedTopic] = useState('world');
  var [liveUpdates, setLiveUpdates] = useState([]);
  var [isClearingUrl, setIsClearingUrl] = useState(false);
  var url = params.get('url') || '';
  var abortControllerRef = useRef(null);

  // Clear URL parameter from browser
  var clearUrlParam = function() {
    setIsClearingUrl(true);
    var newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setIsClearingUrl(false);
  };

  // Fetch today's news
  useEffect(function() {
    fetchTodayNews('world');
    
    var interval = setInterval(function() {
      var updates = [
        'Major development in global markets',
        'Latest update on climate summit',
        'Emergency meeting called by UN',
        'New technology breakthrough announced',
        'Critical health update from WHO'
      ];
      var update = {
        id: Date.now(),
        title: 'Breaking: ' + updates[Math.floor(Math.random() * updates.length)],
        time: 'Just now',
        isBreaking: true
      };
      setLiveUpdates(function(prev) {
        return [update].concat(prev).slice(0, 5);
      });
    }, 30000);

    return function() {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch article when URL parameter exists
  useEffect(function() {
    if (!url) {
      setArticle(null);
      setError(null);
      return;
    }
    setInputUrl(url);
    fetchArticleContent(url);
  }, [url]);

  var fetchTodayNews = async function(category) {
    setLoadingNews(true);
    try {
      var response = await fetchFeed(category);
      if (response && response.feed) {
        setTodayNews(response.feed.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  var fetchArticleContent = async function(articleUrl) {
    if (!articleUrl) return;
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setArticle(null);
    
    try {
      // Use the fetchArticle from api.js - this calls /api/news/article
      var data = await fetchArticle(articleUrl);
      
      // Check if data has the expected structure
      if (!data.article || !data.article.title) {
        throw new Error('Invalid article data received');
      }
      
      // Set article data
      var articleData = {
        article: {
          title: data.article.title || 'Untitled',
          excerpt: data.article.excerpt || '',
          content: data.article.content || '<p>No content available.</p>',
          tags: data.article.tags || [],
          images: data.article.images || [],
        },
        metadata: {
          publisher: data.metadata ? data.metadata.publisher : '',
          date: data.metadata ? data.metadata.date : '',
          url: data.metadata ? data.metadata.url : articleUrl,
          author: data.metadata ? data.metadata.author : data.author || '',
        },
        author: data.author || '',
        readingTime: data.readingTime || 0,
        wordCount: data.wordCount || 0,
      };
      
      setArticle(articleData);
      setError(null);
      
      if (data.article && data.article.content) {
        var words = data.article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        var minutes = Math.ceil(words / 200);
        setReadingTime(minutes || data.readingTime || 0);
      }
      
      // Update URL with the article parameter
      var newUrl = window.location.pathname + '?url=' + encodeURIComponent(articleUrl);
      window.history.pushState({}, '', newUrl);
      
    } catch (err) {
      // Don't show error if it was aborted
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      
      console.error('Fetch error:', err);
      
      var errorMessage = 'Unable to load article content. ';
      
      // Check for different error types
      if (err.message && err.message.indexOf('timeout') !== -1) {
        errorMessage += 'The request timed out. Please try again.';
      } else if (err.message && err.message.indexOf('homepage') !== -1) {
        errorMessage += 'Please provide a specific article URL, not a homepage.';
      } else if (err.message && err.message.indexOf('404') !== -1) {
        errorMessage += 'The article was not found. Please check the URL.';
      } else if (err.response) {
        if (err.response.status === 404) {
          errorMessage += 'The article was not found. Please check the URL.';
        } else if (err.response.status === 400) {
          errorMessage += 'Invalid request. Please check the URL format.';
        } else if (err.response.status === 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += err.response.data?.message || 'Please check the URL and try again.';
        }
      } else {
        errorMessage += err.message || 'Please check the URL and try again.';
      }
      
      setError(errorMessage);
      setArticle(null);
      
      // Clear URL parameter on error
      if (!isClearingUrl) {
        clearUrlParam();
      }
    } finally {
      setLoading(false);
    }
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    // Clear previous error
    setError(null);
    
    try {
      new URL(inputUrl);
      fetchArticleContent(inputUrl);
    } catch (err) {
      setError('Please enter a valid URL (e.g., https://example.com/article)');
    }
  };

  var handleChannelSelect = function(channel) {
    setInputUrl(channel.url);
    setShowChannelSelector(false);
    setError(null);
    setTimeout(function() {
      fetchArticleContent(channel.url);
    }, 100);
  };

  var handleTopicSelect = function(topic) {
    if (selectedTopic === topic && todayNews.length > 0) return;
    setSelectedTopic(topic);
    fetchTodayNews(topic);
  };

  var handleLoadNewsArticle = function(newsItem) {
    if (newsItem.link) {
      setInputUrl(newsItem.link);
      setError(null);
      fetchArticleContent(newsItem.link);
    }
  };

  var handleCopyLink = async function() {
    var urlToCopy = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToCopy);
        setCopied(true);
        setTimeout(function() {
          setCopied(false);
        }, 2000);
      } else {
        var textArea = document.createElement('textarea');
        textArea.value = urlToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(function() {
          setCopied(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      prompt('Copy this URL manually:', urlToCopy);
    }
  };

  var handleClearInput = function() {
    setInputUrl('');
    setError(null);
    setArticle(null);
    clearUrlParam();
  };

  var handlePasteUrl = async function() {
    try {
      var text = await navigator.clipboard.readText();
      if (text && text.indexOf('http') === 0) {
        setInputUrl(text);
      }
    } catch (err) {
      // Fallback - user can manually paste
    }
  };

  var handleRetry = function() {
    if (inputUrl) {
      setError(null);
      fetchArticleContent(inputUrl);
    }
  };

  var handleBookmark = function() {
    setBookmarked(!bookmarked);
  };

  var handleShare = function() {
    if (navigator.share) {
      navigator.share({
        title: article ? article.article.title : 'Article',
        text: article ? article.article.excerpt : '',
        url: window.location.href,
      }).catch(function() {});
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  var handlePrint = function() {
    window.print();
  };

  var fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  var getFontSizeClass = function() {
    return fontSizeClasses[fontSize] || fontSizeClasses.medium;
  };

  var formatDate = function(dateString) {
    if (!dateString) return '';
    try {
      var date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return '';
    }
  };

  var formatTime = function(dateString) {
    if (!dateString) return '';
    try {
      var date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  };

  var renderContent = function(content) {
    if (!content) return null;

    // Custom component overrides for beautiful, newspaper-quality markdown rendering
    var markdownComponents = {
      h1: function(props) {
        return <h1 className="font-serif text-3xl font-bold text-stone-900 mt-8 mb-4 pb-3 border-b-2 border-red-100" {...props} />;
      },
      h2: function(props) {
        return <h2 className="font-serif text-2xl font-bold text-stone-900 mt-8 mb-3 pb-2 border-b border-stone-200" {...props} />;
      },
      h3: function(props) {
        return <h3 className="font-serif text-xl font-semibold text-stone-800 mt-6 mb-2" {...props} />;
      },
      h4: function(props) {
        return <h4 className="font-serif text-lg font-semibold text-stone-800 mt-5 mb-2" {...props} />;
      },
      h5: function(props) {
        return <h5 className="font-serif text-base font-semibold text-stone-700 mt-4 mb-1" {...props} />;
      },
      h6: function(props) {
        return <h6 className="font-serif text-sm font-semibold text-stone-600 mt-4 mb-1 uppercase tracking-wider" {...props} />;
      },
      p: function(props) {
        return <p className="mb-5 leading-8 text-stone-700 text-[1.05rem]" {...props} />;
      },
      a: function(props) {
        return <a className="text-red-700 underline decoration-red-300 underline-offset-2 hover:text-red-900 hover:decoration-red-500 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />;
      },
      blockquote: function(props) {
        return (
          <blockquote className="border-l-4 border-red-600 bg-red-50/40 pl-5 pr-4 py-3 my-6 rounded-r-xl italic text-stone-600" {...props} />
        );
      },
      ul: function(props) {
        return <ul className="my-4 pl-6 space-y-2 list-disc marker:text-red-600" {...props} />;
      },
      ol: function(props) {
        return <ol className="my-4 pl-6 space-y-2 list-decimal marker:text-red-600 marker:font-semibold" {...props} />;
      },
      li: function(props) {
        return <li className="leading-7 text-stone-700 pl-1" {...props} />;
      },
      strong: function(props) {
        return <strong className="font-semibold text-stone-900" {...props} />;
      },
      em: function(props) {
        return <em className="italic text-stone-600" {...props} />;
      },
      hr: function() {
        return <hr className="my-8 border-t-2 border-stone-200" />;
      },
      img: function(props) {
        return (
          <figure className="my-6">
            <img className="w-full rounded-xl shadow-md object-cover max-h-[500px]" loading="lazy" {...props} />
            {props.alt && (
              <figcaption className="mt-2 text-center text-sm text-stone-500 italic">{props.alt}</figcaption>
            )}
          </figure>
        );
      },
      table: function(props) {
        return (
          <div className="my-6 overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
            <table className="w-full border-collapse text-sm" {...props} />
          </div>
        );
      },
      thead: function(props) {
        return <thead className="bg-stone-100" {...props} />;
      },
      th: function(props) {
        return <th className="px-4 py-3 text-left font-semibold text-stone-800 border-b border-stone-200 text-sm uppercase tracking-wider" {...props} />;
      },
      td: function(props) {
        return <td className="px-4 py-3 text-stone-700 border-b border-stone-100" {...props} />;
      },
      tr: function(props) {
        return <tr className="hover:bg-stone-50 transition-colors" {...props} />;
      },
      code: function(props) {
        var isInline = !props.className;
        if (isInline) {
          return <code className="bg-stone-100 text-red-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />;
        }
        return (
          <code className="block bg-stone-900 text-stone-100 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-4" {...props} />
        );
      },
      pre: function(props) {
        return <pre className="bg-stone-900 text-stone-100 p-5 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-6 shadow-lg" {...props} />;
      },
    };

    return (
      <div className="prose prose-stone max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  var currentChannels = NEWS_CHANNELS[selectedRegion] ? NEWS_CHANNELS[selectedRegion].channels : [];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Today's News Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl sm:rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 animate-pulse">
              <Radio className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                Today's News
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                  LIVE
                </span>
              </h3>
              <p className="text-sm text-stone-500">Latest updates from around the world</p>
            </div>
          </div>
          <button
            onClick={function() { fetchTodayNews(selectedTopic); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors text-sm text-stone-600"
            disabled={loadingNews}
          >
            <RefreshCw size={14} className={loadingNews ? 'animate-spin' : ''} />
            {loadingNews ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Live Updates Ticker */}
        {liveUpdates.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-red-700 font-semibold text-sm whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                BREAKING
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap">
                  {liveUpdates.map(function(update, i) {
                    return (
                      <span key={update.id} className="mx-6 text-sm text-stone-700">
                        {update.title} • {update.time}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trending Topics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TRENDING_TOPICS.map(function(topic) {
            return (
              <button
                key={topic.id}
                onClick={function() { handleTopicSelect(topic.id); }}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ' + (
                  selectedTopic === topic.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : topic.color + ' hover:scale-105'
                )}
              >
                <span>{topic.icon}</span>
                {topic.label}
              </button>
            );
          })}
        </div>

        {/* News Grid */}
        {loadingNews ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(function(i) {
              return (
                <div key={i} className="animate-pulse">
                  <div className="bg-stone-200 rounded-xl h-32"></div>
                  <div className="mt-2 bg-stone-200 rounded h-4 w-3/4"></div>
                  <div className="mt-1 bg-stone-200 rounded h-3 w-1/2"></div>
                </div>
              );
            })}
          </div>
        ) : todayNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {todayNews.slice(0, 8).map(function(news, index) {
              return (
                <motion.div
                  key={news.link || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={function() { handleLoadNewsArticle(news); }}
                  className="group cursor-pointer rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="relative h-32 bg-stone-100">
                    {news.image ? (
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={function(e) {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                        <Newspaper className="h-8 w-8 text-stone-400" />
                      </div>
                    )}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        TOP
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(news.publishedAt || news.date)}
                    </p>
                    <h4 className="text-sm font-semibold text-stone-800 line-clamp-2 mt-1 group-hover:text-red-600 transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                      {news.source || news.publisher || 'Source'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500">
            <p>No news available for this category</p>
          </div>
        )}
      </motion.div>

      {/* Input Form with Channel Selector */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl sm:rounded-[2rem] border border-stone-200 bg-white p-4 sm:p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <LinkIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-stone-900">Read Any Article</h3>
              <p className="text-sm text-stone-500">Paste a URL or select a news channel</p>
            </div>
          </div>
          <button
            onClick={function() { setShowChannelSelector(!showChannelSelector); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-medium text-stone-700"
          >
            <Globe size={16} />
            {NEWS_CHANNELS[selectedRegion] ? NEWS_CHANNELS[selectedRegion].label : 'Select Region'}
            <ChevronDown size={16} className={'transition-transform ' + (showChannelSelector ? 'rotate-180' : '')} />
          </button>
        </div>

        {/* Channel Selector Dropdown */}
        <AnimatePresence>
          {showChannelSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.keys(NEWS_CHANNELS).map(function(regionId) {
                    var region = NEWS_CHANNELS[regionId];
                    return (
                      <div key={regionId} className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                          {region.label}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {region.channels.map(function(channel) {
                            return (
                              <button
                                key={channel.id}
                                onClick={function() { handleChannelSelect(channel); }}
                                className={'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105 bg-gradient-to-r ' + channel.color + ' text-white shadow-sm hover:shadow-md'}
                              >
                                <span className="text-lg">{channel.logo}</span>
                                <span className="text-xs font-medium">{channel.name}</span>
                                {channel.badge && (
                                  <span className="text-[8px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                                    {channel.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="url"
              value={inputUrl}
              onChange={function(e) { setInputUrl(e.target.value); }}
              placeholder="https://example.com/news-article"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20 pr-24"
              disabled={loading}
            />
            {inputUrl && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Clear input"
              >
                <X size={18} />
              </button>
            )}
            {!inputUrl && (
              <button
                type="button"
                onClick={handlePasteUrl}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Paste
              </button>
            )}
          </div>
          <motion.button
            type="submit"
            disabled={loading || !inputUrl.trim()}
            className="rounded-xl bg-red-700 px-6 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-red-700/20 flex items-center justify-center gap-2 min-w-[120px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Send size={18} />
                Read Article
              </>
            )}
          </motion.button>
        </form>

        {/* Enhanced Error Display with Retry */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Unable to load article</p>
                <p className="mt-1">{error}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-1.5 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Retry
                  </button>
                  <button
                    onClick={handleClearInput}
                    className="px-4 py-1.5 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Clear URL
                  </button>
                </div>
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <WifiOff size={12} />
                  Tip: Try a different URL or check your internet connection
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Channel Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-400">Quick Access:</span>
          {currentChannels.slice(0, 6).map(function(channel) {
            return (
              <button
                key={channel.id}
                type="button"
                onClick={function() { handleChannelSelect(channel); }}
                className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ' + channel.color + ' text-white text-xs font-medium transition-all hover:scale-105 shadow-sm'}
              >
                <span className="text-sm">{channel.logo}</span>
                {channel.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Empty State */}
      {!article && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white to-stone-50/50 p-12 text-center shadow-sm"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Newspaper className="h-10 w-10 text-red-700" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Ready to Read</h2>
            <p className="max-w-md text-stone-600">
              Select a news story from today's updates above, paste any article URL, or choose a news channel to read in a clean, distraction-free format.
            </p>
            <div className="flex items-center gap-4 text-sm text-stone-400">
              <span className="flex items-center gap-1">
                <Check size={14} className="text-emerald-600" />
                No ads
              </span>
              <span className="w-px h-4 bg-stone-300" />
              <span className="flex items-center gap-1">
                <Check size={14} className="text-emerald-600" />
                Distraction-free
              </span>
              <span className="w-px h-4 bg-stone-300" />
              <span className="flex items-center gap-1">
                <Check size={14} className="text-emerald-600" />
                Adjustable font
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {loading && <Loader label="Fetching article content..." variant="gradient" />}
      </AnimatePresence>

      {/* Article Display */}
      {article && article.article && (
        <div className="rounded-[2rem] border border-stone-200 bg-white shadow-sm overflow-hidden">
          {/* Article Header */}
          <header className="p-6 sm:p-8 md:p-10 border-b border-stone-200 bg-gradient-to-b from-stone-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back to Home
                </Link>
                <button
                  onClick={handleClearInput}
                  className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Clear Article
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                  <button
                    onClick={function() { setFontSize('small'); }}
                    className={'p-1.5 rounded transition-colors ' + (fontSize === 'small' ? 'bg-white shadow-sm' : 'hover:bg-stone-200')}
                    aria-label="Small font"
                  >
                    <Type size={14} className="text-stone-600" />
                  </button>
                  <button
                    onClick={function() { setFontSize('medium'); }}
                    className={'p-1.5 rounded transition-colors ' + (fontSize === 'medium' ? 'bg-white shadow-sm' : 'hover:bg-stone-200')}
                    aria-label="Medium font"
                  >
                    <Type size={16} className="text-stone-600" />
                  </button>
                  <button
                    onClick={function() { setFontSize('large'); }}
                    className={'p-1.5 rounded transition-colors ' + (fontSize === 'large' ? 'bg-white shadow-sm' : 'hover:bg-stone-200')}
                    aria-label="Large font"
                  >
                    <Type size={18} className="text-stone-600" />
                  </button>
                  <button
                    onClick={function() { setFontSize('xlarge'); }}
                    className={'p-1.5 rounded transition-colors ' + (fontSize === 'xlarge' ? 'bg-white shadow-sm' : 'hover:bg-stone-200')}
                    aria-label="Extra large font"
                  >
                    <Type size={20} className="text-stone-600" />
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors relative"
                  aria-label="Share article"
                >
                  <Share2 className="h-5 w-5" />
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-10">
                      <button
                        onClick={function() {
                          navigator.clipboard.writeText(window.location.href);
                          setShowShareMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Copy size={14} />
                        Copy Link
                      </button>
                      <button
                        onClick={function() {
                          setShowShareMenu(false);
                          handlePrint();
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Printer size={14} />
                        Print
                      </button>
                    </div>
                  )}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Print article"
                >
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Newspaper size={12} />
                  {article.metadata && article.metadata.publisher ? article.metadata.publisher : 'Source'}
                </span>
                {readingTime > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-stone-500">
                    <Clock size={14} />
                    {readingTime} min read
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-stone-500">
                  <Eye size={14} />
                  {Math.floor(Math.random() * 1000) + 100} views
                </span>
              </div>

              <h1 className={'font-serif text-4xl sm:text-5xl font-bold leading-tight text-stone-900 text-balance ' + getFontSizeClass()}>
                {article.article.title || 'Untitled Article'}
              </h1>

              {article.article.excerpt && (
                <p className={'text-lg leading-relaxed text-stone-600 text-pretty ' + getFontSizeClass()}>
                  {article.article.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-stone-500">
                {article.author && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {article.author}
                  </span>
                )}
                {article.metadata && article.metadata.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatDate(article.metadata.date)}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className={'p-6 sm:p-8 md:p-10 ' + getFontSizeClass()}>
            {article.article.content ? (
              <div className="max-w-3xl mx-auto">
                {renderContent(article.article.content)}
              </div>
            ) : (
              <p className="text-stone-400 text-center py-8">No content available for this article.</p>
            )}
          </div>

          {/* Article Footer */}
          <footer className="p-6 sm:p-8 border-t border-stone-200 bg-stone-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} />
                  {article.article.content ? article.article.content.replace(/<[^>]*>/g, '').split(/\s+/).length + ' words' : '0 words'}
                </span>
                <span className="w-px h-4 bg-stone-300" />
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {readingTime} min read
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={function() { window.open(article.metadata && article.metadata.url ? article.metadata.url : url, '_blank'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-full text-sm font-medium hover:bg-red-800 transition-colors shadow-lg shadow-red-700/20"
                >
                  <ExternalLink size={16} />
                  View Original
                </button>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-full text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </section>
  );
}

export default Article;