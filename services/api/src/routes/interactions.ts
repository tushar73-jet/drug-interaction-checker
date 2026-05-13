import { Router } from 'express';
import { checkInteractionsController } from '../controllers/interaction.controller';
import { explainInteractionController, explainSchema, chatInteractionController, chatSchema } from '../controllers/explain.controller';
import { validate } from '../middlewares/validate';
import { interactionCheckSchema } from '../validation/schemas';

const router = Router();

/**
 * @route   POST /api/v1/interactions/check
 * @desc    Analyze multiple drugs for potential clinical interactions
 * @access  Public
 */
router.post(
  '/check',
  validate(interactionCheckSchema),
  checkInteractionsController
);

/**
 * @route   POST /api/v1/interactions/explain
 * @desc    AI-powered clinical explanation of a drug interaction (Groq + Tavily)
 * @access  Public
 */
router.post(
  '/explain',
  validate(explainSchema),
  explainInteractionController
);

/**
 * @route   POST /api/v1/interactions/chat
 * @desc    Ask follow-up questions about a drug interaction
 * @access  Public
 */
router.post(
  '/chat',
  validate(chatSchema),
  chatInteractionController
);

export default router;
