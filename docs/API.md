# CovenX Enterprise Contract Lifecycle Management Platform

## REST API Specification

**Status:** Implemented REST API contract
**Version:** 1.0
**Base URL:** `/api/v1`
**Transport:** HTTPS and JSON over REST; Socket.IO for authenticated real-time notifications
**Scope:** Implemented API behavior and client integration contract for the CovenX Enterprise Contract Lifecycle Management Platform.

> CovenX APIs expose secure, auditable contract lifecycle operations while keeping authorization, tenant isolation, validation, and lifecycle rules on the server.

## 1. API standards

### 1.1 General rules

All endpoints are under `/api/v1`. JSON requests use `Content-Type: application/json`, except controlled multipart or direct object-storage upload flows. All timestamps are ISO 8601 UTC strings. IDs are opaque strings representing server-side identifiers. Clients must not construct MongoDB queries, pass arbitrary operators, or rely on undocumented fields.

Every request is evaluated for authentication, tenant context, permission, resource scope, request validation, rate limits, and audit requirements.
Mutations should accept an `Idempotency-Key` header where retries could create duplicate business effects. A `X-Request-Id` header may be supplied by trusted clients; the server returns a generated correlation ID when absent.

### 1.2 Request format

Requests use resource-specific JSON bodies with explicit fields. Unknown fields are rejected or ignored according to the endpoint contract; security-sensitive endpoints reject unknown fields. Example:

```json
{
  "title": "Master Services Agreement",
  "contractType": "service",
  "departmentId": "dep_123",
  "businessUnitId": "bu_456",
  "effectiveDate": "2026-09-01T00:00:00Z",
  "expiryDate": "2028-08-31T23:59:59Z",
  "financial": {
    "value": "250000.00",
    "currency": "USD"
  }
}
```

### 1.3 Response format

Successful responses use a consistent envelope:

```json
{
  "success": true,
  "data": {
    "id": "ctr_123",
    "type": "contract",
    "attributes": {
      "contractNumber": "CX-2026-000123",
      "status": "draft"
    }
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

Collection responses use `data` as an array and include pagination metadata:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "requestId": "req_abc123",
    "pagination": {
      "nextCursor": "eyJ1cGRhdGVkQXQiOiIyMDI2...",
      "hasMore": true,
      "limit": 25
    }
  }
}
```

### 1.4 Pagination

High-volume endpoints use cursor pagination. Clients send `limit` between 1 and 100 and an opaque `cursor` returned by the previous response. Cursors are tied to the query scope, sort, and authorization context and must not be modified. Offset pagination is not supported for contracts, approvals, obligations, documents, notifications, or audit logs.

### 1.5 Filtering, sorting, and searching

Filtering uses allowlisted query parameters, for example `status=active`, `businessUnitId=bu_456`, `expiryBefore=2027-01-01T00:00:00Z`, and `ownerId=usr_123`. Multiple values use repeated parameters or documented comma-separated enums. Sorting uses allowlisted fields such as `updatedAt`, `expiryDate`, `createdAt`, and `contractNumber`, with a `-` prefix for descending order. Search uses `q` and is scoped to the caller’s tenant and permissions. Unknown filter or sort fields return `INVALID_QUERY_PARAMETER`.

### 1.6 Error response structure

Errors use the following structure:

```json
{
  "success": false,
  "error": {
    "code": "CONTRACT_NOT_FOUND",
    "message": "Contract does not exist",
    "details": [
      {
        "field": "contractId",
        "reason": "The referenced contract was not found in the current tenant scope"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

| HTTP status | Error codes | Meaning |
|---|---|---|
| 400 | `INVALID_REQUEST`, `VALIDATION_FAILED`, `INVALID_QUERY_PARAMETER` | Malformed or invalid input. |
| 401 | `AUTHENTICATION_REQUIRED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `REFRESH_REUSE_DETECTED` | Missing or invalid authentication. |
| 403 | `FORBIDDEN`, `PERMISSION_DENIED`, `RESOURCE_SCOPE_DENIED` | Authenticated identity lacks required authority or scope. |
| 404 | `RESOURCE_NOT_FOUND`, resource-specific not-found code | Resource does not exist in the caller’s visible scope. |
| 409 | `CONFLICT`, `VERSION_CONFLICT`, `INVALID_LIFECYCLE_TRANSITION`, `DUPLICATE_RESOURCE`, `IDEMPOTENCY_CONFLICT` | State or concurrency conflict. |
| 413 | `PAYLOAD_TOO_LARGE`, `FILE_TOO_LARGE` | Request or file exceeds policy. |
| 415 | `UNSUPPORTED_MEDIA_TYPE`, `FILE_TYPE_NOT_ALLOWED` | Unsupported content type. |
| 422 | `BUSINESS_RULE_FAILED`, `WORKFLOW_NOT_SATISFIED` | Valid syntax but invalid business operation. |
| 429 | `RATE_LIMITED` | Client or identity exceeded a rate limit. |
| 500 | `INTERNAL_ERROR` | Unexpected server failure; response omits internal details. |
| 503 | `DEPENDENCY_UNAVAILABLE`, `SERVICE_NOT_READY` | Required dependency or provider is unavailable. |

