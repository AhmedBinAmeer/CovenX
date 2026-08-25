# CovenX Enterprise Contract Lifecycle Management Platform

<p align="center">
  <img src="frontend/public/covenx-logo.png" alt="CovenX Enterprise Contract Lifecycle Management Platform" width="240" />
</p>

<p align="center"><strong>Intelligent contract operations for secure, compliant, and scalable enterprises.</strong></p>

<p align="center">
  <a href="docs/UserGuide.md">User Guide</a> ·
  <a href="docs/API.md">API Reference</a> ·
  <a href="docs/Architecture.md">Architecture</a> ·
  <a href="docs/Database.md">Database Design</a>
</p>

## Overview

**CovenX Enterprise Contract Lifecycle Management Platform** is a full-stack enterprise workspace for managing the complete contract lifecycle in one controlled system:

> **Create → Review → Approve → Sign → Monitor → Renew → Archive**

CovenX brings legal, procurement, finance, business, executive, and external stakeholder workflows together through secure document management, structured approvals, obligation monitoring, renewal visibility, auditability, and role-aware collaboration.

The platform is designed around the CovenX values of **trust, security, enterprise reliability, workflow intelligence, compliance, scalability, and digital transformation**.

## Product capabilities

| Capability | What CovenX provides |
|---|---|
| Contract lifecycle management | Create drafts, maintain versions, submit for review, approve, sign, monitor, renew, and archive contracts. |
| Enterprise approvals | Assignment-aware approval queues with comments, rejection reasons, delegation, SLAs, quorum, optimistic concurrency, and audit events. |
| Secure document repository | Private document metadata, direct upload initiation, checksum verification, malware-scan state, authorized short-lived downloads, and retention-aware deletion. |
| Governance | Templates, clause library, risk classification, workflow definitions, user administration, role management, permissions, and audit visibility. |
| Obligation management | Track owners, deadlines, priorities, completion state, evidence references, escalation, and renewal exposure. |
| Notifications | In-app notification center, read state, preferences, quiet hours, email/realtime channels, and event-driven refresh. |
| Portfolio intelligence | Dashboard KPIs, lifecycle distribution, approval workload, obligation compliance, expirations, contract value, and reporting read models. |
| Realtime workspace | Authenticated Socket.IO events for notification, approval, contract, obligation, and dashboard updates. |
| Enterprise security | JWT access tokens, rotating refresh credentials, RBAC, tenant isolation, scoped authorization, rate limiting, validation, audit logging, and secure storage boundaries. |

## User roles

CovenX includes six baseline enterprise access profiles:

| Role | Primary responsibility |
|---|---|
| `super-admin` | Tenant administration, user access, roles, permissions, governance, reporting, and audit. |
| `legal-officer` | Legal authoring, review, contract history, approval decisions, signatures, documents, and audit. |
| `department-manager` | Department contract creation, business approvals, obligations, renewals, reporting, and supporting documents. |
| `finance-reviewer` | Commercial and financial review, assigned approvals, contract history, obligations, documents, and reporting. |
| `executive-approver` | Executive decision-making for assigned agreements, contract history, and portfolio reporting. |
| `vendor-user` | Restricted counterparty access to visible contracts, assigned approvals, and permitted documents. |

Backend authorization remains authoritative. Frontend navigation and action visibility are convenience controls that reflect effective permissions without replacing server-side enforcement.

## Architecture

CovenX is implemented as a modular monolith with clear application boundaries:

```text
React 19 + Vite + TypeScript
              │
              │ Typed REST API + authenticated Socket.IO events
              ▼
Node.js + Express 5 + TypeScript
              │
      Controller / Service / Repository boundaries
              │
      MongoDB · Redis · Object Storage · Email Providers
```

