// embeddings.ts
import axios from "axios";

// Ensure that the OPENAI_API_KEY is set in your environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL =
  "https://api.openai.com/v1/engines/text-embedding-ada-002/embeddings";

export default async function getEmbeddings(text: string): Promise<number[]> {
  if (!text) {
    throw new Error("Empty string passed into getEmbeddings function");
  }

  try {
    // Replace newlines with spaces in the text input
    text = text.replace(/\n/g, " ");

    // Make a POST request to the OpenAI API
    const response = await axios.post(
      OPENAI_API_URL,
      { input: text },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the embedding from the response
    const embedding = response.data.data[0].embedding;
    // console.log("Embedding:", embedding);
    return embedding;
  } catch (error) {
    console.error("Error calling OpenAI createEmbedding API:", error);
    // Rethrow the error to be handled by the caller
    throw error;
  }
}
