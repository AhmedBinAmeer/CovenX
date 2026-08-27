import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config/index.js';
import { Contract, ApprovalTask, Obligation, User, Organization } from '../models/index.js';

export interface HelpdeskMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HelpdeskAction {
  type: 'navigate' | 'filter' | 'view_contract' | 'create_request';
  label: string;
  url?: string;
  data?: any;
}

export interface HelpdeskResponse {
  message: string;
  suggestions: string[];
  action?: HelpdeskAction | null;
}

const helpdeskSchema = z.object({
  message: z.string().min(1).max(4000),
  suggestions: z.array(z.string()).max(5),
  actionType: z.enum(['navigate', 'filter', 'view_contract', 'create_request', 'none']).optional(),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
});

const KNOWLEDGE_BASE = `
# CovenX Enterprise Contract Lifecycle Management (CLM) Helpdesk Knowledge Base

## Core Platform Modules:
1. **Contracts Command Center (/contracts)**:
   - Central repository for all draft, active, review, and archived contracts.
   - Supports creating new contracts, assigning counterparties, financial values, expiry dates, and risk tags.
   - Version history and milestone tracking.

2. **AI Intelligence & Semantic Search (/intelligence & /search)**:
   - Automated contract risk analysis, key clause extraction, and policy compliance verification against custom playbooks.
   - Ask contract questions and retrieve clause citations with confidence scoring.
   - Natural language semantic search across all indexed document chunks.

3. **Approvals & Governance (/approvals)**:
   - Sequential and parallel approval workflows with role-based governance.
   - Automated routing based on contract value, department, and risk rating.
   - Approval/rejection decision audit trails.

4. **Obligations & Renewals (/obligations & /renewals)**:
   - Milestone and compliance deadline tracker.
   - Automated renewal notice windows (30/60/90 days before expiration) to avoid auto-renewals.
   - Assignable obligation tasks with status tracking (pending, completed, overdue).

5. **Collaborative Negotiation & Redlining (/contracts/:id/negotiation)**:
   - Live side-by-side version diff comparisons (added, removed, modified clauses).
   - In-line collaboration comments, version drafting, and conflict resolution.

6. **Intake & Service Requests (/intake)**:
   - Self-service portal for business teams to submit new contract requests or legal reviews.
   - Kanban request board with status tracking from triage to execution.

7. **Clause Library & Templates (/clauses & /templates)**:
   - Standard pre-approved clause repository with fallback alternatives for indemnity, liability, NDA, etc.
   - Reusable contract templates for standard corporate agreements.

8. **Security, Users & RBAC (/settings & /users)**:
   - Tenant isolation, granular role-based permissions (admin, legal, finance, reviewer, member).
   - Session tracking, MFA posture, and immutable audit logs.
`;