| Layer | Technology and responsibility |
|---|---|
| Frontend | React 19, Vite, TypeScript, Lucide icons, Recharts, responsive enterprise UI, Zod request validation, typed API client, and realtime refresh. |
| Backend | Node.js, Express 5, TypeScript, Zod validation, JWT authentication, RBAC middleware, lifecycle services, workers, and Socket.IO. |
| Persistence | MongoDB with Mongoose models, indexes, tenant-aware queries, versioned records, audit logs, and reporting read models. |
| Coordination | Redis for sessions, distributed rate limiting, cache and queue coordination. |
| Documents | Mock or S3-compatible private object storage with upload initiation/finalization and scan-state controls. |
| Quality | TypeScript type checks, ESLint, Vitest backend/frontend tests, production builds, and GitHub Actions quality gates. |

The detailed architecture is documented in [`docs/Architecture.md`](docs/Architecture.md). Database collections, indexes, scaling design, retention, and security are documented in [`docs/Database.md`](docs/Database.md).

## Technology stack

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1F33" alt="React 19" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=FFFFFF" alt="Vite 7" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=FFFFFF" alt="TypeScript 5.9" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=FFFFFF" alt="Node.js 20 or newer" /></a>
</p>
<p align="center">
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=FFFFFF" alt="Express 5" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=FFFFFF" alt="MongoDB 7" /></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=FFFFFF" alt="Redis 7" /></a>
  <a href="https://socket.io/"><img src="https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=FFFFFF" alt="Socket.IO 4" /></a>
</p>
<p align="center">
  <a href="https://zod.dev/"><img src="https://img.shields.io/badge/Zod-Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=FFFFFF" alt="Zod validation" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Local%20Services-2496ED?style=for-the-badge&logo=docker&logoColor=FFFFFF" alt="Docker" /></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/GitHub%20Actions-Quality%20Gates-2088FF?style=for-the-badge&logo=github-actions&logoColor=FFFFFF" alt="GitHub Actions" /></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-Test%20Suite-6E9F18?style=for-the-badge&logo=vitest&logoColor=FFFFFF" alt="Vitest" /></a>
</p>

### Stack at a glance

| Domain | Selected technologies |
|---|---|
| User experience | React 19, Vite 7, TypeScript, Lucide icons, Recharts, responsive CSS motion system, and accessible reduced-motion support. |
| API and application services | Node.js 20+, Express 5, TypeScript, Zod, JWT, bcryptjs, Helmet, CORS, and structured middleware. |
| Data and coordination | MongoDB 7 with Mongoose, Redis 7 with ioredis, indexed tenant-aware queries, sessions, rate limiting, and coordination. |
| Realtime and files | Socket.IO 4, AWS SDK for S3-compatible storage, presigned URLs, checksums, scan state, and secure document boundaries. |
| Engineering quality | Vitest, Supertest, ESLint, TypeScript project checks, npm workspaces, Docker Compose, and GitHub Actions. |

## Repository structure

```text
.
├── frontend/                # React workspace and user interface
│   ├── public/               # Static assets including the CovenX logo
│   └── src/                  # Pages, components, services, hooks, and utilities
├── backend/                 # Express API, services, models, middleware, and workers
│   ├── src/routes/           # REST API route source of truth
│   ├── src/models/           # MongoDB models and indexes
│   ├── src/services/         # Authentication, lifecycle, storage, workflow, and reporting
│   └── tests/                # Backend automated tests
├── database/                # Database design, migration, and seed structure
├── docs/                    # Product, API, architecture, database, deployment, and user guides
├── architecture/            # Diagrams and architecture decision records
├── tests/                   # Repository-level test space
├── docker/                  # Local container assets
├── .github/workflows/       # Continuous integration quality gates
├── .env.example             # Safe environment template; contains no credentials
├── docker-compose.yml       # Local MongoDB and Redis services
└── package.json             # Workspace commands
```

## Local development

### Prerequisites

Install **Node.js 20 or newer**, npm, Docker, and Docker Compose. The default local configuration expects MongoDB on port `27017` and Redis on port `6379`.

### Configure the environment

Create the local environment file from the committed template:

```bash
cp .env.example .env
```

At minimum, review `JWT_SECRET`, `MONGODB_URI`, `REDIS_URL`, `FRONTEND_URL`, and `VITE_API_URL`. The default local configuration uses mock document storage and mock email delivery so that the core workflow can be exercised without external provider credentials.

