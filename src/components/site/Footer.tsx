import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-forest py-16 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <h3 className="font-serif text-2xl text-cream italic mb-3">ReEngage Voices</h3>
          <p className="text-cream/50 text-sm max-w-[44ch] leading-relaxed">
            A digital archive of African heritage stories and lived experiences — a project of ReEngage Africa.
          </p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-cream/40 mb-4">Archive</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/stories" className="hover:text-cream">All stories</Link></li>
            <li><Link to="/contributors" className="hover:text-cream">Contributors</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-cream/40 mb-4">Project</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/about" className="hover:text-cream">About</Link></li>
            <li><Link to="/submit" className="hover:text-cream">Submit a story</Link></li>
            <li><a href="https://reengageafrica.com" className="hover:text-cream">ReEngage Africa</a></li>
          </ul>
        </div>
        <div className="md:col-span-3 text-cream/40 text-[10px] font-mono uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} ReEngage Africa<br />
          voices.reengageafrica.com
        </div>
      </div>
    </footer>
  );
}