Error messages never include passwords, tokens, storage credentials, private document content, or stack traces. Authorization failures do not reveal whether an out-of-scope resource exists.

## 2. Authentication APIs

Authentication endpoints establish and maintain the user session. Login and refresh are rate-limited and audited. Access tokens are short-lived JWTs; refresh tokens are opaque, rotated, stored hashed, and associated with a revocable session.

### POST `/auth/register`

**Purpose:** Create a local user invitation or registration where tenant policy permits it.
**Authentication:** Authenticated; public registration is disabled by default.
**Permission:** `user:create` or a configured invitation capability.

**Request:** `{ email, password, firstName, lastName, roleIds?, departmentId?, businessUnitIds? }`. Password policy, email normalization, role scope, and tenant invitation policy are validated.

**Response:** `201` with a safe user resource and invitation/session status. Passwords and tokens are never returned.

**Errors:** `VALIDATION_FAILED`, `DUPLICATE_RESOURCE`, `PERMISSION_DENIED`, `ROLE_SCOPE_DENIED`, `INVITATIONS_DISABLED`.

### POST `/auth/login`

**Purpose:** Authenticate a local identity.
**Authentication:** None; rate-limited.
**Permission:** None.

**Request:** `{ email, password, deviceLabel?, rememberMe? }`.

**Response:** `200` with `{ user, accessToken, expiresAt, session }`. The refresh token is delivered only through the approved HTTP-only Secure cookie policy.

**Errors:** `INVALID_CREDENTIALS`, `ACCOUNT_SUSPENDED`, `ACCOUNT_DEACTIVATED`, `AUTHENTICATION_RATE_LIMITED`, `MFA_REQUIRED` where configured.

### POST `/auth/logout`

**Purpose:** Revoke the current session and refresh token.
**Authentication:** Required.
**Permission:** Authenticated session owner.

**Request:** Empty body; server identifies the session from the token and cookie.

**Response:** `204` with cleared refresh cookie.

**Errors:** `AUTHENTICATION_REQUIRED`, `SESSION_NOT_FOUND`.

### POST `/auth/refresh`

**Purpose:** Rotate the refresh token and issue a new access token.
**Authentication:** Valid refresh cookie or approved refresh transport.
**Permission:** Active session.

**Request:** Empty body or provider-specific refresh context; refresh token is not accepted in JSON by default.

**Response:** `200` with `{ accessToken, sessionId, rotated }` and a rotated refresh cookie.

**Errors:** `TOKEN_INVALID`, `TOKEN_EXPIRED`, `REFRESH_REUSE_DETECTED`, `SESSION_REVOKED`, `ACCOUNT_DEACTIVATED`.

### GET `/auth/me`

**Purpose:** Return the current safe user profile and effective authorization context.
**Authentication:** Required.
**Permission:** Authenticated session owner.

**Response:** `200` with `{ user, roles, permissions, scope }`.

**Errors:** `AUTHENTICATION_REQUIRED`, `SESSION_REVOKED`.

## 3. User management APIs

All user administration requires `user:read`, `user:create`, `user:update`, or `user:manage` and is constrained by tenant and organizational scope. Deactivation is preferred over destructive deletion because audit and contract history require stable actor references.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /users` | Search and list users | `q`, `status`, `roleId`, `departmentId`, `businessUnitId`, `limit`, `cursor`, `sort` | `200` user collection | `user:read` |
| `GET /users/:id` | Retrieve a user | Path ID | `200` safe user resource | `user:read` plus scope |
| `POST /auth/register` | Invite/create user | `email`, `password`, `firstName`, `lastName`, role IDs, organization scope | `201` user resource | `user:create` |
| `PATCH /users/:id` | Update profile, role, scope, or status | Allowlisted changed fields and concurrency token | `200` updated user | `user:update` or `user:manage` |
| `DELETE /users/:id` | Deactivate user | Optional `reason` and `deactivateSessions` | `204` or `200` deactivation result | `user:manage` |

`PATCH /users/:id` supports activation and deactivation through controlled `status` transitions. Role or scope changes emit audit events and invalidate authorization caches. Errors include `USER_NOT_FOUND`, `DUPLICATE_RESOURCE`, `ROLE_SCOPE_DENIED`, `INVALID_STATUS_TRANSITION`, and `VERSION_CONFLICT`.

## 4. Role and permission APIs

Role and permission changes are highly privileged and audited. A caller may assign only permissions and scopes that its own authority permits.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /roles` | List roles | `status`, `q`, pagination | `200` role collection | `role:read` |
| `POST /roles` | Create role | `name`, `key`, `permissionIds`, `scopeRules` | `201` role resource | `role:create` |
| `PATCH /roles/:id` | Update role | Permission and scope changes plus version token | `200` role resource | `role:update` |
| `GET /permissions` | List atomic permissions | `resource`, `action`, `status` | `200` permission collection | `permission:read` or `user:manage` |

