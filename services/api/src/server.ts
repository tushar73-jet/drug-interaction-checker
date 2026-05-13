import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';

import drugRoutes from './routes/drugs';
import interactionRoutes from './routes/interactions';
import profileRoutes from './routes/profiles';

const app = express();
const PORT = process.env.PORT || 3001;

import logger from './utils/logger';

app.use(helmet()); 
app.use(morgan('dev')); 
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).auth?.userId
  });
  next();
});

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' is not permitted.`));
        }
    },
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

import { clerkMiddleware } from '@clerk/express';
import { authMiddleware } from './middlewares/auth';

app.use(clerkMiddleware());

// API Routes (v1)
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() });
});

app.use('/api/v1/drugs', drugRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/profiles', authMiddleware, profileRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: (req as any).auth?.userId
  });
  errorHandler(err, req, res, next);
});

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
