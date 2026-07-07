// server/src/services/scraperService.js

import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

// Configure axios with realistic headers to avoid 403 errors
const axiosInstance = axios.create({
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
    },
    maxRedirects: 5,
});

// Helper: check if URL is a specific article (not homepage)
const isValidArticleUrl = (url) => {
    try {
        const urlObj = new URL(url);
        if (urlObj.pathname === '/' || urlObj.pathname === '') return false;
        if (/\/index\.html?$/i.test(urlObj.pathname)) return false;
        return true;
    } catch {
        return false;
    }
};

// Initialize Turndown with custom rules
const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
});

// Add custom rule to handle blockquotes with attribution (optional)
turndownService.addRule('blockquote', {
    filter: 'blockquote',
    replacement: (content) => {
        return `\n> ${content.replace(/\n/g, '\n> ')}\n\n`;
    }
});

// Clean HTML and extract Markdown content
const cleanAndExtractContent = (html, url) => {
    const $ = cheerio.load(html);

    // ---------- STEP 1: Remove unwanted sections ----------
    $('script, style, noscript, iframe, svg').remove();

    const unwantedSelectors = [
        '.ad', '.ads', '.advertisement', '.promo', '.promotion', '.banner', '.popup',
        '.newsletter', '.subscribe', '.share', '.social', '.stssm-after-content',
        '.stssm-social-icons', '.ShareBtn-wrap', '.WrittenByShare',
        '.sidebar', '.footer', '.header', '.nav', '.menu', '.comments',
        '[class*="ad-"]', '[class*="Ad-"]', '[id*="ad-"]', '[id*="Ad-"]',
        '.related', '.readmore', '.recommended', '.trending', '.most-read'
    ];
    unwantedSelectors.forEach(sel => $(sel).remove());

    // Remove empty elements and comments
    $('p:empty, *:empty').remove();
    $('*').contents().filter((i, node) => node.type === 'comment').remove();

    // ---------- STEP 2: Locate the main content container ----------
    const contentSelectors = [
        '.entry-content', '.article-content', '.story-content', '.post-content',
        '.content', '.article-body', '.story-body', '.main-content',
        '#article-content', '#story-content', '#content',
        'article', 'main', '.article', '.story', '.post', '.entry'
    ];

    let contentElement = null;
    for (const selector of contentSelectors) {
        const el = $(selector);
        if (el.length > 0 && el.text().trim().length > 200) {
            contentElement = el;
            break;
        }
    }

    // Fallback: collect all meaningful paragraphs
    if (!contentElement) {
        const paragraphs = $('p').filter((i, el) => {
            const text = $(el).text().trim();
            return text.length > 80 && !$(el).closest('.ad, .promo, .banner, .footer, .header, .sidebar').length;
        });
        if (paragraphs.length > 0) {
            const wrapper = $('<div>');
            paragraphs.each((i, el) => wrapper.append($(el).clone()));
            contentElement = wrapper;
        }
    }

    // Final fallback: use body
    if (!contentElement || contentElement.text().trim().length < 50) {
        const body = $('body').clone();
        body.find('script, style, noscript, iframe, svg, .ad, .share, .social, .footer, .header, .sidebar').remove();
        contentElement = body;
    }

    // ---------- STEP 3: Sanitize the content (keep only structural tags) ----------
    const contentClone = contentElement.clone();

    // Remove leftover unwanted elements within the content
    contentClone.find('.ad, .share, .social, .stssm-after-content, .stssm-social-icons, .ShareBtn-wrap, .WrittenByShare, .readmoreinText, .related, .recommended').remove();

    // Allowed tags: headings, paragraphs, lists, links, images, emphasis, etc.
    const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'b', 'em', 'i', 'a', 'img', 'br', 'code', 'pre', 'hr'];

    // Unwrap disallowed tags, keep their text, but also clean attributes
    contentClone.find('*').each((i, el) => {
        const $el = $(el);
        const tagName = el.tagName.toLowerCase();
        if (!allowedTags.includes(tagName)) {
            // Replace the tag with its children (unwrap)
            $el.replaceWith($el.contents());
        } else {
            // Keep only safe attributes: href, src, alt, title
            const attrs = Object.keys(el.attribs || {});
            for (const attr of attrs) {
                if (!['href', 'src', 'alt', 'title'].includes(attr)) {
                    $el.removeAttr(attr);
                }
            }
        }
    });

    // Remove empty elements again
    contentClone.find('*').each((i, el) => {
        const $el = $(el);
        if ($el.contents().length === 0 && $el.text().trim() === '') {
            $el.remove();
        }
    });

    // Convert the cleaned HTML to a string
    let cleanedHtml = contentClone.html() || '';

    // If the cleaned HTML is too short, fallback to body text (plain)
    if (cleanedHtml.length < 50) {
        const text = contentClone.text().trim().replace(/\s{2,}/g, ' ');
        // Return plain text without markdown, but we'll convert to markdown later (just a paragraph)
        cleanedHtml = `<p>${text}</p>`;
    }

    // ---------- STEP 4: Convert cleaned HTML to Markdown ----------
    let markdownContent = turndownService.turndown(cleanedHtml);

    // Clean up markdown (remove excessive line breaks, fix lists, etc.)
    markdownContent = markdownContent
        .replace(/\n{3,}/g, '\n\n') // Limit empty lines
        .replace(/^[ \t]+/gm, '') // Remove leading spaces on lines
        .trim();

    // If markdown is empty, fallback to plain text
    if (!markdownContent) {
        const text = contentClone.text().trim().replace(/\s{2,}/g, ' ');
        markdownContent = text;
    }

    // ---------- STEP 5: Extract metadata ----------
    const title = $('h1.entry-title').first().text().trim() ||
        $('h1').first().text().trim() ||
        $('title').text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        'Untitled Article';

    const excerpt = $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        markdownContent.replace(/\n/g, ' ').substring(0, 200) + '...';

    const author = $('meta[name="author"]').attr('content') ||
        $('.author-name').first().text().trim() ||
        $('.byline').first().text().trim().replace(/^By\s*/i, '') ||
        $('.entry-author').first().text().trim() ||
        '';

    const publisher = $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="publisher"]').attr('content') ||
        $('.publisher').first().text().trim() ||
        '';

    const date = $('meta[property="article:published_time"]').attr('content') ||
        $('meta[name="date"]').attr('content') ||
        $('time').first().attr('datetime') ||
        $('.published-date').first().text().trim() ||
        $('.date').first().text().trim() ||
        $('.entry-date').first().text().trim() ||
        '';

    const image = $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('.post-thumbnail img').first().attr('src') ||
        $('.featured-image img').first().attr('src') ||
        '';

    const tags = [];
    $('.tags a, .categories a, .topic-tag a, .article-tags a, .post-tags a').each((i, el) => {
        const tag = $(el).text().trim();
        if (tag && tags.length < 10 && !tags.includes(tag)) tags.push(tag);
    });

    return {
        article: {
            title: title,
            excerpt: excerpt,
            content: markdownContent || 'No content available for this article.',
            tags: tags,
            images: image ? [image] : [],
        },
        metadata: {
            publisher: publisher,
            date: date,
            url: url || '',
            author: author,
            image: image,
        },
        author: author,
    };
};