Permission assignment is performed through `PATCH /users/:id` or an approved role-assignment subresource. The API rejects unknown permission keys, cross-tenant role IDs, privilege escalation beyond the caller’s scope, and modifications to protected system roles. Errors include `PERMISSION_NOT_FOUND`, `ROLE_NOT_FOUND`, `PRIVILEGE_ESCALATION_DENIED`, and `SCOPE_RULE_INVALID`.

## 5. Contract APIs

Contract resources implement the lifecycle state machine documented in the System Architecture Document. The server validates required metadata, dates, parties, financial values, version tokens, workflow conditions, and permissions for every operation.

### Core contract endpoints

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /contracts` | Search/list contracts | `q`, `status`, `contractType`, `ownerId`, `departmentId`, `businessUnitId`, `expiryBefore`, `expiryAfter`, `limit`, `cursor`, `sort` | `200` contract collection | `contract:read` |
| `POST /contracts` | Create draft contract | `contractNumber?`, `title`, `contractType`, `parties`, `ownerId`, org fields, dates, financial, metadata | `201` draft contract | `contract:create` |
| `GET /contracts/:id` | Retrieve contract detail | Path ID; optional `include` allowlist | `200` contract resource | `contract:read` plus scope |
| `PATCH /contracts/:id` | Update editable contract data | Changed fields, `version` | `200` contract resource | `contract:update` plus scope |
| `DELETE /contracts/:id` | Cancel/delete draft | Optional `reason`, `version` | `204` | `contract:delete` and draft-only policy |
| `POST /contracts/:id/submit-review` | Move Draft to Review | `{ version, comment? }` | `200` contract and operation metadata | `contract:submit-review` |
| `POST /contracts/:id/archive` | Archive eligible contract | `{ version, reason }` | `200` archived contract | `contract:archive` |
| `POST /contracts/:id/renew` | Start renewal process | `{ version, targetExpiryDate?, templateId?, comment? }` | `201` renewal operation or draft | `contract:renew` |
| `GET /contracts/:id/history` | Retrieve lifecycle/audit history | `limit`, `cursor`, `from`, `to`, `eventType` | `200` history collection | `contract:history` or `audit:read` |
| `GET /contracts/:id/versions` | List versions | `state`, pagination | `200` version collection | `contract:read` |
| `POST /contracts/:id/versions` | Create new revision | `changeSummary`, content/document refs, `baseVersionId` | `201` contract version | `contract:update` |

### Collaborative negotiation endpoints

CovenX collaborative negotiation keeps every redline as a new immutable `ContractVersion`. Signed, active, monitoring, renewal, and archived contracts are locked against redline creation. Draft and review contracts require an optimistic contract version token, so concurrent edits fail safely with `VERSION_CONFLICT` rather than overwriting another reviewer’s work.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /contracts/:id/compare` | Compare two tenant-scoped contract versions | `fromVersionId`, `toVersionId` | `200` side-by-side diff blocks and change summary | `contract:read` |
| `POST /contracts/:id/redlines` | Create a governed redline version | `baseVersionId`, `expectedContractVersion`, `changeSummary`, `operations[]` | `201` updated contract and immutable version | `contract:collaborate` |
| `GET /contracts/:id/comments` | List anchored discussion threads | `versionId?`, `status?` | `200` comment collection | `contract:read` |
| `POST /contracts/:id/comments` | Add an anchored comment or reply | `versionId`, `parentId?`, `body`, `anchor`, `mentions[]?` | `201` comment | `contract:comment` |
| `POST /comments/:id/resolve` | Resolve a discussion thread | `{ version }` | `200` resolved comment | `contract:resolve-comment` |

