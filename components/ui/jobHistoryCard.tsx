import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { QuestionSelection } from "@/components/ui/QuestionSelection";

// Interface for the job history card
interface JobHistoryCardProps {
  id: string;
  jobTitle: string;
  companyName: string;
  feedback: string;
  createdAt: string;
}

// Job history card component
export function JobHistoryCard({
  id,
  jobTitle,
  companyName,
  feedback,
  createdAt,
}: JobHistoryCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Function to handle interview configuration
  const handleStartInterview = async (
    technicalCount: number,
    behavioralCount: number
  ) => {
    try {
      // Save interview configuration to database
      const response = await fetch("/api/save-interview-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: id,
          technicalCount,
          behavioralCount,
          jobTitle,
          companyName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save interview configuration");
      }

      const data = await response.json();

      // Navigate to interview session with the interview ID
      router.push(`/interview-session?interviewId=${data.interviewId}`);
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
    }
  };

  return (
    <>
      <Card className="w-full max-w-xs mx-auto mb-4 bg-white/10 text-white border border-white/20 shadow-md rounded-lg p-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold truncate">
            {jobTitle}
          </CardTitle>
          <CardDescription className="text-xs text-white/70 truncate">
            {companyName}
          </CardDescription>
          <div className="text-[10px] text-white/50 mt-1">
            {new Date(createdAt).toLocaleString()}
          </div>
        </CardHeader>
        <CardContent className="text-xs max-h-24 overflow-y-auto pb-2">
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            className="w-full bg-[#6a0dad] hover:bg-[#c10f2f] text-white text-xs py-1 px-2 rounded"
            onClick={() => setShowModal(true)}
          >
            Start Interview
          </Button>
        </CardFooter>
      </Card>

      <QuestionSelection
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStartInterview={handleStartInterview}
        jobTitle={jobTitle}
        companyName={companyName}
      />
    </>
  );
}
