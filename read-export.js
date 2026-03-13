const fs = require("node:fs/promises");
const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const inputPath = ".\\conversations\\out.txt";
  const outputPath =
    "C:\\Users\\morri\\Documents\\LifeManagement\\LifeManagement\\chat-summary.md";

  const transcript = await fs.readFile(inputPath, "utf8");

  if (!transcript.trim()) {
    throw new Error("Input file is empty.");
  }

  const result = await summarizeConversation(transcript);
  await fs.writeFile(outputPath, result, "utf8");

  console.log(`Wrote summary to ${outputPath}`);
}

async function summarizeConversation(transcript) {
  const response = await client.responses.create({
    model: "gpt-5",
    input: `
You are extracting useful information from a ChatGPT conversation.

Return a series of bulleted items that show what I learned from our conversations in different categories.

Rules:
- The name of the category should appear before the items in that category.
- Keep items concise
- Keep items actionable.
- Do not include duplicates
- If nothing fits, return an empty array

Conversation:
${transcript}
`
  });

  return response.output_text;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
