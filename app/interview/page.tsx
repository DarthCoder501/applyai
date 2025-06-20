"use client";

import { useState, useEffect } from "react";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Menu } from "lucide-react";
import JobHistoryList from "@/components/ui/JobHistoryList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

// Interface for the job item
interface jobItem {
  id: string;
  jobTitle: string;
  companyName: string;
  createdAt: string;
}

export default function InterviewPage() {
  const { user } = useUser();
  const [questions, setQuestions] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [job, setJob] = useState<jobItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to fetch the job history
  const fetchJobHistory = async () => {
    const response = await fetch("/api/get-feedback-history");
    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to fetch job history:", response.status, text);
      return;
    }
    const data = await response.json();
    setJob(data);
  };

  // Function to gain access to microphone
  function getLocalStream(): void {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream: MediaStream) => {
        (window as any).localStream = stream;
        (window as any).localAudio.srcObject = stream;
        (window as any).localAudio.autoplay = true;
      })
      .catch((err: Error) => {
        console.error(`you got an error: ${err}`);
      });
  }

  getLocalStream();

  return (
    <div className="min-h-screen bg-gradient-to-br  from-[#c10f2f] to-[#6a0dad] dark:from-[#8b0a24] dark:to-[#3d005e] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center max-w-3xl w-full space-y-8">
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
                      href="/analytics"
                      className="px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                      onClick={() => setMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/home"
                      className="px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                      onClick={() => setMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <SignOutButton>
                      <button
                        className="px-4 py-2  hover:bg-gray-100 w-full transition"
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Interview Session</h1>
            <JobHistoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
