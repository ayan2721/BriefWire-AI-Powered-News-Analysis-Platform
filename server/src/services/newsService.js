import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import dotenv from "dotenv";

dotenv.config();

const NEWSDATA_KEY = process.env.NEWSDATA_API_KEY;

async function fetchNewsDataFromApi(query, category) {
    const url = new URL("https://newsdata.io/api/1/news");

    if (!NEWSDATA_KEY) {
        throw new Error('NEWSDATA_API_KEY is not configured');
    }

    url.searchParams.set("apikey", NEWSDATA_KEY);
    url.searchParams.set("language", "en");
    url.searchParams.set("country", "in");

    if (query && query.trim()) {
        url.searchParams.set("q", query);
    }

    if (category) {
        url.searchParams.set("category", category);
    }

    const response = await axios.get(url.toString(), { timeout: 10000 });
    return response.data && response.data.results
}

export async function fetchNewsData(query = "news", category) {
    try {
        const results = await fetchNewsDataFromApi(query, category);
        if (Array.isArray(results) && results.length > 0) {
            return results;
        }

        // fallback to RSS if NewsData returns no results
        const fallback = await fetchGoogleRss(category || query || 'breaking');
        return fallback;
    } catch (error) {
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Response:", error.response.data);
            console.log("URL:", url.toString());
        } else {
            console.log(error.message);
        }

        return await fetchGoogleRss(category || query || "breaking");
    }
}

export async function fetchGoogleRss(query = "breaking") {
    try {
        const rssUrl =
            "https://news.google.com/rss/search?q=" +
            encodeURIComponent(query);

        const response = await axios.get(rssUrl, {
            timeout: 10000
        });

        const xmlParser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: ""
        });

        const parsed = xmlParser.parse(response.data);

        if (
            parsed &&
            parsed.rss &&
            parsed.rss.channel &&
            parsed.rss.channel.item
        ) {
            return parsed.rss.channel.item;
        }

        return [];
    } catch (error) {
        console.error("Google RSS Error:", error.message);
        return [];
    }
}