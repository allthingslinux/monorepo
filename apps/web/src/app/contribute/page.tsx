import { Button } from "@atl/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";
import {
  BarChart3,
  BookOpen,
  Code,
  DollarSign,
  MessageSquare,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  SiBitcoin,
  SiCashapp,
  SiGithub,
  SiOpencollective,
  SiPaypal,
  SiStripe,
} from "react-icons/si";

import { FinancialSupportDialog } from "@/components/pages/contribute/financial-support-dialog";

import { getPageMetadata } from "../metadata";

export const metadata: Metadata = getPageMetadata("contribute");

export default function ContributePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* Hero Section */}
      <div className="relative mb-12 overflow-hidden rounded-xl border border-primary/10 sm:mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-size-[20px_20px] opacity-20" />

        <div className="relative px-6 py-4 sm:px-10 sm:py-5 md:py-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-bold text-2xl sm:text-2xl md:text-3xl">
              Contribute to All Things Linux
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Help us build the most welcoming and passionate Linux community.
              Whether through donations, code contributions, or volunteering
              your time, every contribution makes a difference.
            </p>
          </div>
        </div>
      </div>

      {/* Ways to Contribute Section */}
      <div className="mb-16 space-y-6">
        {/* Financial Support - Full Width */}
        <Card className="border-2 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
              <CardTitle className="text-2xl">Donate financially</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Your donations help us maintain infrastructure, run events, and
              grow our community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2 leading-none"
                    href="https://opencollective.com/allthingslinux"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiOpencollective className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Open Collective</span>
                  </Link>
                }
              />
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2 leading-none"
                    href="https://paypal.com/donate/?hosted_button_id=9R5Y3RDAMF6D8"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiPaypal className="h-4 w-4 shrink-0" />
                    <span className="leading-none">PayPal</span>
                  </Link>
                }
                variant="outline"
              />
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2 leading-none"
                    href="https://donate.stripe.com/bJe8wQf5O2ZccHW06u1wY07"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiStripe className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Stripe (Monthly)</span>
                  </Link>
                }
                variant="outline"
              />
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2 leading-none"
                    href="https://every.org/allthingslinux/donate/crypto"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiBitcoin className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Every.org (Crypto)</span>
                  </Link>
                }
                variant="outline"
              />
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2 leading-none"
                    href="https://cash.app/$allthingslinux"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiCashapp className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Cash App</span>
                  </Link>
                }
                variant="outline"
              />
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2 leading-none"
                    href="https://donate.stripe.com/28EbJ27Dm9nAcHWdXk1wY06"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiStripe className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Stripe (One-Time)</span>
                  </Link>
                }
                variant="outline"
              />
            </div>
            <div className="mt-3 flex justify-center">
              <FinancialSupportDialog />
            </div>
          </CardContent>
        </Card>

        {/* Volunteer, Wiki, Code, Community */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Volunteer Your Time */}
          <Card className="flex h-full flex-col border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                </div>
                <CardTitle className="text-2xl">Volunteer your time</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Join our team and help manage the community, create content, and
                organize events.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2"
                    href="/apply"
                  >
                    <Users className="h-4 w-4" />
                    Browse Open Roles
                  </Link>
                }
                size="lg"
                variant="default"
              />
            </CardContent>
          </Card>

          {/* Contribute to Wiki */}
          <Card className="flex h-full flex-col border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-500" />
                </div>
                <CardTitle className="text-2xl">
                  Contribute your knowledge
                </CardTitle>
              </div>
              <CardDescription className="text-lg">
                Share your knowledge by contributing, editing or writing
                articles and guides.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2"
                    href="https://atl.wiki"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <BookOpen className="h-4 w-4" />
                    Visit Wiki
                  </Link>
                }
                size="lg"
                variant="default"
              />
            </CardContent>
          </Card>

          {/* Code Contributions */}
          <Card className="flex h-full flex-col border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Code className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Contribute your code</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Help us build and improve our open-source projects and
                infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2"
                    href="https://github.com/allthingslinux"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SiGithub className="h-4 w-4" />
                    View on GitHub
                  </Link>
                }
                size="lg"
                variant="default"
              />
            </CardContent>
          </Card>

          {/* Community Support */}
          <Card className="flex h-full flex-col border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
                <CardTitle className="text-2xl">Help and support</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Help others learn Linux, answer questions, and share your
                knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                render={
                  <Link
                    className="flex items-center justify-center gap-2"
                    href="https://discord.gg/linux"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Join Our Discord
                  </Link>
                }
                size="lg"
                variant="default"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Contribute Section */}
      <Card className="mb-16 border-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Why Contribute?
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Your contributions help us achieve our mission and vision.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="font-bold text-4xl text-primary">20+</div>
              <p className="text-muted-foreground text-sm">
                Dedicated Volunteers
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-bold text-4xl text-primary">100%</div>
              <p className="text-muted-foreground text-sm">
                Open Source and Non-Profit
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-bold text-4xl text-primary">24/7</div>
              <p className="text-muted-foreground text-sm">Community Support</p>
            </div>
          </div>

          {/* Transparency Section */}
          <div className="space-y-4 rounded-lg bg-muted/50 p-8 text-center">
            <h3 className="font-semibold text-xl">
              We Practice Radical Transparency
            </h3>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              As a 501(c)(3) non-profit, we're committed to complete
              transparency. We publish all our financials in real-time and share
              all of our decisions openly with the community.
            </p>
            <Button
              render={
                <Link
                  className="flex items-center justify-center gap-2"
                  href="/open"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Our Finances
                </Link>
              }
              size="lg"
              variant="outline"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}