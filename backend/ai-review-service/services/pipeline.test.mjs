import 'dotenv/config';
import { runReviewPipeline } from './pipeline.js';

const draft = `function getUser(id) {
  const user = db.query("SELECT * FROM users WHERE id = " + id);
  return user;
}`;

const start = Date.now();
const out = await runReviewPipeline({ draftText: draft, draftId: 'TEST-1' });
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\n=== Review completed in ${elapsed}s ===\n`);
console.log('Summary:', out.summary);
console.log('Initial confidence:', out.initialConfidence);
console.log('Final confidence:', out.finalConfidence);
console.log('Evidence status:', out.evidenceStatus);
console.log('Issues:', JSON.stringify(out.issues, null, 2));
console.log('Suggestions:', out.suggestions);
console.log('Citations:', out.citations);
console.log('Retrieved chunks:', out.retrievedChunks.length);
console.log('Reflection notes:', out.reflectionNotes);
