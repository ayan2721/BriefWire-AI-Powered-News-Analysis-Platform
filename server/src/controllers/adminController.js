import { User, Article } from '../models/index.js';

export async function getAdminMetrics(req, res) {
    const [users, articles] = await Promise.all([
        User.count(),
        Article.count()
    ]);
    res.json({ metrics: { users, articles } });
}

export async function listUsers(req, res) {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    res.json({ users });
}

export async function listArticles(req, res) {
    const articles = await Article.findAll({ attributes: ['id', 'title', 'publisher', 'url', 'credibilityScore', 'createdAt'] });
    res.json({ articles });
}