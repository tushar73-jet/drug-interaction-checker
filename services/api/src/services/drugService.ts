import prisma from '../db/prismaClient';

let drugCache: string[] | null = null;

const loadDrugCache = async () => {
    if (drugCache !== null) return;
    const drugs = await prisma.drug.findMany({ select: { name: true } });
    drugCache = drugs.map(d => d.name).sort();
};

export const searchDrugs = async (query: string, limit: number = 20): Promise<{ name: string }[]> => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    await loadDrugCache();

    const normalizedQuery = query.toLowerCase().trim();
    const matches = drugCache!
        .filter(name => name.toLowerCase().includes(normalizedQuery))
        .sort((a, b) => {
            const aStart = a.toLowerCase().startsWith(normalizedQuery);
            const bStart = b.toLowerCase().startsWith(normalizedQuery);
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            return a.localeCompare(b);
        })
        .slice(0, limit);

    return matches.map(name => ({ name }));
};

export const getStats = async () => {
    const [totalDrugs, totalInteractions] = await Promise.all([
        prisma.drug.count(),
        prisma.drugInteraction.count()
    ]);

    return {
        totalDrugs,
        totalInteractions,
    };
};

export const getDrugDetails = async (name: string) => {
    const drug = await prisma.drug.findUnique({
        where: { name }
    });

    if (!drug) {
        return {
            class: 'Information not localized',
            action: 'Standard physiological mechanism',
            warnings: ['Standard clinical precautions']
        };
    }

    return {
        class: drug.class || 'Class not specified',
        action: drug.mechanism || 'Mechanism not specified',
        indications: ['Consult clinical guidelines'],
        warnings: ['Standard clinical precautions']
    };
};