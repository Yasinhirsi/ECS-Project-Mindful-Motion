"use client";
//Indicates this is a client-side component in Next.js.

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Imports necessary React hooks, UI components, and utility functions.

let Sentiment: any; //Defines a variable for the sentiment analysis

//Defines various constants used for sentiment and emotion analysis.

const NEGATION_WORDS = [ //Defines a list of negation words
  "not",
  "no",
  "never",
  "don't",
  "doesn't",
  "didn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "can't",
  "cannot",
  "couldn't",
  "shouldn't",
  "wouldn't",
  "won't",
];

const INTENSITY_MODIFIERS = { //Defines a list of intensity modifiers
  very: 1.5,
  really: 1.5,
  extremely: 2.0,
  absolutely: 2.0,
  completely: 1.8,
  totally: 1.8,
  highly: 1.7,
  especially: 1.7,
  particularly: 1.6,
  deeply: 1.8,
  terribly: 1.9,
  incredibly: 1.9,
  super: 1.8,
  truly: 1.7,
  quite: 1.3,
  rather: 1.2,
  so: 1.5,
  somewhat: 0.7,
  slightly: 0.5,
  "a bit": 0.6,
  "a little": 0.6,
  "kind of": 0.7,
  kinda: 0.7,
  "sort of": 0.7,
  barely: 0.4,
  hardly: 0.4,
  almost: 0.8,
  nearly: 0.8,
  partially: 0.7,
  fairly: 0.8,
  just: 0.9,
};

const EMOTIONAL_PHRASES = [ //Defines a list of emotional phrases
  { phrase: "over the moon", emotions: { joy: 2.0 } },
  { phrase: "on cloud nine", emotions: { joy: 2.0 } },
  { phrase: "down in the dumps", emotions: { sadness: 1.8 } },
  { phrase: "feeling blue", emotions: { sadness: 1.5 } },
  { phrase: "at the end of my rope", emotions: { anxiety: 1.7, anger: 1.2 } },
  { phrase: "losing my mind", emotions: { anxiety: 1.8, fear: 1.2 } },
  { phrase: "freaking out", emotions: { anxiety: 1.7, fear: 1.5 } },
  { phrase: "fed up", emotions: { anger: 1.6, disgust: 1.3 } },
  { phrase: "had it with", emotions: { anger: 1.5, disgust: 1.2 } },
  { phrase: "sick and tired", emotions: { anger: 1.4, disgust: 1.3 } },
  { phrase: "on edge", emotions: { anxiety: 1.6 } },
  { phrase: "stressed out", emotions: { anxiety: 1.7 } },
  { phrase: "heart is racing", emotions: { anxiety: 1.6, fear: 1.3 } },
  {
    phrase: "butterflies in my stomach",
    emotions: { anxiety: 1.2, fear: 0.8, joy: 0.7 },
  },
  { phrase: "hit the roof", emotions: { anger: 1.9 } },
  { phrase: "lost my temper", emotions: { anger: 1.8 } },
  { phrase: "blown away", emotions: { surprise: 1.8 } },
  { phrase: "blown my mind", emotions: { surprise: 1.9 } },
  { phrase: "beside myself", emotions: { surprise: 1.5, anxiety: 1.2 } },
  { phrase: "mixed feelings", emotions: { surprise: 0.9, anxiety: 0.8 } },
  { phrase: "on top of the world", emotions: { joy: 1.9 } },
  { phrase: "in heaven", emotions: { joy: 1.8 } },
  { phrase: "in a good mood", emotions: { joy: 1.4 } },
  { phrase: "in a bad mood", emotions: { anger: 1.2, sadness: 1.1 } },
  { phrase: "couldn't care less", emotions: { disgust: 1.3 } },
  { phrase: "give a damn", emotions: { anger: 1.1 } },
  { phrase: "breaking my heart", emotions: { sadness: 1.9 } },
  { phrase: "heartbroken", emotions: { sadness: 1.9 } },
  { phrase: "falling apart", emotions: { sadness: 1.6, anxiety: 1.3 } },
  { phrase: "cracking up", emotions: { anxiety: 1.4, sadness: 1.1 } },
  { phrase: "out of my mind", emotions: { anxiety: 1.5, fear: 1.2 } },
  { phrase: "scared to death", emotions: { fear: 2.0 } },
  { phrase: "nervous wreck", emotions: { anxiety: 1.9, fear: 1.5 } },
  { phrase: "shaking in my boots", emotions: { fear: 1.8 } },
  { phrase: "creeped out", emotions: { fear: 1.4, disgust: 1.1 } },
  { phrase: "grossed out", emotions: { disgust: 1.7 } },
  { phrase: "makes me sick", emotions: { disgust: 1.6 } },
  { phrase: "can't stand", emotions: { disgust: 1.5, anger: 1.2 } },
  { phrase: "can't believe", emotions: { surprise: 1.5 } },
  { phrase: "mind blown", emotions: { surprise: 1.8 } },
  { phrase: "taken aback", emotions: { surprise: 1.4 } },
  { phrase: "caught off guard", emotions: { surprise: 1.3 } },
  { phrase: "out of nowhere", emotions: { surprise: 1.2 } },
  { phrase: "lonely", emotions: { sadness: 1.4 } },
  { phrase: "all alone", emotions: { sadness: 1.5 } },
  { phrase: "isolated", emotions: { sadness: 1.3, fear: 0.7 } },
  { phrase: "abandoned", emotions: { sadness: 1.6, anger: 0.9 } },
  { phrase: "rejected", emotions: { sadness: 1.5, anger: 0.8 } },
];

