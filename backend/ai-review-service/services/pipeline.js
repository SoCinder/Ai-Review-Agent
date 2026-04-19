import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import { z } from "zod";
import {
    answerSchema,
    evidenceCheckSchema,
} from "./schemas.js";
import { getVectorStore } from "./vectorStore.js";
import { createChatModel } from "./llmFactory.js";

const reviewModel = createChatModel(answerSchema);
const evidenceModel = createChatModel(evidenceCheckSchema);

const ReviewState = new StateSchema({
    draftText: z.string(),
    draftId: z.string().nullable().default(null),
    retrievedDocs: z
        .array(
            z.object({
                sourceId: z.string(),
                source: z.string(),
                title: z.string().optional(),
                content: z.string(),
            })
        )
        .default(() => []),
    evidenceStatus: z
        .enum(["sufficient", "weak", "none"])
        .nullable()
        .default(null),
    evidenceReason: z.string().nullable().default(null),
    initialReview: answerSchema.nullable().default(null),
    finalReview: z
        .object({
            summary: z.string(),
            issues: z.array(z.any()).default([]),
            suggestions: z.array(z.string()).default([]),
            citations: z.array(z.string()).default([]),
            initialConfidence: z.number(),
            finalConfidence: z.number(),
            reflectionNotes: z.array(z.string()).default([]),
            evidenceStatus: z.string().nullable().default(null),
            isGrounded: z.boolean().default(false),
        })
        .nullable()
        .default(null),
});

function formatEvidence(docs) {
    if (!docs?.length) return "No evidence retrieved.";
    return docs
        .map(
            (doc) =>
                `[${doc.sourceId}] title=${doc.title ?? "Untitled"} source=${doc.source}\n${doc.content}`
        )
        .join("\n\n---\n\n");
}

const retrieveNode = async (state) => {
    console.log("[pipeline] retrieve");
    const store = await getVectorStore();
    const docs = await store.similaritySearch(state.draftText, 4);
    return {
        retrievedDocs: docs.map((doc) => ({
            sourceId: doc.metadata.sourceId ?? "unknown-source",
            source: doc.metadata.source ?? "unknown",
            title: doc.metadata.title,
            content: doc.pageContent,
        })),
    };
};

const checkEvidenceNode = async (state) => {
    console.log("[pipeline] checkEvidence");
    if (!state.retrievedDocs.length) {
        return {
            evidenceStatus: "none",
            evidenceReason: "No documents were retrieved.",
        };
    }
    const evidence = formatEvidence(state.retrievedDocs);
    try {
        const result = await evidenceModel.invoke([
            [
                "system",
                `You are evaluating retrieved evidence for a grounded code-review assistant.
Classify the evidence as:
- "sufficient": enough to review reliably
- "weak": partially relevant but incomplete or uncertain
- "none": not relevant enough to support a review
Be conservative.
Keep evidenceReason under 40 words.
Return ONLY valid JSON matching the schema.`,
            ],
            [
                "human",
                `Draft under review:\n${state.draftText}\n\nRetrieved Evidence:\n${evidence}`,
            ],
        ]);
        return {
            evidenceStatus: result.evidenceStatus,
            evidenceReason: result.evidenceReason,
        };
    } catch (error) {
        const shortMessage =
            error instanceof Error ? error.message : "Unknown evidence-check error.";
        console.warn(
            `Evidence check failed. Falling back to weak. ${shortMessage.slice(0, 160)}`
        );
        return {
            evidenceStatus: "weak",
            evidenceReason:
                "Evidence classifier failed to produce valid structured output; defaulting to weak.",
        };
    }
};

