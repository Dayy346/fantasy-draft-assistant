# Fantasy Draft Assistant - Metrics Documentation

This document explains the mathematical formulas and methodology used in the Fantasy Draft Assistant.

## Base Metrics

### Points Per Game (PPG)
**Formula**: `PPG = Total Fantasy Points / Games Played`

The most fundamental metric, representing a player's average fantasy production per game.

### Points Per Touch (PPT)
**Formula**: `PPT = Total Fantasy Points / Total Touches`

Measures efficiency with the ball in hand. Higher values indicate more productive touches.

### Opportunities Per Game (OPPG)
**Formula**: `OPPG = (Rush Attempts + Targets) / Games Played`

Quantifies how often a player gets the ball, regardless of outcome.

### Yards Per Carry (YPC)
**Formula**: `YPC = Rushing Yards / Rush Attempts`

Running back efficiency metric. Higher values indicate better rushing ability.

### Yards Per Reception (YPR)
**Formula**: `YPR = Receiving Yards / Receptions`

Receiving efficiency metric for pass-catchers.

## Advanced Metrics

### 3-Year Weighted Averages

All metrics are computed using a recency-weighted average over the last 3 seasons:

**Formula**: `Weighted_Value = 0.6 × Year1 + 0.3 × Year2 + 0.1 × Year3`

This gives more weight to recent performance while still considering historical data.

### Position-Adjusted Z-Scores

Z-scores normalize player performance relative to their position:

**Formula**: `Z_Score = (Player_Value - Position_Mean) / Position_Standard_Deviation`

This allows fair comparison across different positions and scoring environments.

### Composite Draft Score

A weighted combination of z-scores that varies by position:

#### Running Backs
```
Draft_Score = 0.40 × Z(PPG) + 0.20 × Z(PPT) + 0.15 × Z(OPPG) + 0.10 × Z(YPC) - 0.10 × Z(Injury_Risk) + 0.05 × Z(Consistency)
```

#### Wide Receivers
```
Draft_Score = 0.35 × Z(PPG) + 0.25 × Z(PPT) + 0.20 × Z(OPPG) + 0.10 × Z(YPR) - 0.05 × Z(Injury_Risk) + 0.05 × Z(Consistency)
```

#### Tight Ends
```
Draft_Score = 0.30 × Z(PPG) + 0.25 × Z(PPT) + 0.20 × Z(OPPG) + 0.15 × Z(YPR) - 0.05 × Z(Injury_Risk) + 0.05 × Z(Consistency)
```

#### Quarterbacks
```
Draft_Score = 0.50 × Z(PPG) + 0.20 × Z(PPT) + 0.15 × Z(OPPG) - 0.10 × Z(Injury_Risk) + 0.05 × Z(Consistency)
```

### Value Over Replacement Player (VORP)

**Formula**: `VORP = Projected_PPG - Replacement_Level_PPG`

Replacement levels by position:
- QB: QB12 (12th best QB)
- RB: RB30 (30th best RB)
- WR: WR36 (36th best WR)
- TE: TE12 (12th best TE)

## Rookie Projections

### Draft Capital Score
**Formula**: `Draft_Capital = 100 - (Round - 1) × 20 + (20 - (Pick - 1) × 0.5)`

Higher draft capital indicates better NFL prospects.

### College Production Score
**Formula**: `College_Score = min(100, (College_Yards_Per_Game / 100) × 100)`

Normalizes college production on a 0-100 scale.

### Combine Score
**Formula**: `Combine_Score = min(100, ((4.8 - 40_Time) / 0.4) × 100)`

Converts 40-yard dash times to a 0-100 scale.

### Rookie Score
**Formula**: `Rookie_Score = 0.50 × Draft_Capital + 0.30 × College_Production + 0.20 × Combine_Score`

### Projected PPG
**Formula**: `Projected_PPG = Base_PPG + (Rookie_Score × (Max_PPG - Base_PPG))`

Where:
- Base_PPG = 8 (minimum expected for rookies)
- Max_PPG = 20 (maximum expected for top rookies)

## Injury Risk Proxy

Currently uses games missed as a simple proxy:

**Formula**: `Injury_Risk = max(0, (Expected_Games - Games_Played) / Expected_Games)`

Where Expected_Games = 17 (full season).

## Consistency

**Formula**: `Consistency = 1 - (Standard_Deviation_of_Weekly_Points / Mean_Weekly_Points)`

Higher values indicate more consistent weekly performance.

## Data Sources

- **NFL Statistics**: Official NFL game logs and statistics
- **Fantasy Points**: Standard PPR scoring (1 point per reception)
- **Draft Information**: NFL Draft results and college statistics
- **Combine Data**: NFL Scouting Combine measurements

## Methodology Notes

1. **Sample Size**: Minimum 8 games required for meaningful statistics
2. **Position Groups**: Metrics calculated separately for each position
3. **Outliers**: Extreme values are capped but not removed
4. **Missing Data**: Gracefully handled with appropriate defaults
5. **Transparency**: All formulas are documented and configurable

## Configuration

All weights and thresholds can be adjusted in `backend/src/lib/config.ts` to fine-tune the scoring system based on league settings or user preferences.

## Validation

The scoring system is validated against:
- Historical draft performance
- Expert consensus rankings
- Fantasy football success metrics
- Statistical significance tests

This ensures the metrics provide meaningful insights for draft decisions.
