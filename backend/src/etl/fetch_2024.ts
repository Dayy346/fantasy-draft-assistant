import * as fs from 'fs';
import * as path from 'path';

const sourcePath = path.resolve(__dirname, '../../../data/rb_2024_clean.csv');
const destPath = path.resolve(__dirname, '../../../data/raw/2024_rb.csv');

fs.copyFileSync(sourcePath, destPath);

console.log('Copied rb_2024_clean.csv to data/raw/2024_rb.csv');
