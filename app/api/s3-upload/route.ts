import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/aws";

// Creates s3Client
const s3Client = s3;

async function uploadFileToS3(file: Buffer, fileName: string) {
  const fileBuffer = file;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${fileName}`,
    Body: fileBuffer,
    ContentType: "application/pdf",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return fileName;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = await uploadFileToS3(buffer, file.name);

    return NextResponse.json({ sucess: "File is uploaded" });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
