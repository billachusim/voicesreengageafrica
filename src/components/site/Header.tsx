import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo-mark.png.asset.json";
const logoMark = logoAsset.url;

export function Header() {
  return (
    <nav className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-rule">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoMark} alt="ReEngage" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
            <span className="font-sans text-xl font-semibold tracking-tight not-italic">
              ReEngage <span className="text-amber">Voices</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[11px] font-mono uppercase tracking-[0.18em] text-ink/60">
            <Link to="/stories" className="hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>Archive</Link>
            <Link to="/contributors" className="hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>Contributors</Link>
            <Link to="/about" className="hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>About</Link>
          </div>
        </div>
        <Link
          to="/submit"
          className="bg-ink text-cream px-5 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] hover:bg-amber hover:text-ink transition-colors"
        >
          Submit Story
        </Link>
      </div>
    </nav>
  );
}
