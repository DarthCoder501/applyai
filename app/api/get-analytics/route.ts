import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// Function to get data of logged-in user
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    const items = result.Items || [];
    const analyticsData = items
      .filter((item) => item.feedback) // Only include items with feedback (resume analyses)
      .map((item) => ({
        user_email: item.userEmail,
        job_description: item.jobDescription,
        job_title: item.jobTitle,
        company_name: item.companyName,
        created_at: item.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 50);

    return new Response(JSON.stringify(analyticsData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
