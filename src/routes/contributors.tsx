import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listContributors } from "@/lib/stories.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { resolveAsset } from "@/lib/assets";

const q = queryOptions({ queryKey: ["contributors"], queryFn: () => listContributors() });

export const Route = createFileRoute("/contributors")({
  head: () => ({
    meta: [
      { title: "Contributors — ReEngage Voices" },
      { name: "description", content: "The writers, filmmakers, photographers and field producers behind the Voices archive." },
      { property: "og:title", content: "Contributors — ReEngage Voices" },
      { property: "og:url", content: "/contributors" },
    ],
    links: [{ rel: "canonical", href: "/contributors" }],
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
  const { data } = useSuspenseQuery(q);
  return (
    <>
      <section className="border-b border-rule px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow">Contributors</p>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-3 leading-none">The hands behind the archive.</h1>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.map((c) => (
            <Link key={c.id} to="/contributors/$slug" params={{ slug: c.slug }} className="group block">
              <div className="aspect-square overflow-hidden border border-rule mb-4">
                {c.avatar_url && <img src={resolveAsset(c.avatar_url)} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
              </div>
              <p className="eyebrow">{c.region ?? "—"}</p>
              <h3 className="font-serif text-2xl mt-2 group-hover:text-terracotta">{c.name}</h3>
              <p className="text-sm text-ink/60 mt-1">{c.role}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
