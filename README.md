# CovenX Enterprise Contract Lifecycle Management Platform

CovenX is an enterprise SaaS platform for intelligent contract operations, secure document management, compliance monitoring, and AI-assisted contract intelligence.

The platform is designed around the complete contract lifecycle:

> Create → Review → Approve → Sign → Monitor → Renew → Archive

## Repository status

This repository currently contains the **enterprise monorepo foundation only**. Application features, APIs, database models, and UI screens are intentionally excluded from this initialization phase.

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

The complete System Architecture Document is available at [`docs/Architecture.md`](docs/Architecture.md), and the MongoDB and Redis Database Design Document is available at [`docs/Database.md`](docs/Database.md). Supporting visual assets are in [`architecture/diagrams/`](architecture/diagrams/), and architecture decisions are recorded in [`architecture/decisions/`](architecture/decisions/).

## Branching model

Feature branches such as `feature/authentication`, `feature/contracts`, `feature/workflows`, and `feature/dashboard` merge into `develop`. Reviewed releases are promoted from `develop` to the protected `main` branch.

## Local setup

Install Node.js 20 or newer, review `.env.example`, and start the local MongoDB and Redis services with `docker compose up -d`. Feature-specific installation and run instructions will be added with the first development phase.