Redline operations are explicit `insert`, `delete`, or `replace` operations with bounded character anchors. Mentions are validated against active users in the current tenant and generate notification events without exposing contract content beyond the bounded message preview. Collaboration events include `ContractRedlineCreated.v1`, `ContractCommentCreated.v1`, and `ContractCommentResolved.v1`; Socket.IO broadcasts are tenant- and contract-room scoped.

Contract states are `draft`, `review`, `approval`, `signature`, `active`, `monitoring`, `renewal`, and `archived`. `submit-review` is valid only from Draft with required metadata and a current version. Archive is allowed only by policy for terminated, expired, or otherwise eligible contracts. Renewal creates a governed renewal draft or operation and never mutates the historical signed version.

Lifecycle errors include `CONTRACT_NOT_FOUND`, `CONTRACT_VERSION_NOT_FOUND`, `INVALID_LIFECYCLE_TRANSITION`, `REQUIRED_METADATA_MISSING`, `WORKFLOW_NOT_SATISFIED`, `VERSION_CONFLICT`, `CONTRACT_LOCKED`, and `RESOURCE_SCOPE_DENIED`.

### Document intelligence and semantic retrieval endpoints

Clean, checksum-verified PDF, DOCX, and plain-text documents can be indexed into tenant-scoped evidence chunks. Indexing stores text hashes, source document/version references, bounded chunk metadata, and an embedding model identifier; raw storage keys and vectors are never returned to clients. The `document:index` permission is required for ingestion, while semantic search requires `contract:read` and is additionally constrained by an optional contract ID.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `POST /documents/:id/index` | Extract and index a clean uploaded document | Empty JSON body | `202` indexing result with chunk count and model | `document:index` |
| `POST /search/semantic` | Retrieve relevant indexed evidence chunks | `{ q, contractId?, limit? }` | `200` ranked evidence collection | `contract:read` |

PDF and DOCX parsing occurs only after malware scan and upload checksum verification. Unsupported MIME types, unavailable object content, empty extraction, and documents that are not clean/uploaded fail closed. OpenAI-compatible embeddings are used only when explicitly configured; local development falls back to a deterministic non-secret embedding provider. Semantic results are ranked server-side and omit embedding vectors.

### Contract intelligence endpoints

CovenX Intelligence is server-side only and receives tenant-scoped contract evidence. It must not be treated as an autonomous legal decision-maker. Responses include evidence pointers, confidence, missing-information warnings, and a human review state. When `AI_PROVIDER=mock`, the API remains runnable locally and returns conservative metadata-based results; when `AI_PROVIDER=openai`, the server uses the configured server-side model and API key.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /contracts/:id/intelligence` | List persisted analyses and questions | Path contract ID | `200` intelligence collection | `contract:read` plus scope |
| `POST /contracts/:id/intelligence/analyze` | Generate summary, extracted terms, risks, missing-information findings, and optional playbook comparison | `{ playbook?: string[] }` | `201` intelligence analysis | `contract:update` plus scope |
| `POST /contracts/:id/intelligence/ask` | Ask an evidence-grounded question about the selected contract | `{ question, intelligenceId? }` | `201` intelligence answer with citations | `contract:read` plus scope |
| `POST /intelligence/:id/review` | Accept or override an AI result | `{ decision: 'accepted' \| 'overridden', notes? }` | `200` reviewed intelligence record | `contract:update` plus scope |

AI errors include `AI_EMPTY_RESPONSE`, `INTELLIGENCE_NOT_FOUND`, `CONTRACT_NOT_FOUND`, `VALIDATION_FAILED`, `PERMISSION_DENIED`, and provider/network errors. The service stores provider/model metadata, an input hash for repeatability, source version, evidence, reviewer, review decision, and review timestamp. It never stores the API key or raw authorization headers.

### Contract resource example

```json
{
  "id": "ctr_123",
  "type": "contract",
  "attributes": {
    "contractNumber": "CX-2026-000123",
    "title": "Master Services Agreement",
    "contractType": "service",
    "parties": [{ "name": "Example Vendor", "role": "vendor" }],
    "ownerId": "usr_123",
    "departmentId": "dep_456",
    "businessUnitId": "bu_789",
    "status": "review",
    "effectiveDate": "2026-09-01T00:00:00Z",
    "expiryDate": "2028-08-31T23:59:59Z",
    "financial": { "value": "250000.00", "currency": "USD" },
    "currentVersionId": "ver_001",
    "version": 4
  }
}
```

## 6. Template APIs

Templates are governed authoring assets. Published template versions are immutable for contracts already created from them.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /templates` | List templates | `q`, `contractType`, `status`, pagination | `200` template collection | `template:read` |
| `POST /templates` | Create template | `name`, `key`, `contractType`, `description`, `variables`, `clauseRefs` | `201` template | `template:create` |
| `GET /templates/:id` | Retrieve template | Path ID, optional version | `200` template | `template:read` |
| `PATCH /templates/:id` | Update or publish template | Changed fields, `version`, publication action | `200` template | `template:update` or `template:publish` |

