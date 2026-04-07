import {
  APP_AUTHOR,
  APP_CREATOR,
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_PUBLISHER,
  APP_TITLE,
  BASE_URL,
} from "@atl/config";
import { buildDefaultMetadata, createPageMetadata } from "@atl/seo/metadata";

export { createPageMetadata };

export const portalDefaultMetadata = buildDefaultMetadata({
  author: APP_AUTHOR.name,
  baseUrl: BASE_URL,
  creator: APP_CREATOR,
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  publisher: APP_PUBLISHER,
  title: APP_TITLE,
});
