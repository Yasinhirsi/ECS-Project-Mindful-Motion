"use client";
//Client side component in Next.js

import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Camera,
  SmilePlus,
  X,
  Save,
  RefreshCcw,
  Smile,
  Frown,
  AngryIcon,
  Sparkles,
  Eye,
  Frown as Disgusted,
  CircleOff,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
//Imports needed for emotion analysis page

// Define the path to the models (using CDN for simplicity)
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

export default function FacialAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading models...");
  const [emotions, setEmotions] = useState<Record<string, number> | null>(null);
  const [dominantEmotion, setDominantEmotion] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();
  //Defines the state variables for the facial analysis page

  useEffect(() => {
    const loadModels = async () => { //loads the models from the face-api.js library
      try {
        setLoadingMessage("Loading face detector model...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoadingMessage("Loading face landmark model...");
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setLoadingMessage("Loading face recognition model...");
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setLoadingMessage("Loading face expression model...");
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("Models loaded successfully");
        toast({
          title: "Ready",
          description: "Facial analysis models loaded.",
        });
      } catch (error) {
        console.error("Error loading face-api models:", error);
        toast({
          title: "Error Loading Models",
          description:
            "Could not load facial analysis models. Please refresh the page.",
          variant: "destructive",
        });
        setLoadingMessage("Error loading models");
      }
    };
    loadModels();


    return () => {
      // Clean up the stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    //requests access to the users webcam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, //no audio needed
      });

      streamRef.current = stream; //if permission is granted, media stream is stored to a ref, a stream is a live video feed from the webcam. 

      if (videoRef.current) {
        videoRef.current.srcObject = stream; //assigns the stream to a video element 
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive", //error if permission is denied
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); //stop all tracks in the stream (turns off camera)
      streamRef.current = null; //resets the stream ref
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    } // clears the video element source to stop the preview
    setEmotions(null);
    setDominantEmotion(null);
  }; //resets the state variables

  const analyzeEmotions = async () => {
    if (!modelsLoaded || !videoRef.current || !videoRef.current.srcObject) { //checks if models are loaded and camera is active then displays an error if not loaded
      toast({
        title: "Not Ready",
        description: modelsLoaded
          ? "Camera not active."
          : "Models are still loading.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setEmotions(null);
    setDominantEmotion(null);
    //start of analysis, clears the state variables (previous emotion results)

    try {
      if ( //checks if the video is paused, ended, or not rendering a valid frame for detection 
        videoRef.current.paused ||
        videoRef.current.ended ||
        !videoRef.current.videoWidth
      ) {
        console.log("Waiting for video to play..."); //if the video isnt playing, wait for it to start 
        await new Promise((resolve) => (videoRef.current!.onplay = resolve));
      }
      //ensure that the video is rendering a valid frame for detection
      //Because face-api.js needs a real, rendered video frame to analyse.
      //If detection runs before the video is playing, it will fail or return nothing.

      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions(); //detects a single face, landmarks, expressions

      if (detections && detections.expressions) { //checks if the detections are valid and if the expressions are valid 
        const expressions = detections.expressions; //gets the expressions from the detections
        let detectedEmotions: Record<string, number> = {}; //initialises an empty object to store the detected emotions
        let maxEmotion = ""; //initialises a variable to store the dominant emotion
        let maxValue = 0; //initialises a variable to store the maximum value of the dominant emotion

        Object.entries(expressions).forEach(([emotion, value]) => { //iterates over the expressions and converts them to a percentage
          const percentage = value * 100; //converts the value to a percentage
          detectedEmotions[emotion] = percentage; //stores the percentage in the detectedEmotions object    
          if (percentage > maxValue) {
            maxValue = percentage;
            maxEmotion = emotion; //finds the dominant emotion
          }
        });

        if ("disgust" in detectedEmotions) {
          detectedEmotions["disgusted"] = detectedEmotions["disgust"];
          delete detectedEmotions["disgust"];
          if (maxEmotion === "disgust") maxEmotion = "disgusted";
          //renames disgust to disgusted for clarity
        }

        setEmotions(detectedEmotions); //sets the detected emotions to the state variable
        setDominantEmotion(maxEmotion || "neutral"); //sets the dominant emotion to the state variable

        const {
          data: { session },
        } = await supabase.auth.getSession(); //gets the users session

        if (session) { //if the user is logged in, save the analysis to the database 
          await supabase.from("emotion_analysis").insert({
            user_id: session.user.id,
            analysis_type: "facial",
            emotions: detectedEmotions,
          });
          console.log("Emotion analysis saved to DB"); //saves the result to the emotion_analysis table,
          //user id, analysis_type (facial), emotions all saved. 
        }
      } else {
        console.log("No face detected or expressions not found.");
        setEmotions({
          neutral: 100,
          happy: 0,
          sad: 0,
          angry: 0,
          surprised: 0,
          fearful: 0,
          disgusted: 0,
        });
        setDominantEmotion("neutral");
        toast({
          title: "No Face Detected",
          description: "Could not detect a face in the video feed.",
          variant: "default",
        }); //set dominant emotion to neutral if no face is detected
      }

      setIsAnalyzing(false); //turns off analysis and displays the results
    } catch (error) {
      console.error("Error analyzing emotions with face-api:", error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Error",
        description: "An error occurred during facial analysis.",
        variant: "destructive",
      });
      setEmotions(null);
      setDominantEmotion(null);
    } //if error occurs, reset state variables, and display error toast.
  };

  const handleStartAnalysis = () => {
    if (videoRef.current && videoRef.current.srcObject && modelsLoaded) { //checks if camera is ready and models are loaded.
      analyzeEmotions(); //start analysis if ready 
    } else if (modelsLoaded) {
      startCamera().then(() => {
        setTimeout(analyzeEmotions, 500); //if only camera is not ready, start camera and analyse after 500ms,
      }); //safety delay to avoid analysis before video is ready.
    } else {
      toast({ title: "Loading", description: "Models are still loading..." }); //else show laoding toast
    }
  };

  const handleStopAnalysis = () => {
    setIsAnalyzing(false);
    stopCamera();
  }; //stops analysis and turns off camera

  const handleSaveAndExit = () => {
    stopCamera();
    router.push("/emotion-analysis");
  }; //turns off camera and redirects to the dashboard.

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy":
        return <Smile className="text-emerald-500" />;
      case "sad":
        return <Frown className="text-blue-500" />;
      case "angry":
        return <AngryIcon className="text-red-500" />;
      case "surprised":
        return <Sparkles className="text-amber-500" />;
      case "fearful":
        return <Eye className="text-purple-500" />;
      case "disgusted":
        return <Disgusted className="text-green-600" />;
      case "neutral":
        return <CircleOff className="text-gray-500" />;
      default:
        return null;
    }
  }; //returns the correct icon for each emotion

  const getEmotionColorClass = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy":
        return "bg-emerald-500";
      case "sad":
        return "bg-blue-500";
      case "angry":
        return "bg-red-500";
      case "surprised":
        return "bg-amber-500";
      case "fearful":
        return "bg-purple-500";
      case "disgusted":
        return "bg-green-600";
      case "neutral":
        return "bg-gray-500";
      default:
        return "bg-primary";
    }
  }; //returns the correct colour for each emotion.

  return (
    <div className="flex-1 max-w-7xl mx-auto p-3 md:p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          <span className="inline-flex items-center gap-2">
            <SmilePlus className="h-7 w-7 text-primary" />
            Facial Expression Analysis
          </span>
        </h2>
        <Button variant="outline" size="sm" onClick={handleSaveAndExit}>
          <Save className="mr-2 h-4 w-4" />
          Exit
        </Button>
      </div>

      {!modelsLoaded && (
        <div className="flex items-center justify-center p-10 bg-muted rounded-lg mb-4 border">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card
          className={`lg:col-span-7 border border-border/40 shadow-md ${!modelsLoaded ? "opacity-50 pointer-events-none" : ""
            }`}
        >
          <CardHeader className="py-3 px-4 bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Camera Feed
                </CardTitle>
                <CardDescription className="text-xs">
                  Position your face in the center
                </CardDescription>
              </div>
              <Badge
                variant={
                  isAnalyzing
                    ? "destructive"
                    : streamRef.current
                      ? "secondary"
                      : "outline"
                }
                className={cn(isAnalyzing && "animate-pulse")}
              >
                {isAnalyzing
                  ? "Analyzing..."
                  : streamRef.current
                    ? "Camera Active"
                    : "Ready"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={(e) => console.log("Video metadata loaded")}
                onPlay={() => console.log("Video playing")}
              />
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                  <RefreshCcw className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm font-medium">
                    Analyzing your facial expressions...
                  </p>
                </div>
              )}
              {!modelsLoaded && !isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm font-medium">{loadingMessage}</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
          <CardFooter className="p-3 flex justify-center gap-3 border-t bg-muted/20">
            {!streamRef.current ? (
              <Button
                onClick={handleStartAnalysis}
                className="w-full max-w-xs"
                size="lg"
                disabled={!modelsLoaded || isAnalyzing}
              >
                <Camera className="mr-2 h-4 w-4" />
                {modelsLoaded ? "Start Analysis" : "Loading Models..."}
              </Button>
            ) : !isAnalyzing ? (
              <Button
                onClick={analyzeEmotions}
                className="w-full max-w-xs"
                size="lg"
                disabled={!modelsLoaded}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Analyze Now
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleStopAnalysis}
                className="w-full max-w-xs"
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                Stop Analysis
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card
          className={`lg:col-span-5 border border-border/40 shadow-md ${!modelsLoaded ? "opacity-50" : ""
            }`}
        >
          <CardHeader className="py-3 px-4 bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <SmilePlus className="h-5 w-5 text-primary" />
              Emotion Results
            </CardTitle>
            <CardDescription className="text-xs">
              Analysis of facial expressions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 min-h-[300px] flex flex-col">
            {!modelsLoaded ? (
              <div className="flex-grow flex items-center justify-center text-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Models
                loading...
              </div>
            ) : !emotions && !isAnalyzing ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-10 space-y-3">
                <SmilePlus className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {streamRef.current
                    ? "Click 'Analyze Now' to see results."
                    : "Click 'Start Analysis' to begin."}
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex-grow flex items-center justify-center text-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
              </div>
            ) : emotions ? (
              <div className="space-y-5 flex-grow">
                <div
                  className={cn(
                    "text-center p-4 rounded-md mb-3 border transition-all duration-300 shadow-sm",
                    dominantEmotion
                      ? `border-${dominantEmotion === "happy"
                        ? "emerald"
                        : dominantEmotion === "sad"
                          ? "blue"
                          : dominantEmotion === "angry"
                            ? "red"
                            : dominantEmotion === "surprised"
                              ? "amber"
                              : dominantEmotion === "fearful"
                                ? "purple"
                                : dominantEmotion === "disgusted"
                                  ? "green"
                                  : "gray"
                      }-500/50 bg-${dominantEmotion === "happy"
                        ? "emerald"
                        : dominantEmotion === "sad"
                          ? "blue"
                          : dominantEmotion === "angry"
                            ? "red"
                            : dominantEmotion === "surprised"
                              ? "amber"
                              : dominantEmotion === "fearful"
                                ? "purple"
                                : dominantEmotion === "disgusted"
                                  ? "green"
                                  : "gray"
                      }-50`
                      : ""
                  )}
                >
                  <h3 className="text-sm font-medium mb-2">Primary Emotion</h3>
                  <div className="flex items-center justify-center gap-2">
                    {dominantEmotion && getEmotionIcon(dominantEmotion)}
                    <p className="text-2xl font-bold capitalize">
                      {dominantEmotion === "disgusted"
                        ? "Disgusted"
                        : dominantEmotion}
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid gap-3 max-h-[240px] overflow-y-auto pr-1">
                  {Object.entries(emotions)
                    .sort(([, valA], [, valB]) => valB - valA)
                    .map(([emotion, value]) => (
                      <HoverCard key={emotion}>
                        <HoverCardTrigger asChild>
                          <div className="space-y-1.5 cursor-default">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-1.5">
                                {getEmotionIcon(emotion)}
                                <span className="capitalize">
                                  {emotion === "disgusted"
                                    ? "Disgusted"
                                    : emotion}
                                </span>
                              </span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                                {Math.round(value)}%
                              </span>
                            </div>
                            <div className="relative h-2">
                              <div className="absolute inset-0 bg-muted rounded-full" />
                              <Progress
                                value={value}
                                className={cn(
                                  "h-2 transition-all",
                                  getEmotionColorClass(emotion)
                                )}
                              />
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-60">
                          <div className="flex justify-between space-x-4">
                            <div>
                              <h4 className="text-sm font-semibold capitalize">
                                {emotion === "disgusted"
                                  ? "Disgusted"
                                  : emotion}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {emotion === "happy"
                                  ? "Feeling of joy and contentment"
                                  : emotion === "sad"
                                    ? "Feeling of sorrow or unhappiness"
                                    : emotion === "angry"
                                      ? "Feeling of strong displeasure"
                                      : emotion === "surprised"
                                        ? "Feeling of being taken unaware"
                                        : emotion === "fearful"
                                          ? "Feeling of being afraid"
                                          : emotion === "disgusted"
                                            ? "Feeling of revulsion"
                                            : "Lack of strong emotion"}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                getEmotionColorClass(emotion).replace(
                                  "bg-",
                                  "bg-"
                                ) + "/20"
                              )}
                            >
                              {getEmotionIcon(emotion)}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}