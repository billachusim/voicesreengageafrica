import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo-mark.png.asset.json";
const logoMark = logoAsset.url;

export function Footer() {
  return (
    <footer className="bg-ink text-cream py-16 mt-24 border-t border-amber/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoMark} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
            <h3 className="font-serif text-2xl italic">
              ReEngage <span className="text-amber">Voices</span>
            </h3>
          </div>
          <p className="text-cream/60 text-sm max-w-[44ch] leading-relaxed">
            A digital archive of African heritage stories and lived experiences — a project of ReEngage Africa.
          </p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber/80 mb-4">Archive</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/stories" className="hover:text-amber transition-colors">All stories</Link></li>
            <li><Link to="/contributors" className="hover:text-amber transition-colors">Contributors</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber/80 mb-4">Project</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/about" className="hover:text-amber transition-colors">About</Link></li>
            <li><Link to="/submit" className="hover:text-amber transition-colors">Submit a story</Link></li>
            <li><a href="https://reengageafrica.com" className="hover:text-amber transition-colors">ReEngage Africa</a></li>
          </ul>
        </div>
        <div className="md:col-span-3 text-cream/40 text-[10px] font-mono tracking-[0.12em] leading-relaxed">
          © {new Date().getFullYear()} ReEngage Africa<br />
          voices.reengageafrica.com
        </div>
      </div>
    </footer>
  );
}
