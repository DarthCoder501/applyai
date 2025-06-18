import { docClient, TABLE_NAME } from "@/lib/db";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { auth } from "@clerk/nextjs/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export async function GET(req: Request) {
  // First checking to see if the user is logged in (aka authorized call)
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Get URL parameters for question counts
    const url = new URL(req.url);
    const technicalCount = parseInt(
      url.searchParams.get("technicalCount") || "1"
    );
    const behavioralCount = parseInt(
      url.searchParams.get("behavioralCount") || "1"
    );

    // Create open router instance to use the LLM
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_KEY!,
    });

    // Get the user's most recent job description from the DB
    const userDataResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    // Get the most recent job description
    const userItems = userDataResult.Items || [];
    const mostRecentItem = userItems.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    if (!mostRecentItem || !mostRecentItem.jobDescription) {
      return new Response(
        "No job description found. Please analyze a resume first.",
        {
          status: 404,
        }
      );
    }

    const jobDescription = mostRecentItem.jobDescription;
    const resume = mostRecentItem.resumeText || "";

    // Generate the questions
    const questionResult = await generateText({
      model: openrouter("deepseek/deepseek-r1-distill-qwen-32b:free"),
      system: `You are an expert interviewer with PHD level theoretical and practical knowledge of how to conduct interviews. Generate ${technicalCount} technical questions and ${behavioralCount} behavioral questions based solely on the resume and job description.

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
          content: `Resume Text: ${resume}\n\nJob Description: ${jobDescription}`,
        },
      ],
    });

    // Save questions to DB with a new item
    const questionItem = {
      id: `${userId}-questions-${Date.now()}`,
      userId,
      userEmail: mostRecentItem.userEmail,
      resume,
      jobDescription,
      questions: questionResult.text,
      questionType: "generated",
      technicalCount,
      behavioralCount,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: questionItem,
      })
    );

    // Return just the text content
    return new Response(questionResult.text, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response("Error generating questions", { status: 500 });
  }
}
