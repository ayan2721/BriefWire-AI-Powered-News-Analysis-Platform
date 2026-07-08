-- PostgreSQL (Neon) schema for BriefWire
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'reader',
  "avatarUrl" VARCHAR(512),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Articles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID,
  url TEXT NOT NULL,
  title VARCHAR(512) NOT NULL,
  publisher VARCHAR(255),
  excerpt TEXT,
  content TEXT NOT NULL,
  bias VARCHAR(100),
  sentiment VARCHAR(100),
  "credibilityScore" DOUBLE PRECISION,
  "rawBlobPath" VARCHAR(512),
  "analysisBlobPath" VARCHAR(512),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_Articles_Users" FOREIGN KEY ("userId") REFERENCES "Users"(id)
);

CREATE TABLE "Analyses" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID,
  "articleId" UUID NOT NULL,
  type VARCHAR(100) NOT NULL,
  result JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_Analyses_Users" FOREIGN KEY ("userId") REFERENCES "Users"(id),
  CONSTRAINT "FK_Analyses_Articles" FOREIGN KEY ("articleId") REFERENCES "Articles"(id)
);

CREATE TABLE "Bookmarks" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "articleId" UUID NOT NULL,
  note TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_Bookmarks_Users" FOREIGN KEY ("userId") REFERENCES "Users"(id),
  CONSTRAINT "FK_Bookmarks_Articles" FOREIGN KEY ("articleId") REFERENCES "Articles"(id)
);

CREATE TABLE "Claims" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "articleId" UUID NOT NULL,
  text TEXT NOT NULL,
  evidence JSONB,
  confidence DOUBLE PRECISION,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_Claims_Articles" FOREIGN KEY ("articleId") REFERENCES "Articles"(id)
);
