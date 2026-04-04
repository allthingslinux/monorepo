/* oxlint-disable react/no-danger -- Schema.org JSON-LD is injected via Next.js Script */
import Script from "next/script";

interface ArticleSchema {
  authorName: string;
  dateModified: string;
  datePublished: string;
  description: string;
  imageUrl: string;
  title: string;
}

export function OrganizationSchema() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    description:
      "A 501(c)(3) non-profit organization empowering the Linux ecosystem through education, collaboration, and support.",
    logo: "https://allthingslinux.org/images/logo.png",
    name: "All Things Linux",
    sameAs: ["https://github.com/allthingslinux", "https://discord.gg/linux"],
    url: "https://allthingslinux.org",
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      id="organization-schema"
      strategy="afterInteractive"
      type="application/ld+json"
    />
  );
}

export function WebsiteSchema() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "All Things Linux",
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: "https://allthingslinux.org/search?q={search_term_string}",
    },
    url: "https://allthingslinux.org",
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      id="website-schema"
      strategy="afterInteractive"
      type="application/ld+json"
    />
  );
}

export function ArticleSchema({
  title,
  description,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
}: ArticleSchema) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: {
      "@type": "Person",
      name: authorName,
    },
    dateModified,
    datePublished,
    description,
    headline: title,
    image: imageUrl,
    mainEntityOfPage: {
      "@id": "https://allthingslinux.org",
      "@type": "WebPage",
    },
    publisher: {
      "@type": "Organization",
      logo: {
        "@type": "ImageObject",
        url: "https://allthingslinux.org/images/logo.png",
      },
      name: "All Things Linux",
    },
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      id="article-schema"
      strategy="afterInteractive"
      type="application/ld+json"
    />
  );
}
