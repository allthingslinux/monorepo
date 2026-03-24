import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
    },
    server: {
      // Optional during build, required at runtime when database is accessed
      DATABASE_URL: z.url().optional(),
    },
  });