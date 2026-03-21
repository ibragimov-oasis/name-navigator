CREATE TABLE public.name_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  style text NOT NULL,
  image_url text,
  svg_data text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_name_signatures_name ON public.name_signatures (name);

CREATE POLICY "Anyone can read signatures"
  ON public.name_signatures FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert signatures"
  ON public.name_signatures FOR INSERT
  TO authenticated
  WITH CHECK (true);