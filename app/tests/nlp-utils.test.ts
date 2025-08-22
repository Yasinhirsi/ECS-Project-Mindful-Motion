// nlp-utils.test.ts

// Mock implementation of isNegated
const NEGATION_WORDS = ["not", "no", "never", "don't", "doesn't", "didn't"];

const isNegated = (text: string, index: number, windowSize = 3): boolean => {
    const words = text.split(/\s+/);
    const start = Math.max(0, index - windowSize);
    const preceding = words.slice(start, index);
    return preceding.some((word) =>
        NEGATION_WORDS.includes(word.toLowerCase().replace(/[^\w]/g, ""))
    );
};

// Mock implementation of findModifier
const INTENSITY_MODIFIERS: Record<string, number> = {
    very: 1.5,
    really: 1.5,
    slightly: 0.5,
};

const findModifier = (text: string, index: number, windowSize = 2): number => {
    const words = text.split(/\s+/);
    const start = Math.max(0, index - windowSize);
    const preceding = words.slice(start, index).join(" ").toLowerCase();

    for (const [mod, val] of Object.entries(INTENSITY_MODIFIERS)) {
        if (preceding.includes(mod)) return val;
    }
    return 1;
};

// Tests

describe("Negation Detection", () => {
    test("detects negation in nearby context", () => {
        const text = "I am not happy today";
        const index = 3; // "happy"
        expect(isNegated(text, index)).toBe(true);
    });

    test("returns false when negation is absent", () => {
        const text = "I am very happy today";
        const index = 3;
        expect(isNegated(text, index)).toBe(false);
    });
});

describe("Intensity Modifier Detection", () => {
    test("detects and returns correct modifier", () => {
        const text = "I feel really sad";
        const index = 3; // "sad"
        expect(findModifier(text, index)).toBeCloseTo(1.5);
    });

    test("returns default modifier when not found", () => {
        const text = "I feel sad";
        const index = 2; // "sad"
        expect(findModifier(text, index)).toBe(1);
    });
});