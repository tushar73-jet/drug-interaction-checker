import prisma from '../db/prismaClient';

export const searchDrugs = async (query: string, limit: number = 20): Promise<{ name: string }[]> => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    // Using a raw query because Prisma + SQLite `contains` is case-sensitive by default
    const startsWithQuery = `${query}%`;
    const containsQuery = `%${query}%`;

    type DrugResult = { name: string; starts_with: number };

    // Use a UNION with a helper column to rank "starts with" higher
    const results = await prisma.$queryRaw<DrugResult[]>`
        SELECT name, MAX(starts_with) as starts_with FROM (
            SELECT drug1 as name, (CASE WHEN drug1 LIKE ${startsWithQuery} THEN 1 ELSE 0 END) as starts_with FROM DrugInteraction WHERE drug1 LIKE ${containsQuery}
            UNION ALL
            SELECT drug2 as name, (CASE WHEN drug2 LIKE ${startsWithQuery} THEN 1 ELSE 0 END) as starts_with FROM DrugInteraction WHERE drug2 LIKE ${containsQuery}
        ) GROUP BY name
        ORDER BY starts_with DESC, name ASC
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