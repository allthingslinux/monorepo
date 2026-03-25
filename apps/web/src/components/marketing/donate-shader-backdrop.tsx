"use client";

import { Shader6 } from "@/components/shader6";

/** WebGL backdrop for the donate CTA card (client-only; keeps DonateSection as RSC). */
export function DonateShaderBackdrop() {
  return (
    <Shader6
      backgroundColor="#14151f"
      className="pointer-events-none z-0 opacity-90"
      color="#7b8cff"
    />
  );
}