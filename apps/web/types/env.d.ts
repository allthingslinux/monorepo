import type { website } from "../alchemy.run.ts";

type AlchemyEnv = typeof website.Env;

// Augment the global CloudflareEnv interface declared by @opennextjs/cloudflare
// with bindings from alchemy.run.ts + any raw bindings alchemy can't infer
declare global {
  interface CloudflareEnv extends AlchemyEnv {
    /** Raw KV binding — bound as { id, type } in alchemy.run.ts, not inferred */
    KV_QUICKBOOKS: KVNamespace;
  }

  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