Errors include `TEMPLATE_NOT_FOUND`, `TEMPLATE_KEY_CONFLICT`, `CLAUSE_NOT_FOUND`, `PUBLISHED_VERSION_IMMUTABLE`, and `TEMPLATE_VALIDATION_FAILED`.

## 7. Clause library APIs

Clauses are governed reusable content. High-risk or controlled clauses require an approval workflow before publication.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /clauses` | Search clauses | `q`, `category`, `riskClassification`, `status`, pagination | `200` clause collection | `clause:read` |
| `POST /clauses` | Create clause | `key`, `title`, `body`, `category`, `riskClassification`, `tags` | `201` clause | `clause:create` |
| `PATCH /clauses/:id` | Update, submit, approve, or deprecate clause | Changed fields, `version`, controlled action | `200` clause | `clause:update`, `clause:approve`, or `clause:manage` |

Clause approval transitions record reviewer, reason, version, and audit evidence. Errors include `CLAUSE_NOT_FOUND`, `CLAUSE_KEY_CONFLICT`, `RISK_APPROVAL_REQUIRED`, `CLAUSE_VERSION_CONFLICT`, and `INVALID_CLAUSE_STATUS`.

## 8. Workflow APIs

### Workflow definition endpoints

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /workflows` | List workflow definitions | `status`, `contractType`, pagination | `200` workflow collection | `workflow:read` |
| `POST /workflows` | Create workflow definition | `key`, `name`, `triggerRules`, `stages`, `rejectionPolicy` | `201` workflow | `workflow:create` |
| `GET /workflows/:id` | Retrieve definition | Path ID/version | `200` workflow | `workflow:read` |
| `PATCH /workflows/:id` | Update or publish definition | Changed fields, `version`, action | `200` workflow | `workflow:update` or `workflow:publish` |

A published workflow version cannot be changed in place if it has created tasks. A new version is created instead.

### Workflow execution endpoints

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /contracts/:id/approvals` | View contract approval tasks and timeline | `status`, pagination | `200` approval collection | `approval:read` plus scope |
| `POST /approvals/:id/approve` | Approve assigned task | `{ comment?, version }` | `200` task and contract transition result | `approval:approve` plus assignment |
| `POST /approvals/:id/reject` | Reject and return for rework | `{ reason, returnState?, version }` | `200` task and contract transition result | `approval:reject` plus assignment |
| `POST /approvals/:id/delegate` | Delegate task temporarily | `{ delegateToUserId, reason, expiresAt, version }` | `200` task | `approval:delegate` |

Approval routing selects a published workflow using contract type, value thresholds, risk, business unit, department, and review domain. Tasks carry assignee/role, due date, SLA, quorum, comments, delegation, and escalation state. Workers create reminders before due dates and escalate overdue tasks without erasing original assignment evidence.

Errors include `APPROVAL_NOT_FOUND`, `APPROVAL_NOT_ASSIGNED`, `APPROVAL_ALREADY_COMPLETED`, `APPROVAL_REASON_REQUIRED`, `DELEGATION_NOT_ALLOWED`, `WORKFLOW_NOT_SATISFIED`, `SLA_POLICY_INVALID`, and `VERSION_CONFLICT`.

## 9. Signature APIs

Signature APIs support internal, simulated, and future provider-backed signing. Provider callbacks are authenticated separately and cannot be used as ordinary user endpoints.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `POST /contracts/:id/signature/request` | Request signatures for approved version | `versionId`, `signers`, `provider`, `expiresAt` | `202` signature operation | `signature:request` |
| `GET /contracts/:id/signatures` | List signing status | `status`, pagination | `200` signature collection | `signature:read` |
| `POST /signatures/:id/complete` | Complete internal/simulated signature | `{ evidenceRef?, attestation, version }` | `200` signature | `signature:complete` |
| `POST /signatures/:id/decline` | Decline signing | `{ reason, version }` | `200` signature | `signature:decline` |

Signing can begin only for the approved version and required approval state. Completion advances the contract to Active only when all required signatures are complete. Errors include `SIGNATURE_NOT_FOUND`, `SIGNATURE_VERSION_MISMATCH`, `APPROVALS_INCOMPLETE`, `SIGNER_NOT_AUTHORIZED`, `SIGNATURE_EXPIRED`, and `SIGNATURE_ALREADY_COMPLETED`.

## 10. Obligation management APIs

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /obligations` | Search obligations | `contractId`, `ownerId`, `type`, `priority`, `status`, `dueBefore`, pagination | `200` obligation collection | `obligation:read` |
| `POST /obligations` | Create obligation | `contractId`, `type`, `title`, `ownerId`, `dueDate`, `priority`, `recurrence`, `escalation` | `201` obligation | `obligation:create` |
| `GET /obligations/:id` | Retrieve obligation | Path ID | `200` obligation | `obligation:read` |
| `PATCH /obligations/:id` | Update obligation | Changed fields, `version` | `200` obligation | `obligation:update` |
| `POST /obligations/:id/complete` | Complete obligation | `{ completionNote, evidenceDocumentIds?, version }` | `200` obligation | `obligation:complete` |

