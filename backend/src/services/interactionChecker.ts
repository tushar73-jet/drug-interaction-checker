import prisma from '../db/prismaClient';

export interface InteractionResult {
    drug1: string;
    drug2: string;
    description: string;
    severity: string;
}

/**
 * Normalises a drug name to title-case to match the casing used in the seed data
 * (SQLite does not support case-insensitive string matching via Prisma).
 */
const normalizeDrugName = (name: string): string =>
    name.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export const checkInteractions = async (drugs: string[]): Promise<InteractionResult[]> => {
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
        return [];
    }

    const uniqueDrugs = Array.from(new Set(drugs.map(normalizeDrugName))).filter(Boolean);

    if (uniqueDrugs.length < 2) {
        return [];
    }

    // Build an explicit OR clause for every unique pair in BOTH directions.
    // This fixes the bidirectionality bug: an interaction stored as
    // { drug1: 'Warfarin', drug2: 'Aspirin' } is now found even when the
    // caller supplies ['Aspirin', 'Warfarin'].
    const orConditions: { drug1: string; drug2: string }[] = [];
    for (let i = 0; i < uniqueDrugs.length; i++) {
        for (let j = i + 1; j < uniqueDrugs.length; j++) {
            const a = uniqueDrugs[i];
            const b = uniqueDrugs[j];
            orConditions.push({ drug1: a, drug2: b }); // forward direction
            orConditions.push({ drug1: b, drug2: a }); // reverse direction
        }
    }

    // Use Prisma ORM (consistent with the rest of the codebase) instead of
    // raw SQL, which avoids query injection risks and enforces schema typing.
    const interactions = await prisma.drugInteraction.findMany({
        where: { OR: orConditions },
    });

    return interactions.map(interaction => ({
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        description: interaction.description,
        severity: interaction.severity,
    }));
};
