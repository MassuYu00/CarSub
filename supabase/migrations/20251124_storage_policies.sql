-- Create the storage bucket for vehicles if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;



-- Policy: Allow public read access to all objects in the vehicles bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vehicles' );

-- Policy: Allow authenticated users to upload objects to the vehicles bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'vehicles' );

-- Policy: Allow authenticated users to update their own objects (optional, but good for re-uploads)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'vehicles' AND auth.uid() = owner );

-- Policy: Allow authenticated users to delete their own objects
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'vehicles' AND auth.uid() = owner );
