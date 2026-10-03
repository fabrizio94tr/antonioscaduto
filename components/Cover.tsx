export default function Cover({ src, alt = "" }: { src: string | null; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={alt} loading="lazy" /> : <div className="ph" aria-hidden />;
}
