import { Router, Request, Response } from 'express';
import { checkInteractions } from '../services/interactionChecker';

const router = Router();

/**
 * Validates a single drug name: must be 1–100 characters,
 * containing only letters, digits, spaces, hyphens, and apostrophes.
 * This prevents XSS payloads and keeps garbage data out of the DB.
 */
const DRUG_NAME_REGEX = /^[a-zA-Z0-9 '\-]{1,100}$/;

const isValidDrugName = (name: unknown): name is string =>
    typeof name === 'string' && DRUG_NAME_REGEX.test(name.trim());

router.post('/check', async (req: Request, res: Response) => {
    try {
        const { drugs } = req.body;

        if (!drugs || !Array.isArray(drugs)) {
            res.status(400).json({ error: "Invalid request. 'drugs' must be an array of strings." });
            return;
        }

        // Validate every drug name before touching the database
        const invalidEntry = drugs.find(d => !isValidDrugName(d));
        if (invalidEntry !== undefined) {
            res.status(400).json({
                error: "Invalid drug name detected. Names must be 1–100 characters and contain only letters, digits, spaces, hyphens, or apostrophes."
            });
            return;
        }

        const interactions = await checkInteractions(drugs);

        res.json({ interactions });
    } catch (error) {
        console.error("Error checking interactions:", error);
        res.status(500).json({ error: "Internal server error while checking interactions." });
    }
});

export default router;
