import { Router, Request, Response } from 'express';
import { checkInteractions } from '../services/interactionChecker';
import { buildGraph } from '../services/graphBuilder';

const router = Router();

router.post('/check', async (req: Request, res: Response) => {
    try {
        const { drugs } = req.body;

        if (!drugs || !Array.isArray(drugs)) {
            res.status(400).json({ error: "Invalid request. 'drugs' must be an array of strings." });
            return;
        }

        const interactions = await checkInteractions(drugs);

        res.json({ interactions });
    } catch (error) {
        console.error("Error checking interactions:", error);
        res.status(500).json({ error: "Internal server error while checking interactions." });
    }
});

router.post('/graph', async (req: Request, res: Response) => {
    try {
        const { drugs } = req.body;

        if (!drugs || !Array.isArray(drugs)) {
            res.status(400).json({ error: "Invalid request. 'drugs' must be an array of strings." });
            return;
        }

        const graph = await buildGraph(drugs);

        res.json({ graph });
    } catch (error) {
        console.error("Error building graph:", error);
        res.status(500).json({ error: "Internal server error while building graph." });
    }
});

export default router;
