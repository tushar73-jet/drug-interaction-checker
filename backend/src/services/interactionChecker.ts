import prisma from '../db/prismaClient';

export interface InteractionResult {
    drug1: string;
    drug2: string;
    description: string;
    severity: string;
}

export const checkInteractions = async (drugs: string[]): Promise<InteractionResult[]> => {
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
        return [];
    }

    const uniqueDrugs = Array.from(new Set(drugs.map(d => d.trim()))).filter(Boolean);

    if (uniqueDrugs.length < 2) {
        return [];
    }

    // Use raw query to check for case-insensitive matches using LIKE
    // For each pair of unique drugs, we need to check if they have an interaction
    // Since building dynamic OR LIKE chains in raw SQL is tricky with an array of variable length,
    // and Prisma doesn't support mode: 'insensitive' for SQLite, we can use Prisma's executeRaw
    // or manually build the WHERE clause.

    // We use exact case matches to utilize the SQLite @@index
    const placeholders = uniqueDrugs.map(() => `?`).join(', ');

    const interactions = await prisma.$queryRawUnsafe<any[]>(`
        SELECT * FROM DrugInteraction 
        WHERE drug1 IN (${placeholders}) 
        AND drug2 IN (${placeholders})
    `, ...uniqueDrugs, ...uniqueDrugs);

    return interactions.map(interaction => ({
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        description: interaction.description,
        severity: interaction.severity
    }));
};
