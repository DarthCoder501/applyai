import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { jobId, technicalCount, behavioralCount, jobTitle, companyName } =
      await req.json();

    const interviewConfig = {
      id: `${userId}-interview-${Date.now()}`,
      userId,
      jobId,
      technicalCount,
      behavioralCount,
      jobTitle,
      companyName,
      status: "configured",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: interviewConfig,
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        interviewId: interviewConfig.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving interview config:", error);
    return new Response(JSON.stringify({ success: false, error: "DB Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
