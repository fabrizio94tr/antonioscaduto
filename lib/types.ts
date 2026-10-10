export type Reliability = "ufficiale" | "fonte" | "indiscrezione";
export type Category = {
  id: string; slug: string; name: string; position: number; in_menu: boolean;
  description?: string | null; meta_title?: string | null; meta_description?: string | null;
};
export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category_id: string | null;
  featured: boolean;
  reliability?: Reliability | null;
  breaking?: boolean;
  views?: number;
  published: boolean;
  published_at: string;
  updated_at?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
  noindex?: boolean;
  focus_keyword?: string | null;
  tags?: string[];
  author_name?: string;
  category?: Category | null;
};
export type Page = {
  slug: string; title: string; content: string;
  meta_title?: string | null; meta_description?: string | null; noindex?: boolean;
};
export type Settings = Record<string, string>;
export type TransferStatus = "rumors" | "trattativa" | "vicino" | "ufficiale" | "sfumato";
export type Transfer = {
  id: string;
  player: string;
  from_club: string | null;
  to_club: string | null;
  status: TransferStatus;
  fee: string | null;
  note: string | null;
  article_slug: string | null;
  updated_at: string;
};
