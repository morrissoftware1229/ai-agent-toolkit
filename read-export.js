const fs = require("node:fs/promises");
const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: node read-export.js <path-to-conversations.json>");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const raw = await fs.readFile(filePath, "utf8");
  const conversations = JSON.parse(raw);

  if (!Array.isArray(conversations)) {
    throw new Error("Expected conversations.json to contain an array.");
  }

  const first = conversations[0];

  if (!first) {
    throw new Error("No conversations found.");
  }

  const transcript = formatConversation(first);
  const result = await summarizeConversation(transcript);

  const outputPath = "C:\\Users\\morri\\Documents\\LifeManagement\\LifeManagement\\chat-summary.md";
  await fs.writeFile(outputPath, result, "utf8");
}

function formatConversation(conversation) {
  const mapping = conversation.mapping;

  if (!mapping || typeof mapping !== "object") {
    throw new Error("Expected conversation to contain a mapping object.");
  }

  const lines = [];

  for (const node of Object.values(mapping)) {
    const message = node.message;
    if (!message) {
      continue;
    }

    const role = message.author?.role ?? "unknown";
    const parts = message.content?.parts;
    if (!Array.isArray(parts)) {
      continue;
    }

    const text = parts.join(" ").trim();
    if (!text) {
      continue;
    }

    lines.push(`${role}: ${text}`);
  }

  return lines.join("\n");
}

async function summarizeConversation(transcript) {
  const response = await client.responses.create({
    model: "gpt-5",
    input: `
You are extracting useful information from a ChatGPT conversation.

Return JSON with this exact shape:
{
  "learned": ["..."],
  "actions": ["..."]
}

Rules:
- "learned" should contain important things the user learned or clarified
- "actions" should contain concrete follow-up tasks
- Keep items concise
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
