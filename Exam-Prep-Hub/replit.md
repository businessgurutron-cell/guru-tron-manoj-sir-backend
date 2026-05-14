# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### NEET JEE Prep (Expo Mobile App)
- **Location**: `artifacts/neet-jee-prep/`
- **Purpose**: Comprehensive NEET/JEE/CBSE Board exam prep mobile app
- **Features**:
  - Home Dashboard with subject cards, streak tracker, points system
  - Quiz Mode — timed quizzes with instant results and explanations
  - AI Paper Generator — auto-generate practice papers by subject/topic/difficulty
  - Progress Tracker — subject performance, weak areas, badge system
  - Profile — student/teacher role, exam type selection
- **State**: AsyncStorage-based (no backend required)
- **Tabs**: Home | Quiz | Papers | Progress | Profile

### API Server
- **Location**: `artifacts/api-server/`
- **Port**: 8080 (proxied at `/api`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
