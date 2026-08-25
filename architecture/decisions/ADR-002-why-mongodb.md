# ADR-002: Use MongoDB for Operational Contract Data

**Status:** Accepted
**Date:** 2026-08-25
**Scope:** Contract, workflow, document metadata, and audit projections

## Context

CovenX manages contract metadata, parties, versions, templates, clauses, approvals, signatures, obligations, notifications, and audit records. Several entities have evolving attributes, variable clause structures, and histories that should remain bounded and independently queryable. The platform must support 500,000 contracts, indexed filtering, future sharding, and secure tenant or business-unit scoping.

## Decision

MongoDB will be the durable operational store. Major aggregates such as contracts, versions, approval tasks, obligations, documents, and audit logs will use separate collections with explicit references. Small value objects may be embedded when they share the parent lifecycle. Unbounded histories and binary files will not be embedded in contract documents.

All major records include timestamps and actor fields. Mutable records use optimistic concurrency. Indexes are managed through reviewed migrations and aligned to tenant, status, assignment, date, and identifier query patterns.

## Rationale

MongoDB supports document-shaped contract data, controlled schema evolution, selective projections, compound indexes, and replica-set transactions for short multi-document use cases. Separating version and audit histories prevents a single contract document from growing without bound. Private object storage is better suited to document binaries.

## Consequences

The application must explicitly enforce invariants, tenant scope, schema validation, index health, and transaction boundaries. Eventual consistency is acceptable for dashboard projections and search indexes, but the contract lifecycle state remains authoritative in the contract aggregate. A future sharding strategy must be validated against real access patterns before scale thresholds are reached.

## Rejected alternatives

A relational database was not selected as the primary operational store because the initial domain includes flexible document metadata, templates, clauses, and evolving workflow structures. A document database does not eliminate the need for careful relationship design; relational storage may still be appropriate for specialized reporting if future evidence supports it.

## Validation criteria

Load tests must cover filtered searches, expiry dashboards, approval queues, version retrieval, audit queries, concurrent updates, replica failover, and index selectivity at representative data volumes.
