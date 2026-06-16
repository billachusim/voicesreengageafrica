import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listPublishedStories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("stories")
    .select("id,slug,title,format,theme,region,tags,excerpt,cover_image_url,pull_quote,duration_seconds,pdf_page_count,featured,published_at,contributor:contributors(id,slug,name,role,region,avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getStoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("stories")
      .select("*,contributor:contributors(id,slug,name,role,region,bio,avatar_url)")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listContributors = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("contributors")
    .select("id,slug,name,role,region,bio,avatar_url")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getContributorBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: c }, { data: s }] = await Promise.all([
      sb.from("contributors").select("*").eq("slug", data.slug).maybeSingle(),
      sb.from("stories")
        .select("id,slug,title,format,region,cover_image_url,excerpt,pull_quote,published_at,contributor_id")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
    ]);
    if (!c) return null;
    return { contributor: c, stories: (s ?? []).filter((x) => x.contributor_id === c.id) };
  });

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  format: z.enum(["video", "audio", "pdf", "photo"]).optional(),
  pitch: z.string().trim().min(20).max(5000),
  media_link: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export const submitStory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("submissions").insert({
      name: data.name,
      email: data.email,
      region: data.region || null,
      format: data.format ?? null,
      pitch: data.pitch,
      media_link: data.media_link || null,
    });
    if (error) throw new Error(error.message);
    // Best-effort editor notification; tolerate when email infra is not yet wired.
    try {
      const { sendEditorPitchNotification } = await import("./email-notify.server");
      await sendEditorPitchNotification({
        name: data.name,
        email: data.email,
        region: data.region || "",
        format: data.format ?? null,
        pitch: data.pitch,
        media_link: data.media_link || "",
      });
    } catch (e) {
      console.warn("[submitStory] notification skipped:", (e as Error).message);
    }
    return { ok: true };
  });
