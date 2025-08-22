describe("Emotion Summary Generation", () => {
    const generateEmotionSummary = (emotions: Record<string, number>, sentimentScore: number): string => {
        const sorted = Object.entries(emotions)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, value]) => value > 20);

        if (sorted.length === 0) {
            if (sentimentScore > 0.5) return "You seem to be in a positive mood.";
            if (sentimentScore < -0.5) return "You seem to be in a negative mood.";
            return "Your mood appears to be neutral.";
        }

        const [top, second] = sorted;
        let summary = `You seem to be feeling ${top[0]}`;
        if (second && second[1] > 30) {
            summary += ` and ${second[0]}`;
        }

        if (sentimentScore > 1.0) summary += ". Your overall tone appears quite positive.";
        if (sentimentScore < -1.0) summary += ". Your overall tone appears quite negative.";

        return summary;
    };

    test("generates positive emotion summary", () => {
        const emotions = { joy: 85, sadness: 10 };
        const score = 1.2;
        const summary = generateEmotionSummary(emotions, score);
        expect(summary).toContain("joy");
        expect(summary).toContain("quite positive");
    });

    test("generates blended emotion summary", () => {
        const emotions = { joy: 60, anxiety: 45 };
        const score = 0.3;
        const summary = generateEmotionSummary(emotions, score);
        expect(summary).toContain("joy");
        expect(summary).toContain("anxiety");
    });

    test("fallbacks to sentiment-only when no strong emotions", () => {
        const emotions = { joy: 10, sadness: 15 };
        const score = -0.8;
        const summary = generateEmotionSummary(emotions, score);
        expect(summary).toBe("You seem to be in a negative mood.");
    });
});
