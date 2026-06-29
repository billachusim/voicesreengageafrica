import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ReEngage Voices" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "");
    const password = String(f.get("password") || "");
    setBusy(true);
    try {
      const { error } = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
      if (error) throw error;
      if (mode === "signup") {
        toast.success("Account created. Check your email if confirmation is required.");
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-sans text-2xl font-semibold not-italic block text-center mb-2">ReEngage <span className="text-terracotta">Voices</span></Link>
        <p className="eyebrow text-center mb-8">Editor sign in</p>
        <form onSubmit={onSubmit} className="space-y-4 border border-rule p-8 bg-paper">
          <div>
            <label className="eyebrow block mb-1.5">Email</label>
            <input name="email" type="email" required className="w-full bg-cream border border-rule px-3 py-2 focus:outline-none focus:border-ink" />
          </div>
          <div>
            <label className="eyebrow block mb-1.5">Password</label>
            <input name="password" type="password" required minLength={6} className="w-full bg-cream border border-rule px-3 py-2 focus:outline-none focus:border-ink" />
          </div>
          <button disabled={busy} className="w-full bg-ink text-cream py-3 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-forest disabled:opacity-50 rounded-full">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-[11px] font-mono uppercase tracking-[0.18em] text-ink/50 hover:text-terracotta">
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>
        <p className="text-center text-xs text-ink/40 mt-6">Editor access only. New accounts require role assignment by an admin.</p>
      </div>
    </div>
  );
}
