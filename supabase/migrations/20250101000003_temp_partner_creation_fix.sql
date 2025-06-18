-- Temporary fix to allow partner creation during signup
-- This allows authenticated users to insert partner records

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Partners can insert their own data" ON partners;

-- Create a more permissive policy for partner creation
CREATE POLICY "Authenticated users can create partner records" ON partners
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE partners ENABLE ROW LEVEL SECURITY; 