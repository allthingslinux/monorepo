"use client";

import { Button } from "@atl/ui/components/button";
import Link from "next/link";

export function DonateButton() {
  return (
    <Button
      className="shadow-md hover:bg-primary"
      nativeButton={false}
      render={<Link href="/contribute">How to contribute</Link>}
      size="lg"
      variant="default"
    />
  );
}