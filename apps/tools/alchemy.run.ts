import alchemy from "alchemy";
import { Nextjs } from "alchemy/cloudflare";

const app = await alchemy("allthingslinux-tools");

export const website = await Nextjs("tools", {
  adopt: true,
  domains: [{ adopt: true, domainName: "atl.tools" }],
});

console.log({ url: website.url });

await app.finalize();
