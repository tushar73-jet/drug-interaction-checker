import { Router, Request, Response } from 'express';
import { searchDrugs, getStats } from '../services/drugService';

const router = Router();



router.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query) {
            return res.status(400).json({ error: "Query parameter 'q' is required for autocomplete search." });
        }

        const drugs = await searchDrugs(query);
        res.json({ drugs });

    } catch (error) {
        console.error("Error in drug search route:", error);
        res.status(500).json({ error: "Internal server error while searching for drugs." });
    }
});

export default router;