// src/services/api.js

import axios from 'axios';

// Use the correct API base with /api prefix
const API_BASE =
    import.meta.env.VITE_API_BASE_URL || '/api';

function getHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return response.data;
}

export async function register(name, email, password) {
    const response = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    return response.data;
}

export async function fetchFeed(category) {
    const url = `${API_BASE}/news/feed${category ? `?category=${category}` : ''}`;
    const response = await axios.get(url);
    return response.data;
}

export async function analyzeArticle(payload, token) {
    const response = await axios.post(`${API_BASE}/news/analyze`, payload, { 
        headers: getHeaders(token) 
    });
    return response.data;
}

export async function fetchArticle(url) {
    const response = await axios.get(`${API_BASE}/news/article`, { 
        params: { url } 
    });
    return response.data;
}

export async function fetchDashboardSummary(token) {
    const response = await axios.get(`${API_BASE}/dashboard/summary`, { 
        headers: getHeaders(token) 
    });
    return response.data;
}

export async function fetchAnalysisHistory(token) {
    const response = await axios.get(`${API_BASE}/analysis/history`, { 
        headers: getHeaders(token) 
    });
    return response.data;
}

export async function fetchArchive(token) {
    const response = await axios.get(`${API_BASE}/dashboard/archive`, { 
        headers: getHeaders(token) 
    });
    return response.data;
}

export async function searchArticles(query, category, token) {
    const response = await axios.get(`${API_BASE}/news/search`, { 
        params: { q: query, category } 
    });
    return response.data;
}

export async function getTrendingTopics() {
    const response = await axios.get(`${API_BASE}/news/trending`);
    return response.data;
}

export async function getArticleById(id, token) {
    const response = await axios.get(`${API_BASE}/news/${id}`, { 
        headers: getHeaders(token) 
    });
    return response.data;
}

export async function batchFetchArticles(urls, token) {
    const response = await axios.post(`${API_BASE}/news/batch`, { urls }, { 
        headers: getHeaders(token) 
    });
    return response.data;
}