import { pool } from "@/lib/db";

// Function to save data to AWS RDS MySQL
export async function POST(req: Request) {
  const {
    userEmail,
    resumeText,
    jobDescription,
    matchScore,
    similarityScore,
    feedback,
  } = await req.json();

  try {
    const [result] = await pool.promise().execute(
      `INSERT INTO resume_data (
          user_email, resume_text, job_description, match_score, similarity_score, feedback
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userEmail,
        resumeText,
        jobDescription,
        matchScore,
        similarityScore,
        feedback,
      ]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error saving analysis:", error);
    return new Response(JSON.stringify({ success: false, error: "DB Error" }), {
      status: 500,
    });
  }
}
