-- Update password for admin user
UPDATE auth.users
SET 
  encrypted_password = crypt('Dan5714*', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@galpao64.com';