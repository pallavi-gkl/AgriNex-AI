-- ============================================================
-- AgriNex AI — Supabase Storage Bucket Policies
-- Phase 7: Run these in Supabase SQL Editor after creating
--          the two storage buckets in the Supabase dashboard.
--
-- Instructions:
--   1. Go to Supabase Dashboard → Storage → New Bucket
--   2. Create "crop-images"  (set Public = TRUE)
--   3. Create "land-docs"    (set Public = FALSE)
--   4. Run this entire SQL file in SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- BUCKET: crop-images
-- Purpose: Product crop photos uploaded by farmers via AI grader
-- Access:  Public read (anyone can view product images)
--          Authenticated write (only logged-in farmers can upload)
-- ─────────────────────────────────────────────────────────────

-- Allow anyone (including unauthenticated) to VIEW images
CREATE POLICY "crop-images: Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'crop-images');

-- Allow authenticated farmers to UPLOAD their own crop images
CREATE POLICY "crop-images: Farmer upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'crop-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated farmers to UPDATE their own images
CREATE POLICY "crop-images: Farmer update own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'crop-images'
  AND auth.uid() = owner
);

-- Allow authenticated farmers to DELETE their own images
CREATE POLICY "crop-images: Farmer delete own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'crop-images'
  AND auth.uid() = owner
);

-- ─────────────────────────────────────────────────────────────
-- BUCKET: land-docs
-- Purpose: KYC land certificate documents uploaded by farmers
-- Access:  Private — only the document owner and admins can read
--          Authenticated farmers can upload their own documents
-- ─────────────────────────────────────────────────────────────

-- Farmers can read ONLY their own land documents
CREATE POLICY "land-docs: Owner read own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'land-docs'
  AND auth.role() = 'authenticated'
  AND auth.uid() = owner
);

-- Admins can read ALL land documents (for KYC review)
CREATE POLICY "land-docs: Admin read all documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'land-docs'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Authenticated farmers can UPLOAD their own land documents
CREATE POLICY "land-docs: Farmer upload own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'land-docs'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'farmer'
  )
);

-- Farmers can UPDATE their own land documents
CREATE POLICY "land-docs: Farmer update own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'land-docs'
  AND auth.role() = 'authenticated'
  AND auth.uid() = owner
);

-- Admins can DELETE land documents (e.g., after KYC decision)
CREATE POLICY "land-docs: Admin delete documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'land-docs'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION: Run after applying policies to confirm
-- ─────────────────────────────────────────────────────────────
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects'
-- AND schemaname = 'storage'
-- ORDER BY policyname;
