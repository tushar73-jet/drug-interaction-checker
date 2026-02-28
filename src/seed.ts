const fs = require("fs")
const csv = require("csv-parser")

type CsvRow = Record<string, string>

const results: CsvRow[] = []

fs.createReadStream("data/db_drug_interactions.csv")
  .pipe(csv())
  .on("data", (data: CsvRow) => {
    results.push(data)
  })
  .on("end", () => {
    console.log("CSV Loaded Successfully")
    console.log(results.slice(0, 5))
})