"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Inner() {
  const status = useSearchParams().get("commento");
  if (status === "ok") return <p className="notice ok">Grazie! Il commento comparirà dopo la moderazione.</p>;
  if (status === "errore") return <p className="notice">Commento non valido: servono nome e testo, senza link.</p>;
  return null;
}

export default function CommentStatus() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
