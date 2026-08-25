# CovenX Enterprise Contract Lifecycle Management Platform

CovenX is an enterprise SaaS platform for intelligent contract operations, secure document management, compliance monitoring, and AI-assisted contract intelligence.

The platform is designed around the complete contract lifecycle:

> Create → Review → Approve → Sign → Monitor → Renew → Archive

## Repository status

This repository contains the enterprise monorepo foundation and the first backend implementation phase. The backend foundation now includes configuration loading, MongoDB and Redis boundaries, Express middleware, JWT authentication, refresh-token rotation, RBAC seed definitions, user and role management, audit writes, and contract/version lifecycle foundations. Broader application features remain under active development.

## Monorepo layout

| Directory | Responsibility |
|---|---|
| `frontend/` | Reserved for the React client application. |
| `backend/` | Reserved for the Node.js, Express, and TypeScript service layer. |
| `database/` | Reserved for schemas, migrations, and seed data. |
| `docs/` | Product, architecture, API, deployment, and user documentation. |
| `architecture/` | Architecture diagrams and architecture decision records. |
| `tests/` | Repository-level and future integration tests. |
| `docker/` | Docker development assets. |
| `.github/workflows/` | Continuous integration and delivery workflows. |

## Development principles

CovenX engineering work must prioritize trust, security, enterprise reliability, workflow intelligence, compliance, scalability, and digital transformation. Secrets must remain outside version control, and all implementation work should preserve clear separation between presentation, domain, persistence, and infrastructure concerns.

## Architecture overview

CovenX is organized as a modular monolith with Clean Architecture boundaries. The React frontend communicates with a stateless Node.js and Express REST API. Backend services coordinate contract lifecycle rules, approval workflows, signatures, obligations, documents, notifications, reporting, and audit events through the Controller → Service → Repository → Database dependency direction.

MongoDB is the durable operational store, Redis provides caching and queue coordination, Socket.IO provides authenticated real-time freshness signals, queue workers handle asynchronous work, and private object storage holds encrypted document binaries. JWT authentication, refresh-token rotation, RBAC, scoped permissions, input validation, secure file handling, and append-only audit logging are cross-cutting controls.

The complete System Architecture Document is available at [`docs/Architecture.md`](docs/Architecture.md), the MongoDB and Redis Database Design Document is available at [`docs/Database.md`](docs/Database.md), and the REST API Specification is available at [`docs/API.md`](docs/API.md). Supporting visual assets are in [`architecture/diagrams/`](architecture/diagrams/), and architecture decisions are recorded in [`architecture/decisions/`](architecture/decisions/).

## Branching model

Feature branches such as `feature/authentication`, `feature/contracts`, `feature/workflows`, and `feature/dashboard` merge into `develop`. Reviewed releases are promoted from `develop` to the protected `main` branch.

## Local setup

Install Node.js 20 or newer, run `npm install`, review `.env.example`, and start local MongoDB and Redis services with `docker compose up -d`. Use `npm run build` to compile the backend and `npm test` to run the backend API foundation tests. Set `SEED_RBAC=true` only in a controlled local environment when baseline roles and permissions should be seeded.
