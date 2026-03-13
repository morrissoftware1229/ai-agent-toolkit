const fs = require("node:fs/promises");

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: node graph-traversal.js <path-to-conversations.json>");
    process.exit(1);
  }

  const raw = await fs.readFile(filePath, "utf8");
  const conversations = JSON.parse(raw);

  if (!Array.isArray(conversations)) {
    throw new Error("Expected conversations.json to contain an array.");
  }

  const firstConversation = conversations[0];

  if (!firstConversation) {
    throw new Error("No conversations found.");
  }

  const orderedMessages = getOrderedMessages(firstConversation);

  const lines = [];

  for (const message of orderedMessages) {
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

  const transcript = lines.join("\n\n");

  await fs.writeFile(
    "C:\\Users\\morri\\source\\repos\\ai-agent-toolkit\\conversations\\out.txt",
    transcript,
    "utf8"
  );

  console.log("Wrote transcript to out.txt");
}

function getOrderedMessages(conversation) {
  const mapping = conversation.mapping;

  if (!mapping || typeof mapping !== "object") {
    throw new Error("Expected a mapping object.");
  }

  const ordered = [];
  let nodeId = conversation.current_node;

  if (!nodeId) {
    throw new Error("Expected conversation.current_node to exist.");
  }

  while (nodeId) {
    const node = mapping[nodeId];

    if (!node) {
      break;
    }

    if (node.message) {
      ordered.push(node.message);
    }

    nodeId = node.parent;
  }

  ordered.reverse();
  return ordered;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
