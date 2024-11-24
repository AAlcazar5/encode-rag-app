// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  IndexDict,
  OpenAI,
  RetrieverQueryEngine,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

type Input = {
  query: string;
  topK?: number;
  nodesWithEmbedding: {
    text: string;
    embedding: number[];
  }[];
  temperature: number;
  topP: number;
};

type Character = {
  name: string;
  description: string;
  personality: string;
};

type Output = {
  error?: string;
  payload?: {
    characters: Character[];
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, topK, nodesWithEmbedding, temperature, topP }: Input =
    req.body;

  const embeddingResults = nodesWithEmbedding.map((config) => {
    return new TextNode({ text: config.text, embedding: config.embedding });
  });
  const indexDict = new IndexDict();
  for (const node of embeddingResults) {
    indexDict.addNode(node);
  }

  const index = await VectorStoreIndex.init({
    indexStruct: indexDict,
    serviceContext: serviceContextFromDefaults({
      llm: new OpenAI({
        model: "gpt-4",
        temperature: temperature,
        topP: topP,
      }),
    }),
  });

  index.vectorStore.add(embeddingResults);
  if (!index.vectorStore.storesText) {
    await index.docStore.addDocuments(embeddingResults, true);
  }
  await index.indexStore?.addIndexStruct(indexDict);
  index.indexStruct = indexDict;

  const retriever = index.asRetriever();
  retriever.similarityTopK = topK ?? 2;

  const queryEngine = new RetrieverQueryEngine(retriever);

  const result = await queryEngine.query(query);

  // Log the response for debugging
  console.log("Query response:", result.response);

  let characters: Character[] = [];
  try {
    // Transform the plain text response into structured JSON
    const entries = result.response
      .split("\n")
      .filter((line) => line.trim() !== "");
    characters = entries
      .map((entry) => {
        const match = entry.match(
          /Name:\s*(.*?),\s*Description:\s*(.*?),\s*Personality:\s*(.*)/,
        );
        if (match) {
          return {
            name: match[1].trim(),
            description: match[2].trim(),
            personality: match[3].trim(),
          };
        }
        return null;
      })
      .filter((character) => character !== null) as Character[];
  } catch (error) {
    console.error("Failed to parse response:", error);
    res.status(500).json({ error: "Failed to parse response" });
    return;
  }

  res.status(200).json({ payload: { characters } });
}
