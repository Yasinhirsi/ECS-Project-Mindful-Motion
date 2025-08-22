describe("detectEmotionalPhrases()", () => {
    const EMOTIONAL_PHRASES = [
        { phrase: "over the moon", emotions: { joy: 2.0 } },
        { phrase: "down in the dumps", emotions: { sadness: 1.8 } },
        { phrase: "on edge", emotions: { anxiety: 1.6 } },
        { phrase: "fed up", emotions: { anger: 1.6, disgust: 1.3 } },
    ];

    const detectEmotionalPhrases = (text: string): Record<string, number> => {
        const emotionModifiers: Record<string, number> = {
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
                Object.entries(emotions).forEach(([emotion, intensity]) => {
                    if (emotion in emotionModifiers) {
                        emotionModifiers[emotion] += 20 * intensity;
                    }
                });
            }
        });

        return emotionModifiers;
    };

    test("detects a joyful phrase", () => {
        const result = detectEmotionalPhrases("I'm feeling over the moon today!");
        expect(result.joy).toBeGreaterThan(0);
    });

    test("detects a sad phrase", () => {
        const result = detectEmotionalPhrases("Lately I’ve been down in the dumps.");
        expect(result.sadness).toBeGreaterThan(0);
    });

    test("detects anxiety-related idiom", () => {
        const result = detectEmotionalPhrases("I feel on edge during meetings.");
        expect(result.anxiety).toBeGreaterThan(0);
    });

    test("detects phrase with multiple emotion mappings", () => {
        const result = detectEmotionalPhrases("I'm completely fed up with work.");
        expect(result.anger).toBeGreaterThan(0);
        expect(result.disgust).toBeGreaterThan(0);
    });

    test("returns all-zero scores when no phrases are matched", () => {
        const result = detectEmotionalPhrases("This is a calm and peaceful day.");
        const sum = Object.values(result).reduce((a, b) => a + b, 0);
        expect(sum).toBe(0);
    });
});