const answerNode = async (state) => {
    console.log("[pipeline] answer");
    const evidence = formatEvidence(state.retrievedDocs);
    try {
        const result = await reviewModel.invoke([
            [
                "system",
                `You are a code-review assistant grounded in retrieved guidelines.
Use ONLY the retrieved evidence as authoritative guidance.
Do not invent facts or guidelines.
If evidence is limited, say so clearly in limitations.
Keep the summary concise.
Important citation rules:
- Do NOT place citation IDs inside the summary text.
- The answer field must contain clean prose only.
- Put all supporting source IDs in the citations array.
- Every citation must exactly match one retrieved sourceId.
- Prefer 2 to 4 citations when evidence is available.
Return ONLY valid JSON matching the schema.
Do not include any extra text.
Do not truncate the JSON.
Ensure the JSON is complete and properly closed.`,
            ],
            [
                "human",
                `Draft under review:
${state.draftText}
Evidence Status: ${state.evidenceStatus ?? "unknown"}
Evidence Reason: ${state.evidenceReason ?? "n/a"}
Retrieved Evidence:
${evidence}
Return JSON with:
- answer: concise review summary, clean prose only, no inline citation markers
- confidence: number from 0 to 100
- citations: array of retrieved sourceIds that support the review
- limitations: short array, possibly empty
- issues: array of { type, severity (low|medium|high|critical), description }
- suggestions: array of short actionable strings`,
            ],
        ]);
        const validSourceIds = new Set(
            state.retrievedDocs.map((doc) => doc.sourceId).filter(Boolean)
        );
        const cleanedCitations = Array.isArray(result?.citations)
            ? result.citations.filter((id) => validSourceIds.has(id))
            : [];
        return {
            initialReview: {
                answer: result?.answer || "No review was generated.",
                confidence:
                    typeof result?.confidence === "number"
                        ? result.confidence
                        : 0,
                citations: cleanedCitations,
                limitations: Array.isArray(result?.limitations)
                    ? result.limitations
                    : [],
                issues: Array.isArray(result?.issues) ? result.issues : [],
                suggestions: Array.isArray(result?.suggestions)
                    ? result.suggestions
                    : [],
            },
        };
    } catch (error) {
        const shortMessage =
            error instanceof Error ? error.message : "Unknown answer-node error.";
        console.warn(
            `Review step failed. Falling back to conservative review. ${shortMessage}`
        );
        const fallbackCitations = Array.isArray(state.retrievedDocs)
            ? state.retrievedDocs
                  .slice(0, 2)
                  .map((doc) => doc.sourceId)
                  .filter(Boolean)
            : [];
        return {
            initialReview: {
                answer:
                    state.evidenceStatus === "none"
                        ? "I could not find enough relevant evidence to review this draft reliably."
                        : "The retrieved evidence provides partial guidance, so this review is conservative. Review the cited sources directly for full details.",
                confidence: state.evidenceStatus === "sufficient" ? 60 : 40,
                citations: fallbackCitations,
                limitations: [
                    "The review step failed to produce valid structured output, so a conservative fallback review was used.",
                ],
                issues: [],
                suggestions: [],
            },
        };
    }
};

const reflectNode = async (state) => {
    console.log("[pipeline] reflect");
    const initial = state.initialReview;
    if (!initial) {
        return {
            finalReview: {
                summary: "A grounded review could not be finalized.",
                issues: [],
                suggestions: [],
                citations: [],
                initialConfidence: 0,
                finalConfidence: 40,
                reflectionNotes: [
                    "No initial review was available, so a fallback final response was used.",
                ],
                evidenceStatus: state.evidenceStatus,
                isGrounded: false,
            },
        };
    }
    const validSourceIds = new Set(
        (state.retrievedDocs || []).map((doc) => doc.sourceId).filter(Boolean)
    );
    const cleanedCitations = Array.isArray(initial.citations)
        ? initial.citations.filter((id) => validSourceIds.has(id))
        : [];
    const reflectionNotes = [];
    const initialConfidence =
        typeof initial.confidence === "number" ? initial.confidence : 0;
    let finalConfidence = initialConfidence;

    if (cleanedCitations.length === 0 && validSourceIds.size > 0) {
        reflectionNotes.push(
            "No valid citations were returned by the review step, so citations could not be confirmed in the final response."
        );
        finalConfidence = Math.min(finalConfidence, 40);
    }
    if (Array.isArray(initial.limitations) && initial.limitations.length > 0) {
        reflectionNotes.push(
            "The review includes limitations based on the available retrieved evidence."
        );
        finalConfidence = Math.max(0, finalConfidence - 10);
    }
    if (state.evidenceStatus === "weak") {
        reflectionNotes.push(
            "Evidence was classified as weak — confidence reduced."
        );
        finalConfidence = Math.max(0, finalConfidence - 15);
    }
    if (state.evidenceStatus === "none") {
        reflectionNotes.push(
            "No relevant evidence was found — confidence capped."
        );
        finalConfidence = Math.min(finalConfidence, 30);
    }

    const isGrounded =
        state.evidenceStatus === "sufficient" && cleanedCitations.length > 0;

    return {
        finalReview: {
            summary: initial.answer,
            issues: Array.isArray(initial.issues) ? initial.issues : [],
            suggestions: Array.isArray(initial.suggestions)
                ? initial.suggestions
                : [],
            citations: cleanedCitations,
            initialConfidence,
            finalConfidence,
            reflectionNotes,
            evidenceStatus: state.evidenceStatus,
            isGrounded,
        },
    };
};

export const reviewGraph = new StateGraph(ReviewState)
    .addNode("retrieve", retrieveNode)
    .addNode("checkEvidence", checkEvidenceNode)
    .addNode("answer", answerNode)
    .addNode("reflect", reflectNode)
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "checkEvidence")
    .addEdge("checkEvidence", "answer")
    .addEdge("answer", "reflect")
    .addEdge("reflect", END)
    .compile();

export async function runReviewPipeline({ draftText, draftId = null }) {
    const finalState = await reviewGraph.invoke({ draftText, draftId });
    const review = finalState.finalReview;
    return {
        ...review,
        retrievedChunks: (finalState.retrievedDocs || []).map((doc) => ({
            sourceId: doc.sourceId,
            source: doc.source,
            title: doc.title,
            content: doc.content,
        })),
        draftId: finalState.draftId ?? draftId,
    };
}
