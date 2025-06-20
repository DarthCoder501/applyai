import { useEffect, useState } from "react";
import { JobHistoryCard } from "@/components/ui/jobHistoryCard";

interface JobItem {
  id: string;
  jobTitle: string;
  companyName: string;
  feedback: string;
  createdAt: string;
}

export default function JobHistoryList() {
  const [jobs, setJobs] = useState<JobItem[]>([]);

  useEffect(() => {
    fetch("/api/get-feedback-history")
      .then((res) => res.json())
      .then((data: JobItem[]) => setJobs(data));
  }, []);

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {jobs.map((job) => (
        <JobHistoryCard
          key={job.id}
          id={job.id}
          jobTitle={job.jobTitle}
          companyName={job.companyName}
          feedback={job.feedback}
          createdAt={job.createdAt}
        />
      ))}
    </div>
  );
}
