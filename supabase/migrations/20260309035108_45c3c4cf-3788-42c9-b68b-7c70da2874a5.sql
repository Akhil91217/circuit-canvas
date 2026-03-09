
-- Project sharing: store shared projects
CREATE TABLE public.shared_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  project_name TEXT NOT NULL DEFAULT 'Untitled Project',
  project_data JSONB NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  author_name TEXT DEFAULT 'Anonymous',
  description TEXT DEFAULT '',
  fork_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS needed - public sharing feature, no auth
ALTER TABLE public.shared_projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shared projects
CREATE POLICY "Anyone can view shared projects"
  ON public.shared_projects FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to create shared projects  
CREATE POLICY "Anyone can share projects"
  ON public.shared_projects FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow updating view/fork counts
CREATE POLICY "Anyone can update counts"
  ON public.shared_projects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
