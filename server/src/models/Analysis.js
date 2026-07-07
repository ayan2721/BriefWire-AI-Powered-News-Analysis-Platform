import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Article } from './Article.js';

export const Analysis = sequelize.define('Analysis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    result: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    tableName: 'Analyses',
    timestamps: true
});

Analysis.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Analysis.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });