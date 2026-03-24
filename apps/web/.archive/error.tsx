"use client";

import Link from "next/link";

export default function ErrorBoundary({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="mb-4 font-bold text-3xl">Something went wrong</h1>
      <p className="mb-6">
        We encountered an error while loading this blog post.
      </p>
      <div className="flex justify-center gap-4">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => reset()}
        >
          Try again
        </button>
        <Link
          className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          href="/blog"
        >
          Return to blog
        </Link>
      </div>
    </div>
  );
}