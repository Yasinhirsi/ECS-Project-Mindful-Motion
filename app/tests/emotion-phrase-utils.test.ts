describe('detectEmotionalPhrases()', () => {
    const EMOTIONAL_PHRASES = [
        { phrase: "over the moon", emotions: { joy: 2.0 } },
        { phrase: "down in the dumps", emotions: { sadness: 1.8 } },
        { phrase: "freaking out", emotions: { anxiety: 1.7, fear: 1.5 } },
    ];

    const detectEmotionalPhrases = (text: string): Record<string, number> => {
        const emotionModifiers: Record<string, number> = {
            joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0, anxiety: 0,
        };

        const lowerText = text.toLowerCase();

        EMOTIONAL_PHRASES.forEach(({ phrase, emotions }) => {
            if (lowerText.includes(phrase)) {
                Object.entries(emotions).forEach(([emotion, intensity]) => {
                    if (emotion in emotionModifiers) {
                        emotionModifiers[emotion] += 20 * intensity;
                    }
                });
            }
        });

        return emotionModifiers;
    };

    test('detects joy from idiomatic phrase', () => {
        const result = detectEmotionalPhrases("I'm feeling over the moon today!");
        expect(result.joy).toBeGreaterThan(0);
    });

    test('detects sadness from idiomatic phrase', () => {
        const result = detectEmotionalPhrases("I've been down in the dumps all week.");
        expect(result.sadness).toBeGreaterThan(0);
    });

    test('detects multiple emotions from a mixed phrase', () => {
        const result = detectEmotionalPhrases("I'm freaking out about everything.");
        expect(result.anxiety).toBeGreaterThan(0);
        expect(result.fear).toBeGreaterThan(0);
    });

    test('returns zeroes when no emotional phrase is found', () => {
        const result = detectEmotionalPhrases("I went to the store.");
        Object.values(result).forEach((val) => {
            expect(val).toBe(0);
        });
    });
});
