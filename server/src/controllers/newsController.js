// server/src/controllers/newsController.js

import { fetchNewsData, fetchGoogleRss } from '../services/newsService.js';
import {
    fetchArticleHtml,
    extractPlainText,
    extractMetadata,
    fetchRawHtml,
    extractTextOnly,
    fetchMultipleArticles
} from '../services/scraperService.js';
import { analyzeNews } from "../services/groqService.js";
import { saveRawArticleHTML, saveAnalysisJson } from '../services/storageService.js';
import { Article, Analysis, Claim } from '../models/index.js';

// Fetch public news feed
export async function fetchPublicNews(req, res) {
    try {
        var category = req.query.category || 'world';
        var limit = parseInt(req.query.limit) || 20;

        console.log('[Controller] Fetching news for category: ' + category);

        var feed = await fetchNewsData('news', category);
        var fallback = await fetchGoogleRss(category);

        res.json({
            success: true,
            feed: feed.slice(0, limit),
            fallback: fallback.slice(0, limit),
            total: feed.length,
            category: category,
        });

    } catch (err) {
        console.error('[Controller] Error fetching news:', err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news.",
            error: err.message,
        });
    }
}

// Read a single article
export async function readArticle(req, res) {
    try {
        var url = req.query.url;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Article URL is required"
            });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: "Invalid URL format"
            });
        }

        console.log('[Controller] Reading article from: ' + url);

        // Fetch and parse the article
        var articleData = await fetchArticleHtml(url);

        // Calculate reading time
        var contentText = articleData.article.content.replace(/<[^>]*>/g, '');
        var wordCount = contentText.split(/\s+/).length;
        var readingTime = Math.ceil(wordCount / 200);

        // Format response - consistent structure for frontend
        var response = {
            success: true,
            article: {
                title: articleData.article.title,
                excerpt: articleData.article.excerpt,
                content: articleData.article.content,
                tags: articleData.article.tags || [],
                images: articleData.article.images || [],
            },
            metadata: {
                publisher: articleData.metadata.publisher || '',
                date: articleData.metadata.date || '',
                url: url,
                author: articleData.author || '',
            },
            author: articleData.author || '',
            readingTime: readingTime,
            wordCount: wordCount,
        };

        console.log('[Controller] Successfully processed article: "' + articleData.article.title + '"');
        res.json(response);

    } catch (err) {
        console.error('[Controller] Error reading article:', err);

        var errorMessage = "Unable to read article.";
        var statusCode = 500;

        if (err.message.indexOf('timeout') !== -1) {
            errorMessage = "Request timed out. Please try again.";
            statusCode = 504;
        } else if (err.message.indexOf('404') !== -1) {
            errorMessage = "Article not found. Please check the URL.";
            statusCode = 404;
        } else if (err.message.indexOf('403') !== -1) {
            errorMessage = "Access denied. The website might be blocking our request.";
            statusCode = 403;
        } else if (err.message.indexOf('homepage') !== -1) {
            errorMessage = "Please provide a specific article URL, not a homepage.";
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: err.message,
        });
    }
}

