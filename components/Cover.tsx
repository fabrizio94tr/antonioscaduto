export default function Cover({ src, alt = "", priority = false }: { src: string | null; alt?: string; priority?: boolean }) {
  if (!src) return <div className="ph" aria-hidden />;
  // <img> nativo: le immagini sono già WebP ridimensionati su Supabase Storage, niente costi di ottimizzazione a richiesta
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" {...(priority ? { fetchPriority: "high" as const } : {})} />;
}
