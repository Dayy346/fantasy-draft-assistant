# Fantasy Draft Assistant - API Documentation

This document describes the REST API endpoints for the Fantasy Draft Assistant.

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://your-backend-url.com/api`

## Authentication

Currently no authentication required. All endpoints are publicly accessible.

## Response Format

All responses are JSON objects. Error responses include an `error` field with a descriptive message.

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response:**
```json
{
  "ok": true,
  "ts": "2024-01-15T10:30:00.000Z"
}
```

### Players

#### GET /players

Get a paginated list of players with optional filtering and sorting.

**Query Parameters:**
- `position` (string, optional): Filter by position (QB, RB, WR, TE)
- `sort` (string, optional): Sort field (draftScore, ppg, ppt, vorp, name)
- `order` (string, optional): Sort order (asc, desc)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Example Request:**
```
GET /players?position=RB&sort=draftScore&order=desc&page=1&limit=20
```

**Response:**
```json
{
  "players": [
    {
      "id": "saquon-barkley-rb",
      "name": "Saquon Barkley",
      "position": "RB",
      "team": "PHI",
      "seasons": [
        {
          "id": "saquon-barkley-rb_2024",
          "year": 2024,
          "games": 16,
          "ppg": 20.1,
          "ppt": 0.85,
          "draftScore": 2.3,
          "vorp": 12.1,
          "isRookie": false
        }
      ]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### GET /players/:id

Get detailed information about a specific player.

**Path Parameters:**
- `id` (string): Player ID

**Response:**
```json
{
  "id": "saquon-barkley-rb",
  "name": "Saquon Barkley",
  "position": "RB",
  "team": "PHI",
  "seasons": [
    {
      "id": "saquon-barkley-rb_2024",
      "year": 2024,
      "games": 16,
      "att": 345,
      "tgt": 0,
      "rec": 33,
      "rushYds": 2005,
      "recvYds": 278,
      "totalTd": 15,
      "fpts": 322.3,
      "ppg": 20.1,
      "touches": 378,
      "ppt": 0.85,
      "ypc": 5.81,
      "ypr": 8.42,
      "tpg": 0,
      "oppg": 21.56,
      "draftScore": 2.3,
      "vorp": 12.1,
      "isRookie": false
    }
  ]
}
```

### Search

#### GET /search

Search players by name.

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)
- `limit` (number, optional): Maximum results (default: 20)

**Example Request:**
```
GET /search?q=saquon&limit=10
```

**Response:**
```json
{
  "players": [
    {
      "id": "saquon-barkley-rb",
      "name": "Saquon Barkley",
      "position": "RB",
      "team": "PHI",
      "seasons": [...]
    }
  ],
  "total": 1
}
```

### Metrics

#### GET /metrics

Get position-specific metrics and scoring weights.

**Response:**
```json
[
  {
    "position": "RB",
    "means": {
      "ppg": 10.5,
      "ppt": 0.6,
      "oppg": 15.2,
      "ypc": 4.2,
      "consistency": 0.8
    },
    "stdDevs": {
      "ppg": 3.2,
      "ppt": 0.15,
      "oppg": 4.1,
      "ypc": 0.8,
      "consistency": 0.2
    },
    "weights": {
      "ppg": 0.4,
      "ppt": 0.2,
      "oppg": 0.15,
      "ypc": 0.1,
      "injury": -0.1,
      "consistency": 0.05
    }
  }
]
```

### Draft

#### POST /draft/session

Create a new draft session.

**Response:**
```json
{
  "sessionId": "uuid-string"
}
```

#### GET /draft/:sessionId/board

Get the current state of a draft session.

**Path Parameters:**
- `sessionId` (string): Draft session ID

**Response:**
```json
{
  "id": "uuid-string",
  "picks": [
    {
      "id": "pick-uuid",
      "playerId": "saquon-barkley-rb",
      "player": {
        "id": "saquon-barkley-rb",
        "name": "Saquon Barkley",
        "position": "RB",
        "team": "PHI"
      },
      "pickNumber": 1,
      "teamSlot": "Team A",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "suggestions": [
    {
      "id": "derrick-henry-rb",
      "name": "Derrick Henry",
      "position": "RB",
      "team": "BAL",
      "seasons": [...]
    }
  ],
  "rosterNeeds": {
    "QB": 1,
    "RB": 1,
    "WR": 3,
    "TE": 1
  },
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

#### POST /draft/:sessionId/pick

Make a pick in a draft session.

**Path Parameters:**
- `sessionId` (string): Draft session ID

**Request Body:**
```json
{
  "playerId": "derrick-henry-rb",
  "teamSlot": "Team A"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "picks": [...],
  "suggestions": [...],
  "rosterNeeds": {...},
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

#### DELETE /draft/:sessionId/pick/:pickId

Undo a pick in a draft session.

**Path Parameters:**
- `sessionId` (string): Draft session ID
- `pickId` (string): Pick ID to undo

**Response:**
```json
{
  "id": "uuid-string",
  "picks": [...],
  "suggestions": [...],
  "rosterNeeds": {...},
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Example Error Responses

**Missing required parameter:**
```json
{
  "error": "Query parameter \"q\" is required"
}
```

**Resource not found:**
```json
{
  "error": "Draft session not found"
}
```

**Invalid player ID:**
```json
{
  "error": "Player not found"
}
```

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

The API includes CORS headers to allow cross-origin requests from the frontend application.

## Data Types

### Player
- `id`: string (unique identifier)
- `name`: string (player name)
- `position`: string (QB, RB, WR, TE)
- `team`: string (team abbreviation or "FA" for free agent)

### Season
- `year`: number (season year)
- `games`: number (games played)
- `ppg`: number (points per game)
- `ppt`: number (points per touch)
- `draftScore`: number (composite draft score)
- `vorp`: number (value over replacement player)
- `isRookie`: boolean (true if rookie season)

### RosterNeeds
- `QB`: number (quarterbacks needed)
- `RB`: number (running backs needed)
- `WR`: number (wide receivers needed)
- `TE`: number (tight ends needed)
