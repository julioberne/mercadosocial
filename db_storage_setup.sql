-- ===============================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA IMÁGENES Y 3D
-- ===============================================
-- @ProductMediaUploader - Ejecutar en Supabase SQL Editor
-- ===============================================

-- 1. Crear/Actualizar el bucket para imágenes y modelos 3D
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,  -- Bucket público
    10485760,  -- 10MB max file size
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
        'model/gltf-binary',
        'model/gltf+json',
        'application/octet-stream'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
        'model/gltf-binary',
        'model/gltf+json',
        'application/octet-stream'
    ]::text[];

-- 2. Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_public_delete" ON storage.objects;

-- 3. Crear política para permitir lectura pública
CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 4. Crear política para permitir subir archivos
CREATE POLICY "product_images_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 5. Crear política para permitir eliminar archivos
CREATE POLICY "product_images_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ===============================================
-- FORMATOS SOPORTADOS:
-- ===============================================
-- IMÁGENES: PNG, JPG, JPEG, WebP, GIF
-- 3D:       GLB, GLTF
-- TAMAÑO:   Máximo 10MB por archivo
-- ===============================================
