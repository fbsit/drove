
-- First, ensure the user exists in auth.users (this will be done via the UI)
-- Then set up their permissions
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create RLS policy for super admins
CREATE POLICY "super_admins_full_access"
ON users
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE is_super_admin = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE is_super_admin = true
  )
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ensure the super admin has the correct role and permissions
UPDATE users 
SET 
  is_super_admin = TRUE,
  user_type = 'admin',
  profile_complete = TRUE
WHERE email = 'droveland.com@gmail.com';
