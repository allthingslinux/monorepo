"use client";

import Link from "next/link";

import { Button } from "@atl/ui/components/button";

export function DonateButton() {
  return (
    <Button
      className="hover:bg-primary shadow-md"
      nativeButton={false}
      render={<Link href="/contribute">How to contribute</Link>}
      size="lg"
      variant="default"
    />
  );
}
