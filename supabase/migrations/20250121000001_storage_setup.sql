-- =====================================================
-- AKTIV STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('checkin-proofs', 'checkin-proofs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']),
    ('activity-images', 'activity-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Avatars bucket policies (public read, authenticated upload)
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own avatars"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own avatars"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Check-in proofs bucket policies (authenticated only)
CREATE POLICY "Users can view own checkin proofs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'checkin-proofs'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can upload checkin proofs"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'checkin-proofs'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own checkin proofs"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'checkin-proofs'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own checkin proofs"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'checkin-proofs'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Activity images bucket policies (public read, authenticated upload)
CREATE POLICY "Activity images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated users can upload activity images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'activity-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Activity creators can update their images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'activity-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Activity creators can delete their images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'activity-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
