import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { getContributorBySlug } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StoryCard } from "@/components/site/StoryCard";
import { resolveAsset } from "@/lib/assets";

const q = (slug: string) => queryOptions({ queryKey: ["contributor", slug], queryFn: () => getContributorBySlug({ data: { slug } }) });

export const Route = createFileRoute("/contributors/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(q(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData, params }) => {
    const c: any = (loaderData as any)?.contributor;
    return {
      meta: [
        { title: `${c?.name ?? "Contributor"} — ReEngage Voices` },
        { name: "description", content: c?.bio ?? "" },
        { property: "og:title", content: c?.name ?? "" },
        { property: "og:url", content: `/contributors/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/contributors/${params.slug}` }],
    };
  },
  component: () => (
    <div className="min-h-screen bg-cream">
      <Header />
      <Suspense fallback={<div className="h-96" />}><Body /></Suspense>
      <Footer />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-5xl">Contributor not found</h1>
        <Link to="/contributors" className="inline-block mt-8 bg-ink text-cream px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em]">All contributors</Link>
      </div>
      <Footer />
    </div>
  ),
});

function Body() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(q(slug));
  if (!data) return null;
  const { contributor: c, stories } = data;
  return (
    <>
      <section className="px-6 py-20 border-b border-rule">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10 items-end">
          {c.avatar_url && (
            <div className="md:col-span-4 aspect-square overflow-hidden border border-rule">
              <img src={resolveAsset(c.avatar_url)} alt={c.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="md:col-span-8">
            <p className="eyebrow">{c.region}</p>
            <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-2 leading-none">{c.name}</h1>
            <p className="mt-3 text-ink/60 text-lg italic font-serif">{c.role}</p>
            {c.bio && <p className="mt-6 text-ink/75 leading-relaxed max-w-prose">{c.bio}</p>}
          </div>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="eyebrow mb-8">Stories by {c.name}</h2>
          {stories.length === 0 ? (
            <p className="text-ink/40 font-mono text-sm uppercase tracking-widest">No published stories yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {stories.map((s: any) => <StoryCard key={s.id} story={s} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
