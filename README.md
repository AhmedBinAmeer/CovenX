# CovenX Enterprise Contract Lifecycle Management Platform

<p align="center"><img src="frontend/public/covenx-logo.png" alt="CovenX Enterprise Contract Lifecycle Management Platform" width="220" /></p>

CovenX is an enterprise SaaS platform for intelligent contract operations, secure document management, compliance monitoring, and AI-assisted contract intelligence.

The platform supports the complete contract lifecycle:

> **Create → Review → Approve → Sign → Monitor → Renew → Archive**

## Application status

The repository contains a runnable full-stack CovenX Enterprise Contract Lifecycle Management Platform. The backend provides authenticated REST APIs, MongoDB persistence, Redis-backed sessions and coordination, RBAC, audit logging, lifecycle enforcement, workflows, approvals, signatures, obligations, secure document upload/download, notifications, reporting, and Socket.IO events. The frontend provides the authenticated enterprise workspace, dashboard, contracts and contract-detail lifecycle, secure documents, approvals, obligations, notifications, templates, clauses, workflows, users, audit log, settings, validation, role-aware navigation, and realtime refresh behavior.

Deployment automation is intentionally outside this repository completion scope. For local use, the required user action is to provide environment values and start the application dependencies and workspaces.

## Monorepo layout

| Directory | Responsibility |
|---|---|
| `frontend/` | React 19, Vite, TypeScript, enterprise workspace screens, typed API boundary, validation, and realtime client. |
| `backend/` | Node.js, Express 5, TypeScript API, services, models, middleware, workers, storage, and realtime server. |
| `database/` | Database design, migration placeholders, and seed structure. |
| `docs/` | PRD, architecture, database, API, deployment, and user documentation. |
| `architecture/` | Architecture diagrams and decision records. |
| `tests/` | Repository-level test placeholder; workspace tests live under `backend/tests` and frontend source tests. |
| `docker/` | Local container support assets. |
| `.github/workflows/` | Build, type-check, lint, test, and production-build quality gates. |

## Local setup

Install **Node.js 20 or newer**. Copy `.env.example` to `.env` at the repository root and set the values appropriate for the local environment. Do not commit `.env` or real credentials.

Start local MongoDB and Redis using the existing compose configuration:

```bash
docker compose up -d
```

Install workspace dependencies:

```bash
npm install
```

Start both workspaces in development mode:

```bash
npm run dev
```

The frontend is served by Vite and the backend listens on the configured `PORT`, defaulting to `4000`. The frontend API boundary defaults to `http://localhost:4000/api/v1`; set `VITE_API_URL` if the backend uses a different address.

For controlled local initialization, set `SEED_RBAC=true` and run the backend startup path once. The baseline seed creates the six enterprise access profiles and their permission relationships. Use this only in a controlled development environment.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

The automated test suite covers authentication primitives, API behavior, lifecycle transitions, workflows, documents, observability, pagination, and frontend request/capability helpers. Integration tests that require external MongoDB and Redis are intentionally skipped when those services are unavailable.

## Core application areas

The REST API is exposed under `/api/v1` and is documented in [`docs/API.md`](docs/API.md). The major resource areas are authentication and sessions, users, roles, permissions, contracts, contract versions, approvals, workflows, templates, clauses, signatures, obligations, documents, notifications, dashboard analytics, and audit logs.

The frontend routes include `/`, `/contracts`, `/contracts/new`, `/contracts/:id`, `/approvals`, `/obligations`, `/documents`, `/notifications`, `/templates`, `/clauses`, `/workflows`, `/users`, `/audit`, and `/settings`. Backend permissions remain authoritative; frontend capability checks only improve navigation and action visibility.

## Architecture and security

CovenX is organized as a modular monolith with Clean Architecture boundaries. The React frontend communicates with a stateless Node.js and Express REST API. Backend services enforce lifecycle rules, scoped RBAC, optimistic concurrency, validation, rate limiting, refresh-token rotation, tenant isolation, secure document handling, and append-only audit logging.

MongoDB is the durable operational store. Redis supports sessions, rate limiting, caching, and coordination. Socket.IO provides authenticated realtime freshness signals. Document binaries use the configured mock or S3-compatible storage provider, while document checksums and malware-scan status are verified before authorized downloads.

Read the complete documents at [`docs/Architecture.md`](docs/Architecture.md), [`docs/Database.md`](docs/Database.md), [`docs/API.md`](docs/API.md), [`docs/UserGuide.md`](docs/UserGuide.md), and [`docs/Deployment.md`](docs/Deployment.md).

## Engineering principles

CovenX engineering prioritizes trust, security, enterprise reliability, workflow intelligence, compliance, scalability, and digital transformation. Secrets remain outside version control. Presentation, domain, persistence, and infrastructure concerns remain separated, and all mutating workflows preserve validation, authorization, optimistic locking, and auditability.
