import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 1433),
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: true,
            trustServerCertificate: process.env.NODE_ENV !== 'production'
        }
    },
    logging: false
});

export default async function connectDatabase() {
    await sequelize.authenticate();
    console.log('Connected to Azure SQL Database');
}

export { sequelize };