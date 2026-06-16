
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "anyone can submit" ON public.submissions;
CREATE POLICY "anyone can submit" ON public.submissions FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 254
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(pitch) BETWEEN 20 AND 5000
  );
