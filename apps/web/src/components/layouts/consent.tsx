import Link from "next/link";

const Privacy = () => (
  <a
    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
    href="https://www.iubenda.com/privacy-policy/97069484/full-legal"
    rel="noopener noreferrer"
    target="_blank"
  >
    Privacy Policy
  </a>
);

const Cookies = () => (
  <a
    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
    href="https://www.iubenda.com/privacy-policy/97069484/cookie-policy"
    rel="noopener noreferrer"
    target="_blank"
  >
    Cookie Policy
  </a>
);

const Terms = () => (
  <a
    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
    href="https://www.iubenda.com/terms-and-conditions/97069484"
    rel="noopener noreferrer"
    target="_blank"
  >
    Terms & Conditions
  </a>
);

const Security = () => (
  <Link
    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
    href="/security"
  >
    Security
  </Link>
);

export { Cookies, Privacy, Security, Terms };
