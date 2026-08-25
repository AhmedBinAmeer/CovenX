# ADR-006: Use RBAC with Atomic and Scoped Permissions

**Status:** Accepted
**Date:** 2026-08-25
**Scope:** Identity, authorization, tenant isolation, and resource access

## Context

CovenX serves legal, finance, department, executive, and vendor users with different responsibilities and data scopes. A role-only model is too coarse for actions such as approving a contract, downloading a classified document, configuring a workflow, exporting audit data, or viewing an executive aggregate.

## Decision

CovenX will use role-based access control as the administrative model, with roles composed from atomic resource-action permissions. Each permission is evaluated with resource scope such as tenant, business unit, department, contract ownership, explicit sharing, or assigned workflow task.

Examples include `contract:read`, `contract:create`, `contract:approve`, `document:download`, `workflow:configure`, `obligation:manage`, `audit:read`, `report:read`, and `user:manage`. Authorization is checked at the API boundary and again inside the application service before every sensitive mutation or data access.

## Rationale

RBAC makes common enterprise responsibilities manageable while atomic permissions support least privilege and controlled delegation. Scope rules prevent a valid role from becoming unrestricted access across business units or vendors. Server-side authorization remains authoritative even when the UI hides unavailable actions.

## Consequences

Permissions, role assignments, scope evaluation, delegation, revocation, and vendor sharing require explicit data models and tests. Permission changes must be audited. Executive dashboards must use aggregate-safe projections and cannot expose unauthorized contract detail through counts, filters, exports, or timing signals.

## Rejected alternatives

A role-only model was rejected because it cannot express resource and action granularity. Client-only authorization was rejected because the browser is untrusted. Attribute-based authorization alone was not selected as the administrative baseline because it increases policy complexity; attributes remain available as scope inputs.

## Validation criteria

Maintain an authorization matrix for every module. Test cross-tenant access, business-unit scope, vendor sharing, delegated approval, revoked sessions, direct API calls bypassing the UI, bulk exports, document downloads, and audit access.
