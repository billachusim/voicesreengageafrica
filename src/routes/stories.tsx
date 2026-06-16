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

export const Route = createFileRoute("/stories")({
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

  // Rails per theme (only when "all themes" selected and no search)
  const showRails = theme === "all" && !query && region === "all";

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

      {/* Sticky format tabs (Spotify-style) */}
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
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 mr-1">Cluster</span>
          <ClusterPill active={theme === "all"} onClick={() => setTheme("all")}>All clusters</ClusterPill>
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

      {/* Body */}
      <section className="px-6 py-14 bg-cream">
        <div className="max-w-7xl mx-auto">
          {showRails ? (
            <div className="space-y-16">
              {THEMES.map((t) => {
                const rows = searched.filter((s) => s.theme === t);
                if (rows.length === 0) return null;
                return (
                  <div key={t}>
                    <div className="flex items-end justify-between mb-5 border-b border-rule pb-3">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-terracotta">Cluster</p>
                        <h2 className="font-serif text-2xl md:text-3xl font-medium mt-1">{t}</h2>
                      </div>
                      <button
                        onClick={() => setTheme(t)}
                        className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/60 hover:text-terracotta"
                      >
                        See all ({rows.length}) →
                      </button>
                    </div>
                    <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-6 px-6 scrollbar-thin">
                      {rows.map((s) => (
                        <div key={s.id} className="snap-start shrink-0 w-[260px] md:w-[300px]">
                          <CompactCard story={s} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filtered.length === 0 ? (
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

function CompactCard({ story }: { story: any }) {
  const cover = resolveAsset(story.cover_image_url);
  const isMedia = story.format === "video" || story.format === "audio";
  return (
    <Link to="/stories/$slug" params={{ slug: story.slug }} className="group block">
      <div className="relative aspect-square overflow-hidden bg-paper border border-rule mb-3">
        {cover ? (
          <img src={cover} alt={story.title} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-5">
            <p className="font-serif italic text-ink/70 text-sm leading-snug text-center">
              “{story.pull_quote ?? story.excerpt}”
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 bg-cream/95 text-ink text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest">
          {FORMAT_LABEL[story.format] ?? story.format}
        </span>
        {isMedia && (
          <div className="absolute bottom-2 right-2 size-10 bg-terracotta grid place-items-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="size-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-cream ml-0.5" />
          </div>
        )}
        {story.duration_seconds && isMedia && (
          <span className="absolute bottom-2 left-2 text-cream text-[10px] font-mono tracking-wider">
            {formatDuration(story.duration_seconds)}
          </span>
        )}
      </div>
      <h3 className="font-serif text-base font-medium leading-snug group-hover:text-terracotta transition-colors line-clamp-2">
        {story.title}
      </h3>
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-ink/45 mt-1.5">
        {story.contributor?.name ?? "—"} · {story.region ?? "—"}
      </p>
    </Link>
  );
}
