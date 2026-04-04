"use client";

import { BarChart3, BookOpen, Code, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import {
  SiBitcoin,
  SiCashapp,
  SiOpencollective,
  SiPaypal,
  SiStripe,
} from "react-icons/si";

import { DONATION_OPTIONS } from "@/config/donate";
import { Button } from "@atl/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";

const DONATION_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  cashapp: SiCashapp,
  "every-org": SiBitcoin,
  opencollective: SiOpencollective,
  paypal: SiPaypal,
  "stripe-monthly": SiStripe,
  "stripe-onetime": SiStripe,
};

const linkButtonClass = "inline-flex w-full items-center justify-center gap-2";

export function DonateCtaSections() {
  return (
    <>
      <Card className="border-2 transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <BarChart3 className="size-6 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              Donate financially
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Your donations help us maintain infrastructure, run events, and grow
            our community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DONATION_OPTIONS.map((option) => {
              const Icon = DONATION_ICON_MAP[option.id];
              return (
                <Button
                  className={linkButtonClass}
                  key={option.id}
                  nativeButton={false}
                  render={
                    <a
                      aria-label={option.name}
                      href={option.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    />
                  }
                  size="default"
                  variant={
                    option.id === "opencollective" ? "default" : "outline"
                  }
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  <span>{option.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Users className="size-6 text-purple-600 dark:text-purple-500" />
              </div>
              <CardTitle className="text-lg">Volunteer your time</CardTitle>
            </div>
            <CardDescription>
              Join our team and help manage the community, create content, and
              organize events.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button
              className={linkButtonClass}
              nativeButton={false}
              render={<Link href="/app/connect" />}
              size="lg"
              variant="outline"
            >
              <Users className="size-4" />
              Connect with us
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/10 p-2">
                <BookOpen className="size-6 text-cyan-600 dark:text-cyan-500" />
              </div>
              <CardTitle className="text-lg">
                Contribute your knowledge
              </CardTitle>
            </div>
            <CardDescription>
              Share your knowledge by contributing, editing or writing articles
              and guides.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button
              className={linkButtonClass}
              nativeButton={false}
              render={
                <a
                  aria-label="Visit wiki at wiki.atl.dev"
                  href="https://wiki.atl.dev"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="lg"
              variant="outline"
            >
              <BookOpen className="size-4" />
              Visit Wiki
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Code className="size-6 text-blue-600 dark:text-blue-500" />
              </div>
              <CardTitle className="text-lg">Contribute your code</CardTitle>
            </div>
            <CardDescription>
              Help us build and improve our open-source projects and
              infrastructure.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button
              className={linkButtonClass}
              nativeButton={false}
              render={
                <a
                  aria-label="View All Things Linux on GitHub"
                  href="https://github.com/allthingslinux"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="lg"
              variant="outline"
            >
              <Code className="size-4" />
              View on GitHub
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <MessageSquare className="size-6 text-orange-600 dark:text-orange-500" />
              </div>
              <CardTitle className="text-lg">Help and support</CardTitle>
            </div>
            <CardDescription>
              Help others learn Linux, answer questions, and share your
              knowledge in our community.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button
              className={linkButtonClass}
              nativeButton={false}
              render={<Link href="/app/connect" />}
              size="lg"
              variant="outline"
            >
              <MessageSquare className="size-4" />
              Join our community
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
