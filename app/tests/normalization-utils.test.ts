describe("Emotion Score Normalization", () => {
    const normalizeScores = (scores: Record<string, number>): Record<string, number> => {
        const capped: Record<string, number> = {};
        for (const [emotion, score] of Object.entries(scores)) {
            capped[emotion] = Math.min(score, 100);
        }
        return capped;
    };

    test("caps emotions over 100", () => {
        const rawScores = {
            joy: 120,
            sadness: 85,
            anger: 102,
            fear: 97,
        };
        const result = normalizeScores(rawScores);
        expect(result.joy).toBe(100);
        expect(result.anger).toBe(100);
        expect(result.sadness).toBe(85);
        expect(result.fear).toBe(97);
    });

    test("leaves scores under 100 untouched", () => {
        const rawScores = {
            joy: 30,
            sadness: 60,
        };
        const result = normalizeScores(rawScores);
        expect(result.joy).toBe(30);
        expect(result.sadness).toBe(60);
    });

    test("handles empty score object gracefully", () => {
        const result = normalizeScores({});
        expect(result).toEqual({});
    });
});
