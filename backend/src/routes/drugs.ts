import { Router, Request, Response } from 'express';
import { searchDrugs, getStats, getDrugDetails } from '../services/drugService';

const router = Router();

/**
 * Validates a search query string: 1–100 chars, letters/digits/spaces/hyphens/apostrophes only.
 * Prevents XSS payloads from reaching the drug search logic.
 */
const QUERY_REGEX = /^[a-zA-Z0-9 '\-]{1,100}$/;

const isValidQuery = (q: unknown): q is string =>
    typeof q === 'string' && QUERY_REGEX.test(q.trim());

import { validate } from '../middlewares/validate';
import { drugSearchSchema } from '../validation/schemas';

router.get('/search', validate(drugSearchSchema), async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const drugs = await searchDrugs(query);
        res.json({ status: 'success', data: { drugs } });
    } catch (error) {
        console.error("Error in drug search route:", error);
        res.status(500).json({ error: "Drug search service unavailable" });
    }
});

router.get('/details/:name', async (req: Request, res: Response) => {
    try {
        const name = req.params.name;

        if (!isValidQuery(name)) {
            return res.status(400).json({ error: "Invalid drug name." });
        }

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