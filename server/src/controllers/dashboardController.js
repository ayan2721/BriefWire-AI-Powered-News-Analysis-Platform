import { Article, Bookmark, Analysis } from '../models/index.js';

export async function getDashboardSummary(req, res) {
    const [bookmarks, recentAnalyses, savedArticles] = await Promise.all([
        Bookmark.count({ where: { userId: req.user.id } }),
        Analysis.count({ where: { userId: req.user.id } }),
        Article.count({ where: { userId: req.user.id } })
    ]);

    res.json({ summary: { bookmarks, recentAnalyses, savedArticles } });
}

export async function getBookmarks(req, res) {
    const items = await Bookmark.findAll({ where: { userId: req.user.id }, include: [{ model: Article, as: 'article' }] });
    res.json({ bookmarks: items });
}

export async function getArchive(req, res) {
    const articles = await Article.findAll({ where: { userId: req.user.id }, order: [
            ['updatedAt', 'DESC']
        ] });
    res.json({ archive: articles });
}