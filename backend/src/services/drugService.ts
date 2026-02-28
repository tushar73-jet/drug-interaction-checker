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
        .filter(name => name && name.toLowerCase().includes(query.toLowerCase().trim()))
        .map(name => ({ name }));

    return uniqueMatches;
};