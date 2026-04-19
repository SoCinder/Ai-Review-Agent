import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { createEmbeddings } from "./llmFactory.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const provider = process.env.LLM_PROVIDER || "gemini";
const embeddingModel =
    provider === "ollama"
        ? process.env.EMBEDDING_MODEL || "embeddinggemma"
        : process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const safeEmbeddingName = `${provider}-${embeddingModel}`.replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
); const INDEX_DIR = path.join(
    __dirname,
    "..",
    ".faiss-index",
    safeEmbeddingName
);
const embeddings = createEmbeddings();
function fileTitleFromName(fileName) {
    return fileName
        .replace(/\.txt$/i, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
function slugFromFileName(fileName) {
    return fileName
        .replace(/\.txt$/i, "")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .toLowerCase();
}
function loadKnowledgeFiles() {
    const files = fs
        .readdirSync(DATA_DIR)
        .filter((name) => name.endsWith(".txt"))
        .sort();
    return files.map((fileName) => {
        const text = fs.readFileSync(path.join(DATA_DIR, fileName), "utf8");
        return {
            fileName,
            sourceSlug: slugFromFileName(fileName),
            document: new Document({
                pageContent: text,
                metadata: {
                    source: fileName,
                    title: fileTitleFromName(fileName),
                },
            }),
        };
    });
}
async function buildFreshIndex() {
    const loadedFiles = loadKnowledgeFiles();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 80,
    });
    const enrichedDocs = [];
    for (const { fileName, sourceSlug, document } of loadedFiles) {
        const splitDocs = await splitter.splitDocuments([document]);
        splitDocs.forEach((doc, chunkIndex) => {
            const sourceId = `${sourceSlug}-${String(chunkIndex + 1).padStart(3, "0")}`;
            enrichedDocs.push(
                new Document({
                    pageContent: doc.pageContent,
                    metadata: {
                        ...doc.metadata,
                        source: fileName,
                        title: doc.metadata.title ?? fileTitleFromName(fileName),
                        sourceId,
                        chunkIndex,
                    },
                })
            );
        });
    }
    const store = new FaissStore(embeddings, {});
    await store.addDocuments(enrichedDocs);
    fs.mkdirSync(INDEX_DIR, { recursive: true });
    await store.save(INDEX_DIR);
    return store;
}
export async function getVectorStore() {
    const hasSavedIndex =
        fs.existsSync(INDEX_DIR) && fs.readdirSync(INDEX_DIR).length > 0;
    if (hasSavedIndex) {
        return FaissStore.load(INDEX_DIR, embeddings);
    } return buildFreshIndex();
}
