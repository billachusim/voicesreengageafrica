import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitStory } from "@/lib/stories.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit your story — ReEngage Voices" },
      { name: "description", content: "Share a video interview, audio story, written essay or photo essay with the Voices editors — on the site or via WhatsApp." },
      { property: "og:title", content: "Submit your story — ReEngage Voices" },
      { property: "og:url", content: "/submit" },
    ],
    links: [{ rel: "canonical", href: "/submit" }],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const submit = useServerFn(submitStory);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submit({
        data: {
          name: String(f.get("name") || ""),
          email: String(f.get("email") || ""),
          region: String(f.get("region") || ""),
          format: (f.get("format") || undefined) as any,
          pitch: String(f.get("pitch") || ""),
          media_link: String(f.get("media_link") || ""),
        },
      });
      setDone(true);
      toast.success("Pitch received — we'll be in touch.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message || "Could not send pitch");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <p className="eyebrow">Submit a story</p>
        <h1 className="font-serif text-5xl md:text-7xl font-semibold mt-3 leading-none">Add your voice.</h1>
        <p className="mt-8 text-ink/70 font-serif text-xl leading-relaxed">
          Share a memory, a craft, a song, a story. Use the form below — or, if you'd rather speak it,
          send your video, audio, photos or text through the <strong>ReEngage Africa WhatsApp chatbot</strong>.
          It will walk you through the prompts and forward your submission to our editors.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 border border-rule px-4 py-3 bg-paper">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/50">WhatsApp intake</span>
          <a href="https://wa.me/" className="text-[11px] font-mono uppercase tracking-[0.16em] text-terracotta hover:underline">
            Open ReEngage chatbot →
          </a>
        </div>

        {done ? (
          <div className="mt-12 border border-rule p-10 text-center">
            <p className="eyebrow">Received</p>
            <h2 className="font-serif text-3xl mt-3">Thank you.</h2>
            <p className="text-ink/60 mt-2">An editor will be in touch within two weeks.</p>
            <button onClick={() => setDone(false)} className="mt-6 text-[11px] font-mono uppercase tracking-[0.18em] text-terracotta rounded-full">Submit another</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 space-y-6">
            <Field label="Your name" name="name" required maxLength={120} />
            <Field label="Email" name="email" type="email" required maxLength={254} />
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Region" name="region" placeholder="Abuja / Accra / Nairobi / …" />
              <Select label="Format" name="format" options={[
                ["", "Choose a format"], ["video", "Video interview"], ["audio", "Audio story"], ["pdf", "Written essay"], ["photo", "Photo essay"],
              ]} />
            </div>
            <Field label="Media link (optional)" name="media_link" type="url" placeholder="Drive / YouTube / Vimeo link" />
            <div>
              <label className="eyebrow block mb-2">The pitch</label>
              <textarea name="pitch" rows={8} required minLength={20} maxLength={5000}
                className="w-full bg-paper border border-rule p-4 font-serif text-lg leading-relaxed focus:outline-none focus:border-ink resize-y" />
            </div>
            <button disabled={busy} className="bg-ink text-cream px-8 py-4 text-[11px] font-mono uppercase tracking-[0.18em] hover:bg-forest disabled:opacity-50 rounded-full">
              {busy ? "Sending…" : "Send pitch"}
            </button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, name, ...props }: any) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input name={name} {...props}
        className="w-full bg-paper border border-rule px-4 py-3 focus:outline-none focus:border-ink" />
    </div>
  );
}
function Select({ label, name, options }: any) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <select name={name} className="w-full bg-paper border border-rule px-4 py-3 focus:outline-none focus:border-ink">
        {options.map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
