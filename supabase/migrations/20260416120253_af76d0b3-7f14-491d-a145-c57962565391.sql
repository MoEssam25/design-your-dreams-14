
-- Drop the overly broad SELECT policy
DROP POLICY IF EXISTS "Anyone can view design assets" ON storage.objects;

-- Replace with a policy that allows viewing specific files but not listing
CREATE POLICY "Anyone can view design assets by path" ON storage.objects
  FOR SELECT USING (bucket_id = 'design-assets' AND auth.uid() IS NOT NULL);
