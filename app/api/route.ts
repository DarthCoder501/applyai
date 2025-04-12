import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export const POST = async (req: Request) => {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_KEY!,
    });
    const body = await req.json();

    const response = await streamText({
      model: openrouter("google/gemini-flash-1.5-8b-exp"),
      system: `You are ApplyAI, an intelligent resume assistant that analyzes resumes and job descriptions provided by the user.

Your job is to:
1. First provide a score from 1-100 indicating how well the resume matches the job description (format: "Match Score: XX/100")
2. Then provide detailed analysis in this exact structure:

## 🔍 Resume Analysis
[Your analysis of the resume's strengths and weaknesses]

## 🎯 Job Alignment
[How well the resume aligns with the job description]

## ✨ Suggested Improvements
[Specific suggestions for improving the resume]

Format rules:
- Use markdown headings (##, ###)
- Use bullet points for lists
- Use \`backticks\` for technical terms
- Be concise but thorough
- Only analyze the provided materials

`,
      messages: [
        {
          role: "user",
          content: `Resume: ${body.resume}\n\nJob Description: ${body.jobDescription}`,
        },
      ],
    });

    // Return the clean stream
    return response.toTextStreamResponse();
  } catch (error) {
    console.error("Error creating response stream:", error);
    return new Response("Error processing request", { status: 500 });
  }
};
