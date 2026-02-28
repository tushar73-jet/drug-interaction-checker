import prisma from '../db/prismaClient';

export interface InteractionResult {
    drug1: string;
    drug2: string;
    description: string;
}

export const checkInteractions = async (drugs: string[]): Promise<InteractionResult[]> => {
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
        return [];
    }

    const uniqueDrugs = Array.from(new Set(drugs.map(d => d.trim()))).filter(Boolean);

    if (uniqueDrugs.length < 2) {
        return [];
    }

    const interactions = await prisma.drugInteraction.findMany({
        where: {
            drug1: { in: uniqueDrugs },
            drug2: { in: uniqueDrugs }
        }
    });

    return interactions.map(interaction => ({
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        description: interaction.description
    }));
};
