import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const [{ data: stories }, { data: contribs }] = await Promise.all([
          sb.from("stories").select("slug,updated_at").eq("status", "published"),
          sb.from("contributors").select("slug,updated_at"),
        ]);
        const staticPaths = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/stories", priority: "0.9", changefreq: "daily" },
          { path: "/contributors", priority: "0.7", changefreq: "weekly" },
          { path: "/about", priority: "0.5", changefreq: "monthly" },
          { path: "/submit", priority: "0.5", changefreq: "monthly" },
        ];
        const urls = [
          ...staticPaths,
          ...(stories ?? []).map((s) => ({ path: `/stories/${s.slug}`, priority: "0.8", changefreq: "monthly", lastmod: s.updated_at })),
          ...(contribs ?? []).map((c) => ({ path: `/contributors/${c.slug}`, priority: "0.6", changefreq: "monthly", lastmod: c.updated_at })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u: any) => `  <url>\n    <loc>${BASE_URL}${u.path}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
          .join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
