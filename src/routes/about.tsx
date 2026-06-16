import { createFileRoute, Link } from "@tanstack/react-router";
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
        <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-3 leading-none">A living archive of African memory.</h1>
        <div className="mt-12 space-y-6 text-lg leading-relaxed text-ink/80 font-serif">
          <p>
            <strong>ReEngage Voices</strong> is the storytelling and memory arm of <a href="https://reengageafrica.com" className="underline decoration-terracotta underline-offset-4">ReEngage Africa</a> — a cultural and generational reconnection project that restores depth to African memory and keeps elders intellectually, socially and economically engaged in a digital era.
          </p>
          <p>
            Voices gathers personal memoirs, folklore, sacred histories, indigenous knowledge, craft traditions and lived experience — documented with dignity and depth. Through storytelling, elders remain teachers. Through listening, younger generations become inheritors rather than strangers to their own heritage.
          </p>
          <p>
            Stories arrive two ways: directly through the <Link to="/submit" className="underline decoration-terracotta underline-offset-4">submission page</Link>, or via the <strong>ReEngage Africa WhatsApp chatbot</strong>, which guides contributors through the prompts in voice notes, video, photos or written text. Our editors lightly shape submissions for clarity while preserving voice, intent and meaning.
          </p>
          <p>
            The archive is organised by six editorial clusters and four formats — video interviews, audio stories, written essays and photo essays. Indigenous languages are welcomed throughout; nothing here is meant to be transient.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-rule pt-10">
          <div><p className="eyebrow">Clusters</p><p className="font-serif text-3xl mt-2">6</p></div>
          <div><p className="eyebrow">Formats</p><p className="font-serif text-3xl mt-2">4</p></div>
          <div><p className="eyebrow">Intake</p><p className="font-serif text-3xl mt-2">Site + WhatsApp</p></div>
          <div><p className="eyebrow">Parent</p><p className="font-serif text-3xl mt-2">ReEngage Africa</p></div>
        </div>
      </section>
      <Footer />
    </div>
  ),
});
