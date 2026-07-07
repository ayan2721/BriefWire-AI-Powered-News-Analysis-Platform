# BriefWire Backend

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies: `npm install`
3. Run locally: `npm run dev`

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/news/feed`
- `GET /api/news/article?url=`
- `POST /api/news/analyze`
- `POST /api/news/compare`
- `GET /api/analysis/history`
- `POST /api/analysis/reanalyze`
- `GET /api/dashboard/summary`
- `GET /api/admin/users`

## Notes

- This backend uses Sequelize with Azure SQL.
- Azure Blob Storage stores raw HTML and analysis JSON.
- Groq AI handles article summarization, bias detection, and claim extraction.
