/**
 * CovenX — Demo User Seed Script
 *
 * Creates a single tenant "CovenX Demo Corp" with one user per role
 * so every role-specific feature can be tested immediately.
 *
 * Usage:
 *   npx tsx database/seed/seed-users.ts
 *
 * Idempotent: safe to run multiple times — existing org/users are skipped.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Organization, User, Role, Permission, Contract, ApprovalTask, Workflow, WorkflowVersion } from '../../backend/src/models/index.js';
import { seedRbac, seedIntakeQuestionnaires, seedApprovalWorkflow } from '../../backend/src/config/seed.js';

// ─── Configuration ──────────────────────────────────────────────────────────

const DEMO_ORG = {
  name: 'CovenX Demo Corp',
  slug: 'covenx-demo',
  industry: 'Technology',
  companySize: '100-500',
};

/** One user per role. All share the same password for easy testing. */
const DEMO_USERS = [
  {
    roleKey: 'super-admin',
    email: 'admin@demo.covenx.com',
    firstName: 'Alice',
    lastName: 'Admin',
    title: 'Platform Administrator',
  },
  {
    roleKey: 'legal-officer',
    email: 'legal@demo.covenx.com',
    firstName: 'Leo',
    lastName: 'Legal',
    title: 'Senior Legal Counsel',
  },
  {
    roleKey: 'department-manager',
    email: 'manager@demo.covenx.com',
    firstName: 'Diana',
    lastName: 'Manager',
    title: 'Head of Procurement',
  },
  {
    roleKey: 'finance-reviewer',
    email: 'finance@demo.covenx.com',
    firstName: 'Frank',
    lastName: 'Finance',
    title: 'Finance Controller',
  },
  {
    roleKey: 'executive-approver',
    email: 'exec@demo.covenx.com',
    firstName: 'Eva',
    lastName: 'Executive',
    title: 'Chief Executive Officer',
  },
  {
    roleKey: 'vendor-user',
    email: 'vendor@demo.covenx.com',
    firstName: 'Victor',
    lastName: 'Vendor',
    title: 'Account Manager — External',
  },
];

