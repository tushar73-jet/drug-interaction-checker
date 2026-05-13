import { Router, Response } from 'express';
import { getProfiles, upsertProfile, deleteProfile } from '../services/profileService';

// Simple mock middleware to extract user context
// In production, this would be Clerk's middleware
const router = Router();

import { validate } from '../middlewares/validate';
import { profileSchema } from '../validation/schemas';

router.get('/', async (req: any, res: Response) => {
    const userId = req.auth?.userId;
    if (!userId) throw new Error('Unauthorized Access');

    const profiles = await getProfiles(userId);
    res.json({ status: 'success', data: { profiles } });
});

router.post('/', validate(profileSchema), async (req: any, res: Response) => {
    const userId = req.auth?.userId;
    const { name, drugs, notes } = req.body;
    
    if (!userId) throw new Error('Unauthorized Access');

    const profile = await upsertProfile(userId, name, drugs, notes);
    res.json({ status: 'success', data: { profile } });
});

router.delete('/:id', async (req: any, res: Response) => {
    const userId = req.auth?.userId;
    const { id } = req.params;

    if (!userId) throw new Error('Unauthorized Access');

    await deleteProfile(id, userId);
    res.json({ status: 'success', message: 'Profile deleted successfully' });
});

export default router;
