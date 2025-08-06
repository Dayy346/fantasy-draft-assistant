const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
console.log("Reading CSV file...");

const filePath = path.join(__dirname, "data", "rb_2024_clean.csv");

const results = [];

fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
        // results.push(row);
        const name = row.player;
        const games = parseFloat(row.games);
        const totalPoints = parseFloat(row.fantasy_points);

        // adding a error check to skip data if bad
        if (isNaN(games) || isNaN(totalPoints) || games === 0) return;

        const ppg = totalPoints / games;
        
        const touches = parseFloat(row.att) + parseFloat(row.rec);
        const ppt = touches ? parseFloat((totalPoints/touches).toFixed(2)) : 0;

        const player = {
            name,
            games,
            total_points: totalPoints,
            points_per_game: parseFloat(ppg.toFixed(2)),
            touches,
            points_per_touch: ppt

        };

        results.push(player);
    })
    .on("end",() => {
        const outputPath = path.join(__dirname, "data", "rb_2024_transformed.json");

        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        
        console.log(`saved ${results.length} players to rb_2024_transformed.json`);
        // console.log(results); to check if the array acc took the players
    })