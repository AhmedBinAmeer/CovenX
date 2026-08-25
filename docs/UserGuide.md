# CovenX Enterprise Contract Lifecycle Management Platform
## Full-Fledged Operating and Use-Case Guide

**Audience:** CovenX workspace administrators, legal teams, contract managers, business owners, approvers, finance reviewers, executives, auditors, and vendor users.

**Product scope:** CovenX manages the full contract lifecycle:

> **Create → Review → Approve → Sign → Monitor → Renew → Archive**

This guide explains how an organization uses CovenX in daily operations, what each role can do, which screens support each activity, how secure documents and approvals work, and what administrators should configure before production use.

## 1. What CovenX is used for

CovenX is the system of record for enterprise agreements. It brings contract creation, legal review, approval routing, signatures, obligations, document evidence, renewals, notifications, reporting, and audit history into one controlled workspace.

A typical business process begins when a business owner needs an agreement with a supplier, customer, partner, employee, or strategic counterparty. The agreement is created as a governed draft, enriched with parties and commercial details, reviewed by legal, routed through the correct approval workflow, executed through signature, monitored for obligations and expiry, renewed when appropriate, and ultimately archived according to organizational policy.

CovenX separates **operational visibility** from **authorization**. Users see the screens relevant to their roles, but the backend remains authoritative for tenant isolation, resource scope, permissions, validation, lifecycle rules, optimistic concurrency, secure document access, and audit logging.

## 2. Roles and responsibilities

The current RBAC seed defines six enterprise roles. The role keys below are the machine keys used by the implementation; the display names are human-readable descriptions of the role’s purpose.

| Role key | Business responsibility | Typical users |
|---|---|---|
| `super-admin` | Full platform administration, access management, governance, reporting, audit, and configuration | CovenX or tenant platform administrator |
| `legal-officer` | Legal review, contract authoring and updates, approval decisions, signature oversight, document handling, and audit review | Legal operations or legal department lead |
| `department-manager` | Department-owned contract creation, business approvals, obligations, renewals, reporting, and document handling | Department head or procurement leader |
| `finance-reviewer` | Financial and commercial approval review, contract history, obligation visibility, documents, and reporting | Finance controller or commercial reviewer |
| `executive-approver` | Executive approval of contracts and access to contract history and reporting | Executive sponsor or delegated executive |
| `vendor-user` | Restricted counterparty or supplier access to visible contracts, approval tasks, and permitted documents | Supplier, vendor, or external collaborator |

The role is not a substitute for scope. A user may have a permission such as `contract:read` and still be unable to access a contract outside the user’s tenant, organizational scope, department, business unit, assignment, or approval task.

### 2.1 Permission families

| Permission family | Main actions |
|---|---|
| User administration | `user:read`, `user:create`, `user:update`, `user:manage` |
| Roles and permissions | `role:read`, `role:create`, `role:update`, `permission:read` |
| Contracts | `contract:read`, `contract:create`, `contract:update`, `contract:submit-review`, `contract:archive`, `contract:history`, `renewal:create` |
| Approvals | `approval:read`, `approval:approve`, `approval:reject`, `approval:delegate` |
| Signatures | `signature:request`, `signature:read`, `signature:complete`, `signature:decline` |
| Obligations | `obligation:read`, `obligation:create`, `obligation:update`, `obligation:complete` |
| Documents | `document:read`, `document:upload`, `document:download`, `document:delete`, `document:manage` |
| Reporting and audit | `report:read`, `audit:read` |

Every mutating operation should be treated as a controlled business event. Users should expect validation, permission checks, scope checks, version checks, and audit records.

## 3. First-time setup for an organization

A `super-admin` performs the initial setup. First, the administrator supplies the runtime environment values and starts MongoDB, Redis, the CovenX backend, and the React frontend. Local development uses mock document storage and mock email delivery by default. Production organizations should configure S3-compatible private object storage, email delivery, strong secrets, TLS, and their approved operational controls.

After the workspace is running, the administrator seeds or confirms the standard roles and permissions, creates the initial tenant users, assigns the appropriate role IDs, and verifies that each user has the correct department or business-unit scope. The administrator should then create the clause library, templates, and approval workflows before allowing broad contract authoring.

The recommended setup sequence is:

1. Confirm the tenant identity, organization details, departments, and business units.
2. Confirm the six baseline roles and their permission assignments.
3. Create users through the controlled user-registration path and assign only necessary roles.
4. Create approved clauses, including category, tags, and risk classification.
5. Create templates for recurring contract types and link approved clauses.
6. Create workflows with trigger rules, stages, assignees or roles, SLA hours, quorum, and escalation policy.
7. Configure notification categories, channels, and quiet hours.
8. Perform a test contract from creation through approval, document upload, notification, and audit review.
9. Review the audit log and verify that all test users can access only the resources intended for them.

