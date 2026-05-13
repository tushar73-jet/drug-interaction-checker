import { z } from 'zod';

export const DrugCheckSchema = z.object({
  body: z.object({
    drugs: z.array(
      z.string()
        .min(1, 'Drug name cannot be empty')
        .max(100, 'Drug name is too long')
        .regex(/^[a-zA-Z0-9 '\-]+$/, 'Invalid characters in drug name')
    ).min(2, 'At least 2 drugs are required for interaction checking')
  })
});

export type DrugCheckInput = z.infer<typeof DrugCheckSchema>['body'];
