import type { website } from "../alchemy.run.ts";

export type CloudflareEnv = typeof website.Env;

declare global {
	type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
	// biome-ignore lint/style/noNamespace: required pattern for Cloudflare Workers type augmentation
	namespace Cloudflare {
		export interface Env extends CloudflareEnv {}
	}
}