## 4. Main application screens

| Screen | Primary use |
|---|---|
| Overview | Portfolio KPIs, lifecycle distribution, approval load, overdue obligations, expiry exposure, and compliance indicators |
| Contracts | Search and browse tenant-visible contracts; start a new contract; open contract detail |
| New contract | Create a validated draft with number, title, type, parties, dates, and financial information |
| Contract detail | Manage lifecycle actions, versions, approvals, signatures, documents, and audit history |
| Approvals | Review assigned tasks, approve, reject, comment, or delegate |
| Obligations | Monitor owned commitments and complete them with a completion note and evidence references |
| Documents | Browse secure metadata, scan state, authorized downloads, and deletion controls |
| Notifications | Review in-app notifications, mark items read, and configure delivery preferences |
| Templates | Create and search reusable contract structures |
| Clauses | Create and search approved or draft legal language with risk classification |
| Workflows | Create and search approval workflow definitions |
| Users | Review users and deactivate users when authorized |
| Audit log | Search immutable activity records and investigate sensitive operations |
| Settings | Edit profile details and revoke active sessions |

## 5. End-to-end contract use case

### Use case: create a new supplier agreement

**Actor:** Department manager or legal officer.

The user opens **Contracts** and selects **New contract**. CovenX validates the contract number, title, contract type, parties, dates, financial value, and currency before sending the request. A contract is created in `draft` status, and the backend creates the initial contract version with an immutable version number.

The creator should enter a meaningful contract number, a clear title, the correct contract type, every relevant party, the owner, effective date, expiry date, and commercial value. If the agreement is a recurring structure, the user should begin from an approved template rather than manually recreating standard language.

After saving, the user opens the contract detail page. The detail page shows lifecycle state, current version, dates, value, approvals, signatures, documents, versions, and audit history. The user should confirm the metadata before selecting **Submit review**.

Submitting review requires the current contract version. CovenX changes the state from `draft` to `review`, records an audit event, publishes a contract event, and attempts to execute the matching approval workflow. If the contract has missing required data, is already changed by another user, or fails a workflow rule, the operation is rejected with a visible error rather than silently changing state.

### Use case: legal review and revision

**Actor:** Legal officer.

The legal officer opens the contract from the review queue or contract list, checks parties, dates, commercial terms, risk, clauses, and supporting documents, and reviews the version history. If revisions are required, a new contract version is created with a change summary and reference to the previous version. Historical versions remain available for traceability.

The legal officer should never overwrite a signed or immutable historical version. A revision must explain what changed, who authored it, and which prior version it replaces. After the revision is complete, the contract can be submitted into the governed approval flow again where policy permits.

### Use case: approval decision

**Actor:** Assigned approver, finance reviewer, department manager, or executive approver.

The user opens **Approvals**. The queue shows the contract identifier, workflow stage, due date, task status, and current version. The approver may enter a comment and select **Approve** or **Reject**. A rejection reason should clearly state the required change, missing evidence, or commercial concern.

Approval requests include the task version. If another person has already decided the task, the version is stale, or the user is no longer assigned, CovenX rejects the action and the user must refresh the queue. An approver may use **Delegate** when policy allows and must provide the target reviewer’s user ID or approved assignment identity.

Approvals are auditable. The decision, actor, time, comment or reason, task state, and related contract are retained as part of the operational history.

### Use case: signature execution

**Actor:** Legal officer or authorized signature participant.

Once the contract has reached the signature-ready stage, an authorized user requests signature from the contract detail page. The request includes the provider, the exact contract version, expiry time, and one or more signers. Signers may be internal users or approved vendor identities, and a signing order can be specified.

The signature request progresses through `requested`, `in_progress`, `completed`, `declined`, `expired`, or `cancelled`. Completing or declining a signature requires authorization and evidence or a reason where required. Signature evidence should reference the approved provider record, certificate, envelope, or equivalent execution evidence without placing private signing material into notifications.

### Use case: monitor obligations

**Actor:** Department manager, business owner, contract manager, or assigned obligation owner.

Obligations represent commitments created from a contract. Each obligation should have a contract, owner, type, title, due date, priority, status, recurrence policy where applicable, escalation policy, and evidence references.

The **Obligations** screen shows open commitments, due dates, priority, status, owner, and contract reference. An owner selects **Complete**, provides a meaningful completion note, and attaches or references evidence where applicable. Completion includes the current obligation version to prevent two users from completing or changing the same obligation simultaneously.

