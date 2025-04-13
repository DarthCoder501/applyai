"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";

declare const pdfjsLib: any;

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = async function () {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + " ";
      }
      uploadAndAnalyze(text);
    };
    reader.readAsArrayBuffer(selected);
  };

  const uploadAndAnalyze = async (resumeText: string) => {
    if (!file || !jobDescription) return;
    setIsProcessing(true);
    setFeedback(null);
    setScore(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });

      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, jobDescription }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        result += decoder.decode(value);
      }

      const scoreMatch = result.match(/Match Score: (\d+)/);
      const similarityScore = result.match(
        /Semantic Similarity Score: ([0-9.]+)/
      );

      if (scoreMatch) setScore(parseInt(scoreMatch[1]));
      if (similarityScore) setSimilarity(parseFloat(similarityScore[1]));

      const { user } = useUser();

      await fetch("/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user?.primaryEmailAddress?.emailAddress,
          resumeText,
          jobDescription,
          matchScore: score,
          similarityScore: similarity,
          feedback,
        }),
      });
      setFeedback(result);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#6a0dad] dark:from-[#8b0a24] dark:to-[#3d005e] text-white px-4 py-10">
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
        <h1 className="text-5xl font-bold drop-shadow-md">Resume Analyzer</h1>
        <p className="text-xl text-white/80">
          Upload your resume and a job description to get instant AI-powered
          feedback and a match score.
        </p>

        <div className="flex flex-col gap-4">
          <Input type="file" accept=".pdf" onChange={handleFileChange} />
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here"
            rows={6}
            className="text-white"
          />
        </div>

        <Button
          onClick={() =>
            file && handleFileChange({ target: { files: [file] } } as any)
          }
          disabled={!file || !jobDescription || isProcessing}
          className="mt-4 text-lg px-8 bg-white text-[#6a0dad] hover:bg-gray-100 dark:text-[#6a0dad]"
        >
          {isProcessing ? "Analyzing..." : "Analyze Resume"}
        </Button>

        {score !== null && (
          <div className="mt-10 text-3xl font-semibold">
            Match Score: {score}/100
          </div>
        )}

        {feedback && (
          <div className="mt-6 bg-white/10 p-6 rounded-lg w-full text-left prose prose-invert max-w-4xl">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
