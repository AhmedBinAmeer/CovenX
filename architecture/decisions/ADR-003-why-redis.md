# ADR-003: Use Redis for Cache, Coordination, and Queues

**Status:** Accepted
**Date:** 2026-08-25
**Scope:** Caching, rate limiting, locks, real-time fan-out, and asynchronous work

## Context

CovenX needs low-latency access for safe reference and dashboard data, coordination across stateless API replicas, authenticated Socket.IO fan-out, rate limiting, distributed locks, and queue-based notifications. These concerns are temporary, recoverable, or coordination-oriented and should not make the cache the source of truth for contracts or audit records.

## Decision

Redis will provide short-lived caching, distributed coordination, rate limiting, locks, queue brokering, and Socket.IO adapter support. Durable business state remains in MongoDB and private object storage. Queue jobs carry idempotency keys, retry metadata, and dead-letter handling.

## Rationale

Redis provides fast in-memory operations and primitives suitable for expiry, counters, locks, pub/sub, and work queues. It lets API and Socket.IO nodes coordinate without sticky application state while preserving horizontal scalability.

## Consequences

Cache invalidation and TTL policy must be explicit. Redis outages must degrade safely: the API must not authorize from cache, and durable writes must not depend on an unacknowledged cache update. Workers must be idempotent, queues must be monitored, and memory limits and eviction policy must be selected by workload. Sensitive values must not be cached without an approved protection and retention policy.

## Rejected alternatives

Process-local caches and in-memory queues were rejected because they do not coordinate across replicas and lose work on restart. MongoDB change streams alone were not selected as the general queue mechanism because notification delivery needs retry, backoff, deduplication, and dead-letter semantics.

## Validation criteria

Test cache failure, broker failure, worker restart, duplicate delivery, delayed jobs, lock expiry, Socket.IO node scaling, queue backlog, and recovery without loss of authoritative contract or audit data.
