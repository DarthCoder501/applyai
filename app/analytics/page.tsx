"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton, SignedIn } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  match_score: number;
  similarity_score: number;
  created_at: string;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/get-analytics")
      .then((res) => res.json())
      .then((res) => {
        console.log("Analytics data:", res);
        setData(res);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const avgScore =
    data.reduce((acc, item) => acc + (item.match_score || 0), 0) /
    (data.length || 1);

  const avgSimilarity =
    data.reduce((acc, item) => acc + (item.similarity_score || 0), 0) /
    (data.length || 1);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#6a0dad] dark:from-[#8b0a24] dark:to-[#3d005e] text-white px-6 py-12 space-y-12">
      <h1 className="text-4xl font-bold drop-shadow-md">Resume Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
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
                    Resume Analyzer
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
        {/* Avg Score + Similarity Cards */}
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/20">
          <h2 className="text-lg font-semibold mb-2">Average Match Score</h2>
          <p className="text-3xl font-bold">{Math.round(avgScore)} / 100</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/20">
          <h2 className="text-lg font-semibold mb-2">
            Average Semantic Similarity
          </h2>
          <p className="text-3xl font-bold">{avgSimilarity.toFixed(2)}</p>
        </div>

        {/* Line Chart of Match Score over Time */}
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/20 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Match Score Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff40" />
              <XAxis
                dataKey="created_at"
                stroke="#fff"
                tick={{ fill: "#fff" }}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111", color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="match_score"
                stroke="#fff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart of Similarity Scores */}
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/20 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Semantic Similarity Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff40" />
              <XAxis
                dataKey="created_at"
                stroke="#fff"
                tick={{ fill: "#fff" }}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111", color: "#fff" }}
              />
              <Bar dataKey="similarity_score" fill="#c10f2f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
