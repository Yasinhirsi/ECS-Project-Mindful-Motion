// phrase-utils.test.ts

describe("detectEmotionalPhrases()", () => {
    const EMOTIONAL_PHRASES = [
        { phrase: "over the moon", emotions: { joy: 2.0 } },
        { phrase: "down in the dumps", emotions: { sadness: 1.8 } },
        { phrase: "at the end of my rope", emotions: { anxiety: 1.7, anger: 1.2 } },
    ];

    const detectEmotionalPhrases = (text: string): Record<string, number> => {
        const emotionScores: Record<string, number> = {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
            disgust: 0,
            anxiety: 0,
        };

        const lowerText = text.toLowerCase();

        EMOTIONAL_PHRASES.forEach(({ phrase, emotions }) => {
            if (lowerText.includes(phrase)) {
                for (const [emotion, value] of Object.entries(emotions)) {
                    emotionScores[emotion] += 20 * value;
                }
            }
        });

        return emotionScores;
    };

    test("detects joy from a known phrase", () => {
        const result = detectEmotionalPhrases("I feel over the moon today!");
        expect(result.joy).toBeGreaterThan(0);
    });

    test("detects sadness from a known phrase", () => {
        const result = detectEmotionalPhrases("I'm feeling down in the dumps lately.");
        expect(result.sadness).toBeGreaterThan(0);
    });

    test("detects multiple emotions from one phrase", () => {
        const result = detectEmotionalPhrases("I'm at the end of my rope.");
        expect(result.anxiety).toBeGreaterThan(0);
        expect(result.anger).toBeGreaterThan(0);
    });

    test("returns all zero scores for unrelated text", () => {
        const result = detectEmotionalPhrases("I went shopping and cooked dinner.");
        for (const value of Object.values(result)) {
            expect(value).toBe(0);
        }
    });
});
