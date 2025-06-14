import { pipeline, dot } from "@huggingface/transformers";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    // Creates a feature extraction pipeline
    const extractor = await pipeline(
      "feature-extraction",
      "Snowflake/snowflake-arctic-embed-m-v2.0",
      {
        dtype: "q8",
      }
    );
    // Extracts the sentences from the answer and ideal answer
    const sentences = [body.answer, body.idealAnswer];
    // Computes the similarity scores
    const output = await extractor(sentences, {
      normalize: true,
      pooling: "cls",
    });
    // Converts the output to a list
    const [source_embeddings, ...document_embeddings] = output.tolist();
    // Computes the similarities
    const similarities = document_embeddings.map((x) =>
      dot(source_embeddings, x)
    );
    // Returns the similarity score
    return similarities[0], { status: 200 };
  } catch (error) {
    console.error("Error comparing user answer with ideal answer:", error);
    return new Response("Error processing request", { status: 500 });
  }
};
