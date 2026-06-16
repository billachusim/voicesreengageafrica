import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [s, c, sub] = await Promise.all([
        supabase.from("stories").select("status", { count: "exact", head: false }),
        supabase.from("contributors").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("reviewed", { count: "exact", head: false }),
      ]);
      const stories = s.data ?? [];
      const subs = sub.data ?? [];
      return {
        published: stories.filter((x: any) => x.status === "published").length,
        drafts: stories.filter((x: any) => x.status === "draft").length,
        contributors: c.count ?? 0,
        pitches: subs.length,
        unread: subs.filter((x: any) => !x.reviewed).length,
      };
    },
  });

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="font-serif text-4xl mt-2 mb-10">Editorial overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Published" value={data?.published ?? "—"} />
        <Stat label="Drafts" value={data?.drafts ?? "—"} />
        <Stat label="Contributors" value={data?.contributors ?? "—"} />
        <Stat label="New pitches" value={data?.unread ?? "—"} />
      </div>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <ActionCard to="/admin/stories" label="Manage stories" desc="Create and edit films, audio, essays and photo work." />
        <ActionCard to="/admin/contributors" label="Manage contributors" desc="Add bylines and biographies." />
        <ActionCard to="/admin/submissions" label="Review pitches" desc="Read and triage incoming submissions." />
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="border border-rule p-6">
      <p className="eyebrow">{label}</p>
      <p className="font-serif text-5xl mt-2">{value}</p>
    </div>
  );
}
function ActionCard({ to, label, desc }: any) {
  return (
    <Link to={to} className="border border-rule p-6 block hover:border-ink transition-colors">
      <h3 className="font-serif text-2xl">{label}</h3>
      <p className="text-sm text-ink/60 mt-2">{desc}</p>
      <p className="eyebrow mt-6 text-terracotta">Open →</p>
    </Link>
  );
}
