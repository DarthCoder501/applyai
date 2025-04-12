"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data.status);
      setUploading(false);
    } catch (error) {
      console.log(error);
      setUploading(false);
    }
  };

  <form onSubmit={handleSubmit}>
    <Input type="file" accept="pdf" onChange={handleFileChange} />
    <Button type="submit" disabled={!file || uploading}>
      {uploading ? "Uploading..." : "Upload"}
    </Button>
  </form>;
};

export default UploadForm;
