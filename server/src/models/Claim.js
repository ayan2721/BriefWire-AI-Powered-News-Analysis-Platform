import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Article } from './Article.js';

export const Claim = sequelize.define('Claim', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    evidence: {
        type: DataTypes.JSON,
        allowNull: true
    },
    confidence: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    tableName: 'Claims',
    timestamps: true
});

Claim.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });