import { Request, Response } from 'express';
import { checkInteractions } from '../services/interactionChecker';
import { z } from 'zod';
import { interactionCheckSchema } from '../validation/schemas';

type InteractionInput = z.infer<typeof interactionCheckSchema>['body'];

import { auditLog } from '../utils/auditLog';

export const checkInteractionsController = async (
  req: Request<{}, {}, InteractionInput>,
  res: Response
) => {
  const { drugs } = req.body;
  
  // Audit the check for HIPAA compliance
  await auditLog(
    'CHECK_INTERACTION',
    `Check: ${drugs.join(', ')}`,
    (req as any).auth?.userId,
    { drugCount: drugs.length },
    req.ip
  );

  const interactions = await checkInteractions(drugs);

  return res.status(200).json({
    status: 'success',
    data: {
      interactions,
    },
  });
};
