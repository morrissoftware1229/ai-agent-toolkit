const fs = require("node:fs/promises");

function extractWalkingDistanceByDate(xml) {
  const distanceByDate = {};

  const recordRegex =
    /<Record type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*>/g;

  let match;

  while ((match = recordRegex.exec(xml)) !== null) {
    const record = match[0];

    const unitMatch = record.match(/\bunit="([^"]+)"/);
    const startDateMatch = record.match(/\bstartDate="([^"]+)"/);
    const valueMatch = record.match(/\bvalue="([^"]+)"/);

    if (!unitMatch || !startDateMatch || !valueMatch) {
      continue;
    }

    const unit = unitMatch[1];
    const startDate = startDateMatch[1];
    const value = Number.parseFloat(valueMatch[1]);

    if (unit !== "mi") {
      continue;
    }

    if (!Number.isFinite(value)) {
      continue;
    }

    const day = toIsoDate(startDate);

    if (!distanceByDate[day]) {
      distanceByDate[day] = 0;
    }

    distanceByDate[day] += value;
  }

  return distanceByDate;
}

function toIsoDate(appleDateString) {
  const date = new Date(appleDateString);
  return date.toISOString().slice(0, 10);
}

async function main() {
  const xml = await fs.readFile(".\\docs\\apple_health_export\\export.xml", "utf8");
  const distanceByDate = extractWalkingDistanceByDate(xml);

  const outputText = Object.keys(distanceByDate)
    .sort()
    .map((date) => `${date}: ${distanceByDate[date]}`)
    .join("\n");

  await fs.writeFile(
    "C:\\Users\\morri\\source\\repos\\ai-agent-toolkit\\formatted_docs\\walking-distances.txt",
    outputText,
    "utf8"
  );
}


main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
