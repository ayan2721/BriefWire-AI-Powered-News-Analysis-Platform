import { uploadBlob } from '../config/blobStorage.js';

export async function saveRawArticleHTML(userId, articleId, html) {
    const path = `news/${userId}/${articleId}/original.html`;
    const url = await uploadBlob(path, html, 'text/html');
    return { path, url };
}

export async function saveArticleJson(userId, articleId, json) {
    const body = JSON.stringify(json, null, 2);
    const path = `news/${userId}/${articleId}/article.json`;
    const url = await uploadBlob(path, body);
    return { path, url };
}

export async function saveAnalysisJson(userId, articleId, json) {
    const body = JSON.stringify(json, null, 2);
    const path = `news/${userId}/${articleId}/analysis.json`;
    const url = await uploadBlob(path, body);
    return { path, url };
}