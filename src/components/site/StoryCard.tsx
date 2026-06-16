import { Link } from "@tanstack/react-router";
import { resolveAsset, FORMAT_LABEL, formatDuration } from "@/lib/assets";

interface Story {
  slug: string;
  title: string;
  format: string;
  region: string | null;
  cover_image_url: string | null;
  excerpt: string | null;
  pull_quote: string | null;
  duration_seconds: number | null;
  pdf_page_count: number | null;
  contributor?: { name: string } | null;
}

export function StoryCard({ story }: { story: Story }) {
  const isPdf = story.format === "pdf";
  const cover = resolveAsset(story.cover_image_url);

  return (
    <Link
      to="/stories/$slug"
      params={{ slug: story.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden mb-4 bg-paper border border-rule">
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
        ) : (
          <>
            {cover ? (
              <img
                src={cover}
                alt={story.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-paper" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-ink/40 via-transparent to-transparent" />
            {story.format === "video" && (
              <span className="absolute top-3 right-3 bg-ink/80 text-cream text-[10px] font-mono px-2 py-1 backdrop-blur uppercase tracking-widest">
                Film {formatDuration(story.duration_seconds)}
              </span>
            )}
            {story.format === "audio" && (
              <div className="absolute bottom-3 left-3 right-3 bg-cream/90 backdrop-blur p-3 flex items-center gap-3">
                <div className="size-7 bg-terracotta grid place-items-center rounded-full">
                  <div className="size-2.5 bg-cream rotate-45" />
                </div>
                <div className="flex-1 h-4 flex items-end gap-0.5">
                  {[3, 6, 4, 8, 5, 7, 3, 9, 4, 6, 3].map((h, i) => (
                    <div key={i} className="w-[3px] bg-ink/40" style={{ height: `${h * 2}px` }} />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-ink/60">
                  {formatDuration(story.duration_seconds)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      <span className="eyebrow">
        {story.region ?? "—"} · {FORMAT_LABEL[story.format] ?? story.format}
      </span>
      <h3 className="font-serif text-xl font-medium mt-1.5 group-hover:text-terracotta transition-colors leading-tight">
        {story.title}
      </h3>
      {story.excerpt && (
        <p className="text-sm text-ink/60 mt-2 leading-relaxed line-clamp-2">{story.excerpt}</p>
      )}
      {story.contributor && (
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink/40 mt-3">
          By {story.contributor.name}
        </p>
      )}
    </Link>
  );
}
