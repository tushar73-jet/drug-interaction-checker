import { Router, Request, Response } from 'express';
import { searchDrugs, getStats } from '../services/drugService';

const router = Router();



router.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query) {
            return res.json({ drugs: [] });
        }

        const drugs = await searchDrugs(query);
        res.json({ drugs });

    } catch (error) {
        console.error("Error in drug search route:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await getStats();
        res.json(stats);
    } catch (error) {
        console.error("Error in stats route:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

export default router;