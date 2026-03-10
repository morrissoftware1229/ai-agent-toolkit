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

  if (!first) {
    throw new Error("No conversations found.");
  }

  const mapping = first.mapping;

  if (!mapping || typeof mapping !== "object") {
    throw new Error("Expected first conversation to contain a mapping object.");
  }

  const nodes = Object.values(mapping);

  for (const node of nodes) {
    const message = node.message;

    if (!message) {
      continue;
    }

    const role = message.author?.role ?? "unknown";
    const parts = message.content?.parts;

    if (!Array.isArray(parts)) {
      continue;
    }

    const text = parts.join(" ");

    console.log(`${role}: ${text}`);
  }

  console.log(`First title: ${first?.title ?? "Untitled chat"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});