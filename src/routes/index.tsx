import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listPublishedStories } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StoryCard } from "@/components/site/StoryCard";
import { THEMES } from "@/lib/taxonomy";
import { resolveAsset, FORMAT_LABEL } from "@/lib/assets";
import heroBg from "@/assets/hero-weaver.jpg";

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
  const latest = rest.slice(0, 6);

  return (
    <>
      <IntroHero />
      {featured && <StoryOfTheDay story={featured} />}
      {latest.length > 0 && (
        <section className="py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10 border-b border-rule pb-5">
              <div>
                <p className="eyebrow text-terracotta">Latest</p>
                <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mt-2">New to the archive</h2>
              </div>
              <Link to="/stories" className="text-[11px] font-mono uppercase tracking-[0.18em] text-terracotta hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latest.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          </div>
        </section>
      )}
      <TagsStrip />
      <ArchiveIndex stories={stories} />
    </>
  );
}

function IntroHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-ink">
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-linear-to-b from-ink/70 via-ink/85 to-ink" />
      <div className="relative max-w-3xl mx-auto px-6 text-center py-24">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream font-semibold leading-[1.05] text-balance">
          Every voice holds a lifetime of meaning
        </h1>
        <p className="text-cream/70 mt-8 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Welcome to ReEngage Voices — an archive of African heritage stories, oral histories, and lived experiences.
          Explore interviews, audio recordings, and writings that keep our past alive.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/stories"
            className="bg-cream text-ink px-6 py-3 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-terracotta hover:text-cream transition-colors"
          >
            Explore stories
          </Link>
          <Link
            to="/submit"
            className="border border-cream/30 text-cream px-6 py-3 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] hover:border-cream hover:bg-cream/10 transition-colors"
          >
            Submit your voice
          </Link>
        </div>
      </div>
    </section>
  );
}

function StoryOfTheDay({ story }: { story: any }) {
  const cover = resolveAsset(story.cover_image_url);
  const isPdf = story.format === "pdf";

  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-10">
          Story of the Day
        </h2>
        <Link to="/stories/$slug" params={{ slug: story.slug }} className="group block">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="w-full md:w-1/2 lg:w-5/12 aspect-[4/3] overflow-hidden bg-paper border border-rule relative rounded-xl">
              {isPdf ? (
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="border-l-2 border-terracotta pl-4 italic">
                    <p className="text-lg font-serif leading-snug text-ink/85">
                      “{story.pull_quote ?? story.excerpt}”
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40">
                    {story.pdf_page_count ?? "—"} pages · PDF
                  </span>
                </div>
              ) : cover ? (
                <img
                  src={cover}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full bg-paper" />
              )}
              {!isPdf && <div className="absolute inset-0 bg-linear-to-t from-ink/30 via-transparent to-transparent" />}
            </div>
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-terracotta text-cream px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] rounded-full">
                  {FORMAT_LABEL[story.format] ?? story.format}
                </span>
                <span className="text-ink/50 text-[10px] font-mono uppercase tracking-[0.2em]">
                  {story.region}
                </span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl font-medium group-hover:text-terracotta transition-colors leading-tight">
                {story.title}
              </h3>
              {story.excerpt && (
                <p className="text-ink/60 mt-4 leading-relaxed max-w-lg">{story.excerpt}</p>
              )}
              {story.contributor && (
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink/40 mt-6">
                  By {story.contributor.name}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function TagsStrip() {
  return (
    <section className="py-20 bg-paper border-y border-rule">
      <div className="max-w-7xl mx-auto px-6">
        <p className="eyebrow text-terracotta">Browse by tag</p>
        <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mt-2 mb-8">Search the archive by what matters to you.</h2>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <Link
              key={t}
              to="/stories"
              search={{ tag: t } as any}
              className="px-4 py-2 text-[11px] font-mono uppercase tracking-[0.16em] border border-rule rounded-full hover:bg-ink hover:text-cream hover:border-ink transition-colors"
            >
              {t}
            </Link>
          ))}
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
          <Link to="/stories" className="bg-cream text-ink px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-terracotta hover:text-cream transition-colors w-fit rounded-full">
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
