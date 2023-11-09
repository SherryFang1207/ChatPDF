// import { S3 } from "@aws-sdk/client-s3";
import AWS from "aws-sdk";
import fs from "fs";
import os from "os";
import path from "path";
export async function downloadFromS3(file_key: string) {
  try {
    const s3 = new AWS.S3({
      region: "us-west-1",

      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();
    const tempDir = os.tmpdir();
    const fileName = `chatpdf_download-${Date.now().toString()}.pdf`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, obj.Body as Buffer);
    return filePath;
    //   const file_name = `/tmp/chatpdf_download-${Date.now().toString()}.pdf`;
    //   fs.writeFileSync(file_name, obj.Body as Buffer);
    //   return file_name;
  } catch (error) {
    console.log(error);
    //   reject(error);
    return null;
  }
}
