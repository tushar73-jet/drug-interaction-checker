import { PrismaClient } from '../generated/prisma/client'
import Database from 'better-sqlite3'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const fs = require("fs")
const csv = require("csv-parser")

const adapter = new PrismaBetterSqlite3({ url: 'data/dev.db' })
const prisma = new PrismaClient({ adapter })
type CsvRow = Record<string, string>

async function main() {
  const results: any[] = []

  await new Promise((resolve, reject) => {
    fs.createReadStream("data/db_drug_interactions.csv")
      .pipe(csv())
      .on("data", (data: CsvRow) => {
        results.push({
          drug1: data['Drug 1'],
          drug2: data['Drug 2'],
          description: data['Interaction Description']
        })
      })
      .on("end", resolve)
      .on("error", reject)
  })

  console.log(`CSV Loaded Successfully: ${results.length} rows.`)

  const BATCH_SIZE = 5000;
  let inserted = 0;

  console.log("Seeding to SQLite with Prisma...")
  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE)
    await prisma.drugInteraction.createMany({
      data: batch
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