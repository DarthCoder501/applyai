import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    // Call external emotion recognition API
    const emotionApiUrl = process.env.EMOTION_RECOGNITION_API_URL || "";

    const audioFormData = new FormData();
    audioFormData.append("audio", audioFile);

    const emotionResponse = await fetch(emotionApiUrl, {
      method: "POST",
      body: audioFormData,
    });

    if (emotionResponse.ok) {
      const emotionData = await emotionResponse.json();
      return new Response(
        JSON.stringify({
          transcript: emotionData.transcript || "Audio processed successfully",
          emotion: emotionData.emotion,
          confidence: emotionData.confidence || 0.95,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing speech-to-text:", error);
    return new Response("Error processing audio", { status: 500 });
  }
}
