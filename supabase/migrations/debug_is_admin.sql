-- Check is_admin values for all users
SELECT 
  p.id,
  u.email,
  p.is_admin,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
