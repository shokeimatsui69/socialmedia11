import 'dotenv/config';
import { payloadFromBulkCommentEnv, runBulkComment } from './server/automationCore.js';

const postUrl = process.argv[2];

try {
  const payload = payloadFromBulkCommentEnv(postUrl);
  console.log(`Bulk Comment target: ${payload.postUrl}`);
  await runBulkComment(payload, (message) => console.log(message));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
