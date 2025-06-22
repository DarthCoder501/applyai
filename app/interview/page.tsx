"use client";

import { useState, useEffect } from "react";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Menu } from "lucide-react";
import JobHistoryList from "@/components/ui/JobHistoryList";

export default function InterviewPage() {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <p className="text-lg text-white/80 mb-4">
              Select a job from your history to start practicing interviews
            </p>
            <JobHistoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