### Start the application

```bash
docker compose up -d
npm install
npm run dev
```

The application starts both workspaces through the root development command:

| Service | Default URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:4000/api/v1` |
| MongoDB | `mongodb://localhost:27017/covenx` |
| Redis | `redis://localhost:6379` |

To initialize baseline RBAC data in a controlled local environment, set `SEED_RBAC=true` in `.env` before starting the backend. Never use development secrets or mock providers for a production environment.

## Quality commands

Run the following commands from the repository root:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

The quality workflow validates both workspaces. Backend integration tests that require external MongoDB and Redis are skipped when those dependencies are unavailable; unit and application-boundary tests continue to run.

## Application routes

The frontend workspace includes these primary routes:

| Route | Purpose |
|---|---|
| `/` | Portfolio overview and operational dashboard |
| `/contracts` | Searchable contract portfolio |
| `/contracts/new` | Validated contract authoring |
| `/contracts/:id` | Contract lifecycle, versions, approvals, signatures, documents, and audit history |
| `/approvals` | Assigned approval decisions and delegation |
| `/obligations` | Commitment monitoring and completion |
| `/documents` | Secure document repository |
| `/notifications` | Notification center and preferences |
| `/templates` | Template governance |
| `/clauses` | Clause library and risk classification |
| `/workflows` | Approval workflow definitions |
| `/users` | User administration |
| `/audit` | Tenant-scoped audit history |
| `/settings` | Profile and active-session security |

The REST API is served under `/api/v1`. The complete endpoint contract is available in [`docs/API.md`](docs/API.md).

## Security model

CovenX applies security controls at the API boundary and throughout the lifecycle domain. Access tokens are short-lived JWTs, refresh credentials are rotated and revocable, permissions are role-derived, and resource access is constrained by tenant and organizational scope. Mutations validate request bodies, check authorization, enforce lifecycle transitions, and use version tokens where concurrent changes could create unsafe results.

Documents are handled through controlled upload and download flows. The application stores metadata and security state separately from the binary content, verifies checksums, prevents download of non-clean files, and issues short-lived authorized URLs. Audit records capture security-sensitive operations without exposing passwords, tokens, storage credentials, private document contents, or internal stack traces.

## Documentation

| Document | Description |
|---|---|
| [`docs/UserGuide.md`](docs/UserGuide.md) | Full operational guide, roles, permissions, workflows, exception handling, and day-to-day use. |
| [`docs/API.md`](docs/API.md) | Implemented REST API contract, request/response behavior, errors, permissions, and lifecycle endpoints. |
| [`docs/Architecture.md`](docs/Architecture.md) | System architecture, modular boundaries, events, infrastructure, security, and scaling approach. |
| [`docs/Database.md`](docs/Database.md) | MongoDB and Redis design, collections, indexes, sharding, archiving, and security considerations. |
| [`docs/PRD.md`](docs/PRD.md) | Product requirements and enterprise CLM objectives. |
| [`docs/Deployment.md`](docs/Deployment.md) | Deployment-specific guidance and operational environment considerations. |
| [`architecture/diagrams/`](architecture/diagrams/) | Architecture diagrams and visual system references. |
| [`architecture/decisions/`](architecture/decisions/) | Architecture decision records. |

## Engineering principles

CovenX development prioritizes secure defaults, least privilege, explicit validation, tenant isolation, auditable state changes, immutable historical evidence, predictable APIs, responsive enterprise UX, and maintainable separation of concerns. Secrets and credentials must remain outside version control. All implementation changes should preserve the distinction between presentation, application services, domain rules, persistence, and infrastructure adapters.

## Project status

The repository contains the implemented CovenX application foundation and core enterprise workflows. The current branch includes the backend API, frontend workspace, role-aware navigation, secure document boundaries, realtime integration, automated tests, quality gates, and professional product documentation. Deployment execution is intentionally environment-specific and is not part of this repository README’s local development workflow.
