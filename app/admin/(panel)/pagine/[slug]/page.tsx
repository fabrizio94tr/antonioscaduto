import { notFound } from "next/navigation";
import PageForm from "@/components/admin/PageForm";
import { supabaseServer } from "@/lib/supabase";

export default async function EditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  return (<><h1>Modifica pagina</h1><PageForm page={data} error={(await searchParams).error} /></>);
}
