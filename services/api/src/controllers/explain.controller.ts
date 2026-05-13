import { Request, Response } from 'express';
import { z } from 'zod';
import { auditLog } from '../utils/auditLog';
import logger from '../utils/logger';

export const explainSchema = z.object({
    body: z.object({
        drug1: z.string().min(1).max(100).regex(/^[a-zA-Z0-9 '\-]+$/),
        drug2: z.string().min(1).max(100).regex(/^[a-zA-Z0-9 '\-]+$/),
        description: z.string().min(1).max(2000),
    }),
});

type ExplainInput = z.infer<typeof explainSchema>['body'];

/** Base URL of the Python AI engine microservice */
const AI_ENGINE_URL = (process.env.AI_ENGINE_URL || 'http://localhost:3002').replace(/\/$/, '');

export const explainInteractionController = async (
    req: Request<{}, {}, ExplainInput>,
    res: Response
) => {
    const { drug1, drug2, description } = req.body;

    // Audit log for HIPAA compliance
    await auditLog(
        'EXPLAIN_INTERACTION',
        `AI Explain: ${drug1} + ${drug2}`,
        (req as any).auth?.userId,
        { drug1, drug2 },
        req.ip
    );

    try {
        const aiResponse = await fetch(`${AI_ENGINE_URL}/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drug1, drug2, description }),
            signal: AbortSignal.timeout(65_000), // 65s — allows Python's 60s internal timeout
        });

        if (!aiResponse.ok) {
            const errorBody = await aiResponse.json().catch(() => ({}));
            logger.error(`AI engine returned ${aiResponse.status} for ${drug1}+${drug2}`, errorBody);

            return res.status(aiResponse.status).json({
                status: 'error',
                message: (errorBody as any).detail || 'AI explanation service unavailable.',
            });
        }

        const data = await aiResponse.json();

        return res.status(200).json({
            status: 'success',
            data: {
                explanation: data.explanation,
                citations: data.citations,
            },
        });

    } catch (error: any) {
        const isTimeout = error?.name === 'TimeoutError' || error?.code === 'ABORT_ERR';
        logger.error(`Proxy to AI engine failed for ${drug1}+${drug2}: ${error?.message}`);

        return res.status(isTimeout ? 504 : 502).json({
            status: 'error',
            message: isTimeout
                ? 'AI explanation timed out. Please try again.'
                : 'AI explanation service is temporarily unavailable.',
        });
    }
};
export const chatSchema = z.object({
    body: z.object({
        drug1: z.string(),
        drug2: z.string(),
        context: z.string(),
        question: z.string().min(1).max(500),
        citations: z.array(z.any()).optional(),
    }),
});

type ChatInput = z.infer<typeof chatSchema>['body'];

export const chatInteractionController = async (
    req: Request<{}, {}, ChatInput>,
    res: Response
) => {
    const { drug1, drug2, context, question, citations } = req.body;

    await auditLog(
        'CHAT_INTERACTION',
        `AI Chat Follow-up: ${drug1} + ${drug2}`,
        (req as any).auth?.userId,
        { drug1, drug2, questionLength: question.length },
        req.ip
    );

    try {
        const aiResponse = await fetch(`${AI_ENGINE_URL}/explain/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drug1, drug2, context, question, citations }),
            signal: AbortSignal.timeout(35_000),
        });

        if (!aiResponse.ok) {
            return res.status(aiResponse.status).json({
                status: 'error',
                message: 'AI chat service unavailable.',
            });
        }

        const data = await aiResponse.json();
        return res.status(200).json({
            status: 'success',
            data: { answer: data.answer },
        });
    } catch (error: any) {
        return res.status(502).json({
            status: 'error',
            message: 'AI chat service is temporarily unavailable.',
        });
    }
};
