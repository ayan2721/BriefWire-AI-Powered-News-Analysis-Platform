# Azure Deployment Guide

## Overview

This guide describes the deployment strategy for BriefWire using Azure services.

## Azure Resources

- Azure App Service for the React frontend
- Azure App Service for the Express backend
- Azure SQL Database for persistent user, article, and analysis data
- Azure Blob Storage for original HTML, PDFs, screenshots, and AI assets

## Environment Variables

### Backend

- `PORT`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GROQ_API_KEY`
- `GROQ_API_URL`
- `BLOB_CONNECTION_STRING`
- `BLOB_CONTAINER`
- `NEWSDATA_API_KEY`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_ENABLE_DEBUG`

## Azure App Service

1. Create App Service plans and web apps for frontend and backend.
2. Configure deployment slots, runtime settings, and environment variables.
3. Link each app to the appropriate GitHub branch or use Azure CLI deployments.

## Azure SQL

1. Create a single database in Azure SQL.
2. Configure firewall rules to allow app service outbound connections.
3. Use Sequelize migrations or initialization scripts to create tables.

## Azure Blob Storage

1. Create a storage account and a container named `news`.
2. Add connection string to backend environment variables.
3. Store raw HTML, cleaned article JSON, and AI summaries in blob paths like `news/{userId}/{articleId}/`.

## CI/CD

- Use GitHub Actions or Azure DevOps pipelines.
- Build the React frontend into static assets.
- Deploy backend to App Service with Node.js runtime.
- Run database migrations after deployment.

## Notes

- Keep secrets in Azure App Service configuration or Key Vault.
- Use HTTPS for all frontend/backend communication.
- Use a CDN for static assets if performance is required.
