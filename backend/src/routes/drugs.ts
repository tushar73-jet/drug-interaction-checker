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

router.get('/details/:name', async (req: Request, res: Response) => {
    try {
        const name = req.params.name as string;
        const { getDrugDetails } = await import('../services/drugService');
        const details = await getDrugDetails(name);
        res.json({ details });
    } catch (error) {
        console.error("Error in drug details route:", error);
        res.status(500).json({ error: "Details fetch failed" });
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