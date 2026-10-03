"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

const toHtml = (s: string) =>
  /^\s*<[a-z!]/i.test(s) || !s.trim()
    ? s
    : s.split(/\n{2,}/).map((p) => `<p>${p.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</p>`).join("");

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "Upload fallito");
  return j.url;
}

export default function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  // Gli embed (iframe) e i wrapper dei vecchi articoli verrebbero scartati dall'editor visuale: si parte dal codice HTML.
  const [source, setSource] = useState(/<iframe|<table/i.test(value));
  const [raw, setRaw] = useState(value);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Scrivi qui l'articolo…" }),
    ],
    content: toHtml(value),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "body editor-area" } },
  });

  useEffect(() => () => editor?.destroy(), [editor]);

  if (!editor) return <div className="editor-box" style={{ minHeight: 300 }} />;

  const btn = (label: string, run: () => void, active = false, title?: string) => (
    <button type="button" onClick={run} className={active ? "on" : ""} title={title ?? label}>{label}</button>
  );

  const addLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Indirizzo del link (vuoto per rimuovere)", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      const alt = window.prompt("Testo alternativo dell'immagine (importante per la SEO)", "") ?? "";
      editor.chain().focus().setImage({ src: url, alt }).run();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleSource = () => {
    if (source) {
      editor.commands.setContent(toHtml(raw));
      onChange(editor.getHTML());
    } else {
      setRaw(editor.getHTML());
    }
    setSource(!source);
  };

  return (
    <div className="editor-box">
      <div className="toolbar">
        {!source && (
          <>
            {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Grassetto")}
            {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Corsivo")}
            {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), "Titolo sezione")}
            {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }), "Sottotitolo")}
            {btn("• Elenco", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
            {btn("1. Elenco", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
            {btn("❝ Citazione", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
            {btn("🔗 Link", addLink, editor.isActive("link"))}
            {btn(busy ? "Carico…" : "🖼 Immagine", () => fileRef.current?.click())}
            {btn("↶", () => editor.chain().focus().undo().run(), false, "Annulla")}
            {btn("↷", () => editor.chain().focus().redo().run(), false, "Ripeti")}
          </>
        )}
        <span style={{ flex: 1 }} />
        {btn(source ? "← Editor visuale" : "</> HTML", toggleSource, source)}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addImage(e.target.files?.[0])} />
      </div>
      {source ? (
        <textarea
          className="source"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); onChange(e.target.value); }}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
