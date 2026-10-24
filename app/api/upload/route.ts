import sharp from "sharp";
import { isReader } from "@/lib/roles";
import { supabaseServer } from "@/lib/supabase";

/** Segnaposto pubblicitario (es. riquadro grigio "nexilia" copiato da altri siti): quasi tutto grigio chiaro uniforme. */
async function isPlaceholder(buf: Buffer) {
  try {
    const { data, info } = await sharp(buf).resize(48, 48, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let gray = 0;
    for (let i = 0; i < info.width * info.height; i++) {
      const [r, g, b] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
      if (Math.abs(r - 240) < 14 && Math.abs(g - 240) < 14 && Math.abs(b - 240) < 14) gray++;
    }
    return gray / (info.width * info.height) >= 0.85;
  } catch {
    return false;
  }
}

const MAX = 4 * 1024 * 1024; // sotto il limite di 4,5 MB di Vercel (il browser riduce già le foto)
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user || isReader(auth.user)) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Nessun file" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Formato non supportato (jpg, png, webp, gif, avif)" }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "File troppo grande (max 4 MB)" }, { status: 400 });
  if (await isPlaceholder(Buffer.from(await file.arrayBuffer()))) return Response.json({ error: "Questa immagine è un riquadro pubblicitario vuoto (segnaposto) copiato da un altro sito: non è stata caricata." }, { status: 400 });

  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "immagine";
  const d = new Date();
  const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${base}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data } = sb.storage.from("media").getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
