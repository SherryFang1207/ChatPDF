import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
// import getEmbeddings from "./tryEmbed";
import { getEmbeddings } from "./embeddings";
import { stringList } from "aws-sdk/clients/datapipeline";
export async function getMatchesFromEmbedding(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = client.Index("chatpdf-ai-context-db");
    const fileKeyIdentifier = convertToAscii(fileKey);
    // Add Code here to query the pineconeIndex looking for:
    //     topK: 5,
    //   vector: embeddings,
    //   includeMetadata: true,
    // fileKeyIdentifier: fileKeyIdentifier
    const queryResponse = await pineconeIndex.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    // console.log("Query Responses before filter: ", queryResponse);

    // Filter the results based on the fileKeyIdentifier metadata
    const filteredResults = queryResponse.matches.filter((result) => {
      return result.metadata?.fileKeyIdentifier === fileKeyIdentifier;
    });
    // console.log("Filtered query based on fileKey: ", filteredResults);
    return filteredResults;
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbedding(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => {
    // console.log("metadata for this match is: ", match.metadata!.text);
    return (match.metadata as Metadata).text;
  });
  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}
