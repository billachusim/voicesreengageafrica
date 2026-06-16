import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { listPublishedStories } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StoryCard } from "@/components/site/StoryCard";

const q = queryOptions({ queryKey: ["stories", "published"], queryFn: () => listPublishedStories() });

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "The Archive — ReEngage Voices" },
      { name: "description", content: "Browse every video, audio episode, PDF essay and photo essay in the Voices archive." },
      { property: "og:title", content: "The Archive — ReEngage Voices" },
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

const FORMATS = [
  { id: "all", label: "All formats" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "pdf", label: "Essays" },
  { id: "photo", label: "Photo" },
];

function Body() {
  const { data: stories } = useSuspenseQuery(q);
  const [format, setFormat] = useState("all");
  const [region, setRegion] = useState("all");

  const regions = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => s.region && set.add(s.region));
    return ["all", ...Array.from(set).sort()];
  }, [stories]);

  const filtered = stories.filter((s) =>
    (format === "all" || s.format === format) &&
    (region === "all" || s.region === region),
  );

  return (
    <>
      <section className="border-b border-rule px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow">The Archive</p>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-3 leading-none">All stories, all formats.</h1>
          <p className="mt-6 text-ink/60 max-w-xl text-lg">
            {stories.length} collected works across film, audio, photography and essay.
          </p>
        </div>
      </section>

      <section className="border-b border-rule px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 mr-2">Format</span>
            {FORMATS.map((f) => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                className={`px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] border transition-colors ${
                  format === f.id ? "bg-ink text-cream border-ink" : "border-rule hover:border-ink"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40">Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent border border-rule px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] focus:outline-none focus:border-ink">
              {regions.map((r) => <option key={r} value={r}>{r === "all" ? "All regions" : r}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-24 text-ink/40 font-mono text-sm uppercase tracking-widest">No stories match these filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
