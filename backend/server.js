const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
console.log("Reading CSV file...");

const filePath = path.join(__dirname, "data", "rb_2024_clean.csv");

const results = [];

fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
        results.push(row);
    })
    .on("end",() => {
        console.log("CSV Parsed");
        console.log(results);
    })