import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import type { Vote } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';
import { PixelButton } from '../../../shared/ui';

const COLLAPSED_ITEMS = 6;
const EXPANDED_ITEMS = 15;

interface SentimentWallProps {
    votes: Vote[];
}

export function SentimentWall({ votes }: SentimentWallProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const sortedVotes = useMemo(() => {
        return [...votes].sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
            return timeB - timeA;
        });
    }, [votes]);

    const visibleVotes = isExpanded
        ? sortedVotes.slice(0, EXPANDED_ITEMS)
        : sortedVotes.slice(0, COLLAPSED_ITEMS);

    const showToggle = sortedVotes.length > COLLAPSED_ITEMS;
    const remainingCount = sortedVotes.length - COLLAPSED_ITEMS;

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const getTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const time = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const diff = now.getTime() - time.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'AHORA';
        if (minutes < 60) return `HACE ${minutes}M`;
        if (hours < 24) return `HACE ${hours}H`;
        return time.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    };

    return (
        <section className="pixel-panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Users size={16} className="text-[var(--action-purple)]" />
                    MURO DE PERCEPCIÓN
                    <span className="text-[var(--action-purple)] ml-1">
                        [{sortedVotes.length} VOTOS]
                    </span>
                </h3>
                <span className="text-xs font-bold text-[var(--action-blue)] flex items-center gap-1">
                    <span className="w-2 h-2 bg-[var(--action-blue)] animate-pixel-pulse rounded-full" />
                    FEED
                </span>
            </div>

            {sortedVotes.length === 0 ? (
                <div className="text-center py-10 flex-1 flex items-center justify-center">
                    <p className="text-sm font-bold opacity-40 uppercase">SIN VOTOS AÚN</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar max-h-[400px]">
                        {visibleVotes.map((vote, i) => (
                            <div
                                key={vote.id || i}
                                className="flex justify-between items-center bg-[var(--background-dots)] p-3 border-4 border-black hover:bg-white transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-3 w-3 bg-[var(--action-purple)] border-2 border-black shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold tracking-tight text-xs text-[var(--action-purple)] uppercase">
                                            VALORADO EN {formatCurrency(vote.val, vote.cur)}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-40 uppercase">
                                            {getTimeAgo(vote.timestamp)}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-bold tracking-tight text-lg shrink-0 ml-2">
                                    {formatCurrency(vote.val, vote.cur)}
                                </span>
                            </div>
                        ))}
                    </div>
                    {showToggle && (
                        <PixelButton
                            variant="blue"
                            fullWidth
                            onClick={toggleExpanded}
                            className="mt-4 flex items-center justify-center gap-2"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp size={18} />
                                    COLAPSAR VOTOS
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={18} />
                                    VER MÁS VOTOS ({remainingCount} más)
                                </>
                            )}
                        </PixelButton>
                    )}
                </>
            )}
        </section>
    );
}
