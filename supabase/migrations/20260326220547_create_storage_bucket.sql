/*
  # Create Storage Bucket for Media Files

  1. Storage Setup
    - Creates a public bucket called `media` for storing files
    - Allows public access to all files in the bucket
    - Suitable for videos, images, and other static assets
  
  2. Security
    - Bucket is public for read access (anyone can view files)
    - Write access can be controlled through policies if needed later
  
  3. Usage
    - Upload files through Supabase Dashboard > Storage
    - Access files via: `${SUPABASE_URL}/storage/v1/object/public/media/filename.ext`
*/

-- Create a public bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
END $$;

-- Allow public access to read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Optional: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');