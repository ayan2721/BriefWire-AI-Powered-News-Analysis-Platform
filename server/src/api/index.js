import dotenv from 'dotenv';
import app from '../src/app.js';
import connectDatabase from '../src/config/database.js';

dotenv.config();

let dbConnected = false;

export default async function handler(req, res) {
    try {
        if (!dbConnected) {
            await connectDatabase();
            dbConnected = true;
            console.log("Database connected");
        }

        return app(req, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}