import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";

// Function to save data to DynamoDB
export async function POST(req: Request) {
  const {
    userId,
    userEmail,
    resumeText,
    jobDescription,
    similarityScore,
    feedback,
    jobTitle,
    companyName,
  } = await req.json();
  // Log the received data
  console.log("Received data for saving:", {
    similarityScore,
    feedbackLength: feedback?.length,
  });
  try {
    const item = {
      id: `${userId}-${Date.now()}`, // Composite key
      userId,
      userEmail,
      resumeText,
      jobDescription,
      similarityScore,
      feedback,
      jobTitle,
      companyName,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error saving analysis:", error);
    return new Response(JSON.stringify({ success: false, error: "DB Error" }), {
      status: 500,
    });
  }
}
