import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  dangerouslyDisableIncrementalCache: true,
});