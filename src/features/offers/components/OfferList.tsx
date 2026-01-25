import { useState, useCallback, useMemo } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import type { Offer, ProductStatus } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';
import { PixelButton } from '../../../shared/ui';

// Constantes para colapso
const COLLAPSED_ITEMS = 5;
const EXPANDED_ITEMS = 15;

interface OfferListProps {
    offers: Offer[];
    productStatus: ProductStatus;
    onAcceptOffer: (offerId: number, amount: number, currency: string) => void;
}

export function OfferList({ offers, productStatus, onAcceptOffer }: OfferListProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Ordenar ofertas: aceptadas primero, luego por fecha (más reciente primero)
    const sortedOffers = useMemo(() => {
        return [...offers].sort((a, b) => {
            if (a.status === 'accepted' && b.status !== 'accepted') return -1;
            if (b.status === 'accepted' && a.status !== 'accepted') return 1;
            return 0;
        });
    }, [offers]);

    const visibleOffers = isExpanded 
        ? sortedOffers.slice(0, EXPANDED_ITEMS) 
        : sortedOffers.slice(0, COLLAPSED_ITEMS);
    
    const showToggle = sortedOffers.length > COLLAPSED_ITEMS;
    const remainingCount = sortedOffers.length - COLLAPSED_ITEMS;

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    return (
        <section className="pixel-panel p-6 h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <History size={18} className="text-[var(--action-blue)]" />
                    HISTORIAL DE NEGOCIACIÓN
                    <span className="text-[var(--action-orange)] ml-1">
                        [{sortedOffers.length} OFERTAS TOTALES]
                    </span>
                </h3>
                <span className="text-xs font-bold text-[var(--success-green)] flex items-center gap-1">
                    <span className="w-2 h-2 bg-[var(--success-green)] animate-pixel-pulse rounded-full" />
                    EN VIVO
                </span>
            </div>

            {sortedOffers.length === 0 ? (
                <div className="text-center py-16 bg-[var(--background-dots)] border-4 border-dashed border-black/20">
                    <p className="font-bold text-sm uppercase opacity-40">SIN OFERTAS REGISTRADAS</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar max-h-[500px]">
                        {visibleOffers.map((offer) => (
                            <div
                                key={offer.id}
                                className={`p-4 border-4 border-black transition-all ${
                                    offer.status === 'accepted'
                                        ? 'bg-[var(--success-green)]/20 border-[var(--success-green)]'
                                        : offer.status === 'rejected'
                                            ? 'bg-slate-100 opacity-50'
                                            : 'bg-white hover:bg-[var(--background-dots)]'
                                }`}
                            >
                                <div className="flex flex-wrap justify-between items-center gap-3">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <span className="font-bold text-lg block truncate uppercase">
                                            {offer.bidder}
                                        </span>
                                        <p className="text-xs font-bold opacity-50 uppercase">
                                            {offer.date}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                        <p
                                            className={`text-xl md:text-2xl font-bold tracking-tight leading-none ${
                                                offer.status === 'accepted'
                                                    ? 'text-[var(--success-green)]'
                                                    : 'text-[var(--action-blue)]'
                                            }`}
                                        >
                                            {formatCurrency(offer.amount, offer.cur)}
                                        </p>

                                        {offer.status === 'accepted' && (
                                            <span className="inline-block bg-[var(--success-green)] text-white px-2 py-0.5 border-2 border-black text-[10px] font-bold uppercase">
                                                ✓ ACEPTADA
                                            </span>
                                        )}
                                        {offer.status === 'rejected' && (
                                            <span className="inline-block bg-slate-500 text-white px-2 py-0.5 border-2 border-black text-[10px] font-bold uppercase">
                                                SUPERADA
                                            </span>
                                        )}

                                        {productStatus !== 'sold' && offer.status === 'pending' && (
                                            <PixelButton
                                                variant="white"
                                                onClick={() => onAcceptOffer(offer.id, offer.amount, offer.cur)}
                                                className="text-[10px] px-2 py-1 border-[var(--success-green)] text-[var(--success-green)] hover:bg-[var(--success-green)] hover:text-white"
                                            >
                                                ADJUDICAR VENTA
                                            </PixelButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showToggle && (
                        <PixelButton
                            variant="orange"
                            fullWidth
                            onClick={toggleExpanded}
                            className="mt-4 flex items-center justify-center gap-2"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp size={18} />
                                    COLAPSAR HISTORIAL
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={18} />
                                    VER MÁS OFERTAS ({remainingCount} más)
                                </>
                            )}
                        </PixelButton>
                    )}
                </>
            )}
        </section>
    );
}
