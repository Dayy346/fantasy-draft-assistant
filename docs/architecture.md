# Fantasy Draft Assistant - Architecture Documentation

This document describes the system architecture, technology choices, and deployment strategy for the Fantasy Draft Assistant.

## System Overview

The Fantasy Draft Assistant is a full-stack web application that helps fantasy football players make smarter draft decisions using historical data and transparent analytics.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (Express)     │◄──►│   (SQLite/PG)   │
│                 │    │                 │    │                 │
│ • Player Table  │    │ • REST API      │    │ • Players       │
│ • Draft Board   │    │ • Scoring Logic │    │ • Seasons       │
│ • Filters       │    │ • Draft Logic   │    │ • Metrics       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Render        │
│   (Hosting)     │    │   (Hosting)     │
└─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (faster than Create React App)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **State Management**: React Query (server state) + React hooks (local state)
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API with custom wrapper

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma (type-safe database access)
- **Validation**: Built-in Express validation
- **Security**: Helmet.js (security headers), CORS

### Database
- **Development**: SQLite (file-based, no setup required)
- **Production**: PostgreSQL (via Render)
- **Migrations**: Prisma migrations
- **Seeding**: Custom seed scripts

### Deployment
- **Frontend**: Vercel (automatic deployments from Git)
- **Backend**: Render (containerized deployment)
- **Database**: Render PostgreSQL (managed database)
- **CI/CD**: GitHub Actions

## Project Structure

```
fantasy-draft-assistant/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── etl/           # Data processing scripts
│   │   └── seed/          # Database seeding
│   ├── prisma/            # Database schema and migrations
│   ├── tests/             # Unit and integration tests
│   └── package.json
├── data/                   # Raw and processed data
│   ├── raw/               # Source CSV files
│   └── processed/         # Normalized JSON data
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD configuration
```

## Data Flow

### 1. Data Ingestion
```
CSV Files → ETL Scripts → Normalized JSON → Database Seeding
```

### 2. Player Analytics
```
Database → Scoring Service → Computed Metrics → API Response
```

### 3. Draft Session
```
User Action → API Request → Draft Service → Updated State → Response
```

### 4. Real-time Updates
```
Draft Pick → Backend Processing → Updated Suggestions → Frontend Re-render
```

## Key Design Decisions

### 1. Frontend Framework: Vite over Next.js
**Rationale**: 
- Faster development with hot module replacement
- Simpler deployment to Vercel
- Smaller bundle size
- Better TypeScript support out of the box

### 2. Database: SQLite + PostgreSQL
**Rationale**:
- SQLite for development (zero setup)
- PostgreSQL for production (scalability)
- Prisma provides abstraction layer
- Easy migration between databases

### 3. State Management: React Query + Local State
**Rationale**:
- React Query handles server state efficiently
- Local state for UI-only state
- No need for Redux complexity
- Built-in caching and synchronization

### 4. Styling: Tailwind CSS
**Rationale**:
- Rapid UI development
- Consistent design system
- Small bundle size
- Easy to maintain

### 5. Deployment: Vercel + Render
**Rationale**:
- Vercel: Excellent React support, automatic deployments
- Render: Simple containerized deployment, managed PostgreSQL
- Cost-effective for MVP
- Easy to scale

## Security Considerations

### 1. API Security
- CORS configured for frontend domain
- Helmet.js for security headers
- Input validation on all endpoints
- No authentication (MVP scope)

### 2. Data Protection
- No sensitive user data stored
- Public fantasy football statistics only
- Rate limiting (future enhancement)

### 3. Deployment Security
- HTTPS enforced in production
- Environment variables for secrets
- Database access restricted to backend

## Performance Optimizations

### 1. Frontend
- Code splitting with Vite
- Image optimization
- Lazy loading for large lists
- React Query caching

### 2. Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient Prisma queries
- Connection pooling

### 3. Database
- Proper indexing strategy
- Query optimization
- Regular maintenance

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless backend design
- Database connection pooling
- CDN for static assets

### 2. Caching Strategy
- React Query for client-side caching
- Database query caching
- CDN caching for static content

### 3. Database Scaling
- Read replicas for analytics queries
- Connection pooling
- Query optimization

## Monitoring and Observability

### 1. Application Monitoring
- Health check endpoints
- Error logging
- Performance metrics

### 2. Database Monitoring
- Query performance tracking
- Connection monitoring
- Storage usage

### 3. User Analytics
- Basic usage tracking
- Error reporting
- Performance monitoring

## Development Workflow

### 1. Local Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 2. Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 3. Deployment
- Automatic deployment on main branch push
- Manual deployment via GitHub Actions
- Environment-specific configurations

## Future Enhancements

### 1. Authentication
- User accounts and saved drafts
- League-specific settings
- Custom scoring systems

### 2. Real-time Features
- WebSocket connections for live drafts
- Real-time updates
- Collaborative drafting

### 3. Advanced Analytics
- Machine learning predictions
- Historical draft analysis
- League-specific insights

### 4. Mobile App
- React Native application
- Push notifications
- Offline capabilities

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL environment variable
   - Ensure database is running
   - Verify Prisma schema

2. **CORS Errors**
   - Check CORS_ORIGIN configuration
   - Verify frontend URL matches

3. **Build Failures**
   - Check TypeScript errors
   - Verify all dependencies installed
   - Check environment variables

### Debug Mode
```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
5. Code review and merge

## License

MIT License - see LICENSE file for details
