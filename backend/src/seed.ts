import prisma from './db/prismaClient'
const fs = require("fs")
const csv = require("csv-parser")

type CsvRow = Record<string, string>

// Normalize to title-case so all stored names are consistent regardless of source formatting.
const normalizeDrugName = (name: string): string =>
    name.trim().replace(/\w\S*/g, (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

async function main() {
  const results: any[] = []

  if (!fs.existsSync("data/db_drug_interactions.csv")) {
    console.error("CSV file not found at data/db_drug_interactions.csv");
    return;
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream("data/db_drug_interactions.csv")
      .pipe(csv())
      .on("data", (data: CsvRow) => {
        const description = (data['Interaction Description'] || "").trim();
        let severity = "Moderate";

        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes("fatal") || lowerDesc.includes("severe") || lowerDesc.includes("major") || lowerDesc.includes("life-threatening")) {
          severity = "Major";
        } else if (lowerDesc.includes("minor") || lowerDesc.includes("mild") || lowerDesc.includes("weak")) {
          severity = "Minor";
        }

        results.push({
          drug1: normalizeDrugName(data['Drug 1']),
          drug2: normalizeDrugName(data['Drug 2']),
          description: description,
          severity: severity
        })
      })
      .on("end", resolve)
      .on("error", reject)
  })

  console.log(`CSV Loaded Successfully: ${results.length} rows.`)

  // Extract all unique drugs for master table
  const drugNames = Array.from(new Set(results.flatMap(r => [r.drug1, r.drug2])));
  
  console.log("Seeding Master Drug Table...")
  await prisma.drug.deleteMany({});
  await prisma.drug.createMany({
    data: drugNames.map(name => ({ name }))
  });

  const allDrugs = await prisma.drug.findMany();
  const drugMap = new Map(allDrugs.map(d => [d.name, d.id]));

  console.log("Cleaning existing interactions...")
  await prisma.drugInteraction.deleteMany({});

  const BATCH_SIZE = 1000;
  let inserted = 0;

  console.log("Seeding interactions for normalized schema...")
  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE)
    await prisma.drugInteraction.createMany({
      data: batch.map(r => ({
        drug1Id: drugMap.get(r.drug1)!,
        drug2Id: drugMap.get(r.drug2)!,
        description: r.description,
        severity: r.severity
      }))
    })
    inserted += batch.length;
    console.log(`Inserted ${inserted} / ${results.length}`)
  }

  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })