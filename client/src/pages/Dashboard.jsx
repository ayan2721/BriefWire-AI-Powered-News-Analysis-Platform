import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAnalysisHistory, fetchArchive, fetchDashboardSummary } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, X } from 'lucide-react';

function parseAnalysisResult(result) {
  if (!result) return {};
  if (typeof result === 'string') {
    try {
      return JSON.parse(result);
    } catch {
      return { summary: result };
    }
  }
  return result;
}

function formatAnalysisToMarkdown(analysisData) {
  const parsed = parseAnalysisResult(analysisData);
  
  if (typeof parsed === 'string') {
    return parsed;
  }

  let markdown = '';

  // Main summary
  if (parsed.summary) {
    markdown += `## 📝 Summary\n\n${parsed.summary}\n\n`;
  }

  // Key points
  if (parsed.keyPoints && Array.isArray(parsed.keyPoints)) {
    markdown += `## 🎯 Key Points\n\n`;
    parsed.keyPoints.forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += '\n';
  }

  // Analysis details
  if (parsed.analysis) {
    if (typeof parsed.analysis === 'string') {
      markdown += `## 🔍 Analysis\n\n${parsed.analysis}\n\n`;
    } else if (typeof parsed.analysis === 'object') {
      markdown += `## 🔍 Analysis Details\n\n`;
      Object.entries(parsed.analysis).forEach(([key, value]) => {
        if (typeof value === 'string') {
          markdown += `**${key.replace(/([A-Z])/g, ' $1').trim()}:** ${value}\n\n`;
        } else if (Array.isArray(value)) {
          markdown += `**${key.replace(/([A-Z])/g, ' $1').trim()}:**\n`;
          value.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += '\n';
        } else if (typeof value === 'object') {
          markdown += `**${key.replace(/([A-Z])/g, ' $1').trim()}:**\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            markdown += `- ${subKey.replace(/([A-Z])/g, ' $1').trim()}: ${subValue}\n`;
          });
          markdown += '\n';
        }
      });
    }
  }

  // Sentiment
  if (parsed.sentiment) {
    markdown += `## 📊 Sentiment Analysis\n\n`;
    if (typeof parsed.sentiment === 'string') {
      markdown += `${parsed.sentiment}\n\n`;
    } else if (typeof parsed.sentiment === 'object') {
      Object.entries(parsed.sentiment).forEach(([key, value]) => {
        markdown += `- **${key.replace(/([A-Z])/g, ' $1').trim()}:** ${value}\n`;
      });
      markdown += '\n';
    }
  }

  // Main topics
  if (parsed.mainTopics && Array.isArray(parsed.mainTopics)) {
    markdown += `## 🏷️ Main Topics\n\n`;
    parsed.mainTopics.forEach(topic => {
      markdown += `- ${topic}\n`;
    });
    markdown += '\n';
  }

  // Entities
  if (parsed.entities) {
    markdown += `## 🏛️ Entities Mentioned\n\n`;
    if (Array.isArray(parsed.entities)) {
      parsed.entities.forEach(entity => {
        markdown += `- ${entity}\n`;
      });
    } else if (typeof parsed.entities === 'object') {
      Object.entries(parsed.entities).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          markdown += `**${category.replace(/([A-Z])/g, ' $1').trim()}:**\n`;
          items.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += '\n';
        }
      });
    }
    markdown += '\n';
  }

  // Recommendations
  if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
    markdown += `## 💡 Recommendations\n\n`;
    parsed.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`;
    });
    markdown += '\n';
  }

  // Takeaways
  if (parsed.takeaways && Array.isArray(parsed.takeaways)) {
    markdown += `## 🎓 Key Takeaways\n\n`;
    parsed.takeaways.forEach(takeaway => {
      markdown += `- ${takeaway}\n`;
    });
    markdown += '\n';
  }

  // Categories
  if (parsed.categories && Array.isArray(parsed.categories)) {
    markdown += `## 📂 Categories\n\n`;
    parsed.categories.forEach(category => {
      markdown += `- ${category}\n`;
    });
    markdown += '\n';
  }

  // Statistics or metrics
  if (parsed.statistics || parsed.metrics) {
    const stats = parsed.statistics || parsed.metrics;
    markdown += `## 📈 Statistics\n\n`;
    if (typeof stats === 'object') {
      Object.entries(stats).forEach(([key, value]) => {
        markdown += `- **${key.replace(/([A-Z])/g, ' $1').trim()}:** ${value}\n`;
      });
      markdown += '\n';
    }
  }

  // Additional fields that might contain important information
  const additionalFields = ['insights', 'highlights', 'findings', 'conclusion', 'overview'];
  additionalFields.forEach(field => {
    if (parsed[field]) {
      const value = parsed[field];
      const label = field.charAt(0).toUpperCase() + field.slice(1);
      markdown += `## ${label}\n\n`;
      if (typeof value === 'string') {
        markdown += `${value}\n\n`;
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += '\n';
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([key, val]) => {
          markdown += `- **${key.replace(/([A-Z])/g, ' $1').trim()}:** ${val}\n`;
        });
        markdown += '\n';
      }
    }
  });

  // If no structured data found, format the raw object
  if (!markdown) {
    markdown = '## Analysis Results\n\n';
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === 'string') {
        markdown += `**${key.replace(/([A-Z])/g, ' $1').trim()}:** ${value}\n\n`;
      } else if (Array.isArray(value)) {
        markdown += `**${key.replace(/([A-Z])/g, ' $1').trim()}:**\n`;
        value.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += '\n';
      } else if (typeof value === 'object') {
        markdown += `**${key.replace(/([A-Z])/g, ' $1').trim()}:**\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          markdown += `- ${subKey.replace(/([A-Z])/g, ' $1').trim()}: ${subValue}\n`;
        });
        markdown += '\n';
      }
    });
  }

  return markdown;
}

function Dashboard() {
  const { token, user } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => fetchDashboardSummary(token)
  });

  const { data: analysisData, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: () => fetchAnalysisHistory(token)
  });

  const { data: archiveData, isLoading: isArchiveLoading } = useQuery({
    queryKey: ['archive'],
    queryFn: () => fetchArchive(token)
  });

  const stats = [
    { label: 'Bookmarks', value: data?.summary?.bookmarks },
    { label: 'Analyses', value: data?.summary?.recentAnalyses },
    { label: 'Saved Articles', value: data?.summary?.savedArticles }
  ];

  const toggleExpand = (id, type) => {
    const key = `${type}-${id}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const renderMarkdownContent = (content) => {
    if (typeof content === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(content);
        return formatAnalysisToMarkdown(parsed);
      } catch {
        // If it's not JSON, return as is
        return content;
      }
    }
    return formatAnalysisToMarkdown(content);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">BriefWire Dashboard</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-stone-900">
          Welcome back, {user?.name || 'Reader'}
        </h1>
        <p className="mt-2 leading-7 text-stone-600">
          Your BriefWire dashboard keeps your analysis, bookmarks, and archive in one place.
        </p>
      </div>

      {isLoading && <Loader label="Loading dashboard metrics..." />}

      {data && (
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:border-red-200"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                {stat.label}
              </p>
              <p className="mt-4 font-serif text-4xl font-bold text-stone-900">
                {stat.value ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Recent Analyses</p>
              <p className="mt-2 text-sm text-stone-600">Latest user analysis results from your account.</p>
            </div>
            {isAnalysisLoading && <span className="text-sm text-stone-400">Loading...</span>}
          </div>
          <div className="mt-6 space-y-4">
            {analysisData?.analyses?.length > 0 ? (
              analysisData.analyses.slice(0, 5).map((analysis) => {
                const isExpanded = expandedItems[`analysis-${analysis.id}`];
                const markdownContent = renderMarkdownContent(analysis.result);
                
                return (
                  <article 
                    key={analysis.id} 
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-900">{analysis.article?.title || 'Untitled Analysis'}</h3>
                        <p className="mt-1 text-sm text-stone-600">{new Date(analysis.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(analysis, 'analysis')}
                          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                          aria-label="View full content"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleExpand(analysis.id, 'analysis')}
                          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mt-3 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-24'}`}>
                      <div className="prose prose-sm max-w-none text-stone-700 markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {markdownContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    {!isExpanded && (
                      <button
                        onClick={() => toggleExpand(analysis.id, 'analysis')}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 transition-colors"
                      >
                        Read more...
                      </button>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-stone-500">No analyses found yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Saved Articles</p>
              <p className="mt-2 text-sm text-stone-600">Your saved article archive for quick access.</p>
            </div>
            {isArchiveLoading && <span className="text-sm text-stone-400">Loading...</span>}
          </div>
          <div className="mt-6 space-y-4">
            {archiveData?.archive?.length > 0 ? (
              archiveData.archive.slice(0, 5).map((article) => {
                const isExpanded = expandedItems[`article-${article.id}`];
                const content = article.excerpt || article.content?.slice(0, 140) || 'No description available.';
                
                return (
                  <article 
                    key={article.id} 
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-900">{article.title}</h3>
                        <p className="mt-1 text-sm text-stone-600">{article.publisher || 'Unknown source'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(article, 'article')}
                          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                          aria-label="View full content"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleExpand(article.id, 'article')}
                          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mt-3 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-20'}`}>
                      <div className="prose prose-sm max-w-none text-stone-700 markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    {!isExpanded && (
                      <button
                        onClick={() => toggleExpand(article.id, 'article')}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 transition-colors"
                      >
                        Read more...
                      </button>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-stone-500">No saved articles yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Modal for full content view */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-start p-6 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {selectedItem.type === 'analysis' 
                    ? selectedItem.article?.title || 'Analysis Details'
                    : selectedItem.title}
                </h3>
                <p className="text-sm text-stone-600">
                  {selectedItem.type === 'analysis'
                    ? new Date(selectedItem.createdAt).toLocaleString()
                    : selectedItem.publisher || 'Unknown source'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-full hover:bg-stone-100"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-stone max-w-none markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedItem.type === 'analysis'
                    ? renderMarkdownContent(selectedItem.result)
                    : selectedItem.content || selectedItem.excerpt || 'No content available.'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .markdown-content {
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .markdown-content h1 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #1c1917;
        }
        .markdown-content h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1c1917;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.25rem;
        }
        .markdown-content h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          color: #1c1917;
        }
        .markdown-content h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
          color: #1c1917;
        }
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        .markdown-content ul,
        .markdown-content ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        .markdown-content pre {
          background-color: #f1f5f9;
          padding: 0.75rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 0.5rem;
        }
        .markdown-content blockquote {
          border-left: 3px solid #dc2626;
          padding-left: 1rem;
          margin-left: 0;
          color: #57534e;
        }
        .markdown-content a {
          color: #dc2626;
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: #b91c1c;
        }
        .markdown-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
        .markdown-content table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 0.5rem;
        }
        .markdown-content th,
        .markdown-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .markdown-content strong {
          color: #1c1917;
        }
        .markdown-content hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1rem 0;
        }
      `}</style>
    </section>
  );
}

export default Dashboard;