import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  middleware: {
    external: true,
  },
  dangerouslyDisableIncrementalCache: true,
});