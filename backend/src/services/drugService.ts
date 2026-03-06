import prisma from '../db/prismaClient';

let drugCache: string[] | null = null;

const loadDrugCache = async () => {
    if (drugCache !== null) return;
    const results = await prisma.$queryRaw<{ name: string }[]>`
        SELECT DISTINCT name FROM (
            SELECT drug1 AS name FROM DrugInteraction
            UNION
            SELECT drug2 AS name FROM DrugInteraction
        )
    `;
    drugCache = results.map(r => r.name).sort();
};

export const searchDrugs = async (query: string, limit: number = 20): Promise<{ name: string }[]> => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    await loadDrugCache();

    const normalizedQuery = query.toLowerCase().trim();

    const startsWith: string[] = [];
    const contains: string[] = [];

    for (const drug of drugCache!) {
        const lowerDrug = drug.toLowerCase();
        if (lowerDrug.startsWith(normalizedQuery)) {
            startsWith.push(drug);
        } else if (lowerDrug.includes(normalizedQuery)) {
            contains.push(drug);
        }
    }

    // Combine exact startsWith hits first, then include partial matches
    const combined = [...startsWith, ...contains].slice(0, limit);

    return combined.map(name => ({ name }));
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