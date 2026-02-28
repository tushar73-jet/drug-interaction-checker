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

    // A simpler way with SQLite is to use COLLATE NOCASE if we could, but let's build the parameter list
    const lowerDrugs = uniqueDrugs.map(d => d.toLowerCase());

    // Prisma doesn't easily support case-insensitive IN for SQLite, so we'll fetch interactions
    // where LOWER(drug1) IN (...) AND LOWER(drug2) IN (...)

    // We cannot use IN with Prisma safely case-insensitively, so let's use queryRaw

    // First, let's just create a list of placeholders for the IN clause
    const placeholders = uniqueDrugs.map((_, i) => `?`).join(', ');

    // Unfortunately, prisma.$queryRaw variables can't be expanded directly as IN (?) in this way easily
    // Let's just fetch all where drug1 and drug2 match the list exactly, but doing it case-insensitively using LOWER

    const interactions = await prisma.$queryRawUnsafe<any[]>(`
        SELECT * FROM DrugInteraction 
        WHERE LOWER(drug1) IN (${placeholders}) 
        AND LOWER(drug2) IN (${placeholders})
    `, ...lowerDrugs, ...lowerDrugs);

    return interactions.map(interaction => ({
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        description: interaction.description,
        severity: interaction.severity
    }));
};
