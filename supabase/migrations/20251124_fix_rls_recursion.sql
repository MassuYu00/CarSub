-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin 
    FROM profiles 
    WHERE id = auth.uid()
  ) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the admin policies using the function
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (is_admin());