Open obligations may be `open`, `in_progress`, `overdue`, or `cancelled`; completed obligations are retained as historical evidence. Reminder and escalation workers can generate notifications for upcoming or overdue deadlines.

### Use case: renew an expiring contract

**Actor:** Contract manager, department manager, legal officer, or authorized renewal user.

The dashboard highlights upcoming expirations, and the contract detail page shows the expiry date. The authorized user selects **Renew** and optionally provides a target expiry date. Renewal creates a governed renewal operation or draft and does not mutate the historical signed version.

The renewal should be reviewed as a new business decision. The user should confirm commercial value, counterparties, changes to terms, new obligations, updated clauses, approval requirements, and signature requirements before the renewal proceeds.

### Use case: archive a completed agreement

**Actor:** Authorized legal or platform administrator.

Archiving is available only for eligible lifecycle states and requires the current contract version. The user confirms that the agreement is no longer active, all required evidence is present, there are no unresolved legal holds, and retention rules allow archival. The archive action is recorded in the audit history and removes the contract from active operational queues while preserving its historical record.

## 6. Secure document use case

### Upload sequence

A user with `document:upload` opens a contract detail page and selects **Upload document**. The frontend calculates a SHA-256 checksum and submits metadata including contract ID, version ID when applicable, document type, file name, MIME type, file size, checksum, and classification.

The backend validates the file policy and returns a short-lived upload URL, required upload headers, document ID, and pending status. The browser uploads the binary directly to the configured storage provider. The frontend then calls the finalize endpoint with the checksum. CovenX verifies object existence and checksum, runs the configured malware scanner, and updates the document to `uploaded` and `clean`, or to `quarantined` and `infected` when the file fails scanning.

The current allowed file types are PDF, Microsoft Word, Office Open XML Word, and plain text. The maximum file size is 50 MB according to the frontend and backend validation contract. File names must not contain path separators. Confidential or restricted material should use the appropriate classification.

### Download and deletion

A user selects the download action only when the document scan status is clean and the upload status is available. The backend issues a short-lived authorized URL after checking tenant scope, document status, and `document:download`. Storage keys and long-lived public URLs are not exposed in the UI.

Deletion requires `document:delete`, the current document version, and compliance with retention and legal-hold policy. The implementation marks the document as deleted and removes the storage object through the configured provider. A document under legal hold or retention protection must not be destroyed.

## 7. Notification and realtime operation

Notifications are generated for events such as new approvals, contract changes, obligation deadlines, renewals, signatures, and document scan completion. The **Notifications** screen shows title, message, category, creation time, and read state. Users select the check action to mark an unread notification as read; the current notification version is submitted to protect against concurrent changes.

Users can open **Preferences** and set categories, channels, quiet hours, and whether notifications are enabled. Supported channels are `email`, `in_app`, and `realtime`. Users should avoid disabling critical categories unless organizational policy permits it.

The workspace connects to authenticated Socket.IO events for notification creation, approval updates, contract updates, obligation updates, and dashboard updates. Relevant screens refresh when these events arrive. If the realtime connection is interrupted, users should use the page refresh control and rely on the durable REST data until reconnection occurs.

## 8. Administration procedures

### User administration

A super administrator creates or invites users through the controlled registration endpoint, assigns role IDs, and supplies first name, last name, department, and business-unit scope. Administrators should apply least privilege, avoid assigning `super-admin` except where necessary, and review user access whenever a person changes department or leaves the organization.

Deactivation is preferred to destructive deletion because contract history and audit records need stable actor references. Deactivation should be accompanied by session revocation and a review of assigned approval tasks, obligations, documents, and workflow ownership.

### Role administration

Role changes are highly privileged. A super administrator should begin with the seeded roles and add custom roles only when the organization has a documented need. Permission assignment should reflect the smallest set of actions required for the job. A role with `document:read` should not automatically receive `document:download`, and a role with `approval:read` should not automatically receive `approval:approve`.

### Template and clause governance

A clause librarian or legal officer creates clauses with stable keys, titles, bodies, categories, risk classification, and tags. High-risk and critical clauses should receive additional review before publication. Templates should reference approved clauses and define variables that are safe for authorized contract authors to populate.

Templates and clauses should be changed through new versions or controlled updates. Published assets must be treated as governed content, not informal text snippets.

### Workflow governance

A workflow administrator creates a stable workflow key, defines trigger rules, configures stages, assigns users or roles, specifies SLA hours and quorum, and documents escalation policy. Workflows should be tested against low-value, high-value, high-risk, and exceptional contracts before publication.

