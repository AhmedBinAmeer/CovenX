# ADR-004: Use Clean Architecture and Repository Boundaries

**Status:** Accepted
**Date:** 2026-08-25
**Scope:** Backend module and dependency direction

## Context

Contract lifecycle rules, approval transitions, document authorization, obligations, notifications, and audit requirements are business-critical and must remain testable as infrastructure evolves. Direct database access from HTTP handlers would make rules difficult to test, duplicate authorization and audit behavior, and couple the domain to MongoDB.

## Decision

Backend modules will follow the dependency direction:

> Controller → Service → Repository → Database

Controllers handle transport concerns. Services own use cases, business rules, authorization checks, transition validation, and audit intent. Repositories abstract persistence. Models and adapters implement infrastructure concerns. Events and queues are invoked through explicit ports or adapters.

## Rationale

The layering keeps business policy independent of Express and MongoDB, makes use cases testable without a running server, and gives the team a predictable location for security, validation, and audit controls. It also creates extraction seams for independently scaled workers or services later.

## Consequences

The team must resist bypass paths. Controllers may not contain lifecycle policy or direct database queries. Repositories must make scope and concurrency explicit. The pattern introduces interfaces and mapping code, but that cost is appropriate for an enterprise CLM platform where traceability and maintainability matter more than minimal boilerplate.

## Rejected alternatives

A controller-centric CRUD architecture was rejected because it would scatter workflow policy and make audit completeness difficult to guarantee. An immediate microservices architecture was rejected because it would add distributed transaction and operations complexity before module boundaries are validated.

## Validation criteria

Unit tests must exercise services without HTTP or MongoDB. Integration tests must verify repository behavior, authorization scope, optimistic concurrency, transaction boundaries, audit events, and event publication for each lifecycle use case.