// Analyze an article
export async function analyzeArticle(req, res) {
    try {
        var url = req.body.url;
        var text = req.body.text;
        var mode = req.body.mode || 'full-report';

        if (!url && !text) {
            return res.status(400).json({
                success: false,
                message: "Article URL or text is required"
            });
        }

        var sourceText = "";
        var articleData = null;
        var metadata = {};

        if (text) {
            sourceText = text;
            metadata = {
                publisher: "Text Input",
                title: "Analyzed Text",
            };
        } else {
            // Validate URL
            try {
                new URL(url);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid URL format",
                });
            }

            console.log('[Controller] Analyzing article from: ' + url);

            // Fetch article data
            articleData = await fetchArticleHtml(url);
            sourceText = articleData.article.content;
            metadata = {
                publisher: articleData.metadata.publisher || "Unknown",
                title: articleData.article.title,
                author: articleData.author || "",
                date: articleData.metadata.date || "",
            };
        }

        // Prepare article data for storage
        var articleDataForStorage = {
            url: url || "text-input",
            title: metadata.title || "Article Analysis",
            publisher: metadata.publisher || "Unknown",
            excerpt: sourceText.substring(0, 300),
            content: sourceText,
            author: metadata.author || "",
        };

        // Save article to database
        var article = await Article.create({
            url: articleDataForStorage.url,
            title: articleDataForStorage.title,
            publisher: articleDataForStorage.publisher,
            excerpt: articleDataForStorage.excerpt,
            content: articleDataForStorage.content,
            author: articleDataForStorage.author,
            userId: req.user ? req.user.id : null,
        });

        // Save raw HTML if URL is provided
        if (url) {
            try {
                var html = await fetchRawHtml(url);
                var rawBlob = await saveRawArticleHTML(
                    req.user ? req.user.id : null,
                    article.id,
                    html
                );
                article.rawBlobPath = rawBlob.path;
                await article.save();
            } catch (htmlError) {
                console.warn('[Controller] Could not save raw HTML:', htmlError.message);
            }
        }

        // Analyze with AI
        console.log('[Controller] Sending to AI for analysis...');
        var analysisResponse = await analyzeNews(
            sourceText,
            metadata.publisher || "Unknown"
        );

        // Save analysis to database
        await Analysis.create({
            userId: req.user ? req.user.id : null,
            articleId: article.id,
            type: mode,
            result: JSON.stringify(analysisResponse)
        });

        // ---------- FIX: Sanitize credibility score ----------
        var credibilityScore = parseFloat(analysisResponse.credibilityScore) ||
            parseFloat(analysisResponse.credibility) ||
            0;
        if (isNaN(credibilityScore) || !isFinite(credibilityScore)) {
            credibilityScore = 0;
        }
        credibilityScore = Math.min(100, Math.max(0, credibilityScore));
        // ------------------------------------------------------

        var claims = analysisResponse.claims || [];

        // Save claims
        if (claims && Array.isArray(claims) && claims.length > 0) {
            var claimsToCreate = claims.slice(0, 10).map(function(item) {
                return Claim.create({
                    articleId: article.id,
                    text: item.text || '',
                    evidence: item.evidence || null,
                    confidence: item.confidence || null,
                });
            });
            await Promise.all(claimsToCreate);
        }

        // Save analysis JSON
        try {
            var savedAnalysis = await saveAnalysisJson(
                req.user ? req.user.id : null,
                article.id, {
                    article: articleDataForStorage,
                    analysis: analysisResponse
                }
            );
            article.analysisBlobPath = savedAnalysis.path;
        } catch (storageError) {
            console.warn('[Controller] Could not save analysis JSON:', storageError.message);
        }

        // Update article with analysis results (credibilityScore is now safe)
        article.bias = analysisResponse.bias || null;
        article.sentiment = analysisResponse.sentiment || null;
        article.credibilityScore = credibilityScore; // ✅ always a valid number
        await article.save();

        // Format response
        var analysisText = analysisResponse.analysis ||
            analysisResponse.content ||
            '';

        var credibilityText = analysisResponse.credibility ||
            analysisResponse.credibilityReport ||
            analysisText;

        res.status(201).json({
            success: true,
            article: {
                id: article.id,
                title: article.title,
                excerpt: article.excerpt,
                url: article.url,
                publisher: article.publisher,
                credibilityScore: article.credibilityScore,
                bias: article.bias,
                sentiment: article.sentiment,
                createdAt: article.createdAt,
            },
            analysis: analysisText,
            credibility: credibilityText,
            rawAnalysis: analysisResponse,
            claims: claims.slice(0, 5),
        });

    } catch (err) {
        console.error('[Controller] Error analyzing article:', err);

        if (err.response && err.response.status === 429) {
            return res.status(429).json({
                success: false,
                message: "AI service rate limit reached. Please try again later."
            });
        }

        if (err.message.indexOf('timeout') !== -1) {
            return res.status(504).json({
                success: false,
                message: "Request timed out. Please try again.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Article analysis failed.",
            error: err.message,
        });
    }
}

