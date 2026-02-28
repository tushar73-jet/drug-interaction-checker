import express, { Request, Response } from 'express';
import cors from 'cors';

import drugRoutes from './routes/drugs';
import interactionRoutes from './routes/interactions';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/drugs', drugRoutes);
app.use('/api/interactions', interactionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
