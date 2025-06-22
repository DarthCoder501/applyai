"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, Mic, MicOff, Play, Pause, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Question {
  id: number;
  text: string;
  type: "technical" | "behavioral";
}

interface InterviewConfig {
  jobTitle: string;
  companyName: string;
  technicalCount: number;
  behavioralCount: number;
}

export default function InterviewSessionPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const interviewId = searchParams.get("interviewId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewConfig, setInterviewConfig] =
    useState<InterviewConfig | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!interviewId) {
      router.push("/interview");
      return;
    }

    loadInterviewQuestions();
  }, [interviewId]);

  const loadInterviewQuestions = async () => {
    try {
      const response = await fetch(
        `/api/get-interview-questions?interviewId=${interviewId}`
      );
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setInterviewConfig(data.interviewConfig);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading questions:", error);
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Send audio to speech-to-text API
      const formData = new FormData();
      formData.append("audio", audioBlob);
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const { transcript, emotion, confidence } = await response.json();
      setTranscript(transcript);
      setEmotion(emotion);
      setEmotionConfidence(confidence);
    } catch (error) {
      console.error("Error processing audio:", error);
      setTranscript("Error processing audio. Please try again.");
      setEmotion(null);
      setEmotionConfidence(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1 && transcript) {
      try {
        const currentQuestion = questions[currentQuestionIndex];

        // Save the current answer
        await fetch("/api/save-interview-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            answer: transcript,
            questionType: currentQuestion.type,
          }),
        });

        // Save feedback with emotion analysis
        if (emotion) {
          await fetch("/api/save-interview-feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              interviewId,
              questionId: currentQuestion.id,
              questionText: currentQuestion.text,
              answer: transcript,
              questionType: currentQuestion.type,
              emotion,
              emotionConfidence,
            }),
          });
        }

        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTranscript("");
        setEmotion(null);
        setEmotionConfidence(null);
      } catch (error) {
        console.error("Error saving answer:", error);
        alert("Failed to save answer. Please try again.");
      }
    }
  };

  const finishInterview = async () => {
    if (transcript) {
      try {
        const currentQuestion = questions[currentQuestionIndex];

        // Save the final answer
        await fetch("/api/save-interview-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            answer: transcript,
            questionType: currentQuestion.type,
          }),
        });

        // Save feedback with emotion analysis
        if (emotion) {
          await fetch("/api/save-interview-feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              interviewId,
              questionId: currentQuestion.id,
              questionText: currentQuestion.text,
              answer: transcript,
              questionType: currentQuestion.type,
              emotion,
              emotionConfidence,
            }),
          });
        }

        // Navigate to results page or back to interview list
        router.push("/interview");
      } catch (error) {
        console.error("Error saving final answer:", error);
        alert("Failed to save answer. Please try again.");
      }
    } else {
      router.push("/interview");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#6a0dad] dark:from-[#8b0a24] dark:to-[#3d005e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-xl">Loading your interview...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#6a0dad] dark:from-[#8b0a24] dark:to-[#3d005e] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <SignedIn>
          <div className="absolute top-4 right-4">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 rounded-full bg-white text-[#6a0dad] shadow-lg hover:bg-gray-100 transition"
              >
                <Menu className="w-6 h-6" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 flex flex-col bg-white text-[#6a0dad] rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                  <Link
                    href="/"
                    className="px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => setMenuOpen(false)}
                  >
                    Landing Page
                  </Link>
                  <Link
                    href="/home"
                    className="px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/interview"
                    className="px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => setMenuOpen(false)}
                  >
                    Interview List
                  </Link>
                  <SignOutButton>
                    <button
                      className="px-4 py-2 hover:bg-gray-100 w-full transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </div>
        </SignedIn>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Session</h1>
          <p className="text-lg text-white/80">
            {interviewConfig?.jobTitle} at {interviewConfig?.companyName}
          </p>
          <div className="mt-4 text-sm text-white/60">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <Card className="bg-white/10 border-white/20 text-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.type === "technical"
                    ? "bg-blue-500/20 text-blue-200"
                    : "bg-green-500/20 text-green-200"
                }`}
              >
                {currentQuestion.type === "technical"
                  ? "Technical"
                  : "Behavioral"}
              </span>
              Question {currentQuestion.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white mb-8">
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            {transcript ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-white/90">{transcript}</p>
                </div>
                {emotion && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">
                        Detected Emotion:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          emotion === "happy" ||
                          emotion === "confident" ||
                          emotion === "enthusiastic"
                            ? "bg-green-500/20 text-green-200"
                            : emotion === "neutral" || emotion === "focused"
                            ? "bg-blue-500/20 text-blue-200"
                            : "bg-yellow-500/20 text-yellow-200"
                        }`}
                      >
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </span>
                    </div>
                    {emotionConfidence && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Confidence</span>
                          <span>{Math.round(emotionConfidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${emotionConfidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing your answer...
                  </div>
                ) : (
                  "Click the microphone to start recording your answer"
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isProcessing}
                className="bg-[#6a0dad] hover:bg-[#c10f2f] text-white"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={() => router.push("/interview")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Exit Interview
          </Button>

          <div className="flex gap-4">
            {!isLastQuestion ? (
              <Button
                onClick={nextQuestion}
                disabled={!transcript}
                className="bg-[#6a0dad] hover:bg-[#c10f2f] text-white"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Next Question
              </Button>
            ) : (
              <Button
                onClick={finishInterview}
                disabled={!transcript}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Finish Interview
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
