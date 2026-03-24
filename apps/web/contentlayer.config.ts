import { defineDocumentType, makeSource } from "contentlayer2/source-files";

// Define the Blog Post document type
export const BlogPost = defineDocumentType(() => ({
  computedFields: {
    categorySlug: {
      resolve: (doc) => {
        const category = doc.category || "Uncategorized";
        return category.toLowerCase().replaceAll(" ", "-");
      },
      type: "string",
    },
    dateFormatted: {
      resolve: (doc) => {
        try {
          const date = new Date(doc.date);
          // Use a more stable approach for date formatting
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
          ? doc.category.toLowerCase().replaceAll(" ", "-")
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
  disableImportAliasWarning: true,
  documentTypes: [BlogPost],
  mdx: {
    // Use default MDX processing without custom esbuild options
    // This should avoid the malformed code generation issue
  },
});