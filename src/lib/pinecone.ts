import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import md5 from "md5";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
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

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> download and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download pdf from s3!");
  }
  console.log("Successfully retrieved file and stored at: ", file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. further split and segment the pages into list of documents
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  // const vectors = await Promise.all(documents.flat().map(embedDocument));
  const delayBetweenAPICalls = 60000; // 60 seconds to stay within the rate limit
  const flattenedDocuments = documents.flat();

  console.log("Number of documents:", flattenedDocuments.length);

  const vectors = [];
  for (const doc of flattenedDocuments) {
    const embeddedDoc = await embedDocument(doc);
    vectors.push(embeddedDoc);
    if (flattenedDocuments.length >= 3) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenAPICalls));
    }
  }

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.Index("chatpdf-ai-context-db");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);
  // return pages;
  return documents[0];
}
async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // Use Recursive Splitter to split the page content
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        metadata: {
          pageNumber: metadata.loc.pageNumber,
          text: truncateStringByBytes(pageContent, 36000),
        },
      },
    }),
  ]);
  return docs;
}
