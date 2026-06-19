// Maps seeded `/src-asset/<filename>` paths to ES-imported asset URLs.
// External http(s) media_urls pass through unchanged — designed so the
// schema can later swap to AWS S3 signed URLs with no code changes.
import hero from "@/assets/hero-weaver.jpg";
import radio from "@/assets/cover-radio.jpg";
import makola from "@/assets/cover-makola.jpg";
import nairobi from "@/assets/cover-nairobi.jpg";
import archive from "@/assets/cover-archive.jpg";
import delta from "@/assets/cover-delta.jpg";
import ama from "@/assets/contrib-ama.jpg";
import adewale from "@/assets/contrib-adewale.jpg";
import amaka from "@/assets/contrib-amaka.jpg";
import chisom from "@/assets/contrib-chisom.jpg";
import coverKayode from "@/assets/cover-kayode.jpg";
import contribKayode from "@/assets/contrib-kayode.jpg";

const MAP: Record<string, string> = {
  "hero-weaver.jpg": hero,
  "cover-radio.jpg": radio,
  "cover-makola.jpg": makola,
  "cover-nairobi.jpg": nairobi,
  "cover-archive.jpg": archive,
  "cover-delta.jpg": delta,
  "cover-kayode.jpg": coverKayode,
  "contrib-ama.jpg": ama,
  "contrib-adewale.jpg": adewale,
  "contrib-amaka.jpg": amaka,
  "contrib-chisom.jpg": chisom,
};

export function resolveAsset(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/src-asset/")) {
    const key = url.replace("/src-asset/", "");
    return MAP[key] ?? "";
  }
  return url;
}

export const FORMAT_LABEL: Record<string, string> = {
  video: "Video Interview",
  audio: "Audio Story",
  pdf: "Written Story",
  photo: "Photo Essay",
};

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
