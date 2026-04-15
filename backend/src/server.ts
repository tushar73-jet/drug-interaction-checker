import express, { Request, Response } from 'express';
import cors from 'cors';

import drugRoutes from './routes/drugs';
import interactionRoutes from './routes/interactions';
import profileRoutes from './routes/profiles';

const app = express();
const PORT = process.env.PORT || 3001;

// Restrict CORS to an explicit origin allow-list.
// Set ALLOWED_ORIGINS as a comma-separated env var in production
// (e.g. "https://your-app.vercel.app,https://your-custom-domain.com").
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no Origin header) and listed origins.
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' is not permitted.`));
        }
    },
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-user-id'],
}));

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/drugs', drugRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/profiles', profileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
