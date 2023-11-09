import { Pinecone } from "@pinecone-database/pinecone";

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
