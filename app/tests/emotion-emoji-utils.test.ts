describe('getEmotionEmoji()', () => {
    const getEmotionEmoji = (emotion: string): string => {
        switch (emotion.toLowerCase()) {
            case "joy":
                return "😊";
            case "sadness":
                return "😢";
            case "anger":
                return "😠";
            case "fear":
                return "😨";
            case "surprise":
                return "😲";
            case "disgust":
                return "🤢";
            case "anxiety":
                return "😰";
            default:
                return "";
        }
    };

    test('returns correct emoji for joy', () => {
        expect(getEmotionEmoji("joy")).toBe("😊");
    });

    test('returns correct emoji for sadness', () => {
        expect(getEmotionEmoji("sadness")).toBe("😢");
    });

    test('returns correct emoji for fear (case insensitive)', () => {
        expect(getEmotionEmoji("FEAR")).toBe("😨");
    });

    test('returns empty string for unknown emotion', () => {
        expect(getEmotionEmoji("confusion")).toBe("");
    });

    test('returns correct emoji for anxiety', () => {
        expect(getEmotionEmoji("anxiety")).toBe("😰");
    });
});
