import { z } from 'zod';

/**
 * Enterprise-grade validation schemas for all clinical data inputs.
 * Ensures strict compliance with healthcare data standards.
 */

export const drugSearchSchema = z.object({
  query: z.object({
    q: z.string()
      .min(1, 'Search query required')
      .max(100, 'Query too long')
      .regex(/^[a-zA-Z0-9 '\-]+$/, 'Invalid characters in search')
  })
});

export const interactionCheckSchema = z.object({
  body: z.object({
    drugs: z.array(
      z.string()
        .min(1, 'Drug name required')
        .max(100, 'Drug name too long')
        .regex(/^[a-zA-Z0-9 '\-]+$/, 'Invalid drug name')
    )
      .min(2, 'Select at least 2 drugs to check for interactions')
      .max(20, 'Maximum 20 drugs can be checked at once')
  })
});

export const profileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Patient name required')
      .max(200, 'Name too long'),
    drugs: z.array(z.string()).min(1, 'Select at least 1 drug for the profile'),
    notes: z.string()
      .max(2000, 'Notes too long')
      .optional()
  })
});
