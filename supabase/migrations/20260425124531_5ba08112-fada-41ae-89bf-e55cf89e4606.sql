DROP POLICY IF EXISTS "Public can view product media" ON storage.objects;

CREATE POLICY "Public can view product media files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'product-media'
  AND (
    name LIKE 'image/%'
    OR name LIKE 'video/%'
    OR name LIKE 'processed/%'
  )
);