import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/stories")({
  component: StoriesAdmin,
});

function StoriesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "stories"],
    queryFn: async () => (await supabase.from("stories").select("id,slug,title,format,status,region,published_at").order("updated_at", { ascending: false })).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  async function del(id: string) {
    if (!confirm("Delete this story?")) return;
    const { error } = await supabase.from("stories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "stories"] });
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="eyebrow">Stories</p>
          <h1 className="font-serif text-4xl mt-2">All stories</h1>
        </div>
        <button onClick={() => setCreating(true)} className="bg-ink text-cream px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-forest">+ New story</button>
      </div>

      <table className="w-full border border-rule">
        <thead className="bg-paper">
          <tr className="text-left text-[10px] font-mono uppercase tracking-[0.16em] text-ink/60">
            <th className="p-3">Title</th><th className="p-3">Format</th><th className="p-3">Region</th><th className="p-3">Status</th><th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((s: any) => (
            <tr key={s.id} className="border-t border-rule">
              <td className="p-3 font-serif">{s.title}</td>
              <td className="p-3 text-xs uppercase">{s.format}</td>
              <td className="p-3 text-xs">{s.region}</td>
              <td className="p-3 text-xs">{s.status === "published" ? <span className="text-terracotta">● Published</span> : <span className="text-ink/40">Draft</span>}</td>
              <td className="p-3 text-right space-x-3 text-xs">
                <Link to="/stories/$slug" params={{ slug: s.slug }} target="_blank" className="hover:underline">view</Link>
                <button onClick={() => setEditing(s)} className="hover:underline">edit</button>
                <button onClick={() => del(s.id)} className="text-red-700 hover:underline">delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(editing || creating) && (
        <StoryEditor
          story={editing}
          onClose={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin", "stories"] }); }}
        />
      )}
    </div>
  );
}

function StoryEditor({ story, onClose }: any) {
  const [busy, setBusy] = useState(false);
  const { data: contributors } = useQuery({
    queryKey: ["admin", "contrib-list"],
    queryFn: async () => (await supabase.from("contributors").select("id,name").order("name")).data ?? [],
  });

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tagsRaw = String(f.get("tags") || "").trim();
    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    let chapters = null, gallery = null;
    try { const c = String(f.get("chapters") || "").trim(); chapters = c ? JSON.parse(c) : null; } catch { return toast.error("Chapters JSON is invalid"); }
    try { const g = String(f.get("gallery") || "").trim(); gallery = g ? JSON.parse(g) : null; } catch { return toast.error("Gallery JSON is invalid"); }
    const status = f.get("status") as string;
    const payload: any = {
      slug: String(f.get("slug") || ""),
      title: String(f.get("title") || ""),
      format: f.get("format") as string,
      status,
      theme: String(f.get("theme") || "") || null,
      region: String(f.get("region") || "") || null,
      tags,
      excerpt: String(f.get("excerpt") || "") || null,
      body: String(f.get("body") || "") || null,
      cover_image_url: String(f.get("cover_image_url") || "") || null,
      media_url: String(f.get("media_url") || "") || null,
      transcript: String(f.get("transcript") || "") || null,
      chapters,
      duration_seconds: Number(f.get("duration_seconds")) || null,
      pull_quote: String(f.get("pull_quote") || "") || null,
      pdf_page_count: Number(f.get("pdf_page_count")) || null,
      gallery,
      contributor_id: String(f.get("contributor_id") || "") || null,
      featured: f.get("featured") === "on",
      published_at: status === "published" ? (story?.published_at ?? new Date().toISOString()) : null,
    };
    setBusy(true);
    const { error } = story
      ? await supabase.from("stories").update(payload).eq("id", story.id)
      : await supabase.from("stories").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 grid place-items-center p-6 overflow-auto">
      <form onSubmit={save} className="bg-cream w-full max-w-3xl p-8 max-h-[92vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl">{story ? "Edit story" : "New story"}</h2>
          <button type="button" onClick={onClose} className="text-xs font-mono uppercase tracking-widest">close ✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Inp label="Slug" name="slug" required def={story?.slug} />
          <Inp label="Title" name="title" required def={story?.title} />
          <Sel label="Format" name="format" def={story?.format ?? "video"} opts={[["video","Video"],["audio","Audio"],["pdf","PDF"],["photo","Photo"]]} />
          <Sel label="Status" name="status" def={story?.status ?? "draft"} opts={[["draft","Draft"],["published","Published"]]} />
          <Inp label="Region" name="region" def={story?.region} />
          <Inp label="Theme" name="theme" def={story?.theme} />
          <Inp label="Tags (comma-sep)" name="tags" def={story?.tags?.join(", ")} />
          <Sel label="Contributor" name="contributor_id" def={story?.contributor_id ?? ""} opts={[["",""], ...((contributors ?? []) as any[]).map((c) => [c.id, c.name] as [string,string])]} />
          <Inp label="Cover image URL" name="cover_image_url" def={story?.cover_image_url} full />
          <Inp label="Media URL (S3-ready)" name="media_url" def={story?.media_url} full />
          <Inp label="Duration (seconds)" name="duration_seconds" type="number" def={story?.duration_seconds} />
          <Inp label="PDF page count" name="pdf_page_count" type="number" def={story?.pdf_page_count} />
          <Area label="Excerpt" name="excerpt" def={story?.excerpt} />
          <Area label="Pull quote" name="pull_quote" def={story?.pull_quote} />
          <Area label="Body" name="body" def={story?.body} full rows={6} />
          <Area label="Transcript (video/audio)" name="transcript" def={story?.transcript} full rows={4} />
          <Area label='Chapters JSON: [{"time":0,"title":"…"}]' name="chapters" def={story?.chapters ? JSON.stringify(story.chapters, null, 2) : ""} full rows={3} />
          <Area label='Gallery JSON: [{"url":"…","caption":"…","credit":"…"}]' name="gallery" def={story?.gallery ? JSON.stringify(story.gallery, null, 2) : ""} full rows={3} />
          <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={story?.featured} /> Featured on home</label>
        </div>
        <button disabled={busy} className="mt-6 bg-ink text-cream px-6 py-3 text-[11px] font-mono uppercase tracking-[0.18em]">{busy ? "Saving…" : "Save story"}</button>
      </form>
    </div>
  );
}

function Inp({ label, name, def, full, ...p }: any) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="eyebrow block mb-1">{label}</span>
      <input name={name} defaultValue={def ?? ""} {...p}
        className="w-full bg-paper border border-rule px-3 py-2 focus:outline-none focus:border-ink" />
    </label>
  );
}
function Sel({ label, name, def, opts }: any) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1">{label}</span>
      <select name={name} defaultValue={def} className="w-full bg-paper border border-rule px-3 py-2 focus:outline-none focus:border-ink">
        {opts.map(([v, l]: any) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function Area({ label, name, def, full, rows = 2 }: any) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="eyebrow block mb-1">{label}</span>
      <textarea name={name} defaultValue={def ?? ""} rows={rows}
        className="w-full bg-paper border border-rule px-3 py-2 focus:outline-none focus:border-ink font-mono text-sm" />
    </label>
  );
}
