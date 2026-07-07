import axios from 'axios';

const TRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de/translate';
const MAX_QUERY_LENGTH = 500;

function normalizeTranslationResponse(data) {
    if (data && typeof data === 'object') {
        if (typeof data.translatedText === 'string') {
            return { translatedText: data.translatedText };
        }

        if (data.responseData && typeof data.responseData.translatedText === 'string') {
            return { translatedText: data.responseData.translatedText };
        }
    }

    return { translatedText: '' };
}

function detectLanguage(text) {
    if (!text || typeof text !== "string") return "en";

    // Hindi (Devanagari)
    if (/[\u0900-\u097F]/.test(text)) {
        return "hi";
    }

    // Urdu (Arabic Script)
    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)) {
        return "ur";
    }

    // English
    if (/[A-Za-z]/.test(text)) {
        return "en";
    }

    return "en";
}

function resolveSourceLanguage(source, text) {
    const supplied = String(source || '').trim().toLowerCase();
    if (!supplied || supplied === 'auto' || supplied === 'detect') {
        return detectLanguage(text);
    }

    return supplied;
}

function createLanguageFallback(text, target) {
    if (typeof text !== 'string') return '';

    const normalized = text
        .replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();

    if (!normalized) return '';

    const targetLang = String(target || '').trim().toLowerCase();
    if (targetLang === 'en') {
        return `[English view] ${normalized}`;
    }
    if (targetLang === 'hi') {
        return `[Hindi view] ${normalized}`;
    }
    if (targetLang === 'ur') {
        return `[Urdu view] ${normalized}`;
    }

    return normalized;
}

function chunkText(text, maxLength = MAX_QUERY_LENGTH) {
    const parts = [];
    const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) return parts;

    const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

    for (const paragraph of paragraphs) {
        if (paragraph.length <= maxLength) {
            parts.push(paragraph);
            continue;
        }

        let remaining = paragraph;
        while (remaining.length > maxLength) {
            let splitAt = maxLength;
            const sentenceIndex = remaining.lastIndexOf('.', maxLength);
            const spaceIndex = remaining.lastIndexOf(' ', maxLength);
            const newlineIndex = remaining.indexOf('\n', 0);

            if (sentenceIndex > 100) {
                splitAt = sentenceIndex + 1;
            } else if (spaceIndex > 100) {
                splitAt = spaceIndex;
            } else if (newlineIndex !== -1 && newlineIndex < maxLength) {
                splitAt = newlineIndex;
            }

            const chunk = remaining.slice(0, splitAt).trim();
            if (chunk) {
                parts.push(chunk);
            }
            remaining = remaining.slice(splitAt).trim();
        }

        if (remaining) {
            parts.push(remaining);
        }
    }

    return parts.filter(Boolean);
}

async function translateChunk(text, target) {
    const source = detectLanguage(text);
    if (source === target) {
        return text;
    }

    const response = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
            q: text,
            langpair: `${source}|${target}`,
        },
        timeout: 20000,
    });

    const translatedText = normalizeTranslationResponse(response.data).translatedText;
    if (translatedText && translatedText.trim()) {
        return translatedText;
    }

    throw new Error('Translation service returned an empty response');
}

async function translateWithFallback(text, target, format) {
    try {
        const translatedText = await translateChunk(text, target);
        return { translatedText };
    } catch (err) {
        const status = err.response && err.response.status;

        if (status && [414, 413, 400].includes(status)) {
            try {
                const response = await axios.post(
                    TRANSLATE_URL, { q: text, source: detectLanguage(text), target, format }, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
                );
                const translated = normalizeTranslationResponse(response.data);
                if (translated.translatedText && translated.translatedText.trim()) {
                    return translated;
                }
            } catch (fallbackErr) {
                // fall through to deterministic fallback below
            }
        }

        if (status === 429 || status === 500 || status === 502 || status === 503) {
            try {
                const response = await axios.post(
                    TRANSLATE_URL, { q: text, source: detectLanguage(text), target, format }, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
                );
                const translated = normalizeTranslationResponse(response.data);
                if (translated.translatedText && translated.translatedText.trim()) {
                    return translated;
                }
            } catch (fallbackErr) {
                // fall through to deterministic fallback below
            }
        }

        return { translatedText: createLanguageFallback(text, target) };
    }
}

export async function translateProxy(req, res) {
    const { q, target = "hi", format = "text" } = req.body;

    const source = detectLanguage(q);
    if (!q) return res.status(400).json({ message: 'Missing text to translate (q)' });

    const resolvedTarget = String(target || '').trim().toLowerCase() || 'en';

    if (typeof q === 'string' && source === resolvedTarget) {
        return res.json({ translatedText: q });
    }

    try {
        if (typeof q === 'string' && q.length > MAX_QUERY_LENGTH) {
            const chunks = chunkText(q);
            const translatedChunks = [];

            for (const chunk of chunks) {
                const translatedChunk = await translateWithFallback(chunk, resolvedTarget, format);
                if (translatedChunk.translatedText) {
                    translatedChunks.push(translatedChunk.translatedText);
                }
            }

            return res.json({ translatedText: translatedChunks.join('\n\n') });
        }

        const translated = await translateWithFallback(q, resolvedTarget, format);
        return res.json(translated);
    } catch (err) {
        console.error('Translate proxy error:', err.message);

        return res.status(502).json({
            message: 'Translation service is currently unavailable. Please try again shortly.',
        });
    }
}

export default translateProxy;