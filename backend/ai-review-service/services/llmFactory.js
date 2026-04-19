import {
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { TaskType } from "@google/generative-ai";
const provider = process.env.LLM_PROVIDER || "gemini";
export function createChatModel(schema) {
    if (provider === "ollama") {
        return new ChatOllama({
            model: process.env.GENERATION_MODEL || "gemma4:e4b",
            baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
            temperature: 0,
            numPredict: 600,
        }).withStructuredOutput(schema);
    }
    return new ChatGoogleGenerativeAI({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        temperature: 0,
        maxOutputTokens: 2048,
        apiKey: process.env.GOOGLE_API_KEY,
    }).withStructuredOutput(schema);
}
export function createEmbeddings() {
    if (provider === "ollama") {
        return new OllamaEmbeddings({
            model: process.env.EMBEDDING_MODEL || "embeddinggemma",
            baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        });
    }
    return new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        model: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
        taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
}
