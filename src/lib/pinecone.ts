import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};
// 1. Pinecone obtain the uploaded PDF
// 2. Pinecone split and segment the PDF into chunks
// 3. Pinecone vectorise and get embeddings of the chunks
// 4. Pinecone store the vectors into Pinecone DB

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> download and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download pdf from s3!");
  }
  console.log("Successfully retrieved file and stored at: ", file_name);
  const loader = new PDFLoader(file_name);
  const pages = await loader.load();
  //   console.log("The downloaded pdf has: ", pages);
  return pages;
}
