import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL =
    process.env.GROQ_API_URL ||
    "https://api.groq.com/openai/v1/chat/completions";

const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
    throw new Error("GROQ_API_KEY is required");
}

export function extractMarkdownSection(markdown, heading) {
    if (typeof markdown !== "string" || !markdown.trim()) {
        return "";
    }

    const normalizedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
        `(?:^|\\n)#{2,3}\\s+${normalizedHeading}\\s*\\n([\\s\\S]*?)(?=\\n#{2,3}\\s+|$)`,
        "i"
    );

    const match = markdown.match(pattern);
    return match ? match[1].trim() : "";
}

async function analyzeTextWithGroq(systemPrompt, articleText) {
    try {
        // Limit article length to reduce token usage
        const trimmedArticle = articleText.substring(0, 5000);

        const response = await axios.post(
            API_URL, {
                model: "llama-3.3-70b-versatile",
                messages: [{
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: trimmedArticle,
                    },
                ],
                temperature: 0.2,
                max_tokens: 700,
            }, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        let content = response.data.choices[0].message.content.trim();

        // Remove markdown code fences if present
        content = content
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();

        const credibilitySection = extractMarkdownSection(content, "Credibility");

        return {
            success: true,
            analysis: content,
            credibility: credibilitySection || content,
        };
    } catch (error) {
        if (error.response) {
            console.error("Groq Error:", error.response.data);

            if (error.response.status === 429) {
                return {
                    success: false,
                    error: "RATE_LIMIT",
                    message: error.response.data.error &&
                        error.response.data.error.message ?
                        error.response.data.error.message : "Groq rate limit exceeded.",
                };
            }

            return {
                success: false,
                error: error.response.status,
                message: error.response.data,
            };
        }

        console.error("Groq Error:", error.message);

        return {
            success: false,
            error: "UNKNOWN_ERROR",
            message: error.message,
        };
    }
}

export async function analyzeNews(articleText) {
    const prompt = `
You are an expert journalist, editor, and fact checker.

Analyze the following news article.

Return a beautifully formatted Markdown report.

Use headings, bullet points, tables, bold text, separators and emojis.

The report should contain:

# 📰 AI Analysis Report

## Summary
- Short
- Medium
- Detailed

## Credibility
- Score (/100)
- Confidence
- Progress bar using █ and ░

## Political Bias

## Sentiment

## Emotion

## Fake News Probability

## Clickbait

## Missing Context

## Verified Facts

## Opinions

## Key Claims (Markdown Table)

## Neutral Rewrite

Do NOT return JSON.
Return only Markdown.`;

    return analyzeTextWithGroq(prompt, articleText);
}