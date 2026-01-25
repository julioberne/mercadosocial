import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
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

export function MediaGallery({
    product,
    currentIndex,
    onPrev,
    onNext,
    onSelect,
}: MediaGalleryProps) {
    const isVideo = product.videoUrl && currentIndex === product.images.length;
    const hasMultipleMedia = product.images.length > 1 || product.videoUrl;

    return (
        <div className="bg-black relative min-h-[400px] md:min-h-[500px] flex items-center justify-center group overflow-hidden border-4 border-black">
            {/* Main Media Display */}
            {isVideo ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <iframe
                        className="w-full h-full"
                        src={getEmbedUrl(product.videoUrl) || ''}
                        frameBorder="0"
                        allowFullScreen
                        title="Product Video"
                    />
                </div>
            ) : (
                <img
                    src={product.images[currentIndex] || '/images/placeholder.png'}
                    className="w-full h-full object-cover transition-all duration-500"
                    alt={product.name}
                />
            )}

            {/* Navigation Buttons */}
            {hasMultipleMedia && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button
                        onClick={onPrev}
                        className="pixel-button bg-white p-3 shadow-[4px_4px_0px_black] hover:scale-105"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={onNext}
                        className="pixel-button bg-white p-3 shadow-[4px_4px_0px_black] hover:scale-105"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Thumbnail Indicators */}
            <div className="absolute bottom-4 flex gap-2 z-20">
                {product.images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`h-3 border-2 border-black transition-all ${i === currentIndex
                                ? 'w-8 bg-[var(--action-blue)]'
                                : 'w-3 bg-white/60 hover:bg-white'
                            }`}
                    />
                ))}
                {product.videoUrl && (
                    <button
                        onClick={() => onSelect(product.images.length)}
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

            {/* Currency Badge */}
            <div className="absolute top-4 left-4 z-20">
                <span className="bg-black/80 text-white px-4 py-2 border-2 border-white/20 text-sm font-bold uppercase tracking-widest">
                    {product.ownerCurrency} BASE
                </span>
            </div>

            {/* Thumbnail Row */}
            <div className="absolute bottom-16 left-4 right-4 flex gap-2 z-10">
                {product.images.slice(0, 3).map((img, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`flex-1 h-16 border-4 border-black overflow-hidden ${i === currentIndex ? 'ring-2 ring-[var(--action-blue)]' : ''
                            }`}
                    >
                        <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
