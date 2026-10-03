export type Category = { id: string; slug: string; name: string; position: number; in_menu: boolean };
export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category_id: string | null;
  featured: boolean;
  breaking?: boolean;
  views?: number;
  published: boolean;
  published_at: string;
  category?: Category | null;
};
export type Page = { slug: string; title: string; content: string };
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
