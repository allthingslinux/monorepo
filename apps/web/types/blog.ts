export interface Post {
  author: string;
  category: string;
  categorySlug: string;
  content: string;
  date: string;
  dateFormatted: string;
  description: string;
  image?: string; // Optional featured image URL
  slug: string;
  title: string;
}
