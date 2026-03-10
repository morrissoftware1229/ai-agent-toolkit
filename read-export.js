const fs = require("node:fs/promises");

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: node read-export.js <path-to-conversations.json>");
    process.exit(1);
  }

  const raw = await fs.readFile(filePath, "utf8");
  const conversations = JSON.parse(raw);

  if (!Array.isArray(conversations)) {
    throw new Error("Expected conversations.json to contain an array.");
  }

  console.log(`Conversations found: ${conversations.length}`);

  const first = conversations[0];
  console.log(`First title: ${first?.title ?? "Untitled chat"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});