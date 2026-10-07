/** Disegno del pallone (da usare dentro un <svg viewBox="0 0 24 24">). `id` serve se ci sono più palloni nella stessa pagina. */
export default function BallShape({ id = "ball-clip" }: { id?: string }) {
  return (
    <>
      <defs><clipPath id={id}><circle cx="12" cy="12" r="10.8" /></clipPath></defs>
      <g clipPath={`url(#${id})`} fill="currentColor">
        <path d="M12.00 8.30 L15.52 10.86 L14.17 14.99 L9.83 14.99 L8.48 10.86Z" />
        <path d="M16.29 6.09 L14.84 1.62 L18.64 -1.14 L22.45 1.62 L20.99 6.09Z M18.94 14.26 L22.75 11.49 L26.55 14.26 L25.10 18.73 L20.40 18.73Z M12.00 19.30 L15.80 22.06 L14.35 26.54 L9.65 26.54 L8.20 22.06Z M5.06 14.26 L3.60 18.73 L-1.10 18.73 L-2.55 14.26 L1.25 11.49Z M7.71 6.09 L3.01 6.09 L1.55 1.62 L5.36 -1.14 L9.16 1.62Z" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round">
        <path d="M12.00 8.30 L12.00 5.60 M15.52 10.86 L18.09 10.02 M14.17 14.99 L15.76 17.18 M9.83 14.99 L8.24 17.18 M8.48 10.86 L5.91 10.02" />
        <path d="M12.00 5.60 L7.71 6.09 M12.00 5.60 L16.29 6.09 M18.09 10.02 L16.29 6.09 M18.09 10.02 L18.94 14.26 M15.76 17.18 L18.94 14.26 M15.76 17.18 L12.00 19.30 M8.24 17.18 L12.00 19.30 M8.24 17.18 L5.06 14.26 M5.91 10.02 L5.06 14.26 M5.91 10.02 L7.71 6.09" />
      </g>
      <circle cx="12" cy="12" r="10.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  );
}
