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
            <div className="lg:col-span-5 p-8 flex flex-col justify-between bg-white relative">
                <div className="space-y-6">
                    {/* Seller Badge & Status */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 border-2 border-black overflow-hidden rounded-full">
                                <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{product.seller.level}</p>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-lg">{product.seller.name}</span>
                                    {product.seller.verified && <CheckCircle2 size={16} className="text-[var(--action-blue)]" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="bg-[var(--action-blue)] text-white px-3 py-1 border-2 border-black text-xs font-bold uppercase tracking-widest text-center min-w-[80px]">
                                {mainCurrency} VISTA
                            </span>
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                                {product.status === 'open' && '🟢 ABIERTO'}
                                {product.status === 'locked' && '🔒 FIJADO'}
                                {product.status === 'sold' && '✅ VENDIDO'}
                            </span>
                        </div>
                    </div>

                    {/* Product Title */}
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight break-words uppercase">
                        {product.name}
                    </h1>

                    {/* Description */}
                    <div className="space-y-2">
                        <p
                            className={`text-xl leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''
                                }`}
                        >
                            {product.description}
                        </p>
                        {product.description.length > 150 && (
                            <button
                                onClick={() => setDescExpanded(!descExpanded)}
                                className="flex items-center gap-1 text-[var(--action-blue)] font-bold text-sm uppercase tracking-widest hover:underline"
                            >
                                {descExpanded ? (
                                    <>
                                        <ChevronUp size={16} /> MENOS
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} /> LEER MÁS
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Price and Actions */}
                <div className="mt-8 pt-8 border-t-4 border-black space-y-6">
                    <div className="flex items-end justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[var(--action-blue)] uppercase tracking-widest mb-1">
                                PRECIO ORIGINAL
                            </p>
                            <div className="text-4xl lg:text-5xl font-bold tracking-tight truncate leading-none">
                                {formatCurrency(product.ownerPrice, product.ownerCurrency)}
                            </div>
                        </div>
                        <button
                            onClick={onToggleLock}
                            className="pixel-button btn-white p-3 shadow-[4px_4px_0px_black] shrink-0 ml-4 hover:scale-105"
                            title={product.status === 'open' ? 'Bloquear precio' : 'Desbloquear precio'}
                        >
                            {product.status === 'open' ? <Lock size={24} /> : <Unlock size={24} />}
                        </button>
                    </div>

                    {/* Social Share grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <PixelButton variant="white" className="text-xs py-3 justify-center">
                            <Share2 size={16} /> COMPARTIR
                        </PixelButton>
                        <PixelButton variant="white" className="text-xs py-3 justify-center">
                            <LinkIcon size={16} /> COPIAR LINK
                        </PixelButton>
                        <PixelButton variant="teal" className="text-xs py-3 justify-center col-span-2">
                            <MessageSquare size={16} /> CONTACTAR VENDEDOR (WhatsApp)
                        </PixelButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
