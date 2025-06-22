import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const interviewId = url.searchParams.get("interviewId");

    if (!interviewId) {
      return new Response("Interview ID required", { status: 400 });
    }

    // Get the interview configuration
    const configResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "id = :interviewId",
        ExpressionAttributeValues: {
          ":interviewId": interviewId,
        },
      })
    );

    const interviewConfig = configResult.Items?.[0];
    if (!interviewConfig) {
      return new Response("Interview not found", { status: 404 });
    }

    // Get the job data to access resume and job description
    const jobResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "id = :jobId",
        ExpressionAttributeValues: {
          ":jobId": interviewConfig.jobId,
        },
      })
    );

    const jobData = jobResult.Items?.[0];
    if (!jobData) {
      return new Response("Job data not found", { status: 404 });
    }

    // Generate questions directly here instead of calling another API
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_KEY!,
    });

    const questionResult = await generateText({
      model: openrouter("deepseek/deepseek-r1-distill-qwen-32b:free"),
      system: `You are an expert interviewer with PHD level theoretical and practical knowledge of how to conduct interviews. Generate ${interviewConfig.technicalCount} technical questions and ${interviewConfig.behavioralCount} behavioral questions based solely on the resume and job description.

Guidelines: 
- Technical questions should focus on skills and technologies mentioned in the resume and job description
- Behavioral questions should focus on past experiences and soft skills
- Questions should be challenging but fair
- Each question should be unique and specific
- Technical questions should test both knowledge and problem-solving ability
- Behavioral questions should explore leadership, teamwork, and problem-solving scenarios

Format your response as:
Question 1: [Question 1]
Question 2: [Question 2]
.
.
.
Question n: [Question n]
`,
      messages: [
        {
          role: "user",
          content: `Resume Text: ${
            jobData.resumeText || ""
          }\n\nJob Description: ${jobData.jobDescription || ""}`,
        },
      ],
    });

    const questions = questionResult.text;

    // Save the questions to the database
    const questionsItem = {
      id: `${interviewId}-questions`,
      userId,
      interviewId,
      questions,
      technicalCount: interviewConfig.technicalCount,
      behavioralCount: interviewConfig.behavioralCount,
      jobTitle: interviewConfig.jobTitle,
      companyName: interviewConfig.companyName,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: questionsItem,
      })
    );

    // Parse questions into array
    const questionLines = questions
      .split("\n")
      .filter((line) => line.trim().startsWith("Question"));
    const questionArray = questionLines.map((line, index) => ({
      id: index + 1,
      text: line.replace(/^Question \d+: /, ""),
      type: index < interviewConfig.technicalCount ? "technical" : "behavioral",
    }));

    return new Response(
      JSON.stringify({
        questions: questionArray,
        interviewConfig,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error getting interview questions:", error);
    return new Response("Error getting interview questions", { status: 500 });
  }
}
