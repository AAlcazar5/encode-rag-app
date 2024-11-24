import { Button } from "@/components/ui/button";
import { CharacterTable } from "@/components/ui/charactertable";
import { FileUpload } from "@/components/ui/fileupload";
import { LinkedSlider } from "@/components/ui/linkedslider";
import { Settings } from "@/components/ui/settings";
import { StoryGenerator } from "@/components/ui/storygenerator";
import Head from "next/head";
import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_CHUNK_SIZE = 1024;
const DEFAULT_CHUNK_OVERLAP = 20;
const DEFAULT_TOP_K = 2;
const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_TOP_P = 1;

type Character = {
  name: string;
  description: string;
  personality: string;
};

export default function Home() {
  const answerId = useId();
  const queryId = useId();
  const sourceId = useId();
  const [text, setText] = useState("");
  const [query, setQuery] = useState(
    "List the name, description, and personality of every character. Ensure to distinctly list the characters as such: Name: Mario, Description: An Italian Plumber with superpowers, Personality: Brave.",
  );
  const [needsNewIndex, setNeedsNewIndex] = useState(true);
  const [buildingIndex, setBuildingIndex] = useState(false);
  const [runningQuery, setRunningQuery] = useState(false);
  const [nodesWithEmbedding, setNodesWithEmbedding] = useState([]);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE.toString());
  const [chunkOverlap, setChunkOverlap] = useState(
    DEFAULT_CHUNK_OVERLAP.toString(),
  );
  const [topK, setTopK] = useState(DEFAULT_TOP_K.toString());
  const [temperature, setTemperature] = useState(
    DEFAULT_TEMPERATURE.toString(),
  );
  const [topP, setTopP] = useState(DEFAULT_TOP_P.toString());
  const [answer, setAnswer] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [characters, answer]);

  const generateStory = async () => {
    if (characters.length === 0) {
      console.warn("No characters available to generate a story.");
      return;
    }

    const characterDetails = characters
      .map(
        (char) =>
          `Name: ${char.name}, Description: ${char.description}, Personality: ${char.personality}`,
      )
      .join("\n");

    const storyPrompt = `You are a professional storyteller. Write a single captivating and imaginative short story that includes the following characters. Ensure the story is unique and memorable, with compelling characters and unexpected plot twists. Here are the characters for your story:\n${characterDetails}`;

    console.log("Sending story prompt:", storyPrompt);

    try {
      const response = await fetch("/api/generateStory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: storyPrompt }),
      });

      if (!response.ok) {
        console.error("Failed to generate story:", response.statusText);
        setAnswer("Story generation failed.");
        return;
      }

      const { story } = await response.json();
      console.log("Received story:", story);
      setAnswer(story || "Story generation failed.");
    } catch (error) {
      console.error("Error during story generation:", error);
      setAnswer("Story generation failed.");
    }
  };

  return (
    <>
      <Head>
        <title>LlamaIndex.TS Playground</title>
      </Head>
      <main className="mx-2 flex h-full flex-col lg:mx-56">
        <Settings
          chunkSize={chunkSize}
          setChunkSize={setChunkSize}
          chunkOverlap={chunkOverlap}
          setChunkOverlap={setChunkOverlap}
          setNeedsNewIndex={setNeedsNewIndex}
        />
        <FileUpload
          sourceId={sourceId}
          text={text}
          setText={setText}
          setNeedsNewIndex={setNeedsNewIndex}
        />
        <Button
          className="w-full"
          disabled={!needsNewIndex || buildingIndex || runningQuery}
          onClick={async () => {
            setAnswer("Building index...");
            setBuildingIndex(true);
            setNeedsNewIndex(false);
            const result = await fetch("/api/splitandembed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                document: text,
                chunkSize: parseInt(chunkSize),
                chunkOverlap: parseInt(chunkOverlap),
              }),
            });
            const { error, payload } = await result.json();

            if (error) {
              setAnswer(error);
            }

            if (payload) {
              setNodesWithEmbedding(payload.nodesWithEmbedding);
              setAnswer("Index built!");
            }

            setBuildingIndex(false);
          }}
        >
          {buildingIndex ? "Building Vector index..." : "Build index"}
        </Button>

        {!buildingIndex && !needsNewIndex && (
          <>
            <LinkedSlider
              className="my-2"
              label="Top K:"
              description={
                "The maximum number of chunks to return from the search. " +
                "It's called Top K because we are retrieving the K nearest neighbors of the query."
              }
              min={1}
              max={15}
              step={1}
              value={topK}
              onChange={(value: string) => {
                setTopK(value);
              }}
            />

            <LinkedSlider
              className="my-2"
              label="Temperature:"
              description={
                "Temperature controls the variability of model response. Adjust it " +
                "downwards to get more consistent responses, and upwards to get more diversity."
              }
              min={0}
              max={1}
              step={0.01}
              value={temperature}
              onChange={(value: string) => {
                setTemperature(value);
              }}
            />

            <LinkedSlider
              className="my-2"
              label="Top P:"
              description={
                "Top P is another way to control the variability of the model " +
                "response. It filters out low probability options for the model. It's " +
                "recommended by OpenAI to set temperature to 1 if you're adjusting " +
                "the top P."
              }
              min={0}
              max={1}
              step={0.01}
              value={topP}
              onChange={(value: string) => {
                setTopP(value);
              }}
            />

            <div className="my-2 space-y-2">
              <Button
                id={queryId}
                type="submit"
                className="w-full"
                disabled={needsNewIndex || buildingIndex || runningQuery}
                onClick={async () => {
                  setRunningQuery(true);
                  const result = await fetch("/api/retrieveandquery", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      query,
                      nodesWithEmbedding,
                      topK: parseInt(topK),
                      temperature: parseFloat(temperature),
                      topP: parseFloat(topP),
                    }),
                  });

                  const { error, payload } = await result.json();

                  if (error) {
                    setAnswer(error);
                  }

                  if (payload) {
                    setCharacters(payload.characters);
                  }

                  setRunningQuery(false);
                }}
              >
                {runningQuery
                  ? "Retrieving Characters..."
                  : "List Characters from Story"}
              </Button>
            </div>
            {characters.length > 0 && (
              <CharacterTable characters={characters} />
            )}
            <StoryGenerator
              generateStory={generateStory}
              characters={characters}
              answer={answer}
            />
          </>
        )}
        <div ref={bottomRef} />
      </main>
    </>
  );
}
