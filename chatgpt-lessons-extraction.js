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

  const inputPath = ".\\conversations\\chatgpt-transcripts.txt";
  const outputPath =
    "C:\\Users\\morri\\Documents\\LifeManagement\\LifeManagement\\chat-summary.md";

  const transcript = await fs.readFile(inputPath, "utf8");

  if (!transcript.trim()) {
    throw new Error("Input file is empty.");
  }

  const result = await summarizeConversation(transcript);
  await fs.appendFile(outputPath, result, "utf8");

  console.log(`Wrote summary to ${outputPath}`);
}

async function summarizeConversation(transcript) {
  const response = await client.responses.create({
    model: "gpt-5",
    input: `
    You are reviewing a large transcript of my ChatGPT conversations to extract durable personal knowledge.

    Your job is not to summarize everything. Your job is to identify the most valuable things I learned and the concrete actions I should take.

    Write a Markdown note with exactly these sections:

    # Chat Summary

    ## What I Learned

    Group items into short topical categories when helpful. For each item:
    - include only durable insights, clarified concepts, best practices, decisions, or patterns
    - prefer insights that are useful again later
    - merge duplicates and rephrase repeated ideas into one stronger statement
    - do not include trivia, filler, or one-off conversational chatter
    - do not include things that were merely asked but never answered
    - keep each bullet concise but specific

    ## Actions To Take

    Include only concrete follow-up actions for me. For each item:
    - use an action verb at the start
    - include only actions that are actually implied by the conversation
    - do not invent tasks that were never suggested
    - merge duplicates
    - keep each bullet specific enough that I could act on it later

    Additional rules:
    - prioritize quality over coverage
    - it is better to return fewer strong items than many weak ones
    - avoid repeating the same point in different wording
    - write for future review in an Obsidian note
    - if a section has nothing valuable, write "None"

    Transcript:
    ${transcript}
    `

  });

  return response.output_text;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
