import { z } from "zod";
export const requestSchema = z.object({
    question: z.string().min(10, "Please enter a more complete question."),
});
export const routeSchema = z.object({
    route: z.enum(["retrieve", "clarify", "direct"]),
    reason: z.string().min(1),
});
export const rewriteSchema = z.object({
    retrievalQuery: z.string().min(3),
});
export const evidenceCheckSchema = z.object({
    evidenceStatus: z.enum(["sufficient", "weak", "none"]),
    evidenceReason: z.string().min(1),
});
export const issueSchema = z.object({
    type: z.string().min(1),
    severity: z.enum(["low", "medium", "high", "critical"]),
    description: z.string().min(1),
});
export const answerSchema = z.object({
    answer: z.string().min(20),
    confidence: z.number().min(0).max(100),
    citations: z.array(z.string().min(1)).default([]),
    limitations: z.array(z.string().min(1)).default([]),
    issues: z.array(issueSchema).default([]),
    suggestions: z.array(z.string().min(1)).default([]),
});
export const finalResponseSchema = z.object({
    answer: z.string().min(20),
    confidence: z.number().min(0).max(100),
    citations: z.array(z.string().min(1)).default([]),
    reflectionNotes: z.array(z.string().min(1)).default([]),
    responseType: z
        .enum(["grounded_answer", "clarification", "direct_answer"])
        .default("grounded_answer"),
    needsClarification: z.boolean().default(false),
    isGrounded: z.boolean().default(true),
    retrievalUsed: z.boolean().default(true),
});
export const reflectionSchema = finalResponseSchema.extend({
    revisionNeeded: z.boolean().default(false),
});

export const issueReflectionSchema = z.object({
    reviewedIssues: z.array(z.object({
        type: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]),
        description: z.string(),
        supported: z.boolean(),
        supportReason: z.string(),
    })),
    overallReflectionNote: z.string(),
    adjustedConfidence: z.number().min(0).max(100),
});
