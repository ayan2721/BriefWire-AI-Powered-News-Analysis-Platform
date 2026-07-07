import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './User.js';

export const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publisher: {
        type: DataTypes.STRING,
        allowNull: true
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    bias: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sentiment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    credibilityScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    rawBlobPath: {
        type: DataTypes.STRING,
        allowNull: true
    },
    analysisBlobPath: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Articles',
    timestamps: true
});

Article.belongsTo(User, { foreignKey: 'userId', as: 'owner' });