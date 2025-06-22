import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuestionSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: (technicalCount: number, behavioralCount: number) => void;
  jobTitle: string;
  companyName: string;
}

export function QuestionSelection({
  isOpen,
  onClose,
  onStartInterview,
  jobTitle,
  companyName,
}: QuestionSelectionProps) {
  const [technicalCount, setTechnicalCount] = useState(3);
  const [behavioralCount, setBehavioralCount] = useState(2);

  const handleStart = () => {
    onStartInterview(technicalCount, behavioralCount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle>Configure Your Interview</DialogTitle>
          <DialogDescription>
            Set up your interview for {jobTitle} at {companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="technical" className="text-right">
              Technical Questions
            </Label>
            <Input
              id="technical"
              type="number"
              min="1"
              max="10"
              value={technicalCount}
              onChange={(e) => setTechnicalCount(parseInt(e.target.value) || 1)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="behavioral" className="text-right">
              Behavioral Questions
            </Label>
            <Input
              id="behavioral"
              type="number"
              min="1"
              max="10"
              value={behavioralCount}
              onChange={(e) =>
                setBehavioralCount(parseInt(e.target.value) || 1)
              }
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="bg-[#6a0dad] hover:bg-[#c10f2f]"
          >
            Start Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
