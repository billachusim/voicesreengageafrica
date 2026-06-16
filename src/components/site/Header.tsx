import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <nav className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-rule">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight italic">
            ReEngage <span className="text-terracotta">Voices</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/60">
            <Link to="/stories" className="hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>Archive</Link>
            <Link to="/contributors" className="hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>Contributors</Link>
            <Link to="/about" className="hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>About</Link>
          </div>
        </div>
        <Link
          to="/submit"
          className="bg-ink text-cream px-4 py-2 text-[11px] font-mono uppercase tracking-[0.16em] hover:bg-forest transition-colors"
        >
          Submit Story
        </Link>
      </div>
    </nav>
  );
}
