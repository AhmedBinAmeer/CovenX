# ADR-005: Use Event-Driven Design for Asynchronous Work

**Status:** Accepted
**Date:** 2026-08-25
**Scope:** Domain events, outbox recovery, workers, and integrations

## Context

CovenX must notify users about approvals, signatures, expiries, renewals, SLA deadlines, and compliance reviews. It must also support document scanning, metadata extraction, reporting, future OCR, search indexing, and external signing or email providers. These tasks may be slow, retryable, and independent of the user’s request latency.

## Decision

Services will emit versioned domain events for meaningful business facts. Durable outbox or job records will preserve event intent at the business transaction boundary. Queue workers will process asynchronous jobs idempotently with retries, exponential backoff, dead-letter handling, and operational metrics. Socket.IO events will provide authenticated freshness signals, while REST remains the authoritative read and mutation interface.

## Rationale

Event-driven design decouples lifecycle changes from notification and processing workloads, improves responsiveness, and allows workers to scale independently. Versioned event contracts create stable integration boundaries for future OCR, search, e-signature, and analytics adapters.

## Consequences

The system must handle eventual consistency, duplicate delivery, ordering limits, schema versioning, poison messages, and replay or recovery procedures. Every consumer needs an idempotency strategy. Events describe facts rather than commands, and sensitive payloads are minimized or protected.

## Rejected alternatives

Synchronous email, document processing, and reporting inside API requests were rejected because they increase latency and failure coupling. Unstructured fire-and-forget calls were rejected because they lose observability and recovery guarantees.

## Validation criteria

Test transaction-to-outbox recovery, duplicate jobs, retry exhaustion, worker restarts, dead-letter replay, event schema compatibility, notification deduplication, and authorized Socket.IO fan-out across multiple gateway replicas.
