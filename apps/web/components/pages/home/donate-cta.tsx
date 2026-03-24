import { memo } from "react";
import Link from "next/link";
import { BsOpencollective } from "react-icons/bs";

import { Button } from "@/components/ui/button";

const DonateCta = memo(() => {
  return (
    <section className="py-4 md:py-6">
      <div
        className="container relative overflow-hidden rounded-lg bg-center bg-cover"
        style={{
          backgroundImage: 'url("/images/donatebg.webp")',
        }}
      >
        <div className="absolute inset-0 bg-background opacity-40" />
        <div className="relative flex w-full flex-col py-8 sm:p-3 md:rounded-xl md:p-6 lg:flex-row lg:items-center lg:p-16">
          <div className="flex-1">
            <BsOpencollective className="mb-6 size-12" />
            <h3 className="mb-4 font-semibold text-foreground text-xl md:mb-4 md:text-3xl lg:mb-6">
              Support our Community
            </h3>
            <p className="text-balance text-card-foreground lg:text-base">
              All Things Linux is a community-driven project that relies on
              donations and out of pocket funds. Your donations help us keep the
              lights on and provide more services to the community.
            </p>
            <div className="mt-8">
              <Link href="/contribute">
                <Button size="lg" variant="secondary">
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

DonateCta.displayName = "DonateCta";

export default DonateCta;
