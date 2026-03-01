import prisma from '../db/prismaClient';

export const searchDrugs = async (query: string, limit: number = 20): Promise<{ name: string }[]> => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    // Using a raw query because Prisma + SQLite `contains` is case-sensitive by default
    const rawQuery = `%${query}%`;

    // Query both columns where the drug might exist using case-insensitive LIKE
    type DrugResult = { drug1?: string; drug2?: string };

    const results = await prisma.$queryRaw<DrugResult[]>`
        SELECT drug1 as name FROM DrugInteraction WHERE drug1 LIKE ${rawQuery}
        UNION
        SELECT drug2 as name FROM DrugInteraction WHERE drug2 LIKE ${rawQuery}
        LIMIT ${limit}
    `;

    // Map result objects back to strings and filter
    const allNames = results.map((r: any) => r.name);

    // Filter to only include names that actually match the query (case insensitive)
    const uniqueMatches = Array.from(new Set(allNames))
        .filter((name: any) => name && typeof name === 'string' && name.toLowerCase().includes(query.toLowerCase().trim()))
        .map((name: any) => ({ name: String(name) }));

    return uniqueMatches;
};

export const getStats = async () => {
    const totalInteractions = await prisma.drugInteraction.count();

    // Count unique drugs across both columns
    const results = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT name) as count FROM (
            SELECT drug1 AS name FROM DrugInteraction
            UNION
            SELECT drug2 AS name FROM DrugInteraction
        )
    `;

    const totalDrugs = Number(results[0].count);

    return {
        totalDrugs,
        totalInteractions,
        activeClinicians: 1204 + Math.floor(Math.random() * 50), // Mock active clinicians for now
    };
};