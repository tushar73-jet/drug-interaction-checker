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

router.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.json({ drugs: [] });
        }

        if (!isValidQuery(query)) {
            return res.status(400).json({ error: "Invalid search query. Use only letters, digits, spaces, hyphens, or apostrophes (max 100 chars)." });
        }

        const drugs = await searchDrugs(query as string);
        res.json({ drugs });

    } catch (error) {
        console.error("Error in drug search route:", error);
        res.status(500).json({ error: "Search failed" });
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