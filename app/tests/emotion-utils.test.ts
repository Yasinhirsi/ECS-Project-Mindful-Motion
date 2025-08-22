describe('Emotional Phrase Detection', () => {
    const detectEmotionalPhrases = (text: string) => {
        const EMOTIONAL_PHRASES = [
            { phrase: "over the moon", emotions: { joy: 2.0 } },
            { phrase: "down in the dumps", emotions: { sadness: 1.8 } },
        ];
        const emotionModifiers: Record<string, number> = {
            joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0, anxiety: 0
        };
        const lowerText = text.toLowerCase();
        EMOTIONAL_PHRASES.forEach(({ phrase, emotions }) => {
            if (lowerText.includes(phrase)) {
                Object.entries(emotions).forEach(([emotion, intensity]) => {
                    emotionModifiers[emotion] += 20 * intensity;
                });
            }
        });
        return emotionModifiers;
    };

    test('detects joyful idiom', () => {
        const result = detectEmotionalPhrases("I’m over the moon!");
        expect(result.joy).toBeGreaterThan(0);
    });

    test('detects sad idiom', () => {
        const result = detectEmotionalPhrases("He's feeling down in the dumps today.");
        expect(result.sadness).toBeGreaterThan(0);
    });

    test('returns zero for unrelated text', () => {
        const result = detectEmotionalPhrases("It’s sunny outside");
        expect(Object.values(result).every(score => score === 0)).toBe(true);
    });
});
