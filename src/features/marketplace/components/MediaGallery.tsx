/**
 * @ProductMediaGallery
 * Galería de imágenes y video del producto con soporte para:
 * - Navegación con flechas
 * - Swipe táctil en móvil
 * - Thumbnails clicables
 * - Video de YouTube embebido
 */
import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Box } from 'lucide-react';
import type { Product } from '../../../shared/types';

interface MediaGalleryProps {
    product: Product;
    currentIndex: number;
    onPrev: () => void;
    onNext: () => void;
    onSelect: (index: number) => void;
}

function getEmbedUrl(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=0`
        : url;
}

// Check if URL is a 3D model
function is3DUrl(url: string): boolean {
    return url?.match(/\.(glb|gltf)$/i) !== null;
}

export function MediaGallery({
    product,
    currentIndex,
    onPrev,
    onNext,
    onSelect,
}: MediaGalleryProps) {
    const isVideo = product.videoUrl && currentIndex === product.images.length;
    const hasMultipleMedia = product.images.length > 1 || product.videoUrl;
    const totalMedia = product.images.length + (product.videoUrl ? 1 : 0);

    // Touch/Swipe handling
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setIsSwiping(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isSwiping) return;
        touchEndX.current = e.touches[0].clientX;
        const diff = touchEndX.current - touchStartX.current;
        // Limit swipe offset to reasonable bounds
        setSwipeOffset(Math.max(-100, Math.min(100, diff * 0.5)));
    }, [isSwiping]);

    const handleTouchEnd = useCallback(() => {
        if (!isSwiping) return;

        const diff = touchEndX.current - touchStartX.current;
        const threshold = 50; // Minimum swipe distance

        if (diff > threshold) {
            // Swiped right → previous
            onPrev();
        } else if (diff < -threshold) {
            // Swiped left → next
            onNext();
        }

        setIsSwiping(false);
        setSwipeOffset(0);
        touchStartX.current = 0;
        touchEndX.current = 0;
    }, [isSwiping, onPrev, onNext]);

    // Mouse drag for desktop
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef<number>(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        dragStartX.current = e.clientX;
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const diff = e.clientX - dragStartX.current;
        setSwipeOffset(Math.max(-100, Math.min(100, diff * 0.3)));
    }, [isDragging]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const diff = e.clientX - dragStartX.current;
        const threshold = 50;

        if (diff > threshold) {
            onPrev();
        } else if (diff < -threshold) {
            onNext();
        }

        setIsDragging(false);
        setSwipeOffset(0);
    }, [isDragging, onPrev, onNext]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            setSwipeOffset(0);
        }
    }, [isDragging]);

    // Render current media
    const renderMedia = () => {
        if (isVideo) {
            return (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <iframe
                        className="w-full h-full"
                        src={getEmbedUrl(product.videoUrl) || ''}
                        frameBorder="0"
                        allowFullScreen
                        title="Product Video"
                    />
                </div>
            );
        }

        const imageUrl = product.images[currentIndex] || '/images/placeholder.png';

        // Check if it's a 3D model
        if (is3DUrl(imageUrl)) {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
                    <Box size={80} className="text-purple-300 mb-4" />
                    <span className="text-white text-xl font-bold uppercase">Modelo 3D</span>
                    <span className="text-purple-300 text-sm mt-2">{imageUrl.split('/').pop()}</span>
                </div>
            );
        }

        return (
            <img
                src={imageUrl}
                className="w-full h-full object-cover transition-transform duration-200 select-none pointer-events-none"
                alt={product.name}
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                }}
                draggable={false}
            />
        );
    };

    return (
        <div
            ref={containerRef}
            className="bg-black relative min-h-[400px] md:min-h-[500px] flex items-center justify-center group overflow-hidden border-4 border-black cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            {/* Main Media Display */}
            {renderMedia()}

            {/* Swipe Hint Overlay (first visit) */}
            {hasMultipleMedia && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Left/Right gradient hints on swipe */}
                    {swipeOffset > 20 && (
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/30 to-transparent flex items-center pl-4">
                            <ChevronLeft size={32} className="text-white animate-pulse" />
                        </div>
                    )}
                    {swipeOffset < -20 && (
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/30 to-transparent flex items-center justify-end pr-4">
                            <ChevronRight size={32} className="text-white animate-pulse" />
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Buttons */}
            {hasMultipleMedia && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="pixel-button bg-white p-3 shadow-[4px_4px_0px_black] hover:scale-105 pointer-events-auto"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="pixel-button bg-white p-3 shadow-[4px_4px_0px_black] hover:scale-105 pointer-events-auto"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Progress Bar / Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {product.images.map((_, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onSelect(i); }}
                        className={`h-3 border-2 border-black transition-all ${i === currentIndex
                            ? 'w-8 bg-[var(--action-blue)]'
                            : 'w-3 bg-white/60 hover:bg-white'
                            }`}
                    />
                ))}
                {product.videoUrl && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSelect(product.images.length); }}
                        className={`h-3 border-2 border-black transition-all flex items-center justify-center ${currentIndex === product.images.length
                            ? 'w-8 bg-[var(--heart-red)]'
                            : 'w-3 bg-white/60 hover:bg-white'
                            }`}
                    >
                        {currentIndex === product.images.length && (
                            <Play size={8} className="text-white" />
                        )}
                    </button>
                )}
            </div>

            {/* Slide Counter */}
            {hasMultipleMedia && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-black/80 text-white px-3 py-1 border-2 border-white/20 text-sm font-bold">
                        {currentIndex + 1} / {totalMedia}
                    </span>
                </div>
            )}

            {/* Currency Badge */}
            <div className="absolute top-4 left-4 z-20">
                <span className="bg-black/80 text-white px-4 py-2 border-2 border-white/20 text-sm font-bold uppercase tracking-widest">
                    {product.ownerCurrency} BASE
                </span>
            </div>

            {/* Thumbnail Row */}
            <div className="absolute bottom-16 left-4 right-4 flex gap-2 z-10 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onSelect(i); }}
                        className={`flex-shrink-0 w-20 h-14 border-4 border-black overflow-hidden transition-all ${i === currentIndex
                                ? 'ring-2 ring-[var(--action-blue)] scale-105'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                    >
                        {is3DUrl(img) ? (
                            <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                                <Box size={20} className="text-white" />
                            </div>
                        ) : (
                            <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                        )}
                    </button>
                ))}
                {product.videoUrl && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSelect(product.images.length); }}
                        className={`flex-shrink-0 w-20 h-14 border-4 border-black overflow-hidden bg-red-600 flex items-center justify-center transition-all ${currentIndex === product.images.length
                                ? 'ring-2 ring-[var(--heart-red)] scale-105'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Play size={24} className="text-white" />
                    </button>
                )}
            </div>

            {/* Swipe instruction (mobile only, shows briefly) */}
            <div className="absolute bottom-36 left-1/2 -translate-x-1/2 md:hidden pointer-events-none z-10">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                    ← Desliza →
                </span>
            </div>
        </div>
    );
}
