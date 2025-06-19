-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos',
  'partner-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Create policy to allow partners to upload their own logos
CREATE POLICY "Partners can upload their own logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'partner-logos' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.user_id = auth.uid()
  )
);

-- Create policy to allow partners to update their own logos
CREATE POLICY "Partners can update their own logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'partner-logos' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.user_id = auth.uid()
  )
);

-- Create policy to allow partners to delete their own logos
CREATE POLICY "Partners can delete their own logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'partner-logos' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.user_id = auth.uid()
  )
);

-- Create policy to allow public read access to logos
CREATE POLICY "Public can view partner logos" ON storage.objects
FOR SELECT USING (bucket_id = 'partner-logos'); 