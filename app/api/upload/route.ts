import { supabaseServer } from "@/lib/supabase";

const MAX = 6 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Nessun file" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Formato non supportato (jpg, png, webp, gif, avif)" }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "File troppo grande (max 6 MB)" }, { status: 400 });

  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "immagine";
  const d = new Date();
  const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${base}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data } = sb.storage.from("media").getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
