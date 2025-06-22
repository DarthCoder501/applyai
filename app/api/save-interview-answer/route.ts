import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { interviewId, questionId, questionText, answer, questionType } =
      await req.json();

    const answerItem = {
      id: `${interviewId}-answer-${questionId}`,
      userId,
      interviewId,
      questionId,
      questionText,
      answer,
      questionType,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: answerItem,
      })
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving interview answer:", error);
    return new Response(JSON.stringify({ success: false, error: "DB Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
