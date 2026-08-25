# ADR-001: Use MERN-Aligned Technologies

**Status:** Accepted
**Date:** 2026-08-25
**Scope:** Platform technology baseline

## Context

The CovenX Enterprise Contract Lifecycle Management Platform requires a productive enterprise web stack for contract repository operations, authoring, approvals, signatures, obligation monitoring, dashboards, secure documents, and auditability. The project requirements specify React 19, TypeScript, Redux Toolkit, Tailwind CSS, React Query, React Hook Form, Recharts, Node.js, Express.js, MongoDB, Redis, Socket.IO, JWT authentication, REST APIs, Clean Architecture, event-driven design, and queue-based notifications.

## Decision

CovenX will use a MERN-aligned architecture: React and TypeScript for the frontend, Node.js and Express for the backend, and MongoDB for operational persistence. Redis, Socket.IO, object storage, queue workers, and provider adapters complement the core stack where the platform needs caching, coordination, real-time updates, asynchronous work, and secure binary storage.

The initial deployable boundary will be a modular monolith with explicit module boundaries and Clean Architecture seams. The stack choice does not prohibit extracting workers or independently scaling modules later.

## Rationale

A shared TypeScript-centered ecosystem supports consistent contracts between frontend and backend, while React is suited to feature-rich enterprise workflows and dashboards. Node.js and Express provide a lightweight HTTP and WebSocket integration surface for REST APIs and event coordination. MongoDB fits contract-shaped metadata, evolving templates, clauses, versions, and audit context while supporting indexed query patterns and a path to horizontal scale.

## Consequences

The team gains a coherent development model and lower initial operational complexity. The team must enforce boundaries because JavaScript and MongoDB do not automatically provide strong domain constraints. Schema validation, service-layer rules, repository abstraction, migration discipline, contract tests, observability, and security review are mandatory.

## Rejected alternatives

A polyglot service architecture and an SQL-first stack were not selected for the initial foundation because they would increase operational and delivery complexity before the domain boundaries and workload patterns are validated. They may be reconsidered for specialized workloads if evidence justifies the change.

## Validation criteria

The selected stack must demonstrate the required lifecycle workflows, authorization checks, indexed contract queries, document flows, queue processing, audit completeness, and performance targets through automated and load testing before production readiness is claimed.
