import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { slugifyCategory } from "./src/lib/blog-utils";

// Define the Blog Post document type
export const BlogPost = defineDocumentType(() => ({
  computedFields: {
    categorySlug: {
      resolve: (doc) => {
        const category = doc.category || "Uncategorized";
        return slugifyCategory(category);
      },
      type: "string",
    },
    dateFormatted: {
      resolve: (doc) => {
        try {
          const date = new Date(doc.date);
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        } catch (error) {
          console.error("Error formatting date:", error);
          return doc.date;
        }
      },
      type: "string",
    },
    slug: {
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ""),
      type: "string",
    },
    url: {
      resolve: (doc) => {
        const categorySlug = doc.category
          ? slugifyCategory(doc.category)
          : "uncategorized";
        const slug = doc._raw.sourceFileName.replace(/\.mdx$/, "");
        return `/blog/${categorySlug}/${slug}`;
      },
      type: "string",
    },
  },
  contentType: "mdx",
  fields: {
    author: {
      default: "All Things Linux",
      required: true,
      type: "string",
    },
    category: {
      required: true,
      type: "string",
    },
    date: {
      required: true,
      type: "date",
    },
    description: {
      required: true,
      type: "string",
    },
    /** When true, hidden from listings and feeds in production builds. */
    draft: {
      default: false,
      required: false,
      type: "boolean",
    },
    /** Featured / OG image: absolute URL or path under site root (e.g. /images/foo.png). */
    image: {
      required: false,
      type: "string",
    },
    title: {
      required: true,
      type: "string",
    },
  },
  filePathPattern: "blog/**/*.mdx",
  name: "BlogPost",
}));

// Create the contentlayer source
export default makeSource({
  contentDirPath: "content",
  date: {
    timezone: "UTC",
  },
  disableImportAliasWarning: true,
  documentTypes: [BlogPost],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["anchor"] },
        },
      ],
    ],
    remarkPlugins: [remarkGfm],
  },
});
