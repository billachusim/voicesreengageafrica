import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/contributors")({
  component: ContribAdmin,
});

function ContribAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "contributors"],
    queryFn: async () => (await supabase.from("contributors").select("*").order("name")).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p = {
      slug: String(f.get("slug")),
      name: String(f.get("name")),
      role: String(f.get("role") || "") || null,
      region: String(f.get("region") || "") || null,
      bio: String(f.get("bio") || "") || null,
      avatar_url: String(f.get("avatar_url") || "") || null,
    };
    const { error } = editing
      ? await supabase.from("contributors").update(p).eq("id", editing.id)
      : await supabase.from("contributors").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null); setCreating(false);
    qc.invalidateQueries({ queryKey: ["admin", "contributors"] });
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("contributors").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "contributors"] });
  }

  const editingRow = editing || (creating ? {} : null);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <h1 className="font-serif text-4xl">Contributors</h1>
        <button onClick={() => setCreating(true)} className="bg-ink text-cream px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em]">+ New</button>
      </div>
      <table className="w-full border border-rule">
        <thead className="bg-paper">
          <tr className="text-left text-[10px] font-mono uppercase tracking-widest">
            <th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Region</th><th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((c: any) => (
            <tr key={c.id} className="border-t border-rule">
              <td className="p-3 font-serif">{c.name}</td>
              <td className="p-3 text-sm">{c.role}</td>
              <td className="p-3 text-sm">{c.region}</td>
              <td className="p-3 text-right space-x-3 text-xs">
                <button onClick={() => setEditing(c)} className="hover:underline">edit</button>
                <button onClick={() => del(c.id)} className="text-red-700 hover:underline">delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingRow && (
        <div className="fixed inset-0 bg-ink/60 grid place-items-center p-6 z-50">
          <form onSubmit={save} className="bg-cream w-full max-w-xl p-8 space-y-4">
            <h2 className="font-serif text-2xl">{editing ? "Edit" : "New"} contributor</h2>
            {["slug","name","role","region","avatar_url"].map((k) => (
              <label key={k} className="block">
                <span className="eyebrow block mb-1">{k.replace("_"," ")}</span>
                <input name={k} defaultValue={editingRow[k] ?? ""} required={k==="slug"||k==="name"}
                  className="w-full bg-paper border border-rule px-3 py-2 focus:outline-none focus:border-ink" />
              </label>
            ))}
            <label className="block">
              <span className="eyebrow block mb-1">Bio</span>
              <textarea name="bio" defaultValue={editingRow.bio ?? ""} rows={4}
                className="w-full bg-paper border border-rule px-3 py-2 focus:outline-none focus:border-ink" />
            </label>
            <div className="flex gap-3">
              <button className="bg-ink text-cream px-6 py-3 text-[11px] font-mono uppercase tracking-widest">Save</button>
              <button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="border border-rule px-6 py-3 text-[11px] font-mono uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
