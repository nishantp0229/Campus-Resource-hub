-- Campus Resource Hub: Supabase Schema Upgrade
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)

-- 1. Ensure 'upvotes' and 'department' columns exist on resources table
ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'CSE';

-- 2. Backfill existing records with default values
UPDATE public.resources
SET upvotes = 0
WHERE upvotes IS NULL;

UPDATE public.resources
SET department = 'CSE'
WHERE department IS NULL;

-- 3. Ensure Row Level Security (RLS) permits updating upvotes & reading resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'resources' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" 
        ON public.resources 
        FOR SELECT 
        USING (true);
    END IF;
END $$;

-- Allow public insert access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'resources' AND policyname = 'Allow public insert access'
    ) THEN
        CREATE POLICY "Allow public insert access" 
        ON public.resources 
        FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- Allow public update access (for upvotes and download count increments)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'resources' AND policyname = 'Allow public update access'
    ) THEN
        CREATE POLICY "Allow public update access" 
        ON public.resources 
        FOR UPDATE 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 4. Enable Supabase Realtime for table 'resources' so upvotes and updates sync across tabs live
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'resources'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
    END IF;
END $$;
