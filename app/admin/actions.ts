"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";

export async function login(formData: FormData) {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logout() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/admin/login");
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function saveArticle(formData: FormData) {
  const sb = await supabaseServer();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title")).trim();
  const row = {
    title,
    slug: String(formData.get("slug") || "").trim() || slugify(title) + "-" + Date.now().toString(36).slice(-4),
    excerpt: String(formData.get("excerpt") ?? "") || null,
    content: String(formData.get("content") ?? ""),
    image_url: String(formData.get("image_url") ?? "") || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    published_at: formData.get("published_at")
      ? new Date(String(formData.get("published_at"))).toISOString()
      : new Date().toISOString(),
  };
  const { error } = id ? await sb.from("articles").update(row).eq("id", id) : await sb.from("articles").insert(row);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteArticle(formData: FormData) {
  const sb = await supabaseServer();
  await sb.from("articles").delete().eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin");
}
