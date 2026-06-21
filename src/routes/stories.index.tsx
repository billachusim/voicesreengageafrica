import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { listPublishedStories } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StoryCard } from "@/components/site/StoryCard";
import { THEMES, FORMATS } from "@/lib/taxonomy";
import { resolveAsset, FORMAT_LABEL, formatDuration } from "@/lib/assets";

const q = queryOptions({ queryKey: ["stories", "published"], queryFn: () => listPublishedStories() });

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "Browse — ReEngage Voices" },
      { name: "description", content: "Browse every video interview, audio story, written essay and photo essay in the Voices archive. Toggle by format or explore by theme." },
      { property: "og:title", content: "Browse — ReEngage Voices" },
      { property: "og:url", content: "/stories" },
    ],
    links: [{ rel: "canonical", href: "/stories" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: () => (
    <div className="min-h-screen bg-cream">
      <Header />
      <Suspense fallback={<div className="h-96" />}><Body /></Suspense>
      <Footer />
    </div>
  ),
});

function Body() {
  const { data: stories } = useSuspenseQuery(q);
  const [format, setFormat] = useState<string>("all");
  const [theme, setTheme] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const regions = useMemo(() => {
    const s = new Set<string>();
    stories.forEach((x) => x.region && s.add(x.region));
    return ["all", ...Array.from(s).sort()];
  }, [stories]);

  const byFormat = stories.filter((s) => format === "all" || s.format === format);
  const searched = byFormat.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title?.toLowerCase().includes(q) ||
      s.excerpt?.toLowerCase().includes(q) ||
      s.contributor?.name?.toLowerCase().includes(q) ||
      (s.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
    );
  });
  const filtered = searched.filter((s) =>
    (theme === "all" || s.theme === theme) &&
    (region === "all" || s.region === region),
  );

  return (
    <>
      {/* Spotify-style header */}
      <section className="bg-linear-to-b from-forest to-ink text-cream px-6 pt-16 pb-10">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow text-terracotta">The Voices Library</p>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-3 leading-none">Listen, watch, read.</h1>
          <p className="mt-5 text-cream/70 max-w-xl text-lg">
            {stories.length} stories collected from elders and contributors across the continent.
            Submitted on the site or sent in through the ReEngage Africa WhatsApp chatbot.
          </p>
        </div>
      </section>

      {/* Sticky format tabs */}
      <div className="sticky top-16 z-40 bg-cream/95 backdrop-blur border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] border transition-all ${
                format === f.id
                  ? "bg-ink text-cream border-ink"
                  : "border-rule text-ink/60 hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, tags, contributors…"
              className="w-56 md:w-72 bg-paper border border-rule px-4 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 mr-1">Tag</span>
          <ClusterPill active={theme === "all"} onClick={() => setTheme("all")}>All tags</ClusterPill>
          {THEMES.map((t) => (
            <ClusterPill key={t} active={theme === t} onClick={() => setTheme(t)}>{t}</ClusterPill>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40">Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent border border-rule px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] focus:outline-none focus:border-ink">
              {regions.map((r) => <option key={r} value={r}>{r === "all" ? "All regions" : r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Body — flat grid */}
      <section className="px-6 py-14 bg-cream">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-24 text-ink/40 font-mono text-sm uppercase tracking-widest">
              No stories match these filters.
            </p>
          ) : (
            <>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/50 mb-6">
                {filtered.length} {filtered.length === 1 ? "story" : "stories"}
                {theme !== "all" && <> · {theme}</>}
                {format !== "all" && <> · {FORMAT_LABEL[format]}</>}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filtered.map((s) => <StoryCard key={s.id} story={s} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function ClusterPill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.14em] border rounded-full transition-colors ${
        active ? "bg-terracotta text-cream border-terracotta" : "border-rule text-ink/70 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

