import prisma from '../db/prismaClient';

export interface GraphNode {
    id: string;
    label: string;
}

export interface GraphEdge {
    source: string;
    target: string;
    description: string;
}

export interface InteractionGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export const buildGraph = async (drugs: string[]): Promise<InteractionGraph> => {
    if (!drugs || drugs.length === 0) {
        return { nodes: [], edges: [] };
    }

    const uniqueDrugs = Array.from(new Set(drugs.map(d => d.trim()))).filter(Boolean);

    const nodes: GraphNode[] = uniqueDrugs.map(drug => ({
        id: drug,
        label: drug
    }));

    if (uniqueDrugs.length < 2) {
        return {
            nodes,
            edges: []
        };
    }

    const interactions = await prisma.drugInteraction.findMany({
        where: {
            drug1: { in: uniqueDrugs },
            drug2: { in: uniqueDrugs }
        }
    });

    const edges: GraphEdge[] = interactions.map(interaction => ({
        source: interaction.drug1,
        target: interaction.drug2,
        description: interaction.description
    }));

    return {
        nodes,
        edges
    };
};
