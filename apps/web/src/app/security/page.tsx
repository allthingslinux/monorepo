import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Security vulnerability disclosure and responsible reporting for All Things Linux.",
  title: "Security - Responsible Disclosure",
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <h1 className="mb-4 font-bold text-4xl">Security at All Things Linux</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none [&_li]:my-1 [&_ol]:space-y-1 [&_ul]:space-y-1">
        <p>
          At All Things Linux, we are committed to maintaining the highest
          security standards to protect our community and infrastructure. We
          deeply value the security research community and actively encourage
          responsible disclosure of security vulnerabilities. Your contributions
          help us ensure the safety, privacy, and integrity of our platforms and
          services.
        </p>
        <p>
          We believe in transparency and collaboration when it comes to
          security. Our team is dedicated to investigating all reported issues
          promptly and working with researchers to address vulnerabilities in a
          timely and responsible manner.
        </p>
        <h2>Scope</h2>
        <p>
          This security policy applies to all All Things Linux projects and
          services, including but not limited to:
        </p>
        <ul>
          <li>
            All our domains including their subdomains:
            <ul className="mt-1 ml-4 space-y-0.5 text-muted-foreground text-sm">
              <li>allthingslinux.com</li>
              <li>allthingslinux.dev</li>
              <li>allthingslinux.org</li>
              <li>atl.chat</li>
              <li>atl.dev</li>
              <li>atl.moe</li>
              <li>atl.network</li>
              <li>atl.rip</li>
              <li>atl.services</li>
              <li>atl.sh</li>
              <li>atl.tools</li>
              <li>atl.wiki</li>
            </ul>
          </li>
          <li>
            API endpoints, backend services, Discord bot services or
            integrations, and community platforms or forums.
          </li>
          <li>
            Repositories within the All Things Linux GitHub organization,
            individual projects may have exceptions.
          </li>
        </ul>
        We are interested in any vulnerability that could lead to unauthorized
        access, data breaches, or service disruptions. We welcome any reports of
        potential security issues outside of this scope but we may not be able
        to address them immediately. Please also note that we host external
        services, we also welcome reports regarding those services but we may
        not be able to address them directly and will refer you to the
        appropriate party.
        <h2>How to Report a Security Issue</h2>
        <p>
          If you have discovered a security vulnerability, please help us keep
          our community safe by reporting it responsibly. When reporting, please
          include:
        </p>
        <ol>
          <li>
            A clear description of the vulnerability and its potential impact
          </li>
          <li>Detailed steps to reproduce the issue</li>
          <li>
            Information about the environment where you discovered the issue
          </li>
          <li>Any proof-of-concept code or evidence (if applicable)</li>
          <li>
            Any recommendations or patches you may have for resolving the issue
          </li>
        </ol>
        <div className="rounded-lg border-2 border-primary/20 bg-card p-4 shadow-lg sm:p-5 md:p-6">
          <h3 className="-mt-2 mb-0 flex items-center font-medium font-mono text-lg text-primary/90 sm:text-xl md:text-2xl">
            <span className="mr-2 text-green-500">~/</span>Contact Information
          </h3>
          <p className="-mt-2 mb-0 text-sm leading-relaxed sm:text-base md:text-lg">
            <br />
            <a
              className="font-medium text-blue-500 hover:text-blue-400 hover:underline"
              href="mailto:security@allthingslinux.org"
            >
              security@allthingslinux.org
            </a>
          </p>
          <p className="mt-1 mb-3 ml-4 text-muted-foreground text-sm">
            PGP Key:{" "}
            <a
              className="font-medium text-blue-500 hover:text-blue-400 hover:underline"
              href="https://allthingslinux.org/security@allthingslinux.org-pubkey.asc"
            >
              allthingslinux.org/security@allthingslinux.org-pubkey.asc
            </a>
          </p>
          <p className="mb-0 text-muted-foreground text-sm leading-relaxed sm:text-base md:text-lg">
            Alternatively, you may open a ticket in our Discord server at{" "}
            <a
              className="font-medium text-blue-500 hover:text-blue-400 hover:underline"
              href="https://discord.gg/linux"
            >
              discord.gg/linux
            </a>{" "}
            and request assistance from our systems team. Please do not disclose
            vulnerability details in the ticket unless requested by an
            administrator or a member of the systems team.
          </p>
        </div>
        <h2>Responsible Disclosure Guidelines</h2>
        <p>We ask that you:</p>
        <ul>
          <li>
            Do not make use of any vulnerabilities without explicit permission
            to do so
          </li>
          <li>Do not access, copy, or destroy data in any capacity</li>
          <li>
            Do not disrupt our services or degrade the performance of our
            services
          </li>
          <li>
            Keep vulnerability details confidential until we have addressed the
            issue
          </li>
          <li>Give us reasonable time to investigate and resolve the issue</li>
        </ul>
        <h2>Safe Harbor</h2>
        <p>
          Any activities conducted in a manner consistent with this policy will
          be considered authorized conduct and we will not initiate legal action
          against you. If legal action is initiated by a third party against you
          in connection with activities conducted under this policy, we will
          ensure it is known that your actions were conducted in compliance with
          this policy.
        </p>
        <div className="rounded-lg border-2 border-primary/20 bg-card p-4 shadow-lg sm:p-5 md:p-6">
          <h3 className="-mt-2 mb-0 flex items-center font-medium font-mono text-lg text-primary/90 sm:text-xl md:text-2xl">
            <span className="mr-2 text-yellow-500">~/</span>Recognition
          </h3>
          <p className="mt-1 mb-0 text-muted-foreground">
            We appreciate security researchers who help keep our community safe.
            If you would like to be acknowledged for your responsible
            disclosure, please let us know in your report and we&apos;ll be
            happy to recognize your contribution publicly.
          </p>
        </div>
        <p className="mb-0 text-muted-foreground text-sm">
          Thank you for helping us keep All Things Linux secure for everyone.
        </p>
      </div>
    </div>
  );
}