import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const config: NextConfig = {
  typedRoutes: true,
};

export default config;

// oxlint-disable-next-line no-void
void initOpenNextCloudflareForDev();
