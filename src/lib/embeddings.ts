import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  if (!text) {
    throw new Error("Empty string passed into getEmbeddings function");
  }
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });
    const result = await response.json();
    if (!result.error) {
      console.log(result);
      return result.data[0].embedding as number[];
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.log("error calling openai embeddings api", error);
    throw error;
  }
}
