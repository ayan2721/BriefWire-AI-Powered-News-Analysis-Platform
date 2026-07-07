import dotenv from 'dotenv';
import app from './app.js';
import connectDatabase from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`BriefWire backend running on http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error('Server startup failed', error);
    process.exit(1);
});