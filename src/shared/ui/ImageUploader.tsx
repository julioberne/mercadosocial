/**
 * @ProductMediaUploader
 * Componente para subir, eliminar y reorganizar imágenes y modelos 3D del producto
 * 
 * Características:
 * - Subir archivos: PNG, JPG, JPEG, WebP, GIF, GLB, GLTF
 * - Drag & Drop para subir
 * - Drag & Drop para reorganizar orden
 * - Eliminar archivos individualmente
 * - Soporte para cámara en móvil
 * - Límite configurable de archivos y tamaño
 */
import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Loader2, Image as ImageIcon, CheckCircle, Box, GripVertical, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Formatos soportados
const SUPPORTED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif'
];

const SUPPORTED_3D_TYPES = [
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream'
];

// Accept string for file inputs
const ACCEPT_STRING = 'image/png,image/jpeg,image/webp,image/gif,.glb,.gltf';

interface MediaUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
}

// Check if file is an image
const isImageFile = (file: File): boolean => {
    return SUPPORTED_IMAGE_TYPES.includes(file.type) ||
        file.name.match(/\.(png|jpe?g|webp|gif)$/i) !== null;
};

// Check if file is a 3D model
const is3DFile = (file: File): boolean => {
    return SUPPORTED_3D_TYPES.includes(file.type) ||
        file.name.match(/\.(glb|gltf)$/i) !== null;
};

// Check if URL is a 3D file
const is3DUrl = (url: string): boolean => {
    return url?.match(/\.(glb|gltf)$/i) !== null;
};

// Get file extension
const getFileExtension = (file: File): string => {
    const match = file.name.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : 'bin';
};

