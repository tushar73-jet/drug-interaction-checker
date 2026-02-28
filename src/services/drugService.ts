import prisma from '../db/prismaClient';

export const searchDrugs = async (query: string, limit: number = 20): Promise<string[]> => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    // Query both columns where the drug might exist
    const [drug1Results, drug2Results] = await Promise.all([
        prisma.drugInteraction.findMany({
        where: {
            drug1: {
                contains: query.toLowerCase().trim()
            }
            },
        select: { drug1: true },
            take: limit
        }),
        prisma.drugInteraction.findMany({
            where: {
                drug2: {
                contains: query.toLowerCase().trim()
        }
            },
        select: { drug2: true },
            take: limit
        })
    ]);

    // Extract names, combine, and remove duplicates
    const allNames = [
        ...drug1Results.map(r => r.drug1),
        ...drug2Results.map(r => r.drug2)
    ];

    // Filter to only include names that actually match the query
    const uniqueMatches = Array.from(new Set(allNames))
        .filter(name => name.includes(query.toLowerCase().trim()))
        .slice(0, limit);

    return uniqueMatches;
};