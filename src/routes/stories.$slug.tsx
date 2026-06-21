import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { getStoryBySlug } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { resolveAsset, FORMAT_LABEL, formatDuration } from "@/lib/assets";

const storyQuery = (slug: string) =>
  queryOptions({ queryKey: ["story", slug], queryFn: () => getStoryBySlug({ data: { slug } }) });

export const Route = createFileRoute("/stories/$slug")({
  loader: async ({ context, params }) => {
    const story = await context.queryClient.ensureQueryData(storyQuery(params.slug));
    if (!story) throw notFound();
    return story;
  },
  head: ({ params, loaderData }) => {
    const s: any = loaderData;
    const cover = s?.cover_image_url ?? "";
    return {
      meta: [
        { title: `${s?.title ?? "Story"} — ReEngage Voices` },
        { name: "description", content: s?.excerpt ?? "" },
        { property: "og:title", content: s?.title ?? "" },
        { property: "og:description", content: s?.excerpt ?? "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/stories/${params.slug}` },
        { property: "og:image", content: cover },
        { name: "twitter:image", content: cover },
      ],
      links: [{ rel: "canonical", href: `/stories/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: s?.title,
          description: s?.excerpt,
          image: cover,
          datePublished: s?.published_at,
          author: s?.contributor ? { "@type": "Person", name: s.contributor.name } : undefined,
          publisher: { "@type": "Organization", name: "ReEngage Africa" },
        }),
      }],
    };
  },
  component: StoryPage,
  pendingComponent: () => <div className="min-h-screen bg-cream" />,
  notFoundComponent: () => (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="eyebrow">Not in the archive</p>
        <h1 className="font-serif text-5xl mt-3">Story not found</h1>
        <Link to="/stories" className="inline-block mt-8 bg-ink text-cream px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] rounded-full">Back to archive</Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center text-ink/60">{error.message}</div>
      <Footer />
    </div>
  ),
});

function StoryPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <Suspense fallback={<div className="h-screen" />}><Body /></Suspense>
      <Footer />
    </div>
  );
}

function Body() {
  const { slug } = Route.useParams();
  const { data: story } = useSuspenseQuery(storyQuery(slug));
  if (!story) return null;
  const s: any = story;
  const cover = resolveAsset(s.cover_image_url);
  const media = resolveAsset(s.media_url);

  return (
    <article className="bg-cream">
      {/* Header */}
      <header className="px-6 py-20 md:py-32 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <span className="eyebrow">{FORMAT_LABEL[s.format] ?? s.format}</span>
          <div className="rule-line flex-1" />
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40">
            {s.published_at ? new Date(s.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : ""}
          </span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] text-balance">{s.title}</h1>
        {s.excerpt && <p className="font-serif text-xl md:text-2xl text-ink/70 mt-8 leading-relaxed max-w-[56ch]">{s.excerpt}</p>}
        {s.contributor && (
          <div className="flex items-center gap-3 mt-10">
            {s.contributor.avatar_url && (
              <img src={resolveAsset(s.contributor.avatar_url)} alt={s.contributor.name}
                width={48} height={48} loading="lazy"
                className="size-12 rounded-full object-cover" />
            )}
            <div>
              <Link to="/contributors/$slug" params={{ slug: s.contributor.slug }} className="font-medium hover:text-terracotta">
                {s.contributor.name}
              </Link>
              <div className="text-xs text-ink/50">{s.contributor.role}{s.contributor.region ? ` · ${s.contributor.region}` : ""}</div>
            </div>
          </div>
        )}
      </header>

      {/* Format-specific reader */}
      <div className="px-6">
        <div className="max-w-5xl mx-auto">
          {s.format === "video" && <VideoReader src={media} cover={cover} duration={s.duration_seconds} chapters={s.chapters} transcript={s.transcript} />}
          {s.format === "audio" && <AudioReader src={media} cover={cover} duration={s.duration_seconds} chapters={s.chapters} transcript={s.transcript} />}
          {s.format === "pdf" && <PdfReader src={media} pullQuote={s.pull_quote} pages={s.pdf_page_count} cover={cover} />}
          {s.format === "photo" && <PhotoReader gallery={s.gallery} cover={cover} />}
        </div>
      </div>

      {/* Body */}
      {s.body && (
        <div className="px-6 mt-16">
          <div className="max-w-[60ch] mx-auto prose-archival">
            <p className="font-serif text-2xl leading-[1.7] text-ink/90 first-letter:text-7xl first-letter:font-semibold first-letter:text-terracotta first-letter:mr-3 first-letter:float-left text-pretty">
              {s.body}
            </p>
          </div>
        </div>
      )}

      {/* Tags / region */}
      <footer className="px-6 mt-24 mb-12">
        <div className="max-w-4xl mx-auto border-t border-rule pt-8 flex flex-wrap gap-3 items-center">
          {s.region && <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/50">{s.region}</span>}
          {s.tags?.map((t: string) => (
            <span key={t} className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 border border-rule px-2 py-1">#{t}</span>
          ))}
        </div>
      </footer>
    </article>
  );
}

function VideoReader({ src, cover, duration, chapters, transcript }: any) {
  const playable = Boolean(src);
  return (
    <div className="space-y-8">
      <div className="aspect-video bg-ink relative overflow-hidden rounded-xl">
        {playable ? (
          <video controls preload="metadata" poster={cover} className="w-full h-full">
            <source src={src} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={cover} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      {duration && <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/40">Runtime · {formatDuration(duration)}</p>}
      {chapters && Array.isArray(chapters) && chapters.length > 0 && (
        <div className="border border-rule p-6">
          <h3 className="eyebrow mb-4">Chapters</h3>
          <ul className="space-y-2 text-sm">
            {chapters.map((c: any, i: number) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-ink/40 w-12">{formatDuration(c.time)}</span>
                <span>{c.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {transcript && (
        <details className="border border-rule p-6">
          <summary className="eyebrow cursor-pointer">Transcript</summary>
          <p className="mt-4 text-sm leading-relaxed text-ink/75 whitespace-pre-wrap">{transcript}</p>
        </details>
      )}
    </div>
  );
}

function AudioReader({ src, cover, duration, chapters, transcript }: any) {
  const external = src && /^https?:/.test(src);
  return (
    <div className="bg-paper border border-rule p-8 md:p-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {cover && <img src={cover} alt="" width={300} height={300} loading="lazy" className="w-48 h-48 object-cover border border-rule rounded-xl" />}
        <div className="flex-1 w-full">
          <p className="eyebrow mb-3">Audio Episode</p>
          <div className="h-16 w-full flex items-end gap-1 mb-4">
            {Array.from({ length: 60 }).map((_, i) => {
              const h = 20 + Math.abs(Math.sin(i * 0.6)) * 70 + Math.cos(i) * 8;
              return <div key={i} className="flex-1 bg-ink/30" style={{ height: `${Math.max(8, h)}%` }} />;
            })}
          </div>
          {external ? (
            <audio controls src={src} className="w-full" />
          ) : (
            <p className="text-xs text-ink/50 font-mono">Audio URL will be added soon.</p>
          )}
          {duration && <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/40">{formatDuration(duration)}</p>}
        </div>
      </div>
      {chapters && Array.isArray(chapters) && chapters.length > 0 && (
        <div className="mt-8 pt-8 border-t border-rule">
          <h3 className="eyebrow mb-4">Episode notes</h3>
          <ul className="space-y-2 text-sm">
            {chapters.map((c: any, i: number) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-ink/40 w-12">{formatDuration(c.time)}</span>
                <span>{c.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {transcript && (
        <details className="mt-6 pt-6 border-t border-rule">
          <summary className="eyebrow cursor-pointer">Transcript</summary>
          <p className="mt-4 text-sm leading-relaxed text-ink/75 whitespace-pre-wrap">{transcript}</p>
        </details>
      )}
    </div>
  );
}

function PdfReader({ src, pullQuote, pages, cover }: any) {
  const external = src && /^https?:/.test(src);
  return (
    <div className="space-y-10">
      {pullQuote && (
        <blockquote className="border-l-2 border-terracotta pl-8 py-2 my-12 max-w-3xl">
          <p className="font-serif italic text-3xl leading-snug text-ink">“{pullQuote}”</p>
        </blockquote>
      )}
      <div className="border border-rule bg-paper aspect-[4/3] relative overflow-hidden rounded-xl">
        {external ? (
          <iframe src={src} title="Essay PDF" className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-12 text-center">
            {cover && <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
            <div className="relative">
              <p className="eyebrow">PDF Essay</p>
              <p className="text-ink/60 mt-3 font-serif text-xl">PDF preview placeholder — media URL will be added.</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/50">{pages ?? "—"} pages</span>
        {external && (
          <a href={src} target="_blank" rel="noreferrer" className="bg-ink text-cream px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-forest rounded-full">
            Download PDF ↓
          </a>
        )}
      </div>
    </div>
  );
}

function PhotoReader({ gallery, cover }: any) {
  const items = Array.isArray(gallery) && gallery.length > 0
    ? gallery
    : cover ? [{ url: cover, caption: "", credit: "" }] : [];
  return (
    <div className="space-y-16">
      {items.map((g: any, i: number) => {
        const url = resolveAsset(g.url);
        return (
          <figure key={i} className={i % 2 === 0 ? "" : "md:pl-16"}>
            <img src={url} alt={g.caption ?? ""} loading="lazy"
              className="w-full h-auto border border-rule rounded-xl" />
            {(g.caption || g.credit) && (
              <figcaption className="mt-3 flex justify-between text-[11px] font-mono uppercase tracking-[0.16em] text-ink/50">
                <span>{g.caption}</span>
                {g.credit && <span>© {g.credit}</span>}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