Due-date workers generate deduplicated reminders and escalate overdue obligations according to policy. Errors include `OBLIGATION_NOT_FOUND`, `OWNER_SCOPE_DENIED`, `DUE_DATE_INVALID`, `OBLIGATION_ALREADY_COMPLETED`, and `VERSION_CONFLICT`.

## 8. Document APIs

Documents use a controlled upload flow. Binary content is stored in private object storage; MongoDB stores metadata, security state, relationship, checksum, and storage reference.

### POST `/documents/upload`

**Purpose:** Initiate or finalize an authorized document upload.
**Authentication:** Required.
**Permission:** `document:upload` plus contract/version scope.

**Request:** Upload initiation uses `{ contractId, versionId?, documentType, fileName, mimeType, sizeBytes, classification }`. The server validates file policy and returns `201` with `{ documentId, uploadUrl, uploadHeaders, expiresAt, status: "pending" }`. A finalize action confirms the uploaded object and checksum.

**Response:** `200` or `202` document metadata with `scanStatus: pending`; it is not downloadable until clean.

**Errors:** `FILE_TYPE_NOT_ALLOWED`, `FILE_TOO_LARGE`, `RESOURCE_SCOPE_DENIED`, `UPLOAD_SESSION_EXPIRED`, `CHECKSUM_MISMATCH`, `MALWARE_DETECTED`.

| Method and path | Purpose | Required permission |
|---|---|---|
| `GET /documents` | List safe document metadata, optionally filtered by contract, obligation, or scan status | `document:read` |
| `GET /documents/:id` | Retrieve safe metadata and scan status | `document:read` |
| `GET /documents/:id/download` | Issue short-lived download URL or stream | `document:download` |
| `DELETE /documents/:id` | Quarantine or dispose eligible document | `document:delete` or `document:manage` |

Downloads are audited. Storage keys, credentials, unrestricted object URLs, and quarantined content are never exposed. Deletion respects legal holds, retention rules, version immutability, and dependent contract evidence.

