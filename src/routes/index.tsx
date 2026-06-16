import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listPublishedStories } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StoryCard } from "@/components/site/StoryCard";
import { resolveAsset, FORMAT_LABEL } from "@/lib/assets";

const storiesQuery = queryOptions({
  queryKey: ["stories", "published"],
  queryFn: () => listPublishedStories(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReEngage Voices — African heritage stories & lived experience" },
      { name: "description", content: "Cinematic film, audio, photo essays and PDF writing from across the continent. A digital archive by ReEngage Africa." },
      { property: "og:title", content: "ReEngage Voices" },
      { property: "og:description", content: "A digital archive of African heritage stories — film, audio, essays, and photography." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(storiesQuery),
  component: HomePage,
  pendingComponent: () => <div className="min-h-screen bg-cream" />,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <Suspense fallback={<div className="h-[90vh] bg-paper" />}>
        <HomeBody />
      </Suspense>
      <Footer />
    </div>
  );
}

function HomeBody() {
  const { data: stories } = useSuspenseQuery(storiesQuery);
  const featured = stories.find((s) => s.featured) ?? stories[0];
  const rest = stories.filter((s) => s.id !== featured?.id);

  const clusters: { title: string; subtitle: string }[] = [
    { title: "Proverbs, Music & Oral Artistry", subtitle: "The talking drum, the praise poem, the riddle told at dusk." },
    { title: "Everyday Life & Cultural Memory", subtitle: "Markets, kitchens, courtyards — the rhythms of ordinary days." },
    { title: "Work, Trades & Indigenous Knowledge", subtitle: "Hands, soil, dye-pots and looms. Knowledge passed by doing." },
    { title: "Community & Spiritual Practice", subtitle: "Family, faith, festivals — how a people gathers." },
    { title: "Local Cosmology, Myths & Ancestry", subtitle: "Sacred rivers, sky stories, and the people who arrived first." },
    { title: "Memory, Conflict & Nationhood", subtitle: "Independence, struggle, governance, and the long quiet after." },
  ];

  return (
    <>
      {featured && <Hero story={featured} />}
      {clusters.map((c) => {
        const rows = rest.filter((s) => s.theme === c.title).slice(0, 3);
        if (rows.length === 0) return null;
        return <Rail key={c.title} title={c.title} subtitle={c.subtitle} stories={rows} />;
      })}
      <ArchiveIndex stories={stories} />
    </>
  );
}

function Hero({ story }: { story: any }) {
  const cover = resolveAsset(story.cover_image_url);
  return (
    <section className="relative h-[92vh] flex flex-col justify-end overflow-hidden bg-ink">
      {cover && (
        <img src={cover} alt="" width={1920} height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-90" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6 pb-20 w-full">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-terracotta text-cream px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em]">
            {FORMAT_LABEL[story.format] ?? story.format}
          </span>
          <span className="text-cream/80 text-[10px] font-mono uppercase tracking-[0.2em]">
            {story.region}
          </span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream font-semibold leading-[0.95] text-balance max-w-[18ch]">
          {story.title}
        </h1>
        {story.excerpt && (
          <p className="text-cream/75 mt-6 max-w-xl text-lg leading-relaxed">{story.excerpt}</p>
        )}
        <div className="flex items-center gap-6 mt-8">
          {story.contributor && (
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-terracotta" />
              <span className="text-cream/90 text-[11px] font-mono uppercase tracking-[0.18em]">
                By {story.contributor.name}
              </span>
            </div>
          )}
          <Link to="/stories/$slug" params={{ slug: story.slug }}
            className="bg-cream text-ink px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-terracotta hover:text-cream transition-colors">
            Enter the story
          </Link>
        </div>
      </div>
    </section>
  );
}

function Rail({ title, subtitle, stories }: { title: string; subtitle: string; stories: any[] }) {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 border-b border-rule pb-5">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">{title}</h2>
            <p className="text-sm text-ink/55 mt-2 max-w-md">{subtitle}</p>
          </div>
          <Link to="/stories" className="text-[11px] font-mono uppercase tracking-[0.18em] text-terracotta hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((s) => <StoryCard key={s.id} story={s} />)}
        </div>
      </div>
    </section>
  );
}

function ArchiveIndex({ stories }: { stories: any[] }) {
  return (
    <section className="py-24 bg-ink">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow text-terracotta">The Voices Archive</p>
            <h2 className="font-serif text-4xl md:text-5xl text-cream font-medium mt-2">Every story, every format.</h2>
          </div>
          <Link to="/stories" className="bg-cream text-ink px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-terracotta hover:text-cream transition-colors w-fit">
            Browse the archive →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-cream/10">
          {stories.slice(0, 8).map((s) => (
            <Link key={s.id} to="/stories/$slug" params={{ slug: s.slug }}
              className="bg-ink p-6 hover:bg-white/5 transition-colors group">
              <span className="text-terracotta text-[10px] font-mono uppercase tracking-[0.18em] font-semibold">
                {FORMAT_LABEL[s.format] ?? s.format}
              </span>
              <h4 className="text-cream font-serif text-lg mt-3 group-hover:underline leading-snug">{s.title}</h4>
              <p className="text-cream/40 text-[10px] font-mono uppercase tracking-[0.16em] mt-5">
                {s.contributor?.name ?? "—"} · {s.region ?? "—"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
