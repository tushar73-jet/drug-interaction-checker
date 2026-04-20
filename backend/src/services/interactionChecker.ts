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
    if (!drugs || drugs.length < 2) return [];

    const uniqueNames = Array.from(new Set(drugs.map(normalizeDrugName))).filter(Boolean);
    if (uniqueNames.length < 2) return [];

    // Query interactions across the normalized many-to-many relationship.
    // We look for any interaction where both drug names are in our input list.
    const interactions = await prisma.drugInteraction.findMany({
        where: {
            AND: [
                { drug1: { name: { in: uniqueNames } } },
                { drug2: { name: { in: uniqueNames } } }
            ]
        },
        include: {
            drug1: true,
            drug2: true
        }
    });

    return interactions.map(interaction => ({
        drug1: interaction.drug1.name,
        drug2: interaction.drug2.name,
        description: interaction.description,
        severity: interaction.severity,
    }));
};
