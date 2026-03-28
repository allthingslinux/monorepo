import alchemy from 'alchemy';
import { Nextjs } from 'alchemy/cloudflare';

const app = await alchemy('atl-sh');

export const website = await Nextjs('docs', {
  domains: ['docs.atl.sh'],
});

console.log({ url: website.url });

await app.finalize();
