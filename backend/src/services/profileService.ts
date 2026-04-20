import prisma from '../db/prismaClient';

export const getProfiles = async (clerkId: string) => {
    const profiles = await prisma.patientProfile.findMany({
        where: { clerkId },
        include: { drugs: true },
        orderBy: { updatedAt: 'desc' }
    });
    // Map to return simple flat array of drug names for the frontend
    return profiles.map(p => ({
        ...p,
        drugs: p.drugs.map(d => d.drugName)
    }));
};

export const upsertProfile = async (clerkId: string, name: string, drugNames: string[], notes?: string) => {
    return await prisma.$transaction(async (tx) => {
        // Find existing or create new profile
        let profile = await tx.patientProfile.findFirst({
            where: { clerkId, name: { equals: name } }
        });

        if (profile) {
            // Update base profile
            profile = await tx.patientProfile.update({
                where: { id: profile.id },
                data: { notes, updatedAt: new Date() }
            });
            // Clear existing drugs specifically for this profile
            await tx.profileDrug.deleteMany({ where: { profileId: profile.id } });
        } else {
            // Create brand new profile
            profile = await tx.patientProfile.create({
                data: { clerkId, name, notes }
            });
        }

        // Add fresh drugs
        await tx.profileDrug.createMany({
            data: drugNames.map(drugName => ({
                profileId: profile!.id,
                drugName
            }))
        });

        // Return the full updated object
        return { ...profile, drugs: drugNames };
    });
};

export const deleteProfile = async (id: string, clerkId: string) => {
    // Delete patient profile (cascades to profileDrug)
    return await prisma.patientProfile.deleteMany({
        where: { id, clerkId }
    });
};
