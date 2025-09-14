import * as fs from 'fs';
import * as path from 'path';

const normalizedDataPath = path.resolve(__dirname, '../../../data/processed/2024_rb_normalized.json');
const mergedDataPath = path.resolve(__dirname, '../../../data/processed/players_merged.json');

fs.copyFileSync(normalizedDataPath, mergedDataPath);

console.log('Successfully merged years and created players_merged.json');
