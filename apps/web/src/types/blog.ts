export interface Post {
  author: string;
  category: string;
  categorySlug: string;
  content: string;
  date: string;
  dateFormatted: string;
  description: string;
  /** Omitted when false / from older generated types. */
  draft?: boolean;
  image?: string;
  slug: string;
  title: string;
}
