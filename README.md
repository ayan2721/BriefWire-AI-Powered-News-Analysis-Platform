# BriefWire

Beyond the Headlines.

BriefWire is an AI-powered News Intelligence Platform built with React, Express, Azure SQL, Azure Blob Storage, and Groq AI. It provides a modern news reading experience, multi-source comparison, credibility analysis, article summarization, and personal archives.

## Features

- Public news feed with breaking news, trending topics, and category browsing
- User authentication with JWT, registration, login, and profile management
- AI article analysis using Groq for summary, bias, sentiment, claims, and credibility recommendations
- News scraping, readability extraction, and Azure Blob storage for raw article content
- Personal archives, bookmarks, analysis history, and export-ready reports
- Admin panel for user and article management
- Responsive modern UI with dark mode, animations, and chart-driven analytics

## Architecture

- `client/` - React front-end with Tailwind CSS, Framer Motion, React Query, and Chart libraries
- `server/` - Express API server with Azure SQL integration and AI workflows
- `docs/` - Deployment and architecture documentation

## Startup

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Azure Deployment

See `docs/DEPLOYMENT.md` for Azure App Service, Azure SQL Database, and Azure Blob Storage deployment guidance.