## 12. Notification APIs

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /notifications` | List current user notifications | `status`, `type`, pagination | `200` notification collection | Authenticated recipient |
| `PATCH /notifications/:id/read` | Mark notification read | `{ version? }` | `200` notification | Recipient or `notification:manage` |
| `POST /notifications/preferences` | Set channel and category preferences | `{ categories, channels, quietHours, enabled }` | `200` preferences | Authenticated user |

Notification delivery is asynchronous. Queue status, retries, deduplication, and provider errors are not exposed as mutable client controls. Errors include `NOTIFICATION_NOT_FOUND`, `RECIPIENT_SCOPE_DENIED`, and `PREFERENCE_VALIDATION_FAILED`.

## 13. Dashboard APIs

Dashboard endpoints return permission-filtered aggregates and freshness metadata. They use cached or precomputed projections and never substitute cache data for authorization.

| Method and path | Purpose | Query parameters | Success | Required permission |
|---|---|---|---|---|
| `GET /dashboard/summary` | Executive and operational summary | `businessUnitId?`, `departmentId?`, `from?`, `to?` | `200` counts, values, compliance, freshness | `report:read` |
| `GET /dashboard/contracts` | Contract status, expiry, type, and value aggregates | Scope and period filters | `200` aggregate data | `report:read` |
| `GET /dashboard/approvals` | Pending, overdue, and cycle-time metrics | Scope and period filters | `200` aggregate data | `report:read` |
| `GET /dashboard/obligations` | Due, overdue, completed, and compliance metrics | Scope and period filters | `200` aggregate data | `report:read` |

Aggregation strategy uses indexed MongoDB queries, dashboard projections, and Redis short-lived caching. Responses include `generatedAt`, `dataAsOf`, and `cacheStatus` or equivalent freshness metadata. Detailed contract access requires separate authorized resource requests.

## 14. Audit APIs

Audit access is restricted because records can contain sensitive actor, IP, workflow, and contract-change context. Audit searches require tenant scope and time bounds.

| Method and path | Purpose | Query parameters | Success | Required permission |
|---|---|---|---|---|
| `GET /audit` | Search audit events | `entityType`, `entityId`, `actorId`, `action`, `from`, `to`, `result`, pagination | `200` audit collection | `audit:read` |
| `GET /audit/contracts/:id` | Retrieve a contract’s audit history | `from`, `to`, `eventType`, pagination | `200` contract audit collection | `audit:read` plus contract scope |

Audit responses contain redacted before/after summaries and never expose secrets. Large exports are asynchronous operations with separate authorization and audit records. Errors include `AUDIT_ACCESS_DENIED`, `AUDIT_TIME_RANGE_REQUIRED`, and `AUDIT_EXPORT_NOT_ALLOWED`.

## 15. Integration APIs

Integration configuration is administrative and secrets are written to a managed secret store rather than returned through the API. Supported adapter categories include e-signature providers, ERP systems, identity providers, email, OCR, and search.

| Method and path | Purpose | Request fields | Success | Required permission |
|---|---|---|---|---|
| `GET /integrations` | List configured integrations and health metadata | `type`, `status` | `200` redacted integration collection | `integration:read` |
| `POST /integrations` | Register provider adapter | `type`, `provider`, non-secret configuration, scopes | `201` redacted integration | `integration:create` |
| `PATCH /integrations/:id` | Update, test, enable, or disable adapter | Allowlisted config/action, `version` | `200` redacted integration | `integration:update` |
| `POST /webhooks/:provider` | Receive provider callback | Provider-specific signed payload | `202` acknowledgment | Provider signature validation, no user RBAC |

Webhook handlers validate provider signatures, replay protection, event IDs, and expected resource correlation before enqueueing idempotent processing. They do not trust user-supplied tenant IDs or status transitions.

## 16. Event API design

The following are internal versioned domain events. They are not public REST endpoints. Events contain minimal data and references; consumers re-fetch authorized details through repositories or APIs where required.

| Event | Payload | Producer | Consumers |
|---|---|---|---|
| `ContractCreated.v1` | `eventId`, `occurredAt`, `tenantId`, `contractId`, `contractNumber`, `actorId`, `requestId` | Contract service | Audit, dashboard projection, search indexer |
| `ContractSubmitted.v1` | `eventId`, `occurredAt`, `tenantId`, `contractId`, `versionId`, `workflowId`, `submittedBy` | Contract/workflow service | Workflow task creator, notifications, audit |
| `ApprovalCompleted.v1` | `eventId`, `occurredAt`, `tenantId`, `approvalTaskId`, `contractId`, `decision`, `actorId`, `completedAt` | Workflow service | Contract transition, notifications, audit, dashboard |
| `ContractSigned.v1` | `eventId`, `occurredAt`, `tenantId`, `contractId`, `versionId`, `signatureIds`, `signedAt` | Signature service | Contract activation, documents, notifications, audit |
| `ObligationCreated.v1` | `eventId`, `occurredAt`, `tenantId`, `obligationId`, `contractId`, `ownerId`, `dueDate`, `type` | Obligation service | Reminder scheduler, dashboard, audit |
| `RenewalDue.v1` | `eventId`, `occurredAt`, `tenantId`, `contractId`, `expiryDate`, `renewalOwnerId`, `noticeDays` | Renewal scheduler | Notifications, renewal workflow, dashboard, audit |
| `DocumentUploaded.v1` | `eventId`, `occurredAt`, `tenantId`, `documentId`, `contractId`, `versionId`, `scanStatus`, `checksum` | Document service | Malware/OCR worker, search indexer, audit |

Events are published through a durable outbox or equivalent recovery mechanism after the business transaction commits. Consumers use idempotency keys, retry with backoff, dead-letter queues, and schema-version compatibility. Event payloads do not contain passwords, tokens, storage credentials, or unrestricted document content.

## 17. Security requirements

### JWT handling

Access tokens are short-lived JWTs containing only the minimum identity, tenant, session, authentication-version, and authorization-context claims. Refresh tokens are opaque, rotated, stored hashed, bound to sessions, and revoked on logout, reuse detection, password reset, deactivation, or administrative action. The API rejects expired, malformed, wrong-audience, wrong-issuer, or revoked-session tokens.

### RBAC enforcement

Every protected endpoint declares a permission and scope requirement. The API checks tenant and resource scope at the boundary, and the application service repeats authorization before sensitive mutations. UI visibility is not a security control. Vendor users are restricted to explicit shares; dashboard aggregates are permission-filtered; audit exports and document downloads are separately permissioned and audited.

### Rate limits and abuse controls

Authentication, refresh, password, search, document initiation, exports, webhooks, and mutation endpoints have separate identity- and scope-aware limits. Payload sizes, query complexity, page limits, upload types, and regex/search operators are bounded. Repeated authorization failures and suspicious file activity produce security telemetry without leaking resource existence.

### Input validation and error safety

Schemas validate types, lengths, enums, dates, financial precision, IDs, cross-field rules, and allowed query operators. The API rejects MongoDB operators and arbitrary sort/projection fields. Error responses are stable, safe, and correlated by request ID; internal diagnostics remain in protected logs.

### File security

Upload initiation enforces permission, contract scope, MIME allowlist, size limit, opaque storage key, checksum, malware scanning, quarantine, and retention policy. Downloads are short-lived and audited. Provider callbacks and integration credentials use separate trust controls.

### Audit requirements

Authentication attempts, permission decisions, contract creation and changes, lifecycle transitions, approvals, delegations, signatures, obligations, document uploads/downloads/deletions, notification administration, integration changes, and audit access are recorded. Audit events are append-only, redact sensitive values, carry actor/request/IP context, and are never bypassed by direct controller paths.

## 18. API versioning strategy

The current public version is `/api/v1`. Backward-compatible additions may be released within v1. Breaking changes require `/api/v2`, a new contract version, migration guidance, and a deprecation period. The server may support content negotiation or explicit `Accept` headers for minor representation changes, but the URL major version remains stable for clients.

Event schemas use independent event versions such as `ContractCreated.v1`. Deprecated fields remain readable for the announced support period, are documented as deprecated, and are removed only after usage analysis. Database migrations remain backward-compatible with the active API versions during rollout.

## 19. API governance and testing

Every endpoint must have an owner, permission declaration, request/response schema, error catalogue, audit events, rate-limit class, idempotency behavior, pagination/search contract, and data-sensitivity classification. Contract tests verify response envelopes and status codes. Integration tests verify tenant isolation, RBAC, lifecycle transitions, version conflicts, audit completeness, queue/event publication, document security, and provider callback validation.

Performance tests cover contract search, dashboard aggregation, approval inboxes, document metadata queries, audit pagination, concurrent authentication, and 25,000 concurrent user connections. No endpoint is considered production-ready until its query plan, index usage, failure behavior, and observability signals are reviewed.

## References

[1]: ./PRD.md "CovenX Product Requirements Document"
[2]: ./Architecture.md "CovenX System Architecture Document"
[3]: ./Database.md "CovenX Database Design Document"
[4]: ../README.md "CovenX repository README and engineering foundation"


## Enterprise hardening additions

### Contract intake portal

`GET /api/v1/intake/questionnaires` returns published, tenant-scoped questionnaires. `POST /api/v1/intake/questionnaires` creates a versioned questionnaire for authorized operations users. `GET /api/v1/intake/requests` lists tenant-scoped requests, and `POST /api/v1/intake/requests` validates required answers before creating a request. Authorized operations users can call `POST /api/v1/intake/requests/:id/convert` to create a draft contract and immutable initial version from a request.

Required permissions are `intake:read`, `intake:create`, and `intake:manage`. Questionnaire answers are stored with the questionnaire version that validated them. Intake conversion creates an audit event and publishes `IntakeRequestSubmitted.v1` for downstream automation.

### Integration registry and webhooks

`GET /api/v1/integrations` returns redacted tenant-scoped integration records. `POST /api/v1/integrations` stores provider configuration and encrypts optional secrets with AES-256-GCM using `INTEGRATION_ENCRYPTION_KEY`. Secrets are never returned to the frontend. `PATCH /api/v1/integrations/:id` uses an optimistic `version` field, and `POST /api/v1/integrations/:id/test` performs a configuration health check.

Supported provider types are `salesforce`, `slack`, and `docusign`. Provider credentials and external account choices remain environment/configuration dependent. `POST /api/v1/webhooks/:provider` verifies a provider signature, rejects stale Slack timestamps, deduplicates `externalEventId`, stores a tenant-scoped webhook event, and publishes `IntegrationWebhookReceived.v1`.

### Durable worker runtime

The backend worker runtime is controlled by `WORKER_ENABLED`, `WORKER_POLL_INTERVAL_MS`, and `WORKER_SCHEDULE_INTERVAL_MS`. It processes recoverable outbox delivery and scheduled reminder work and shuts down with the API process. Provider-specific delivery and high-volume document embedding jobs should be attached to the same durable queue boundary before production scale validation.
