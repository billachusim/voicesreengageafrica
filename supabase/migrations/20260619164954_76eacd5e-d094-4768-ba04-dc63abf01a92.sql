INSERT INTO public.contributors (slug, name, role, region, bio, avatar_url)
VALUES ('kayode-garricks','Kayode Garricks','Storyteller','Nigeria','Kayode Garricks shares lived experience and reflections in conversation with ReEngage Voices.',NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (slug, title, format, status, region, theme, tags, excerpt, cover_image_url, media_url, featured, published_at, contributor_id)
SELECT 'kayode-garricks-interview','In Conversation with Kayode Garricks','video','published','Nigeria','Lived Experience',
  ARRAY['interview','heritage','nigeria'],
  'A video interview with Kayode Garricks — reflections on heritage, memory, and lived experience, recorded for ReEngage Voices.',
  '/src-asset/cover-kayode.jpg',
  '/__l5e/assets-v1/eef54298-d47b-48a9-ba00-c43d85cad5ea/kayode-garricks-interview.mp4',
  true, now(), c.id
FROM public.contributors c WHERE c.slug = 'kayode-garricks'
ON CONFLICT (slug) DO UPDATE SET
  media_url = EXCLUDED.media_url,
  cover_image_url = EXCLUDED.cover_image_url,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured;