# Fantasy Draft Assistant 🏈

A comprehensive full-stack web application to help fantasy football players draft smarter using historical data, transparent math, and live pick tracking.

## ✨ Features

- **📊 Data-Driven Insights**: Ingest NFL season data and normalize per-player stats
- **🧮 Advanced Metrics**: Compute weighted metrics, z-scores, Composite Draft Score, and VORP/VBD
- **⚡ Live Draft Tracking**: Track live draft picks and provide real-time suggestions
- **🎯 Rookie Projections**: Estimate rookie performance using draft capital + college production
- **🤖 Mock Drafts**: Practice against AI bots with different strategies (2-12 teams)
- **🔍 Transparent Math**: All calculations are visible and explainable
- **📈 Position-Neutral Scoring**: Fair comparison across all fantasy positions

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** database with **Prisma** ORM (SQLite for local dev)
- **REST API** with comprehensive endpoints
- **ETL Scripts** for data processing

### Frontend
- **React** + **TypeScript** + **Vite**
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **React Router** for navigation

### Deployment
- **Vercel** (frontend) + **Render** (backend) + **Neon** (database)
- **GitHub Actions** for CI/CD
- **Comprehensive testing** with Jest, Supertest, and Playwright

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use SQLite for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fantasy-draft-assistant
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   yarn install
   
   # Frontend
   cd ../frontend
   yarn install
   ```

3. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   yarn seed
   ```

4. **Start the development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   yarn dev
   
   # Frontend (Terminal 2)
   cd frontend
   yarn dev
   ```

5. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database Studio: `npx prisma studio`

## 📁 Project Structure

```
fantasy-draft-assistant/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic & scoring
│   │   ├── seed/          # Database seeding
│   │   └── app.ts         # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and types
│   │   └── App.tsx        # Main app component
│   └── package.json
├── data/                   # Raw and processed data
│   ├── raw/               # Original data files
│   └── processed/         # Cleaned and merged data
└── README.md
```

## 🔌 API Endpoints

### Players
- `GET /api/players` - List all players with filtering and sorting
- `GET /api/players/:id` - Get specific player details
- `GET /api/players/search` - Search players by name

### Draft
- `POST /api/draft/session` - Create new draft session
- `GET /api/draft/:id` - Get draft session details
- `POST /api/draft/:id/pick` - Make a draft pick

### Mock Draft
- `POST /api/mock-draft/session` - Create mock draft session
- `GET /api/mock-draft/:id` - Get mock draft details
- `POST /api/mock-draft/:id/start` - Start mock draft
- `POST /api/mock-draft/:id/pick` - Make mock draft pick
- `GET /api/mock-draft/:id/bot-pick` - Get bot's pick

## 📊 Player Database

The application includes comprehensive player data:

- **QB**: 30+ quarterbacks with passing stats
- **RB**: 250+ running backs with detailed rushing/receiving stats
- **WR**: 30+ wide receivers with receiving stats
- **TE**: 30+ tight ends with receiving stats
- **K**: 30+ kickers with scoring stats
- **DEF**: 30+ team defenses with defensive stats

## 🧮 Scoring System

The position-neutral scoring system ensures fair comparison across all positions:

- **Primary Metric**: Points per game (PPG)
- **Position Scaling**: Each position has a value multiplier
- **Advanced Metrics**: Z-scores, VORP, consistency, injury risk
- **Replacement Baselines**: Position-specific replacement player values

## 🤖 Mock Draft Features

- **Snake Draft**: Traditional snake draft order
- **AI Bots**: 4 different strategies (BPA, Needs, Balanced, Aggressive)
- **Real-time Updates**: Live draft board and team rosters
- **Customizable**: 2-12 teams, 8-16 rounds

## 📈 Data Sources

- **NFL Stats**: Official NFL statistics
- **Fantasy Points**: Standard PPR scoring
- **Draft Data**: NFL draft information
- **College Stats**: NCAA football statistics
- **Combine Data**: NFL Combine measurements

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend
yarn dev

# Frontend
cd frontend
yarn dev
```

### Production
```bash
# Build
yarn build

# Start
yarn start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@fantasydraftassistant.com or join our Discord community.

---

**Ready to draft smarter?** 🏈 Start your mock draft today!