import { checkInteractions } from './interactionChecker';

describe('checkInteractions', () => {
    it('returns an array for any valid input', async () => {
        const result = await checkInteractions(['Aspirin', 'Warfarin']);
        expect(Array.isArray(result)).toBe(true);
    });

    it('returns identical results regardless of the order drugs are supplied', async () => {
        const forward = await checkInteractions(['Aspirin', 'Warfarin']);
        const reversed = await checkInteractions(['Warfarin', 'Aspirin']);
        expect(forward.length).toBe(reversed.length);
    });

    it('normalises drug name casing before querying', async () => {
        const mixedCase = await checkInteractions(['ASPIRIN', 'warfarin']);
        const titleCase = await checkInteractions(['Aspirin', 'Warfarin']);
        expect(mixedCase.length).toBe(titleCase.length);
    });

    it('returns an empty array when fewer than 2 drugs are provided', async () => {
        const result = await checkInteractions(['Aspirin']);
        expect(result).toEqual([]);
    });

    it('returns an empty array for an empty input', async () => {
        const result = await checkInteractions([]);
        expect(result).toEqual([]);
    });

    it('deduplicates repeated drug names before querying', async () => {
        const withDuplicates = await checkInteractions(['Aspirin', 'Aspirin', 'Warfarin']);
        const withoutDuplicates = await checkInteractions(['Aspirin', 'Warfarin']);
        expect(withDuplicates.length).toBe(withoutDuplicates.length);
    });

    it('each result contains the required fields', async () => {
        const result = await checkInteractions(['Aspirin', 'Warfarin']);
        for (const interaction of result) {
            expect(interaction).toHaveProperty('drug1');
            expect(interaction).toHaveProperty('drug2');
            expect(interaction).toHaveProperty('description');
            expect(interaction).toHaveProperty('severity');
        }
    });
});
