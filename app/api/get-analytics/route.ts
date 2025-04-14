import { pool } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// Function to get data of logged-in user
export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const [rows] = await pool.promise().query(
      `SELECT user_email, job_description, match_score, similarity_score, created_at
       FROM resume_data
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      {
        status: 500,
      }
    );
  }
}
