import 'dotenv/config';
import { payloadFromBulkLikeEnv, runBulkLike } from './server/automationCore.js';

const postUrl = process.argv[2];

try {
  const payload = payloadFromBulkLikeEnv(postUrl);
  console.log(`Bulk Like target: ${payload.postUrl}`);
  await runBulkLike(payload, (message) => console.log(message));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
