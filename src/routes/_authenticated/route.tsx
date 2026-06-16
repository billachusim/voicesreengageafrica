import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // Load roles
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    return { user: data.user, roles: (roles ?? []).map((r) => r.role) as string[] };
  },
  component: AdminShell,
});

function AdminShell() {
  const { user, roles } = Route.useRouteContext();
  const router = useRouter();
  const isPriv = roles.includes("admin") || roles.includes("editor");

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-serif text-lg italic">Voices · Admin</Link>
          <nav className="flex items-center gap-6 text-[11px] font-mono uppercase tracking-[0.16em] text-ink/60">
            <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "text-ink" }} className="hover:text-ink">Dashboard</Link>
            <Link to="/admin/stories" activeProps={{ className: "text-ink" }} className="hover:text-ink">Stories</Link>
            <Link to="/admin/contributors" activeProps={{ className: "text-ink" }} className="hover:text-ink">Contributors</Link>
            <Link to="/admin/submissions" activeProps={{ className: "text-ink" }} className="hover:text-ink">Pitches</Link>
            <span className="text-ink/30">·</span>
            <span className="text-ink/40">{user.email}</span>
            <button onClick={signOut} className="text-terracotta hover:underline">Sign out</button>
          </nav>
        </div>
      </header>
      {isPriv ? (
        <div className="max-w-7xl mx-auto px-6 py-10"><Outlet /></div>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="eyebrow">Access denied</p>
          <h1 className="font-serif text-4xl mt-3">No role assigned</h1>
          <p className="text-ink/60 mt-4">Your account is signed in but has no editor or admin role yet. Ask an admin to grant access.</p>
          <p className="text-ink/40 text-xs font-mono mt-6 break-all">User ID: {user.id}</p>
        </div>
      )}
    </div>
  );
}
