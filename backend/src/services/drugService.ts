import prisma from '../db/prismaClient';

export const searchDrugs = async (query: string, limit: number = 20): Promise<{ name: string }[]> => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    // Using a raw query because Prisma + SQLite `contains` is case-sensitive by default
    const startsWithQuery = `${query}%`;
    const containsQuery = `%${query}%`;

    type DrugResult = { name: string; rank: number };

    // Simpler UNION approach for SQLite ranking
    const results = await prisma.$queryRaw<DrugResult[]>`
        SELECT name, MIN(rank) as rank FROM (
            SELECT drug1 as name, 1 as rank FROM DrugInteraction WHERE drug1 LIKE ${startsWithQuery}
            UNION ALL
            SELECT drug2 as name, 1 as rank FROM DrugInteraction WHERE drug2 LIKE ${startsWithQuery}
            UNION ALL
            SELECT drug1 as name, 2 as rank FROM DrugInteraction WHERE drug1 LIKE ${containsQuery}
            UNION ALL
            SELECT drug2 as name, 2 as rank FROM DrugInteraction WHERE drug2 LIKE ${containsQuery}
        ) AS combined
        GROUP BY name
        ORDER BY rank ASC, name ASC
        LIMIT ${limit}
    `;

    return results.map(r => ({ name: r.name }));
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