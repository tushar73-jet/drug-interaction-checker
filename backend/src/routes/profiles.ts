import { Router, Response } from 'express';
import { getProfiles, upsertProfile, deleteProfile } from '../services/profileService';

// Simple mock middleware to extract user context
// In production, this would be Clerk's middleware
const router = Router();

router.get('/', async (req: any, res: Response) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Auth required' });

    try {
        const profiles = await getProfiles(userId as string);
        res.json({ profiles: profiles.map(p => ({ ...p, drugs: JSON.parse(p.drugs) })) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

router.post('/', async (req: any, res: Response) => {
    const userId = req.headers['x-user-id'];
    const { name, drugs, notes } = req.body;
    
    if (!userId) return res.status(401).json({ error: 'Auth required' });
    if (!name || !drugs) return res.status(400).json({ error: 'Invalid data' });

    try {
        const profile = await upsertProfile(userId as string, name, drugs, notes);
        res.json({ profile: { ...profile, drugs: JSON.parse(profile.drugs) } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

router.delete('/:id', async (req: any, res: Response) => {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Auth required' });

    try {
        await deleteProfile(id, userId as string);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

export default router;
