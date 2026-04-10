import prisma from '../db/prismaClient';

export const getProfiles = async (clerkId: string) => {
    return await prisma.patientProfile.findMany({
        where: { clerkId },
        orderBy: { updatedAt: 'desc' }
    });
};

export const upsertProfile = async (clerkId: string, name: string, drugs: string[], notes?: string) => {
    // Check if profile exists for this user and patient name
    const existing = await prisma.patientProfile.findFirst({
        where: { clerkId, name: { equals: name } }
    });

    if (existing) {
        return await prisma.patientProfile.update({
            where: { id: existing.id },
            data: { 
                drugs: JSON.stringify(drugs),
                notes: notes,
                updatedAt: new Date()
            }
        });
    }

    return await prisma.patientProfile.create({
        data: {
            clerkId,
            name,
            drugs: JSON.stringify(drugs),
            notes: notes
        }
    });
};

export const deleteProfile = async (id: string, clerkId: string) => {
    return await prisma.patientProfile.deleteMany({
        where: { id, clerkId }
    });
};
