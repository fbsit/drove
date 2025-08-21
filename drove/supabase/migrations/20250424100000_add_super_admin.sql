
-- Add is_super_admin column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Set the specified email as super admin
UPDATE users 
SET is_super_admin = TRUE, user_type = 'admin'
WHERE email = 'droveland.com@gmail.com';

