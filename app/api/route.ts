import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { pipeline, dot } from "@huggingface/transformers";

export const POST = async (req: Request) => {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_KEY!,
    });

    const body = await req.json();
    /*
    const extractor = await pipeline(
      "feature-extraction",
      "Snowflake/snowflake-arctic-embed-m-v2.0",
      {
        dtype: "q8",
      }
    );

    const sentences = [body.resume, body.jobDescription];

    const output = await extractor(sentences, {
      normalize: true,
      pooling: "cls",
    });

    // Compute similarity scores
    const [source_embeddings, ...document_embeddings] = output.tolist();
    const similarities = document_embeddings.map((x) =>
      dot(source_embeddings, x)
    );
    */

    const result = await generateText({
      model: openrouter("deepseek/deepseek-r1-distill-qwen-32b:free"),
      system: `You are ApplyAI, an intelligent resume review assistant. 

Your job is to provide detailed analysis in this exact structure:

Feedback Format (Repeat for Each Bullet Point)
Section: [Experiences / Projects / etc.] 
Title: [Role or Project Title]
Bullet: [Original bullet point text]
Score: X/10 A number from 1 to 10 indicating the strength of the bullet in terms of clarity, specificity, impact, and alignment with the job.
Analysis: A concise explanation of what works well and what could be improved. Comment on action verbs, technologies, metrics, and relevance to the job.
Suggestion: A rewritten version of the bullet that improves specificity, quantification, or relevance. Use strong action verbs, technical terms, and measurable outcomes when possible.

Format rules:
- Use markdown headings (##, ###)
- Use bullet points for lists
- Use \`backticks\` for technical terms

General rules:
- Be concise but thorough
- Only analyze the provided materials
- Repeat the format above for each bullet individually.
- Be concise but informative. Never generalize — only refer to the given resume and job description.
- Do not summarize the entire resume — only evaluate the bullet points.
- Never fabricate achievements; base all suggestions strictly on the original bullet.
- Be constructive: always include a suggestion for improvement, even for strong bullets.`,
      messages: [
        {
          role: "user",
          content: `Resume: ${body.resume}\n\nJob Description: ${body.jobDescription}`,
        },
      ],
    });

    // Return just the text content
    return new Response(result.text, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error creating response:", error);
    return new Response("Error processing request", { status: 500 });
  }
};
