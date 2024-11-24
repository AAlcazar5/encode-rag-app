### Encode RAG App

This is a student project from the Encode academy built on top of the LlamaIndex TypeScript Playground (https://github.com/run-llama/ts-playground). The purpose of this app is to build the ability to extract characters from a story (in txt format) and list them in a table format utilizing a RAG pipeline. Once the characters have been extracted, they are then "remixed" into another new custom story utilizing the OpenAI API. 

## Getting Started

- Run `npm install` and `npm run dev`.
- Make sure to set your OpenAI key: `export OPENAI_API_KEY-="sk-..."`.
- Click on the "No file selected" file upload input.
- Once the file has been chosen, configure your settings (Chunk size, chunk overlap) click on the "Build Index" button.
- Wait a few seconds, then click on the "List Characters from the Story" button.
- Wait a few seconds, and inspect the table for characters. Once you're satisfied with the output, click on the "Generate Story" button to create a custom story with your characters.
- Enjoy the story!

