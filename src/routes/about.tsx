import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ReEngage Voices" },
      { name: "description", content: "ReEngage Voices is a digital storytelling archive by ReEngage Africa, preserving African heritage and lived experience." },
      { property: "og:title", content: "About ReEngage Voices" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <p className="eyebrow">About</p>
        <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-3 leading-none">A breath for the living.</h1>
        <div className="mt-12 space-y-6 text-lg leading-relaxed text-ink/80 font-serif">
          <p>ReEngage Voices is a sub-project of ReEngage Africa. We collect African heritage stories and lived experiences across four formats — film, audio, photography and long-form essay — and present them as a single, browsable archive.</p>
          <p>Our reporting begins in Abuja, Accra and Nairobi and extends outward through the contributors who carry the work. Every story carries a byline, a region, and a clear record of how it was made.</p>
          <p>The archive is built to last. Stories are kept in a single canonical record; media URLs are designed to migrate cleanly to long-term object storage. Nothing here is meant to be transient.</p>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-rule pt-10">
          <div><p className="eyebrow">Founded</p><p className="font-serif text-3xl mt-2">2024</p></div>
          <div><p className="eyebrow">Cities</p><p className="font-serif text-3xl mt-2">3</p></div>
          <div><p className="eyebrow">Formats</p><p className="font-serif text-3xl mt-2">4</p></div>
          <div><p className="eyebrow">Parent</p><p className="font-serif text-3xl mt-2">ReEngage</p></div>
        </div>
      </section>
      <Footer />
    </div>
  ),
});
