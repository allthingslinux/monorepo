import alchemy from "alchemy";
import { Nextjs } from "alchemy/cloudflare";

const app = await alchemy("atl-tools");

export const website = await Nextjs("web", {
	adopt: true,
	domains: [{ domainName: "atl.tools", adopt: true }],
});

console.log({ url: website.url });

await app.finalize();
