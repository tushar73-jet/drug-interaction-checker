import { Router } from 'express';
import { checkInteractionsController } from '../controllers/interaction.controller';
import { validate } from '../middlewares/validate';
import { interactionCheckSchema } from '../validation/schemas';

const router = Router();

/**
 * @route   POST /api/interactions/check
 * @desc    Analyze multiple drugs for potential clinical interactions
 * @access  Public (or protected by API Key/Auth)
 */
router.post(
  '/check',
  validate(interactionCheckSchema),
  checkInteractionsController
);

export default router;
