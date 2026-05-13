import { checkInteractions } from './interactionChecker';
import prisma from '../db/prismaClient';

jest.mock('../db/prismaClient', () => ({
    __esModule: true,
    default: {
        drugInteraction: {
            findMany: jest.fn(),
        },
    },
}));

describe('checkInteractions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('returns an array for any valid input', async () => {
        (prisma.drugInteraction.findMany as jest.Mock).mockResolvedValue([]);
        const result = await checkInteractions(['Aspirin', 'Warfarin']);
        expect(Array.isArray(result)).toBe(true);
    });

    it('returns identical results regardless of the order drugs are supplied', async () => {
        const mockData = [{
            drug1: { name: 'Aspirin' },
            drug2: { name: 'Warfarin' },
            description: 'Bleeding risk',
            severity: 'Major'
        }];
        (prisma.drugInteraction.findMany as jest.Mock).mockResolvedValue(mockData);
        
        const forward = await checkInteractions(['Aspirin', 'Warfarin']);
        const reversed = await checkInteractions(['Warfarin', 'Aspirin']);
        expect(forward.length).toBe(reversed.length);
    });

    it('normalises drug name casing before querying', async () => {
        (prisma.drugInteraction.findMany as jest.Mock).mockResolvedValue([]);
        await checkInteractions(['ASPIRIN', 'warfarin']);
        
        expect(prisma.drugInteraction.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    AND: expect.arrayContaining([
                        { drug1: { name: { in: ['Aspirin', 'Warfarin'] } } }
                    ])
                })
            })
        );
    });

    it('returns an empty array when fewer than 2 drugs are provided', async () => {
        const result = await checkInteractions(['Aspirin']);
        expect(result).toEqual([]);
        expect(prisma.drugInteraction.findMany).not.toHaveBeenCalled();
    });

    it('returns an empty array for an empty input', async () => {
        const result = await checkInteractions([]);
        expect(result).toEqual([]);
    });

    it('deduplicates repeated drug names before querying', async () => {
        (prisma.drugInteraction.findMany as jest.Mock).mockResolvedValue([]);
        await checkInteractions(['Aspirin', 'Aspirin', 'Warfarin']);
        
        expect(prisma.drugInteraction.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    AND: expect.arrayContaining([
                        { drug1: { name: { in: ['Aspirin', 'Warfarin'] } } }
                    ])
                })
            })
        );
    });

    it('each result contains the required fields', async () => {
        const mockData = [{
            drug1: { name: 'Aspirin' },
            drug2: { name: 'Warfarin' },
            description: 'Bleeding risk',
            severity: 'Major'
        }];
        (prisma.drugInteraction.findMany as jest.Mock).mockResolvedValue(mockData);

        const result = await checkInteractions(['Aspirin', 'Warfarin']);
        expect(result.length).toBe(1);
        expect(result[0]).toEqual({
            drug1: 'Aspirin',
            drug2: 'Warfarin',
            description: 'Bleeding risk',
            severity: 'Major'
        });
    });
});