// Compare articles
export async function compareArticle(req, res) {
    try {
        var url = req.body.url;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required for comparison."
            });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: "Invalid URL format",
            });
        }

        console.log('[Controller] Comparing article from: ' + url);

        // Fetch the main article
        var articleData = await fetchArticleHtml(url);
        var base = {
            title: articleData.article.title,
            content: articleData.article.content,
            excerpt: articleData.article.excerpt,
            author: articleData.author || "",
            publisher: articleData.metadata.publisher || "",
            date: articleData.metadata.date || "",
        };

        // Fetch related articles for comparison
        var related = await fetchNewsData('news', 'all', 8);

        var comparisons = related.slice(0, 8).map(function(item) {
            return {
                source: item.source_id || item.creator || "Unknown",
                title: item.title || "Untitled",
                description: item.description || "",
                link: item.link || item.url || "",
                publishedAt: item.pubDate || item.pubDateUtc || "",
            };
        });

        res.json({
            success: true,
            article: base,
            comparisons: comparisons,
            totalComparisons: comparisons.length,
        });

    } catch (err) {
        console.error('[Controller] Error comparing article:', err);
        res.status(500).json({
            success: false,
            message: "Comparison failed.",
            error: err.message,
        });
    }
}

// Search articles
export async function searchArticles(req, res) {
    try {
        var query = req.query.q;
        var category = req.query.category || 'all';
        var limit = parseInt(req.query.limit) || 20;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters.",
            });
        }

        console.log('[Controller] Searching for: "' + query + '" in category: ' + category);

        // Search using news service
        var results = await fetchNewsData('search', category, limit, query);

        res.json({
            success: true,
            query: query,
            category: category,
            results: results,
            total: results.length,
        });

    } catch (err) {
        console.error('[Controller] Error searching articles:', err);
        res.status(500).json({
            success: false,
            message: "Search failed.",
            error: err.message,
        });
    }
}

// Get trending topics
export async function getTrendingTopics(req, res) {
    try {
        var trendingTopics = [
            { id: 'world', label: 'World News', icon: '🌍', count: 1245 },
            { id: 'technology', label: 'Technology', icon: '💻', count: 876 },
            { id: 'sports', label: 'Sports', icon: '⚽', count: 654 },
            { id: 'business', label: 'Business', icon: '📈', count: 543 },
            { id: 'health', label: 'Health', icon: '🏥', count: 432 },
            { id: 'entertainment', label: 'Entertainment', icon: '🎬', count: 321 },
            { id: 'politics', label: 'Politics', icon: '🏛️', count: 298 },
            { id: 'science', label: 'Science', icon: '🔬', count: 187 },
        ];

        res.json({
            success: true,
            topics: trendingTopics,
            updatedAt: new Date().toISOString(),
        });

    } catch (err) {
        console.error('[Controller] Error fetching trending topics:', err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trending topics.",
            error: err.message,
        });
    }
}

// Get article by ID
export async function getArticleById(req, res) {
    try {
        var id = req.params.id;

        var article = await Article.findByPk(id, {
            include: [{
                    model: Analysis,
                    limit: 1,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                },
                { model: Claim, limit: 10 },
            ],
        });

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found.",
            });
        }

        res.json({
            success: true,
            article: article,
        });

    } catch (err) {
        console.error('[Controller] Error fetching article by ID:', err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch article.",
            error: err.message,
        });
    }
}

// Batch fetch multiple articles
export async function batchFetchArticles(req, res) {
    try {
        var urls = req.body.urls;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of URLs.",
            });
        }

        if (urls.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Maximum 10 URLs allowed per request.",
            });
        }

        console.log('[Controller] Fetching ' + urls.length + ' articles in batch');

        var results = await fetchMultipleArticles(urls);

        res.json({
            success: true,
            data: results,
            summary: {
                total: urls.length,
                succeeded: results.results.length,
                failed: results.errors.length,
            }
        });

    } catch (err) {
        console.error('[Controller] Error in batch fetch:', err);
        res.status(500).json({
            success: false,
            message: "Batch fetch failed.",
            error: err.message,
        });
    }
}

export default {
    fetchPublicNews: fetchPublicNews,
    readArticle: readArticle,
    analyzeArticle: analyzeArticle,
    compareArticle: compareArticle,
    searchArticles: searchArticles,
    getTrendingTopics: getTrendingTopics,
    getArticleById: getArticleById,
    batchFetchArticles: batchFetchArticles,
};