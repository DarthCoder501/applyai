import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  // Get the user id from Clerk server-side auth
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Get the feedback history from the database for this user
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(id, :prefix)",
        ExpressionAttributeValues: {
          ":prefix": userId,
        },
      })
    );
    // Map the feedbacks to the feedbacks array
    const feedbacks =
      result.Items?.map((item: any) => ({
        id: item.id,
        jobTitle: item.jobTitle || "Untitled Position",
        companyName: item.companyName || "Unknown Company",
        feedback: item.feedback,
        createdAt: item.createdAt,
      }))
        // Sort the feedbacks by the date they were created
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];

    // Return the feedbacks
    return new Response(JSON.stringify(feedbacks), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // If there is an error, return an error
    console.error("Error fetching feedback history:", error);
    return new Response("Error fetching feedback history", { status: 500 });
  }
}