//Defines keywords associated with different emotions.

const EXPANDED_EMOTION_KEYWORDS = { //Defines a list of expanded emotion keywords 
  joy: [
    "happy",
    "joy",
    "excited",
    "glad",
    "delighted",
    "pleased",
    "cheerful",
    "content",
    "thrilled",
    "wonderful",
    "love",
    "awesome",
    "great",
    "ecstatic",
    "elated",
    "jubilant",
    "overjoyed",
    "radiant",
    "upbeat",
    "blissful",
    "blessed",
    "bright",
    "charmed",
    "cheery",
    "enchanted",
    "enthusiastic",
    "euphoric",
    "fantastic",
    "fortunate",
    "gleeful",
    "gratified",
    "hopeful",
    "jovial",
    "lively",
    "lucky",
    "merry",
    "optimistic",
    "playful",
    "positive",
    "satisfied",
    "sunny",
    "thankful",
    "uplifted",
    "vibrant",
    "victorious",
    "yay",
    "hooray",
    "stoked",
  ],
  sadness: [
    "sad",
    "unhappy",
    "depressed",
    "down",
    "miserable",
    "gloomy",
    "hopeless",
    "grief",
    "sorrow",
    "disappointed",
    "hurt",
    "broken",
    "blue",
    "bummed",
    "crushed",
    "dejected",
    "despairing",
    "devastated",
    "discouraged",
    "disheartened",
    "dispirited",
    "distressed",
    "downcast",
    "grim",
    "heartache",
    "heartbroken",
    "heartsick",
    "melancholy",
    "mournful",
    "pessimistic",
    "regretful",
    "somber",
    "tearful",
    "troubled",
    "upset",
    "weary",
    "woeful",
    "defeated",
    "lonely",
    "isolated",
    "abandoned",
    "lost",
    "empty",
    "numb",
  ],
  anger: [
    "angry",
    "mad",
    "furious",
    "irritated",
    "annoyed",
    "frustrated",
    "outraged",
    "irate",
    "enraged",
    "hostile",
    "hate",
    "dislike",
    "agitated",
    "aggravated",
    "bitter",
    "boiling",
    "cross",
    "displeased",
    "exasperated",
    "fuming",
    "heated",
    "indignant",
    "inflamed",
    "insulted",
    "offended",
    "provoked",
    "resentful",
    "seething",
    "vexed",
    "pissed",
    "worked up",
    "livid",
    "heated",
    "bothered",
    "infuriated",
    "incensed",
    "raging",
  ],
  fear: [
    "afraid",
    "scared",
    "fearful",
    "anxious",
    "worried",
    "nervous",
    "terrified",
    "panic",
    "dread",
    "frightened",
    "apprehensive",
    "alarmed",
    "aghast",
    "cowed",
    "dreading",
    "fearsome",
    "frantic",
    "horrified",
    "intimidated",
    "nervous",
    "overwhelming",
    "panicky",
    "petrified",
    "phobic",
    "shaken",
    "spooked",
    "startled",
    "tense",
    "threatened",
    "timid",
    "trembling",
    "unnerved",
    "wary",
    "jumpy",
    "on edge",
    "freaked out",
    "uneasy",
    "distressed",
    "flustered",
  ],
  surprise: [
    "surprised",
    "shocked",
    "astonished",
    "amazed",
    "startled",
    "unexpected",
    "stunned",
    "wonder",
    "speechless",
    "bewildered",
    "dumbfounded",
    "flabbergasted",
    "floored",
    "incredulous",
    "taken aback",
    "astounded",
    "awestruck",
    "blindsided",
    "dazed",
    "jolted",
    "rattled",
    "staggered",
    "struck",
    "stupefied",
    "thunderstruck",
    "unbelievable",
    "unexpected",
    "wowed",
    "mind blown",
    "blown away",
  ],
  disgust: [
    "disgusted",
    "repulsed",
    "revolted",
    "nauseated",
    "gross",
    "sickened",
    "distaste",
    "aversion",
    "dislike",
    "hate",
    "appalled",
    "detestable",
    "disapproving",
    "disdain",
    "loathing",
    "offended",
    "outraged",
    "repelled",
    "repugnant",
    "revolting",
    "yucky",
    "creepy",
    "foul",
    "hideous",
    "horrid",
    "nasty",
    "offensive",
    "repelling",
    "vile",
    "vulgar",
    "wretched",
    "eww",
    "yuck",
    "ugh",
    "gross out",
  ],
  anxiety: [
    "anxiety",
    "nervous",
    "tense",
    "uneasy",
    "restless",
    "stressed",
    "worried",
    "apprehensive",
    "panic",
    "jittery",
    "agitated",
    "antsy",
    "concerned",
    "disturbed",
    "edgy",
    "fidgety",
    "fretful",
    "irritable",
    "keyed up",
    "on edge",
    "perturbed",
    "rattled",
    "ruffled",
    "shaky",
    "strained",
    "troubled",
    "uncomfortable",
    "uptight",
    "wound up",
    "worried sick",
    "pressured",
    "overwhelmed",
    "distressed",
    "frazzled",
    "anxious",
    "stressed out",
    "freaking out",
  ],
};

