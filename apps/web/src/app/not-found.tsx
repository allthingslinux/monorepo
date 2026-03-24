import { Button } from "@atl/ui/components/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 font-bold text-6xl">404</h1>
      <h2 className="mb-4 font-semibold text-2xl">Page Not Found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button render={<Link href="/">Go Home</Link>} />
    </div>
  );
}