export function ImageUploader({ images, onImagesChange, maxFiles = 6, maxSizeMB = 10 }: MediaUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Generate unique filename preserving extension
    const generateFileName = (originalFile: File) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = getFileExtension(originalFile);
        return `product_${timestamp}_${random}.${ext}`;
    };

    // Upload file to Supabase Storage
    const uploadToSupabase = async (file: File): Promise<string | null> => {
        const fileName = generateFileName(file);
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            if (uploadError.message.includes('Bucket not found')) {
                setError('⚠️ Bucket "product-images" no existe. Créalo en Supabase Storage.');
                return null;
            }
            if (uploadError.message.includes('mime type')) {
                setError('⚠️ Tipo de archivo no permitido. Ejecuta db_storage_setup.sql actualizado.');
                return null;
            }
            setError(`Error al subir: ${uploadError.message}`);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    };

    // Validate file type
    const isValidFileType = (file: File): boolean => {
        return isImageFile(file) || is3DFile(file);
    };

    // Process selected files
    const processFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxFiles - images.length;
        if (remainingSlots <= 0) {
            setError(`Máximo ${maxFiles} archivos permitidos`);
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        const uploadedUrls: string[] = [];
        const maxBytes = maxSizeMB * 1024 * 1024;

        for (let i = 0; i < filesToProcess.length; i++) {
            const file = filesToProcess[i];

            if (!isValidFileType(file)) {
                setError(`Formato no soportado: ${file.name}. Usa: PNG, JPG, WebP, GIF, GLB, GLTF`);
                continue;
            }

            if (file.size > maxBytes) {
                setError(`${file.name} es muy grande (máx. ${maxSizeMB}MB)`);
                continue;
            }

            setUploadProgress(Math.round(((i + 0.5) / filesToProcess.length) * 100));

            const url = await uploadToSupabase(file);
            if (url) {
                uploadedUrls.push(url);
            }

            setUploadProgress(Math.round(((i + 1) / filesToProcess.length) * 100));
        }

        if (uploadedUrls.length > 0) {
            onImagesChange([...images, ...uploadedUrls]);
        }

        setIsUploading(false);
        setUploadProgress(0);
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        e.target.value = '';
    };

    // Handle drag events for upload zone
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle drop for upload zone
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        // Only process if not dragging an existing image
        if (draggedIndex === null) {
            processFiles(e.dataTransfer.files);
        }
    };

    // Remove file
    const removeFile = useCallback((index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    // Move file up in order
    const moveUp = useCallback((index: number) => {
        if (index === 0) return;
        const newImages = [...images];
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    // Move file down in order
    const moveDown = useCallback((index: number) => {
        if (index === images.length - 1) return;
        const newImages = [...images];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    // Drag & Drop reordering handlers
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const newImages = [...images];
            const [draggedItem] = newImages.splice(draggedIndex, 1);
            newImages.splice(dragOverIndex, 0, draggedItem);
            onImagesChange(newImages);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [draggedIndex, dragOverIndex, images, onImagesChange]);

    // Open file picker
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    // Open camera
    const openCamera = () => {
        cameraInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_STRING}
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload Zone */}
            <div
                className={`
                    relative border-4 border-dashed rounded-none p-6
                    transition-all duration-200 cursor-pointer
                    ${dragActive
                        ? 'border-[var(--action-blue)] bg-[var(--action-blue)]/10'
                        : 'border-gray-300 hover:border-[var(--action-blue)] hover:bg-gray-50'
                    }
                    ${isUploading ? 'pointer-events-none opacity-70' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFilePicker}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2 className="animate-spin text-[var(--action-blue)]" size={40} />
                        <div className="w-full max-w-xs bg-gray-200 h-3 border-2 border-black">
                            <div
                                className="h-full bg-[var(--action-blue)] transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold uppercase">Subiendo... {uploadProgress}%</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--action-blue)]/10 border-3 border-black">
                                <Upload size={24} className="text-[var(--action-blue)]" />
                            </div>
                            <div className="p-3 bg-purple-100 border-3 border-black hidden md:block">
                                <Box size={24} className="text-purple-600" />
                            </div>
                            <div className="p-3 bg-[var(--success-green)]/10 border-3 border-black md:hidden"
                                onClick={(e) => { e.stopPropagation(); openCamera(); }}
                            >
                                <Camera size={24} className="text-[var(--success-green)]" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-bold uppercase text-sm md:text-base">
                                <span className="hidden md:inline">Arrastra archivos aquí o haz clic</span>
                                <span className="md:hidden">Toca para subir o usar cámara</span>
                            </p>
                            <p className="text-xs text-gray-500 uppercase mt-1">
                                PNG, JPG, WebP, GIF, GLB, GLTF • Máx. {maxSizeMB}MB
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {images.length}/{maxFiles} archivos
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Camera button for mobile */}
            <button
                type="button"
                onClick={openCamera}
                className="
                    md:hidden w-full py-3 px-4
                    bg-[var(--success-green)] text-white font-bold uppercase
                    border-4 border-black
                    flex items-center justify-center gap-2
                    active:translate-y-1 transition-transform
                "
            >
                <Camera size={20} />
                Tomar Foto
            </button>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 border-3 border-red-500 text-red-700">
                    <X size={18} />
                    <span className="text-sm font-bold flex-1">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="hover:bg-red-200 p-1 rounded"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Instructions for reordering */}
            {images.length > 1 && (
                <p className="text-xs text-gray-500 uppercase text-center">
                    💡 Arrastra para reorganizar • La primera imagen es la principal
                </p>
            )}

            {/* Media Preview Grid with Drag & Drop Reordering */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                        <div
                            key={url}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                                relative group border-4 border-black bg-gray-100 overflow-hidden
                                transition-all duration-200 cursor-grab active:cursor-grabbing
                                ${index === 0 ? 'ring-2 ring-[var(--action-blue)]' : ''}
                                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                                ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-green-500' : ''}
                            `}
                        >
                            {/* Media preview */}
                            <div className="aspect-square">
                                {is3DUrl(url) ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                                        <Box size={40} className="text-purple-600 mb-2" />
                                        <span className="text-xs font-bold text-purple-700 uppercase">3D</span>
                                    </div>
                                ) : url.startsWith('http') || url.startsWith('/') ? (
                                    <img
                                        src={url}
                                        alt={`Media ${index + 1}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                        draggable={false}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23eee" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">Error</text></svg>';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <ImageIcon size={32} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Drag handle indicator */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white p-1 rounded opacity-50 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={16} />
                            </div>

                            {/* Index badge */}
                            <div className={`
                                absolute bottom-2 left-2 px-2 py-1 text-xs font-bold
                                ${index === 0
                                    ? 'bg-[var(--action-blue)] text-white'
                                    : 'bg-black text-white'
                                }
                            `}>
                                {index === 0 ? '★ PRINCIPAL' : `#${index + 1}`}
                            </div>

                            {/* File type badge */}
                            {(url.includes('.gif') || is3DUrl(url)) && (
                                <div className={`
                                    absolute bottom-2 right-2 text-xs font-bold px-2 py-1
                                    ${is3DUrl(url) ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'}
                                `}>
                                    {is3DUrl(url) ? '3D' : 'GIF'}
                                </div>
                            )}

                            {/* Action buttons overlay */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Delete button */}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="
                                        w-8 h-8 bg-red-500 text-white
                                        border-2 border-black
                                        flex items-center justify-center
                                        hover:bg-red-600 transition-colors
                                    "
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>

                                {/* Move up button */}
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                                        className="
                                            w-8 h-8 bg-white text-black
                                            border-2 border-black
                                            flex items-center justify-center
                                            hover:bg-gray-100 transition-colors
                                        "
                                        title="Mover arriba"
                                    >
                                        <MoveUp size={16} />
                                    </button>
                                )}

                                {/* Move down button */}
                                {index < images.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                                        className="
                                            w-8 h-8 bg-white text-black
                                            border-2 border-black
                                            flex items-center justify-center
                                            hover:bg-gray-100 transition-colors
                                        "
                                        title="Mover abajo"
                                    >
                                        <MoveDown size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add more placeholder */}
                    {images.length < maxFiles && (
                        <button
                            type="button"
                            onClick={openFilePicker}
                            className="
                                aspect-square border-4 border-dashed border-gray-300 
                                flex flex-col items-center justify-center gap-2
                                hover:border-[var(--action-blue)] hover:bg-gray-50
                                transition-colors
                            "
                        >
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-500 font-bold">+ Añadir</span>
                        </button>
                    )}
                </div>
            )}

            {/* Success indicator */}
            {images.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[var(--success-green)] font-bold uppercase">
                    <CheckCircle size={16} />
                    {images.length} {images.length === 1 ? 'archivo cargado' : 'archivos cargados'}
                </div>
            )}
        </div>
    );
}
