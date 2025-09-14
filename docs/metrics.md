# Fantasy Draft Assistant - Metrics Documentation

## Overview

This document describes the comprehensive metrics and calculations used in the Fantasy Draft Assistant to evaluate player performance across all positions (QB, RB, WR, TE) and generate draft recommendations.

## Core Metrics

### Points Per Game (PPG)
- **Definition**: Total fantasy points divided by games played
- **Calculation**: `fpts / games`
- **Usage**: Primary metric for overall player value across all positions

### Points Per Touch (PPT)
- **Definition**: Fantasy points per opportunity (carries + receptions)
- **Calculation**: `fpts / (att + rec)`
- **Usage**: Efficiency metric for skill position players (RB, WR, TE)

### Opportunities Per Game (OPPG)
- **Definition**: Total opportunities (carries + targets) per game
- **Calculation**: `(att + tgt) / games`
- **Usage**: Volume metric indicating usage (RB)

### Yards Per Carry (YPC)
- **Definition**: Rushing yards per carry
- **Calculation**: `rushYds / att`
- **Usage**: RB efficiency metric

### Yards Per Reception (YPR)
- **Definition**: Receiving yards per reception
- **Calculation**: `recvYds / rec`
- **Usage**: WR/TE efficiency metric

## Position-Specific Advanced Metrics

### Running Backs (RB)
- **Touches**: `att + rec` - Total opportunities
- **PPT**: Points per touch efficiency
- **OPPG**: Opportunities per game (volume)
- **YPC**: Yards per carry efficiency

### Wide Receivers (WR)
- **Targets Per Game (TPG)**: `tgt / games` - Volume metric
- **Yards Per Route Run (YPRR)**: `recvYds / routes` - Route efficiency
- **Yards Per Target (YPT)**: `recvYds / tgt` - Target efficiency
- **Average Depth of Target (aDOT)**: `airYds / tgt` - Target depth
- **PPT**: Points per touch efficiency

### Tight Ends (TE)
- **Targets Per Game (TPG)**: `tgt / games` - Volume metric
- **Yards Per Route Run (YPRR)**: `recvYds / routes` - Route efficiency
- **Yards Per Target (YPT)**: `recvYds / tgt` - Target efficiency
- **PPT**: Points per touch efficiency

### Quarterbacks (QB)
- **Yards Per Attempt (YPA)**: `passYds / passAtt` - Passing efficiency
- **Pass TD Rate**: `passTd / passAtt` - Touchdown efficiency
- **INT Rate**: `ints / passAtt` - Interception rate (negative)
- **Rushing PPG Index**: `(rushYds/10 + rushTd*6) / games` - Dual-threat ability

## Advanced Calculations

### 3-Year Weighted Average
- **Purpose**: Smooth out year-to-year variance and emphasize recent performance
- **Weights**: 
  - Year 1 (most recent): 60%
  - Year 2: 30%
  - Year 3: 10%
- **Calculation**: `(y1 * 0.6) + (y2 * 0.3) + (y3 * 0.1)`
- **Renormalization**: If years are missing, weights are adjusted proportionally

### Z-Scores
- **Purpose**: Normalize metrics across positions for fair comparison
- **Calculation**: `(value - mean) / standard_deviation`
- **Usage**: Position-specific standardization
- **Minimum Games**: Only players with ≥8 games included in cohort calculations

### Draft Score
- **Purpose**: Composite score combining multiple metrics with position-specific weights
- **Calculation**: Weighted sum of z-scores, renormalized if metrics are missing
- **Weights by Position**:
  - **RB**: PPG (40%), PPT (20%), OPPG (15%), YPC (10%), Injury (-10%), Consistency (5%)
  - **WR**: PPG (40%), TPG (20%), YPRR/YPT (15%), PPT (10%), aDOT (5%), Consistency (5%), Injury (-5%)
  - **TE**: PPG (45%), TPG (25%), YPRR/YPT (15%), PPT (10%), Consistency (5%)
  - **QB**: PPG (45%), Pass TD Rate (15%), YPA (10%), Rushing PPG Index (15%), INT Rate (-10%), Consistency (5%)

### VORP (Value Over Replacement Player)
- **Purpose**: Value above replacement-level player within position
- **Replacement Baselines** (12-team leagues):
  - RB: 30th ranked
  - WR: 36th ranked
  - TE: 12th ranked
  - QB: 12th ranked
- **Calculation**: `player_ppg_w - replacement_ppg_w`
- **Usage**: Position-relative value assessment

## Data Requirements

### Minimum Games Threshold
- **Value**: 8 games
- **Purpose**: Filter out small sample sizes that skew z-scores
- **Application**: Only players with ≥8 games included in cohort calculations

### Field Mapping
The system maps various data sources to canonical field names:
- **QB**: pass_att, pass_cmp, pass_yds, pass_td, ints, rush_att, rush_yds, rush_td
- **RB**: att, tgt, rec, rush_yds, recv_yds, total_td
- **WR/TE**: tgt, rec, recv_yds, rec_td, routes, air_yds

### Data Sources
- Fantasy points from standard scoring
- Game logs for per-game calculations
- 3+ years of data for weighted averages
- Position-specific advanced metrics where available
- Route data for WR/TE (optional, falls back to YPT)

## Implementation Details

### Scoring Pipeline
1. **Normalization**: Map raw data to canonical fields
2. **Derivation**: Calculate position-specific metrics
3. **Weighting**: Apply 3-year recency weights
4. **Z-Scoring**: Normalize within position cohorts
5. **Draft Scoring**: Combine weighted z-scores
6. **VORP**: Calculate value over replacement

### Error Handling
- **Division by Zero**: Safe division functions prevent crashes
- **Missing Data**: Graceful fallbacks (YPRR → YPT)
- **Weight Renormalization**: Adjusts weights when metrics are missing
- **Small Samples**: Filters out players with insufficient games

### Performance Considerations
- **Cohort Grouping**: Efficient position-based calculations
- **Batch Processing**: Handles large datasets
- **Memory Management**: Streams data processing
- **Caching**: Stores computed metrics for API responses

## Usage Examples

### API Sorting
```javascript
// Sort by draft score
GET /api/players?sortBy=draftScore&sortOrder=desc

// Sort by VORP
GET /api/players?sortBy=vorp&sortOrder=desc

// Sort by position-specific metrics
GET /api/players?position=QB&sortBy=ypa&sortOrder=desc
```

### Metric Interpretation
- **Draft Score > 1.0**: Elite tier players
- **Draft Score 0.0-1.0**: Solid starters
- **Draft Score < 0.0**: Bench/streaming options
- **VORP > 0**: Above replacement level
- **VORP < 0**: Below replacement level

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

## Configuration

All weights and thresholds can be adjusted in `backend/src/lib/config.ts` to fine-tune the scoring system based on league settings or user preferences.

## Validation

The scoring system is validated against:
- Historical draft performance
- Expert consensus rankings
- Fantasy football success metrics
- Statistical significance tests

This ensures the metrics provide meaningful insights for draft decisions.

## Future Enhancements

### Planned Additions
- **Consistency Metrics**: Weekly variance calculations
- **Injury Risk**: Games missed analysis
- **Rookie Projections**: Draft capital + college production
- **Situational Metrics**: Red zone, third down efficiency
- **Weather Adjustments**: Outdoor vs. indoor performance