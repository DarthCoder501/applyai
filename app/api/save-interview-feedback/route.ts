import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const {
      interviewId,
      questionId,
      questionText,
      answer,
      questionType,
      emotion,
      emotionConfidence,
    } = await req.json();

    // Generate AI feedback based on answer and emotion
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_KEY!,
    });

    const feedbackPrompt = `You are an expert interview coach. Analyze this interview answer and provide constructive feedback.

Question: ${questionText}
Answer: ${answer}
Detected Emotion: ${emotion} (confidence: ${Math.round(
      emotionConfidence * 100
    )}%)
Question Type: ${questionType}

Provide feedback in this format:
## Content Analysis
[Evaluate the substance and relevance of the answer]

## Delivery & Emotion
[Comment on the emotional delivery and confidence level]

## Areas for Improvement
[Specific suggestions for better answers]

## Overall Score: X/10
[Rate the answer from 1-10]

Keep feedback constructive and actionable.`;

    const feedbackResult = await generateText({
      model: openrouter("deepseek/deepseek-r1-distill-qwen-32b:free"),
      system:
        "You are an expert interview coach providing constructive feedback.",
      messages: [
        {
          role: "user",
          content: feedbackPrompt,
        },
      ],
    });

    const feedbackItem = {
      id: `${interviewId}-feedback-${questionId}`,
      userId,
      interviewId,
      questionId,
      questionText,
      answer,
      questionType,
      emotion,
      emotionConfidence,
      aiFeedback: feedbackResult.text,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: feedbackItem,
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        feedback: feedbackResult.text,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving interview feedback:", error);
    return new Response(JSON.stringify({ success: false, error: "DB Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