// Retry logic for transient failures
const fetchWithRetry = (url, retries = 3, delay = 2000) => {
    return new Promise((resolve, reject) => {
        axiosInstance.get(url)
            .then(resolve)
            .catch((error) => {
                if (retries === 0) return reject(error);
                console.log(`[Scraper] Retry (${retries} left) for ${url}`);
                setTimeout(() => {
                    fetchWithRetry(url, retries - 1, delay * 1.5)
                        .then(resolve)
                        .catch(reject);
                }, delay);
            });
    });
};

// Main exported function
export const fetchArticleHtml = async(url) => {
    console.log(`[Scraper] Fetching article from: ${url}`);
    if (!isValidArticleUrl(url)) {
        throw new Error('Please provide a specific article URL, not a homepage.');
    }

    try {
        const response = await fetchWithRetry(url);
        const html = response.data;
        if (!html || html.length < 100) {
            throw new Error('Empty or invalid response from website');
        }

        const result = cleanAndExtractContent(html, url);
        if (!result.article.content || result.article.content.length < 50) {
            throw new Error('Could not extract meaningful content from this article.');
        }

        console.log(`[Scraper] Successfully extracted: "${result.article.title}"`);
        console.log(`[Scraper] Content length: ${result.article.content.length} chars`);
        return result;
    } catch (error) {
        console.error('[Scraper] Error:', error.message);
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new Error('Request timed out. Please try again.');
        }
        if (error.response) {
            if (error.response.status === 403) {
                throw new Error('Access denied (403). The website is blocking our request. Please try a different source.');
            }
            if (error.response.status === 404) {
                throw new Error('Article not found. Please check the URL.');
            }
            if (error.response.status === 429) {
                throw new Error('Too many requests. Please wait and try again.');
            }
        }
        throw new Error(`Failed to fetch article: ${error.message || 'Unknown error'}`);
    }
};

// Backward compatibility exports (return plain text for older use cases)
export const extractPlainText = (html, url) => {
    const result = cleanAndExtractContent(html, url);
    // Remove markdown syntax to get plain text
    const plain = result.article.content
        .replace(/[#*`>]/g, '')
        .replace(/\n{2,}/g, '\n\n')
        .trim();
    return {
        title: result.article.title,
        content: plain,
        excerpt: result.article.excerpt,
        url: url || '',
    };
};

export const extractMetadata = (html) => {
    const $ = cheerio.load(html);
    return {
        title: $('h1').first().text().trim() || $('title').text().trim() || $('meta[property="og:title"]').attr('content') || 'Untitled Article',
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
        publisher: $('meta[property="og:site_name"]').attr('content') || $('meta[name="publisher"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || $('.author-name').first().text().trim() || $('.byline').first().text().trim().replace(/^By\s*/i, '') || '',
        date: $('meta[property="article:published_time"]').attr('content') || $('meta[name="date"]').attr('content') || $('.published-date').first().text().trim() || $('.date').first().text().trim() || '',
        image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || $('img').first().attr('src') || '',
    };
};

export const fetchRawHtml = async(url) => {
    const response = await axiosInstance.get(url);
    return response.data;
};

export const extractTextOnly = (html) => {
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, svg, .ad, .share, .social').remove();
    return $('body').text().trim().replace(/\s{2,}/g, ' ');
};

export const fetchMultipleArticles = async(urls) => {
    const results = [],
        errors = [];
    for (const url of urls) {
        try {
            const data = await fetchArticleHtml(url);
            results.push({ url, success: true, data });
        } catch (err) {
            errors.push({ url, success: false, error: err.message });
        }
    }
    return { results, errors };
};

export default {
    fetchArticleHtml,
    extractPlainText,
    extractMetadata,
    fetchRawHtml,
    extractTextOnly,
    fetchMultipleArticles,
};