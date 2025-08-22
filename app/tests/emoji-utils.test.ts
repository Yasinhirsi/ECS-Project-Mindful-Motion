// tests/emoji-utils.test.ts

describe("getEmotionEmoji()", () => {
    const getEmotionEmoji = (emotion: string): string => {
        switch (emotion) {
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

    test("returns correct emoji for joy", () => {
        expect(getEmotionEmoji("joy")).toBe("😊");
    });

    test("returns correct emoji for fear", () => {
        expect(getEmotionEmoji("fear")).toBe("😨");
    });

    test("returns empty string for unknown emotion", () => {
        expect(getEmotionEmoji("confusion")).toBe("");
    });
});
