import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent } from "react";

type FileUploadProps = {
  sourceId: string;
  text: string;
  setText: (value: string) => void;
  setNeedsNewIndex: (value: boolean) => void;
};

export function FileUpload({
  sourceId,
  text,
  setText,
  setNeedsNewIndex,
}: FileUploadProps) {
  return (
    <div className="my-2 flex h-3/4 flex-auto flex-col space-y-2">
      <Label htmlFor={sourceId}>Upload source text file:</Label>
      <Input
        id={sourceId}
        type="file"
        accept=".txt"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const fileContent = event.target?.result as string;
              setText(fileContent);
              setNeedsNewIndex(true);
            };
            if (file.type !== "text/plain") {
              console.error(`${file.type} parsing not implemented`);
              setText("Error");
            } else {
              reader.readAsText(file);
            }
          }
        }}
      />
      {text && (
        <Textarea
          value={text}
          readOnly
          placeholder="File contents will appear here"
          className="flex-1"
        />
      )}
    </div>
  );
}