export async function processHelpdeskQuery(
  tenantId: string | undefined,
  actorId: string | undefined,
  query: string,
  history: HelpdeskMessage[] = []
): Promise<HelpdeskResponse> {
  try {
    let tenantContext = '';

    if (tenantId && tenantId.length === 24) {
      try {
        const [contracts, pendingApprovals, overdueObligations, users, org] = await Promise.all([
          Contract.find({ tenantId }).sort({ updatedAt: -1 }).limit(15).lean().catch(() => []),
          ApprovalTask.countDocuments({ tenantId, status: 'pending' }).catch(() => 0),
          Obligation.find({ tenantId, status: { $ne: 'completed' } }).lean().catch(() => []),
          User.countDocuments({ tenantId }).catch(() => 0),
          Organization.findById(tenantId).lean().catch(() => null),
        ]);

        const activeCount = contracts.filter((c) => c.status === 'active').length;
        const draftCount = contracts.filter((c) => c.status === 'draft').length;
        const reviewCount = contracts.filter((c) => c.status === 'review').length;
        const now = new Date();
        const overdueCount = overdueObligations.filter((o) => o.dueDate && new Date(o.dueDate) < now).length;

        const contractSummaries = contracts.slice(0, 8).map((c) => 
          `- ${c.title} (${c.contractNumber}): Status=${c.status}, Type=${c.contractType}, Expiry=${c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : 'None'}`
        ).join('\n');

        tenantContext = `
## Current Workspace Status (${org?.name || 'Your Tenant'}):
- Total Workspace Members: ${users}
- Active Contracts: ${activeCount}, In Review: ${reviewCount}, Drafts: ${draftCount}
- Pending Approval Tasks: ${pendingApprovals}
- Active Obligations: ${overdueObligations.length} (Overdue: ${overdueCount})
- Recent Contracts:
${contractSummaries}
`;
      } catch {
        tenantContext = '';
      }
    }

    // If OpenAI is configured, call LLM
    if (config.AI_PROVIDER === 'openai' && config.AI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: config.AI_API_KEY, baseURL: config.AI_BASE_URL || undefined });
        const systemPrompt = `You are the CovenX Enterprise AI Helpdesk Agent. You assist users with contract management, platform features, workflows, and workspace data.
Be clear, professional, concise, and helpful. Use markdown bullet points and bold text where appropriate.

${KNOWLEDGE_BASE}
${tenantContext ? `\n${tenantContext}` : '\nUser is browsing the platform or landing page.'}

Return JSON strictly matching this schema:
{
  "message": "Detailed and friendly helpdesk response in markdown",
  "suggestions": ["3 to 4 short relevant follow-up questions"],
  "actionType": "navigate" | "filter" | "view_contract" | "create_request" | "none",
  "actionLabel": "Optional button text for action",
  "actionUrl": "Optional route URL like /contracts, /approvals, /obligations, /intake, /intelligence"
}`;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map((h) => ({ role: h.role === 'user' ? ('user' as const) : ('assistant' as const), content: h.content })),
          { role: 'user', content: query }
        ];

        const response = await client.chat.completions.create({
          model: config.AI_MODEL,
          messages,
          response_format: { type: 'json_object' },
          max_completion_tokens: 1200,
        });

        const raw = response.choices[0]?.message?.content;
        if (raw) {
          const parsed = helpdeskSchema.parse(JSON.parse(raw));
          return {
            message: parsed.message,
            suggestions: parsed.suggestions || [],
            action: parsed.actionType && parsed.actionType !== 'none' && parsed.actionLabel ? {
              type: parsed.actionType as any,
              label: parsed.actionLabel,
              url: parsed.actionUrl,
            } : null,
          };
        }
      } catch {
        // Fallback to rule-based assistant below
      }
    }

    // Intelligent Rule-based Helpdesk Assistant Engine
    return generateIntelligentResponse(query.toLowerCase(), tenantContext);
  } catch {
    return generateIntelligentResponse(query.toLowerCase(), '');
  }
}

