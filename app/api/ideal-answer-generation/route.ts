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
    // Get URL parameters for questions that we want to generate ideal answers for
    const url = new URL(req.url);
    const questionGeneration = url.searchParams.get("questions") || "1";

    // Get the number of technical and behavioral questions
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
    const resume = mostRecentItem.resume || "";
    const questions = mostRecentItem.questions || "";

    // Generate the questions
    const idealAnswers = await generateText({
      model: openrouter("deepseek/deepseek-r1-distill-qwen-32b:free"),
      system: `You are an expert career coach with a Ph.D. in organizational psychology and 15+ years of experience helping candidates ace interviews. Generate ideal answers for the following ${technicalCount} technical and ${behavioralCount} behavioral interview questions based exclusively on the candidate's resume and job description. 

Inputs Provided:
- Full resume text
- Complete job description
- Pre-generated list of questions (${technicalCount} technical, ${behavioralCount} behavioral)

Guidelines:
1. Technical Answers:
   - Demonstrate deep knowledge of tools/concepts mentioned in the resume/job description
   - Include problem-solving logic (e.g., "First I'd verify X, then optimize Y using Z")
   - Incorporate resume specifics (projects, tools, certifications)

2. Behavioral Answers:
   - Mandatory STAR structure (Situation, Task, Action, Result) woven into cohesive paragraphs
   - Highlight soft skills from job description (leadership, conflict resolution, etc.)
   - Quantify results when possible (e.g., "reduced latency by 30%")

3. General Rules**:
   - Answers must be 4-6 sentences in paragraph form
   - Use resume-specific details (company names, projects, technologies)
   - Never invent facts absent from resume/job description
   - Technical answers should include troubleshooting steps where applicable

Output Format:
Answer [Question Number]: [Full paragraph answer]\n`,
      messages: [
        {
          role: "user",
          content: `\n\n${questions}\n\nResume Text: ${resume}\n\nJob Description: ${jobDescription}`,
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
      idealAnswers: idealAnswers.text,
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
    return new Response(idealAnswers.text, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response("Error generating questions", { status: 500 });
  }
}
