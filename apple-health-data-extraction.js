const fs = require("node:fs/promises");

function extractWalkingDistanceByDate(xml) {
  console.log("Starting walking distance extraction...");

  const distanceByDate = {};
  const recordRegex =
    /<Record type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*>/g;

  let match;
  let matchCount = 0;

  while ((match = recordRegex.exec(xml)) !== null) {
    matchCount += 1;

    if (matchCount % 10000 === 0) {
      console.log(`Matched ${matchCount} walking distance records...`);
    }

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

    if (unit !== "mi" || !Number.isFinite(value)) {
      continue;
    }

    const day = toIsoDate(startDate);

    if (!distanceByDate[day]) {
      distanceByDate[day] = 0;
    }

    distanceByDate[day] += value;
  }

  console.log(`Finished walking extraction. Total matches: ${matchCount}`);
  return distanceByDate;
}

function extractWeightEntries(xml) {
  console.log("Starting weight extraction...");

  const weights = [];
  const observationRegex =
    /<observation[\s\S]*?<type>HKQuantityTypeIdentifierBodyMass<\/type>[\s\S]*?<\/observation>/g;

  let match;
  let matchCount = 0;

  while ((match = observationRegex.exec(xml)) !== null) {
    matchCount += 1;

    const observation = match[0];

    const valueMatch = observation.match(/<value>([^<]+)<\/value>/);
    const lowDateMatch = observation.match(/<low value="([^"]+)"/);
    const unitMatch = observation.match(/<unit>([^<]+)<\/unit>/);

    if (!valueMatch || !lowDateMatch || !unitMatch) {
      continue;
    }

    const value = Number.parseFloat(valueMatch[1]);
    const rawDate = lowDateMatch[1];
    const unit = unitMatch[1];

    if (!Number.isFinite(value)) {
      continue;
    }

    weights.push({
      date: toIsoDate(rawDate),
      value,
      unit
    });
  }

  console.log(`Finished weight extraction. Total matches: ${matchCount}`);
  return weights;
}

function toIsoDate(dateString) {
  const normalized = dateString.replace(
    /^(\d{4})(\d{2})(\d{2}).*/,
    "$1-$2-$3"
  );

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const date = new Date(dateString);
  return date.toISOString().slice(0, 10);
}

function formatDistanceByDate(distanceByDate) {
  return Object.keys(distanceByDate)
    .sort()
    .map((date) => `${date}: ${distanceByDate[date]}`)
    .join("\n");
}

function formatWeightEntries(weights) {
  return weights
    .map((entry) => `${entry.date}: ${entry.value} ${entry.unit}`)
    .join("\n");
}

async function main() {
  console.log("Reading export.xml...");
  const exportXml = await fs.readFile(
    ".\\docs\\apple_health_export\\export.xml",
    "utf8"
  );
  console.log("Finished reading export.xml");

  console.log("Reading export_cda.xml...");
  const exportCdaXml = await fs.readFile(
    ".\\docs\\apple_health_export\\export_cda.xml",
    "utf8"
  );
  console.log("Finished reading export_cda.xml");

  const distanceByDate = extractWalkingDistanceByDate(exportXml);
  console.log(`Walking distance days found: ${Object.keys(distanceByDate).length}`);

  const weights = extractWeightEntries(exportCdaXml);
  console.log(`Weight entries found: ${weights.length}`);

  const walkingOutput = formatDistanceByDate(distanceByDate);
  const weightOutput = formatWeightEntries(weights);

  console.log("Writing walking-distances.txt...");
  await fs.writeFile(
    ".\\formatted_docs\\walking-distances.txt",
    walkingOutput,
    "utf8"
  );
  console.log("Finished writing walking-distances.txt");

  console.log("Writing weights.txt...");
  await fs.writeFile(
    ".\\formatted_docs\\weights.txt",
    weightOutput,
    "utf8"
  );
  console.log("Finished writing weights.txt");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