export default function DailyCheckinPage() { //Defines the main component for the daily checkin page
  // Sets up various state variables to manage the component's data and UI state.
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotions, setEmotions] = useState<Record<string, number> | null>(null);
  const [sentimentScore, setSentimentScore] = useState<number | null>(null);
  const [emotionSummary, setEmotionSummary] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const loadSentiment = async () => {
      try {
        Sentiment = (await import("sentiment")).default;
        console.log("Sentiment library loaded successfully");
      } catch (error) {
        console.error("Failed to load Sentiment library:", error);
      }
    };
    loadSentiment();
  }, []);

  const isNegated = (    // Checks if a word is negated by looking at surrounding words
    text: string,
    wordIndex: number,
    windowSize = 3
  ): boolean => {
    const words = text.split(/\s+/); //splits the text into words
    const start = Math.max(0, wordIndex - windowSize); //finds the start of the window
    const preceding = words.slice(start, wordIndex); //finds the preceding words

    return preceding.some((word) => //checks if any of the preceding words are negation words
      NEGATION_WORDS.includes(word.toLowerCase().replace(/[^\w]/g, "")) //checks if the word is a negation word
    );
  };

  const findModifier = ( // Finds intensity modifiers for emotions
    text: string,
    wordIndex: number,
    windowSize = 2
  ): number => {
    const words = text.split(/\s+/); //splits the text into words
    const start = Math.max(0, wordIndex - windowSize); //finds the start of the window
    const preceding = words.slice(start, wordIndex).join(" ").toLowerCase(); //finds the preceding words

    for (const [modifier, intensity] of Object.entries(INTENSITY_MODIFIERS)) { //iterates over the intensity modifiers
      if (modifier.includes(" ") && preceding.includes(modifier)) { //checks if the modifier is a space and if the preceding words include the modifier
        return intensity; //returns the intensity
      }
    }

    for (const [modifier, intensity] of Object.entries(INTENSITY_MODIFIERS)) { //iterates over the intensity modifiers
      if (
        !modifier.includes(" ") &&
        preceding.split(/\s+/).includes(modifier) //looks for word before emotion
      ) {
        return intensity; //returns the intensity 
      }
    }

    return 1.0; //returns 1.0 if no intensity modifier is found (default intensity)
  };

  const detectEmotionalPhrases = (text: string): Record<string, number> => {   // Detects emotional phrases in the text
    const emotionModifiers: Record<string, number> = { //initialises an empty object to store the emotion modifiers
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      anxiety: 0,
    };

    const lowerText = text.toLowerCase(); //converts the text to lowercase

    EMOTIONAL_PHRASES.forEach(({ phrase, emotions }) => { //iterates over the emotional phrases
      if (lowerText.includes(phrase)) { //checks if the phrase is in the text
        Object.entries(emotions).forEach(([emotion, intensity]) => { //iterates over the emotions and their intensities
          if (emotion in emotionModifiers) { //checks if the emotion is in the emotion modifiers
            emotionModifiers[emotion] += 20 * intensity; //adds the intensity to the emotion modifier
          }
        });
      }
    });

    return emotionModifiers; //returns the emotion modifiers  
  };

  const generateEmotionSummary = (    // Generates a summary of detected emotions
    emotions: Record<string, number>, //the emotions and their intensities
    sentimentScore: number //the sentiment score
  ): string => {
    const sortedEmotions = Object.entries(emotions) //sorts the emotions by intensity
      .sort((a, b) => b[1] - a[1]) //sorts the emotions by intensity
      .filter(([_, value]) => value > 20); //filters out emotions with intensity less than 20

    if (sortedEmotions.length === 0) { //if there are no emotions, return the sentiment score
      return sentimentScore > 0.5
        ? "You seem to be in a positive mood."
        : sentimentScore < -0.5
          ? "You seem to be in a negative mood."
          : "Your mood appears to be neutral.";
    }

    const topEmotion = sortedEmotions[0]; //the top emotion
    const secondEmotion = sortedEmotions.length > 1 ? sortedEmotions[1] : null; //the second emotion

    let intensityDesc = ""; //the intensity description
    if (topEmotion[1] > 75) intensityDesc = "very "; //if the top emotion is very intense, set the intensity description to "very"
    else if (topEmotion[1] > 50) intensityDesc = "quite "; //if the top emotion is quite intense, set the intensity description to "quite"
    else if (topEmotion[1] < 30) intensityDesc = "slightly "; //if the top emotion is slightly intense, set the intensity description to "slightly"

    let summary = `You seem to be feeling ${intensityDesc}${topEmotion[0]}`;  //the summary

    if (secondEmotion && secondEmotion[1] > 30) { //if there is a second emotion and it is intense
      summary += ` and ${secondEmotion[1] > 50 ? "quite " : "somewhat "}${secondEmotion[0]
        }`; //adds the second emotion to the summary
    }

    if (
      sentimentScore < -1.0 &&
      !summary.includes("sad") &&
      !summary.includes("anger")
    ) {
      summary += ". Your overall tone appears quite negative"; //if the sentiment score is negative and the summary does not include "sad" or "anger", adds ". Your overall tone appears quite negative" to the summary
    } else if (sentimentScore > 1.0 && !summary.includes("joy")) {
      summary += ". Your overall tone appears quite positive"; //if the sentiment score is positive and the summary does not include "joy", adds ". Your overall tone appears quite positive" to the summary
    }

    return summary + "."; //returns the summary
  };

  const detectEmotions = (  // Main function for emotion detection
    text: string //the text to analyze
  ): {
    emotions: Record<string, number>; //the emotions and their intensities
    sentimentScore: number; //the sentiment score
    summary: string; //the summary
  } => {
    const words = text.split(/\s+/); //splits the text into words
    const lowerText = text.toLowerCase(); //converts the text to lowercase

    let sentimentResult = { score: 0, comparative: 0 }; //initialises the sentiment result
    if (Sentiment) { //checks if the sentiment library is loaded
      const sentiment = new Sentiment(); //creates a new sentiment object
      sentimentResult = sentiment.analyze(text); //analyzes the text
    }

    const emotionScores: Record<string, number> = { //initialises the emotion scores
      joy: 10, //initialises the joy score
      sadness: 10, //initialises the sadness score
      anger: 10, //initialises the anger score
      fear: 10, //initialises the fear score
      surprise: 10, //initialises the surprise score
      disgust: 10, //initialises the disgust score
      anxiety: 10, //initialises the anxiety score
    };

    const phraseEmotions = detectEmotionalPhrases(text); //detects the emotional phrases in the text
    Object.entries(phraseEmotions).forEach(([emotion, value]) => { //iterates over the emotions and their intensities
      if (value > 0) { //if the intensity is greater than 0
        emotionScores[emotion] += value; //adds the intensity to the emotion score
      }
    });

    Object.entries(EXPANDED_EMOTION_KEYWORDS).forEach(([emotion, keywords]) => { //iterates over the emotions and their keywords
      keywords.forEach((keyword) => { //iterates over the keywords
        const regex = new RegExp(`\\b${keyword}\\b`, "gi"); //creates a new regular expression
        let match: RegExpExecArray | null; //initialises the match

        while ((match = regex.exec(lowerText)) !== null) { //while the match is not null
          const wordIndex = words.findIndex((word, index) => { //finds the index of the keyword
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, ""); //cleans the word
            return (
              cleanWord === keyword &&
              lowerText.indexOf(cleanWord, index) === match?.index
            );
          });

          if (wordIndex !== -1) { //if the word index is not -1
            const negated = isNegated(lowerText, wordIndex); //checks if the word is negated

            const modifier = findModifier(lowerText, wordIndex); //finds the modifier

            if (negated) { //if the word is negated
              if (emotion === "joy") { //if the emotion is joy
                emotionScores.sadness += 10 * modifier; //adds the modifier to the sadness score
              } else if (
                ["sadness", "anger", "fear", "disgust", "anxiety"].includes(
                  emotion
                )
              ) {
                emotionScores.joy += 5 * modifier; //adds the modifier to the joy score
              }
            } else {
              emotionScores[emotion] += 15 * modifier; //adds the modifier to the emotion score
            }
          }
        }
      });
    });

    const normalizedSentiment = sentimentResult.comparative; //normalises the sentiment

    if (normalizedSentiment > 0) { //if the sentiment is positive
      emotionScores.joy += Math.min(normalizedSentiment * 20, 50); //adds the normalized sentiment to the joy score
      emotionScores.sadness = Math.max(
        emotionScores.sadness - normalizedSentiment * 10,
        0
      ); //subtracts the normalized sentiment from the sadness score  
      emotionScores.anger = Math.max(
        emotionScores.anger - normalizedSentiment * 10,
        0
      ); //subtracts the normalized sentiment from the anger score
    } else if (normalizedSentiment < 0) {
      const negValue = Math.abs(normalizedSentiment);
      emotionScores.sadness += Math.min(negValue * 15, 40);
      emotionScores.anger += Math.min(negValue * 10, 30);
      emotionScores.joy = Math.max(emotionScores.joy - negValue * 15, 0);
    }

    const exclamationCount = (text.match(/!/g) || []).length; //counts the number of exclamation marks
    if (exclamationCount > 0) { //if there are exclamation marks
      const exclamationMultiplier = Math.min(exclamationCount, 5); //finds the multiplier
      if (normalizedSentiment > 0) { //if the sentiment is positive
        emotionScores.joy += exclamationMultiplier * 5; //adds the multiplier to the joy score
        emotionScores.surprise += exclamationMultiplier * 5; //adds the multiplier to the surprise score
      } else if (normalizedSentiment < 0) { //if the sentiment is negative
        emotionScores.anger += exclamationMultiplier * 7; //adds the multiplier to the anger score
        emotionScores.surprise += exclamationMultiplier * 3; //adds the multiplier to the surprise score
      } else { //if the sentiment is neutral
        emotionScores.surprise += exclamationMultiplier * 8; //adds the multiplier to the surprise score
      }
    }

    const questionCount = (text.match(/\?/g) || []).length; //counts the number of question marks
    if (questionCount > 0) { //if there are question marks
      emotionScores.surprise += Math.min(questionCount * 5, 20); //adds the multiplier to the surprise score
      emotionScores.anxiety += Math.min(questionCount * 4, 15); //adds the multiplier to the anxiety score
    }

    if ( //if the text contains "i am" or "i'm" or "im" or "i feel" or "feeling" and "sad" or "depressed" or "down" or "unhappy"
      /\b(i am|i'm|im|i feel|feeling)\s+(sad|depressed|down|unhappy)\b/i.test(
        text
      )
    ) {
      emotionScores.sadness += 30; //adds 30 to the sadness score
    }

    if ( //if the text contains "i am" or "i'm" or "im" or "i feel" or "feeling" and "happy" or "excited" or "joyful" or "great"
      /\b(i am|i'm|im|i feel|feeling)\s+(happy|excited|joyful|great)\b/i.test(
        text
      )
    ) {
      emotionScores.joy += 30; //adds 30 to the joy score
    }

    if (
      /\b(i am|i'm|im|i feel|feeling)\s+(angry|mad|upset|furious)\b/i.test(text)
    ) {
      emotionScores.anger += 30;
    }

    if (
      /\b(i am|i'm|im|i feel|feeling)\s+(scared|afraid|terrified|anxious)\b/i.test(
        text
      )
    ) {
      emotionScores.fear += 30;
      emotionScores.anxiety += 20;
    }

    const strongNegativeEmotions = [ //Defines a list of strong negative emotions
      "sadness",
      "anger",
      "fear",
      "anxiety",
      "disgust",
    ].filter((emotion) => emotionScores[emotion] > 40); //filters out emotions with intensity less than 40

    if (strongNegativeEmotions.length > 1) { //if there are more than one strong negative emotion
      strongNegativeEmotions.forEach((emotion) => { //iterates over the strong negative emotions
        emotionScores[emotion] += 10; //adds 10 to the emotion score
      });
    }

    Object.keys(emotionScores).forEach((emotion) => { //iterates over the emotions
      emotionScores[emotion] = Math.min(emotionScores[emotion], 100); //ensures the emotion score is not greater than 100
    });

    const summary = generateEmotionSummary(emotionScores, normalizedSentiment); //generates the emotion summary 

    return {
      emotions: emotionScores,
      sentimentScore: sentimentResult.comparative,
      summary,
    };
  };

  const analyzeText = async () => { //Analyzes the input text for emotions and sentiment
    if (!text.trim()) { //if the text is empty
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!Sentiment) { //if the sentiment library is not loaded  
      toast({
        title: "Warning",
        description:
          "Sentiment analysis library is still loading. Analysis may be less accurate.",
        variant: "default",
      });
    }

    setIsAnalyzing(true); //sets the isAnalyzing state to true

    try {
      const {
        emotions: detectedEmotions,
        sentimentScore: score,
        summary,
      } = detectEmotions(text); //detects the emotions and sentiment from the text

      const recommendations: string[] = []; //initialises an empty array to store the recommendations

      if (detectedEmotions.sadness > 70) { //if the sadness score is greater than 70
        recommendations.push(
          "Consider reaching out to a therapist to discuss your feelings." //adds a recommendation to reach out to a therapist
        );
        recommendations.push(
          "Try engaging in activities that bring you joy, like watching a favorite movie or listening to uplifting music." //adds a recommendation to engage in activities that bring you joy
        );
      }

      if (detectedEmotions.anxiety > 70) { //if the anxiety score is greater than 70
        recommendations.push(
          "Practice deep breathing exercises to help manage anxiety." //adds a recommendation to practice deep breathing exercises
        );
        recommendations.push(
          "Consider trying guided meditation to calm your mind." //adds a recommendation to try guided meditation
        );
      }

      if (detectedEmotions.anger > 70) { //if the anger score is greater than 70
        recommendations.push(
          "Physical activity can help release tension. Consider going for a run or doing some exercise." //adds a recommendation to engage in physical activity
        );
        recommendations.push(
          "Practice counting to 10 before reacting when you feel angry." //adds a recommendation to practice counting to 10 before reacting when you feel angry
        );
      }

      if (detectedEmotions.fear > 70) { //if the fear score is greater than 70
        recommendations.push("Talk to someone you trust about your fears."); //adds a recommendation to talk to someone you trust about your fears
        recommendations.push(
          "Try grounding techniques when feeling fearful: focus on 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste." //adds a recommendation to try grounding techniques when feeling fearful
        );
      }

      if (detectedEmotions.joy > 70) { //if the joy score is greater than 70
        recommendations.push(
          "Share your positive emotions with others to spread joy." //adds a recommendation to share your positive emotions with others to spread joy
        );
        recommendations.push(
          "Journal about what made you happy to refer back to on harder days." //adds a recommendation to journal about what made you happy to refer back to on harder days
        );
      }

      if (score < -1.5) { //if the sentiment score is less than -1.5
        recommendations.push(
          "Your message has a strongly negative tone. Consider practicing positive self-talk techniques." //adds a recommendation to consider practicing positive self-talk techniques
        );
      }

      if (recommendations.length === 0) { //if there are no recommendations
        recommendations.push(
          "Continue monitoring your emotions and practicing self-care." //adds a recommendation to continue monitoring your emotions and practicing self-care
        );
        recommendations.push(
          "Regular exercise and mindfulness can help maintain emotional balance." //adds a recommendation to regular exercise and mindfulness can help maintain emotional balance
        );
      }

      setEmotions(detectedEmotions); //sets the emotions state to the detected emotions 
      setSentimentScore(score); //sets the sentiment score state to the score
      setEmotionSummary(summary); //sets the emotion summary state to the summary
      setRecommendations(recommendations); //sets the recommendations state to the recommendations

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await supabase.from("daily_checkins").insert({
          user_id: session.user.id,
          text_content: text,
          emotion_scores: detectedEmotions,
          recommendations: recommendations,
        });

        toast({
          title: "Check-in saved",
          description: "Your daily check-in has been saved successfully.",
        });
      }

      setIsAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setIsAnalyzing(false);

      toast({
        title: "Error",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getEmotionEmoji = (emotion: string): string => {  // Returns appropriate emoji for each emotion
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Daily Check-in</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>
              Express your thoughts and feelings to receive personalised
              recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write about how you're feeling today..."
              className="min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={analyzeText}
              disabled={isAnalyzing || !text.trim()}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Emotion Analysis</CardTitle>
            <CardDescription>
              Analysis of your expressed emotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emotions ? (
              <div className="space-y-4">
                {emotionSummary && (
                  <div className="mb-4 p-3 bg-muted/50 border rounded-lg">
                    <p className="text-sm">{emotionSummary}</p>
                  </div>
                )}

                {sentimentScore !== null && (
                  <div className="mb-4 bg-muted p-3 rounded-lg">
                    <p className="text-sm mb-1 font-medium">
                      Overall Sentiment
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {sentimentScore > 0
                          ? "Positive"
                          : sentimentScore < 0
                            ? "Negative"
                            : "Neutral"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {sentimentScore.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={50 + sentimentScore * 10}
                      className={`mt-1 ${sentimentScore > 0
                        ? "bg-green-100"
                        : sentimentScore < 0
                          ? "bg-red-100"
                          : ""
                        }`}
                    />
                  </div>
                )}

                {Object.entries(emotions)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, value]) => (
                    <div key={emotion} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize flex items-center">
                          {getEmotionEmoji(emotion)}{" "}
                          <span className="ml-2">{emotion}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(value)}%
                        </span>
                      </div>
                      <Progress
                        value={value}
                        className={`${value > 50
                          ? emotion === "joy"
                            ? "bg-green-100"
                            : emotion === "sadness"
                              ? "bg-blue-100"
                              : emotion === "anger"
                                ? "bg-red-100"
                                : emotion === "fear" || emotion === "anxiety"
                                  ? "bg-purple-100"
                                  : emotion === "surprise"
                                    ? "bg-yellow-100"
                                    : emotion === "disgust"
                                      ? "bg-green-200"
                                      : ""
                          : ""
                          }`}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Submit your check-in to see emotion analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Based on your emotional state, here are some recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5 text-primary flex-shrink-0"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