A workflow should make ownership unambiguous. Every stage must have a responsible user or role, a clear SLA, an escalation path, and a rejection policy. A workflow that cannot assign a valid reviewer should not be published for operational use.

### Audit investigation

An auditor or authorized administrator opens **Audit log** to investigate who performed an action, which entity was affected, when it occurred, what the result was, and what request or session context was recorded. Audit records may include actor ID, entity type and ID, old and new values, timestamp, IP address, user agent, request ID, session ID, result, and metadata.

Audit logs should be used for access reviews, approval investigations, document access review, contract change review, incident response, and compliance evidence. They should not be edited through normal application operations.

## 9. Daily operating routines by role

| Role | Daily routine |
|---|---|
| Super administrator | Review security events, user access, failed operations, service readiness, role assignments, and abnormal sessions. |
| Legal officer | Review new contracts, revise clauses and versions, process legal approvals, monitor signatures, inspect audit history, and manage renewals. |
| Department manager | Create and submit departmental contracts, resolve approval requests, monitor obligations, review upcoming expiries, and confirm business evidence. |
| Finance reviewer | Review contract value and commercial terms, approve or reject assigned tasks, and verify financial obligations and documentation. |
| Executive approver | Review concise decision context, approve or reject assigned high-impact agreements, and monitor portfolio exposure from the dashboard. |
| Vendor user | Access only visible assigned contracts, respond to permitted approvals or document requests, and upload authorized supporting documents. |

## 10. Practical exception handling

| Situation | Correct response |
|---|---|
| `PERMISSION_DENIED` | Confirm the user’s role and permission; do not bypass the API with a different tenant or client-side request. |
| `VERSION_CONFLICT` or `CONFLICT` | Refresh the record, review the latest state, and repeat the action only after confirming the new version. |
| `INVALID_LIFECYCLE_TRANSITION` | Check the current contract state and use the next permitted lifecycle operation. |
| `WORKFLOW_NOT_SATISFIED` | Review required metadata, workflow assignment, trigger rules, quorum, and stage ownership. |
| `DOCUMENT_CHECKSUM_MISMATCH` | Do not retry blindly; confirm the selected file, checksum, upload URL, and upload completion. |
| `DOCUMENT_NOT_AVAILABLE` | Confirm that the file is uploaded, clean, not quarantined, not deleted, and that the user has download permission. |
| `REFRESH_REUSE_DETECTED` | Treat the session as compromised or invalid, sign in again, revoke unknown sessions, and investigate the audit log. |
| Empty dashboard or list | Confirm MongoDB and Redis availability, tenant context, role permissions, filters, and whether seed data exists. |

## 11. Recommended governance controls

Organizations should use strong, unique JWT secrets, approved secret storage, TLS, private object storage, restricted storage credentials, email provider controls, regular access reviews, retention policies, legal holds, and verified backup and restore procedures. Secrets must never be committed to Git or placed in frontend source files.

The frontend should be treated as a convenience and workflow layer. The backend must remain the security boundary. Users should never rely on hidden buttons alone as proof that an operation is authorized.

Before declaring the system operational, the organization should execute a role-by-role acceptance test, confirm tenant isolation, test document quarantine, verify refresh-token rotation, exercise optimistic-lock conflicts, review audit records, and test the complete contract journey with representative data.

## 12. Local run procedure

From the repository root:

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

The default local services are MongoDB at `mongodb://localhost:27017/covenx` and Redis at `redis://localhost:6379`. The frontend defaults to `http://localhost:5173`, and the backend defaults to port `4000`. The frontend API base URL is configured with `VITE_API_URL`, defaulting to `http://localhost:4000/api/v1`.

For a quality check before use:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

The current implementation uses mock storage and mock email providers by default. This is useful for local workflow validation; organizations must configure approved real providers and security controls before production deployment.

## 13. Reference implementation paths

| Concern | Repository path |
|---|---|
| Frontend application entry and routes | `frontend/src/main.tsx` |
| Workspace shell and navigation | `frontend/src/components/Layout.tsx` |
| Typed REST API client | `frontend/src/services/api.ts` |
| Frontend request schemas and domain types | `frontend/src/services/types.ts` |
| Realtime client | `frontend/src/services/realtime.ts` |
| Permission-aware navigation | `frontend/src/utils/permissions.ts` |
| Backend route source of truth | `backend/src/routes/api.ts` |
| Backend role and permission seed | `backend/src/config/seed.ts` |
| Backend models | `backend/src/models/index.ts` |
| Environment validation | `backend/src/config/index.ts` |
| Database design | `docs/Database.md` |
| REST API specification | `docs/API.md` |
| System architecture | `docs/Architecture.md` |