function generateIntelligentResponse(q: string, tenantCtx: string): HelpdeskResponse {
  if (q.includes('approval') || q.includes('pending') || q.includes('approve') || q.includes('reject')) {
    return {
      message: `### CovenX Approvals & Governance\n\nIn CovenX, contracts requiring sign-off follow automated or custom **approval matrices** based on financial thresholds, risk scores, and department roles.\n\n- **Where to review**: Go to **Approvals** in the sidebar to review tasks assigned to you or your role.\n- **Decision Audit**: Every approve/reject decision is cryptographically logged with user comments.\n- **Sequential Routing**: Higher-tier approvals trigger automatically after initial stage sign-off.`,
      suggestions: [
        'How do I submit a contract for review?',
        'Where can I check contract obligations?',
        'How to add users with approver roles?'
      ],
      action: {
        type: 'navigate',
        label: 'Open Approvals Workspace',
        url: '/approvals'
      }
    };
  }

  if (q.includes('obligation') || q.includes('deadline') || q.includes('due') || q.includes('expire') || q.includes('renewal')) {
    return {
      message: `### Obligation & Renewal Management\n\nCovenX tracks all compliance obligations, deliverables, and upcoming renewals across all contracts:\n\n- **Automated Renewal Alerts**: Configured 30, 60, or 90 days before contract expiration to prevent unwanted auto-renewals.\n- **Milestone Tracking**: Mark deliverables as pending, in-progress, or completed.\n- **Risk Alerts**: Highlighting overdue deliverables directly on your executive dashboard.`,
      suggestions: [
        'How do I renew a contract?',
        'How to search clauses across all contracts?',
        'How does AI contract risk review work?'
      ],
      action: {
        type: 'navigate',
        label: 'View Obligations Center',
        url: '/obligations'
      }
    };
  }

  if (q.includes('ai') || q.includes('intelligence') || q.includes('search') || q.includes('risk') || q.includes('playbook')) {
    return {
      message: `### CovenX AI Contract Intelligence\n\nOur AI assistant extracts deep contract insights, identifies compliance risks, and provides clause-level search:\n\n- **Automated Risk Analysis**: Audits agreements against industry-standard legal playbooks for liability caps, indemnification, and SLA penalties.\n- **Interactive Q&A**: Ask direct questions about any contract version and receive citations with confidence scores.\n- **Semantic Vector Search**: Find relevant clauses instantly using natural language without needing exact keyword matches.`,
      suggestions: [
        'How do I compare two contract versions?',
        'How do I create a new intake request?',
        'Where are user access controls managed?'
      ],
      action: {
        type: 'navigate',
        label: 'Open AI Intelligence',
        url: '/intelligence'
      }
    };
  }

  if (q.includes('create') || q.includes('intake') || q.includes('request') || q.includes('new contract') || q.includes('ticket')) {
    return {
      message: `### Creating Contracts & Legal Intake\n\nBusiness teams can initiate contract workflows in two ways:\n\n1. **Legal Intake Portal (/intake)**: Submit a structured contract request form specifying counterparty, estimated value, and urgency.\n2. **Direct Contract Creation (/contracts)**: Click **"Create Contract"** in the Contracts repository to draft an agreement with pre-configured templates.`,
      suggestions: [
        'How to set up approval matrices?',
        'How to invite new team members?',
        'Where are standard clause templates?'
      ],
      action: {
        type: 'navigate',
        label: 'Submit Intake Request',
        url: '/intake'
      }
    };
  }

  if (q.includes('user') || q.includes('role') || q.includes('permission') || q.includes('member') || q.includes('invite')) {
    return {
      message: `### User Administration & Role-Based Access\n\nCovenX enforces strict tenant isolation and role permissions:\n\n- **Member Management**: Administrators can invite team members with specific roles (Admin, Legal Counsel, Financial Reviewer, Approver, Viewer).\n- **Granular Permissions**: Permissions control editing, approving, signing, and viewing sensitive commercial values.\n- **Session & MFA**: Monitor active user sessions and security postures in **Settings**.`,
      suggestions: [
        'How do approvals work in CovenX?',
        'How to view audit logs?',
        'How to search semantic clauses?'
      ],
      action: {
        type: 'navigate',
        label: 'Manage Users & Roles',
        url: '/users'
      }
    };
  }

  if (q.includes('negotiat') || q.includes('diff') || q.includes('version') || q.includes('redline') || q.includes('comment')) {
    return {
      message: `### Collaborative Redlining & Version Comparison\n\n- **Side-by-Side Diffing**: Real-time visual comparison highlighting inserted, deleted, and unmodified clauses between versions.\n- **Collaboration Comments**: Threaded discussions anchored to specific contract clauses.\n- **Version Locking**: Preserve immutable snapshots before requesting external counterpart signatures.`,
      suggestions: [
        'How does AI review contract risks?',
        'How to set obligation reminders?',
        'Where to find standard templates?'
      ],
      action: {
        type: 'navigate',
        label: 'Go to Contracts',
        url: '/contracts'
      }
    };
  }

  // Default Helpdesk Overview Response
  return {
    message: `Hello! I am your **CovenX AI Helpdesk Assistant**. I can help you with anything across your contract lifecycle:\n\n- **Contract Workflows**: Drafting, version comparisons, and redlining.\n- **AI Intelligence**: Semantic search, clause extraction, and risk audits.\n- **Approvals & Governance**: Reviewing pending tasks and routing rules.\n- **Obligations & Renewals**: Tracking key dates, SLAs, and preventing auto-renewals.\n- **Workspace Administration**: Roles, permissions, and tenant security.\n\n${tenantCtx ? `**Workspace Summary**:\n${tenantCtx}` : 'Ask any question or pick one of the quick suggestions below!'}\n`,
    suggestions: [
      'What are my pending approvals?',
      'How does AI contract risk review work?',
      'How do I track contract obligations & renewals?',
      'How to submit a new contract request?'
    ],
    action: {
      type: 'navigate',
      label: 'Explore Contracts',
      url: '/contracts'
    }
  };
}
