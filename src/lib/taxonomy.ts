// Shared content taxonomy for ReEngage Voices.
// Themes mirror the editorial clusters in the Story Prompt Toolkit.

export const THEMES = [
  "Everyday Life & Cultural Memory",
  "Work, Trades & Indigenous Knowledge",
  "Community & Spiritual Practice",
  "Local Cosmology, Myths & Ancestry",
  "Memory, Conflict & Nationhood",
  "Proverbs, Music & Oral Artistry",
] as const;

export type Theme = (typeof THEMES)[number];

export const FORMATS = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "pdf", label: "Writing" },
  { id: "photo", label: "Photo" },
] as const;
