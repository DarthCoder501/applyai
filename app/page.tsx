"use client";

import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#6a0dad] dark:from-[#8b0a24] dark:to-[#3d005e] text-white">
      <div className="text-center space-y-8 max-w-3xl px-4">
        <h1 className="text-5xl font-bold tracking-tight drop-shadow-md">
          Welcome to ApplyAI
        </h1>

        <p className="text-xl text-white/80">
          Your AI-powered assistant that helps you improve your resume to get
          those interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="text-lg px-8 bg-white text-[#c10f2f] hover:bg-gray-100 dark:text-[#c10f2f]"
              >
                Get Started
              </Button>
            </SignUpButton>

            <SignInButton mode="modal">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-white text-white hover:bg-white hover:text-[#6a0dad]"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/home">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-white text-[#6a0dad] hover:bg-gray-100"
                >
                  Go to Workspace
                </Button>
              </Link>
              <SignOutButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-white text-white hover:bg-white hover:text-[#c10f2f]"
                >
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              title: "Instant Resume Upload",
              desc: "Securely upload your resume in seconds and unlock powerful AI-driven analysis tailored to your target roles.",
            },
            {
              title: "AI Tailored Feedback",
              desc: "Receive smart, actionable suggestions to improve clarity, formatting, and alignment with job descriptions.",
            },
            {
              title: "Boost Your Hiring Odds",
              desc: "Identify gaps, highlight strengths, and optimize every section to stand out to recruiters and ATS systems.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-white/80">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
