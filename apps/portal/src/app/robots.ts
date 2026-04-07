import type { MetadataRoute } from "next";

import { BASE_URL } from "@atl/config";
import { generateRobots } from "@atl/seo/robots";

export default function robots(): MetadataRoute.Robots {
  return generateRobots(BASE_URL);
}
