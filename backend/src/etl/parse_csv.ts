import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const rawDataPath = path.resolve(__dirname, '../../../data/raw/2024_rb.csv');
const processedDataPath = path.resolve(__dirname, '../../../data/processed/2024_rb.json');

const results: any[] = [];

fs.createReadStream(rawDataPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    fs.writeFileSync(processedDataPath, JSON.stringify(results, null, 2));
    console.log('Successfully parsed 2024_rb.csv and created 2024_rb.json');
  });
