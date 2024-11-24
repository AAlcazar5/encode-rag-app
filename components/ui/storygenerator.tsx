import { Button } from "@/components/ui/button";
import { useState } from "react";

type Character = {
  name: string;
  description: string;
  personality: string;
};

type StoryGeneratorProps = {
  generateStory: () => Promise<void>; // Assuming generateStory is async
  characters: Character[];
  answer: string;
};

export function StoryGenerator({
  generateStory,
  characters,
  answer,
}: StoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      await generateStory();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="my-2 space-y-2">
      <Button
        className="w-full"
        onClick={handleGenerateStory}
        disabled={characters.length === 0 || isGenerating}
      >
        {isGenerating ? "Generating" : "Generate Story"}
      </Button>
      {answer && (
        <div
          className="mt-4 rounded bg-gray-700 p-4 text-white"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
