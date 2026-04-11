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
    };
};

export const getDrugDetails = async (name: string) => {
    const mockDetails: Record<string, any> = {
        'Aspirin': {
            class: 'NSAID / Antiplatelet',
            indications: ['Pain management', 'Fever reduction', 'Ischemic stroke prophylaxis'],
            action: 'Irreversibly inhibits COX-1 and COX-2',
            warnings: ['Gastric ulceration', 'Gastrointestinal bleeding', 'Reye syndrome in children']
        },
        'Warfarin': {
            class: 'Anticoagulant (Vitamin K Antagonist)',
            indications: ['DVT prophylaxis', 'PE management', 'Atrial fibrillation'],
            action: 'Inhibits Vitamin K epoxide reductase',
            warnings: ['Life-threatening hemorrhage', 'Teratogenicity', 'Frequent INR monitoring required']
        },
        'Lisinopril': {
            class: 'ACE Inhibitor',
            indications: ['Hypertension', 'Heart failure', 'Post-MI management'],
            action: 'Prevents conversion of Angio I to Angio II',
            warnings: ['Hyperkalemia', 'Angioedema', 'Renal function monitoring']
        },
        'Metformin': {
            class: 'Biguanide (Antidiabetic)',
            indications: ['Type 2 Diabetes Mellitus', 'PCOS'],
            action: 'Decreases hepatic glucose production & improves insulin sensitivity',
            warnings: ['Lactic acidosis risk (rare)', 'Vitamin B12 deficiency', 'Renal contraindications']
        }
    };

    return mockDetails[name] || {
        class: 'Information not localized',
        indications: ['Standard therapeutic use'],
        action: 'Standard physiological mechanism',
        warnings: ['Standard clinical precautions']
    };
};