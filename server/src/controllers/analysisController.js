import { Analysis, Article } from '../models/index.js';

export async function getAnalysisHistory(req, res) {
    const analyses = await Analysis.findAll({
        where: { userId: req.user.id },
        include: [{ model: Article, as: 'article', attributes: ['title', 'url', 'publisher'] }],
        order: [
            ['createdAt', 'DESC']
        ]
    });
    res.json({ analyses });
}

export async function getAnalysisById(req, res) {
    const analysis = await Analysis.findOne({
        where: { id: req.params.id, userId: req.user.id },
        include: [{ model: Article, as: 'article' }]
    });
    if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json({ analysis });
}

export async function reanalyzeArticle(req, res) {
    const { articleId } = req.body;
    const article = await Article.findOne({ where: { id: articleId, userId: req.user.id } });
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }
    article.updatedAt = new Date();
    await article.save();
    res.json({ message: 'Reanalysis queued', articleId });
}