const DEMO_PASSWORD = 'CovenX@Demo2026!';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function banner(msg: string) {
  console.log(`\n${'─'.repeat(60)}\n  ${msg}\n${'─'.repeat(60)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/covenx';
  banner(`Connecting to MongoDB → ${uri}`);
  await mongoose.connect(uri);
  console.log('  ✓ Connected');

  // ── 1. Org ──────────────────────────────────────────────────────────────────
  banner('Creating demo organization');

  let org = await Organization.findOne({ slug: DEMO_ORG.slug });

  if (org) {
    console.log(`  ⚠  Organization "${DEMO_ORG.slug}" already exists — skipping creation`);
  } else {
    org = await Organization.create({
      name: DEMO_ORG.name,
      normalizedName: DEMO_ORG.name.toLowerCase(),
      slug: DEMO_ORG.slug,
      status: 'active',
      plan: 'trial',
      onboarding: {
        currentStep: 'complete',
        completedSteps: ['profile', 'team', 'governance', 'integrations', 'complete'],
        completedAt: new Date(),
      },
      trial: {
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 90 * 86400_000), // 90 days
      },
      profile: {
        industry: DEMO_ORG.industry,
        companySize: DEMO_ORG.companySize,
      },
    });
    console.log(`  ✓ Created organization: "${org.name}" (id: ${org._id})`);
  }

  const tenantId = String(org._id);

  // ── 2. RBAC seed ────────────────────────────────────────────────────────────
  banner('Seeding RBAC (roles + permissions)');
  await seedRbac(tenantId);
  console.log('  ✓ All 6 roles and permissions seeded');

  // ── 2.1 Intake Questionnaires ───────────────────────────────────────────────
  banner('Seeding Intake Questionnaires');
  await seedIntakeQuestionnaires(tenantId);
  console.log('  ✓ Default intake questionnaires seeded');

  // ── 2.2 Approval Workflow ───────────────────────────────────────────────────
  banner('Seeding Approval Workflow');
  await seedApprovalWorkflow(tenantId);
  console.log('  ✓ Standard approval workflow (Legal → Finance → Executive) seeded');

  // ── 3. Users ────────────────────────────────────────────────────────────────
  banner('Creating demo users');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const results: { email: string; role: string; status: 'created' | 'skipped' }[] = [];

  for (const def of DEMO_USERS) {
    const normalizedEmail = def.email.toLowerCase();
    const existing = await User.findOne({ tenantId: org._id, normalizedEmail });

    if (existing) {
      results.push({ email: def.email, role: def.roleKey, status: 'skipped' });
      continue;
    }

    const role = await Role.findOne({ tenantId: org._id, key: def.roleKey, status: 'active' });
    if (!role) {
      console.error(`  ✗ Role "${def.roleKey}" not found — skipping user ${def.email}`);
      continue;
    }

    const user = await User.create({
      tenantId: org._id,
      email: def.email,
      normalizedEmail,
      passwordHash,
      emailVerified: true,
      profile: {
        firstName: def.firstName,
        lastName: def.lastName,
        displayName: `${def.firstName} ${def.lastName}`,
        title: def.title,
      },
      organization: { name: DEMO_ORG.name, slug: DEMO_ORG.slug },
      roleIds: [role._id],
      status: 'active',
    });

    // Set the org owner to the super-admin
    if (def.roleKey === 'super-admin' && !org.ownerUserId) {
      org.ownerUserId = user._id;
      await org.save();
    }

    results.push({ email: def.email, role: def.roleKey, status: 'created' });
  }

  // ── 3.5 Re-execute workflow for contracts already in 'review' with no tasks ─
  banner('Re-executing workflow for pending review contracts');
  const reviewContracts = await Contract.find({ tenantId: org._id, status: 'review' } as any);
  let retriggered = 0;
  for (const c of reviewContracts) {
    const existingTasks = await ApprovalTask.countDocuments({ contractId: c._id, tenantId: org._id } as any);
    if (existingTasks === 0) {
      // Find and execute the workflow
      const workflow: any = await Workflow.findOne({ tenantId: org._id, status: 'published' });
      const workflowVersion: any = workflow && await WorkflowVersion.findOne({ workflowId: workflow._id, versionNumber: 1, status: 'published' });
      if (workflow && workflowVersion) {
        const stages = workflowVersion.stages ?? workflow.stages ?? [];
        for (const [index, stage] of stages.entries()) {
          const assignedUser = stage.assignedUserId
            ? await User.findOne({ _id: stage.assignedUserId, tenantId: org._id, status: 'active' })
            : await User.findOne({ tenantId: org._id, roleIds: stage.assignedRoleId, status: 'active' });
          if (!assignedUser && !stage.assignedUserId) continue;
          await ApprovalTask.create({
            tenantId: org._id,
            contractId: c._id,
            workflowId: workflow._id,
            workflowVersionId: workflowVersion._id,
            stageKey: stage.stageKey ?? `stage-${index + 1}`,
            assignedUserId: assignedUser?._id ?? stage.assignedUserId,
            assignedRoleId: stage.assignedRoleId,
            status: 'pending',
            dueAt: new Date(Date.now() + Number(stage.slaHours ?? 72) * 3600000),
            decision: { quorum: Number(stage.quorum ?? 1) },
          });
        }
        // Advance contract to 'approval'
        (c as any).status = 'approval';
        (c as any).version = ((c as any).version ?? 1) + 1;
        await c.save();
        retriggered++;
        console.log(`  ✓ Triggered approval workflow for ${(c as any).contractNumber}`);
      }
    }
  }
  if (retriggered === 0) console.log('  ✓ No pending review contracts needing re-trigger');

  // ── 4. Summary ──────────────────────────────────────────────────────────────
  banner('Seed complete — User credentials');

  console.log(`\n  Workspace Slug : ${DEMO_ORG.slug}`);
  console.log(`  Shared Password: ${DEMO_PASSWORD}\n`);

  const colW = [32, 20, 14, 10];
  const header = ['Email', 'Role', 'Name / Title', 'Status']
    .map((h, i) => h.padEnd(colW[i]))
    .join('  ');
  console.log('  ' + header);
  console.log('  ' + '─'.repeat(colW.reduce((a, b) => a + b + 2, 0)));

  for (const r of results) {
    const def = DEMO_USERS.find((u) => u.email === r.email)!;
    const row = [
      r.email.padEnd(colW[0]),
      r.role.padEnd(colW[1]),
      `${def.firstName} ${def.lastName}`.padEnd(colW[2]),
      r.status,
    ].join('  ');
    const icon = r.status === 'created' ? '✓' : '⚠';
    console.log(`  ${icon} ${row}`);
  }

  console.log(`\n  Login at: http://localhost:5173/login`);
  console.log(`  Use workspace slug: "${DEMO_ORG.slug}" in the workspace field\n`);

  await mongoose.disconnect();
  console.log('  ✓ Disconnected from MongoDB\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n  ✗ Seed failed:', err.message);
  process.exit(1);
});
