import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: SubsAdmin,
});

function SubsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "subs"],
    queryFn: async () => (await supabase.from("submissions").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  async function toggle(id: string, reviewed: boolean) {
    const { error } = await supabase.from("submissions").update({ reviewed: !reviewed }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "subs"] });
  }
  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Pitches</h1>
      <div className="space-y-4">
        {(data ?? []).length === 0 && <p className="text-ink/40 font-mono text-sm uppercase tracking-widest">No pitches yet.</p>}
        {(data ?? []).map((s: any) => (
          <div key={s.id} className={`border p-6 ${s.reviewed ? "border-rule opacity-60" : "border-ink"}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-serif text-xl">{s.name} <a href={`mailto:${s.email}`} className="text-terracotta text-sm">&lt;{s.email}&gt;</a></p>
                <p className="eyebrow mt-1">{[s.region, s.format].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <button onClick={() => toggle(s.id, s.reviewed)} className="text-[11px] font-mono uppercase tracking-widest text-terracotta">
                {s.reviewed ? "Mark unread" : "Mark reviewed"}
              </button>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{s.pitch}</p>
            {s.media_link && <a href={s.media_link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-mono text-terracotta">↗ {s.media_link}</a>}
            <p className="text-[10px] font-mono uppercase tracking-widest text-ink/30 mt-4">{new Date(s.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
