import OpenAI from 'openai';
import crypto from 'node:crypto';
import { z } from 'zod';
import { config } from '../config/index.js';
import { Contract, ContractIntelligence, ContractVersion } from '../models/index.js';

const analysisSchema = z.object({
  summary: z.string().min(1).max(5000),
  keyTerms: z.array(z.object({
    name: z.string().min(1),
    value: z.string().max(1000),
    confidence: z.number().min(0).max(1),
    evidence: z.string().min(1).max(1000),
  })).max(40),
  risks: z.array(z.object({
    category: z.enum(['commercial', 'legal', 'privacy', 'security', 'operational', 'renewal', 'other']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string().min(1).max(240),
    explanation: z.string().min(1).max(2000),
    recommendation: z.string().max(2000),
    evidence: z.string().min(1).max(1000),
    confidence: z.number().min(0).max(1),
  })).max(40),
  missingInformation: z.array(z.string().max(500)).max(20),
});

const answerSchema = z.object({
  answer: z.string().min(1).max(6000),
  citations: z.array(z.object({ label: z.string().min(1).max(200), evidence: z.string().min(1).max(1000) })).max(20),
  confidence: z.number().min(0).max(1),
  needsHumanReview: z.boolean(),
});

type ContractContext = { contract: any; version: any; sourceText: string };

function hash(value: string) { return crypto.createHash('sha256').update(value).digest('hex'); }

function toContext(contract: any, version: any): ContractContext {
  const source = JSON.stringify({
    contract: {
      contractNumber: contract.contractNumber,
      title: contract.title,
      contractType: contract.contractType,
      parties: contract.parties,
      status: contract.status,
      effectiveDate: contract.effectiveDate,
      expiryDate: contract.expiryDate,
      renewal: contract.renewal,
      financial: contract.financial,
      risk: contract.risk,
      tags: contract.tags,
      metadata: contract.metadata,
    },
    version: version ? {
      versionNumber: version.versionNumber,
      state: version.state,
      changeSummary: version.changeSummary,
      contentRef: version.contentRef,
      clauseRefs: version.clauseRefs,
    } : null,
  });
  return { contract, version, sourceText: source.slice(0, 60000) };
}

function mockAnalysis(context: ContractContext) {
  const contract = context.contract;
  const expiry = contract.expiryDate ? new Date(contract.expiryDate).toISOString().slice(0, 10) : 'not specified';
  return {
    summary: `${contract.title} is a ${contract.contractType} contract currently in ${contract.status} status. The recorded expiry date is ${expiry}. This initial review is based on structured contract metadata and the selected version; attach readable agreement text for deeper clause analysis.`,
    keyTerms: [
      { name: 'Contract type', value: contract.contractType, confidence: 0.98, evidence: `Contract record contractType=${contract.contractType}` },
      { name: 'Lifecycle status', value: contract.status, confidence: 0.99, evidence: `Contract record status=${contract.status}` },
      { name: 'Expiry date', value: expiry, confidence: contract.expiryDate ? 0.99 : 0.3, evidence: contract.expiryDate ? 'Contract record expiryDate' : 'No expiryDate is present in the contract record' },
    ],
    risks: contract.expiryDate ? [] : [{ category: 'renewal', severity: 'high', title: 'Expiry date is missing', explanation: 'The contract record does not contain an expiry date, so renewal monitoring cannot be fully automated.', recommendation: 'Confirm the governing agreement and add the verified expiry or renewal date.', evidence: 'Contract record has no expiryDate', confidence: 0.96 }],
    missingInformation: ['Readable agreement text or document content for clause-level analysis', ...(contract.expiryDate ? [] : ['Verified expiry or renewal date'])],
  };
}

function mockAnswer(question: string, context: ContractContext) {
  return {
    answer: `The current CovenX record does not contain enough agreement text to answer “${question}” reliably. I can confirm the contract is “${context.contract.title}”, type “${context.contract.contractType}”, and status “${context.contract.status}”. Upload or attach a readable contract version, then ask again.`,
    citations: [{ label: 'Contract metadata', evidence: `title=${context.contract.title}; type=${context.contract.contractType}; status=${context.contract.status}` }],
    confidence: 0.35,
    needsHumanReview: true,
  };
}

async function callModel<T>(system: string, user: string, schema: z.ZodType<T>): Promise<T | null> {
  if (config.AI_PROVIDER !== 'openai' || !config.AI_API_KEY) return null;
  const client = new OpenAI({ apiKey: config.AI_API_KEY, baseURL: config.AI_BASE_URL || undefined });
  const response = await client.chat.completions.create({
    model: config.AI_MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    response_format: { type: 'json_object' },
    max_completion_tokens: config.AI_MAX_OUTPUT_TOKENS,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('AI_EMPTY_RESPONSE');
  return schema.parse(JSON.parse(content));
}

export async function getContractContext(tenantId: string, contractId: string): Promise<ContractContext> {
  const contract = await Contract.findOne({ _id: contractId, tenantId });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  const version = contract.currentVersionId ? await ContractVersion.findOne({ _id: contract.currentVersionId, tenantId, contractId }) : await ContractVersion.findOne({ tenantId, contractId }).sort({ versionNumber: -1 });
  return toContext(contract, version);
}

export async function analyzeContract(tenantId: string, contractId: string, actorId: string, playbook: string[] = []) {
  const context = await getContractContext(tenantId, contractId);
  const inputHash = hash(`${context.sourceText}|${playbook.join('|')}`);
  const existing = await ContractIntelligence.findOne({ tenantId, contractId, kind: 'analysis', inputHash }).sort({ createdAt: -1 });
  if (existing) return existing;
  const system = 'You are CovenX Intelligence, an enterprise contract-review assistant. Analyze only the supplied contract evidence. Never invent terms, never provide definitive legal advice, and clearly identify missing information. Return JSON only with summary, keyTerms, risks, and missingInformation. Every key term and risk must include a short verbatim-or-near-verbatim evidence pointer from the supplied record.';
  const user = `Review this CovenX contract evidence. ${playbook.length ? `Compare against this review playbook: ${playbook.join('; ')}` : ''}\n\n${context.sourceText}`;
  const result = await callModel(system, user, analysisSchema) ?? mockAnalysis(context);
  return ContractIntelligence.create({ tenantId, contractId, contractVersionId: context.version?._id, kind: 'analysis', status: 'generated', provider: config.AI_PROVIDER, model: config.AI_PROVIDER === 'openai' ? config.AI_MODEL : 'mock', inputHash, summary: result.summary, keyTerms: result.keyTerms, risks: result.risks, missingInformation: result.missingInformation, createdBy: actorId });
}

export async function answerContractQuestion(tenantId: string, contractId: string, actorId: string, question: string, intelligenceId?: string) {
  const context = await getContractContext(tenantId, contractId);
  const inputHash = hash(`${context.sourceText}|${question}`);
  const system = 'You are CovenX Intelligence. Answer only from the supplied contract evidence. Do not invent facts or provide definitive legal advice. If evidence is insufficient, say so. Return JSON only with answer, citations, confidence, and needsHumanReview.';
  const user = `Question: ${question}\n\nContract evidence:\n${context.sourceText}`;
  const result = await callModel(system, user, answerSchema) ?? mockAnswer(question, context);
  return ContractIntelligence.create({ tenantId, contractId, contractVersionId: context.version?._id, kind: 'question', status: 'generated', provider: config.AI_PROVIDER, model: config.AI_PROVIDER === 'openai' ? config.AI_MODEL : 'mock', inputHash, question, answer: result.answer, citations: result.citations, confidence: result.confidence, needsHumanReview: result.needsHumanReview, sourceIntelligenceId: intelligenceId, createdBy: actorId });
}

export async function reviewIntelligence(tenantId: string, intelligenceId: string, actorId: string, decision: 'accepted' | 'overridden', notes?: string) {
  const item = await ContractIntelligence.findOne({ _id: intelligenceId, tenantId });
  if (!item) throw new Error('INTELLIGENCE_NOT_FOUND');
  item.status = decision;
  item.reviewedBy = new (await import('mongoose')).default.Types.ObjectId(actorId);
  item.reviewedAt = new Date();
  item.reviewNotes = notes;
  await item.save();
  return item;
}

export async function listContractIntelligence(tenantId: string, contractId: string) {
  return ContractIntelligence.find({ tenantId, contractId }).sort({ createdAt: -1 }).limit(50).lean();
}

export const intelligenceSchemas = { analysisSchema, answerSchema };
