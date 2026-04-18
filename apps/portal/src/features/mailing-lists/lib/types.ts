export interface NormalizedFeedItem {
  authorEmail: string | null;
  authorName: string | null;
  bodyText: string;
  guid: string | null;
  /** Atom `thr:in-reply-to` / `in-reply-to` when the feed exposes it */
  inReplyTo: string | null;
  link: string;
  publishedAt: Date | null;
  title: string;
}
