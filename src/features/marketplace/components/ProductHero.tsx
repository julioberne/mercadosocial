import { useState } from 'react';
import { Lock, Unlock, ChevronDown, ChevronUp, Share2, Link as LinkIcon, MessageSquare, CheckCircle2 } from 'lucide-react';
import type { Product, CurrencyCode } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';
import { MediaGallery } from './MediaGallery';
import { PixelButton } from '../../../shared/ui';

interface ProductHeroProps {
    product: Product;
    mainCurrency: CurrencyCode;
    currentImageIndex: number;
    onPrevImage: () => void;
    onNextImage: () => void;
    onSelectImage: (index: number) => void;
    onToggleLock: () => void;
}

export function ProductHero({
    product,
    mainCurrency,
    currentImageIndex,
    onPrevImage,
    onNextImage,
    onSelectImage,
    onToggleLock,
}: ProductHeroProps) {
    const [descExpanded, setDescExpanded] = useState(false);

    // Limitar descripción a 200 caracteres cuando está colapsada
    const shortDescription = product.description.length > 200
        ? product.description.substring(0, 200) + '...'
        : product.description;

    return (
        <div className="pixel-panel overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Media Gallery (7 cols) */}
            <div className="lg:col-span-7 border-r-0 lg:border-r-4 border-black">
                <MediaGallery
                    product={product}
                    currentIndex={currentImageIndex}
                    onPrev={onPrevImage}
                    onNext={onNextImage}
                    onSelect={onSelectImage}
                />
            </div>

            {/* Right: Product Info (5 cols) */}
            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-white relative">
                <div className="space-y-4">
                    {/* Seller Badge & Status */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 border-2 border-black overflow-hidden rounded-full">
                                <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{product.seller.level}</p>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-sm md:text-lg">{product.seller.name}</span>
                                    {product.seller.verified && <CheckCircle2 size={14} className="text-[var(--action-blue)]" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="bg-[var(--action-blue)] text-white px-2 md:px-3 py-1 border-2 border-black text-[10px] md:text-xs font-bold uppercase tracking-widest text-center min-w-[60px] md:min-w-[80px]">
                                {mainCurrency} VISTA
                            </span>
                            <span className="text-[9px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest">
                                {product.status === 'open' && '🟢 ABIERTO'}
                                {product.status === 'locked' && '🔒 FIJADO'}
                                {product.status === 'sold' && '✅ VENDIDO'}
                            </span>
                        </div>
                    </div>

                    {/* Product Title - Reducido a 2rem */}
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-snug break-words" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>
                        {product.name}
                    </h1>

                    {/* Description - Mejorada */}
                    <div className="space-y-3">
                        <div className={`
                            relative overflow-hidden transition-all duration-300 ease-in-out
                            ${descExpanded ? 'max-h-96' : 'max-h-24'}
                        `}>
                            <p className="text-sm md:text-base leading-relaxed text-gray-700">
                                {descExpanded ? product.description : shortDescription}
                            </p>
                            {/* Gradient fade when collapsed */}
                            {!descExpanded && product.description.length > 200 && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                            )}
                        </div>

                        {product.description.length > 200 && (
                            <button
                                onClick={() => setDescExpanded(!descExpanded)}
                                className="flex items-center gap-1 text-[var(--action-blue)] font-bold text-xs uppercase tracking-widest hover:underline transition-colors"
                            >
                                {descExpanded ? (
                                    <>
                                        <ChevronUp size={14} /> Ver menos
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={14} /> Ver descripción completa
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Price and Actions */}
                <div className="mt-6 pt-6 border-t-4 border-black space-y-4">
                    <div className="flex items-end justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[var(--action-blue)] uppercase tracking-widest mb-1">
                                PRECIO ORIGINAL
                            </p>
                            <div className="text-2xl md:text-3xl font-bold tracking-tight truncate leading-none">
                                {formatCurrency(product.ownerPrice, product.ownerCurrency)}
                            </div>
                        </div>
                        <button
                            onClick={onToggleLock}
                            className="pixel-button btn-white p-2 md:p-3 shadow-[4px_4px_0px_black] shrink-0 ml-4 hover:scale-105"
                            title={product.status === 'open' ? 'Bloquear precio' : 'Desbloquear precio'}
                        >
                            {product.status === 'open' ? <Lock size={20} /> : <Unlock size={20} />}
                        </button>
                    </div>

                    {/* Social Share grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <PixelButton variant="white" className="text-[10px] md:text-xs py-2 md:py-3 justify-center">
                            <Share2 size={14} /> COMPARTIR
                        </PixelButton>
                        <PixelButton variant="white" className="text-[10px] md:text-xs py-2 md:py-3 justify-center">
                            <LinkIcon size={14} /> COPIAR LINK
                        </PixelButton>
                        <PixelButton variant="teal" className="text-[10px] md:text-xs py-2 md:py-3 justify-center col-span-2">
                            <MessageSquare size={14} /> CONTACTAR VENDEDOR
                        </PixelButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
