import { Activity } from 'lucide-react';
import type { CurrencyCode, MarketStats } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';

interface GapAnalysisProps {
    stats: MarketStats;
    mainCurrency: CurrencyCode;
}

export function GapAnalysis({ stats, mainCurrency }: GapAnalysisProps) {
    const maxValue = Math.max(stats.ownerPriceInMain, stats.avgSentiment, stats.maxOffer) || 1;

    return (
        <section className="pixel-panel p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--action-blue)] p-3 border-4 border-black relative">
                        <Activity size={28} className="text-white" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-[var(--action-blue)]"></span>
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold uppercase tracking-tight leading-none">
                                ANÁLISIS DE BRECHA & INTELIGENCIA DE MERCADO
                            </h3>
                            <span className="bg-black text-white text-[8px] px-1 font-bold animate-pulse">LIVE</span>
                        </div>
                        <p className="text-sm font-bold opacity-50 uppercase mt-1">
                            Referencia de valoración crítica sin superposición
                        </p>
                    </div>
                </div>

                {/* Stats Badges */}
                <div className="flex gap-3">
                    <div className="bg-[var(--success-green)]/10 px-4 py-2 border-4 border-[var(--success-green)]">
                        <p className="text-xs font-bold text-[var(--success-green)] uppercase mb-1 text-center">
                            CONFIANZA
                        </p>
                        <p className="text-2xl font-bold text-[var(--success-green)] text-center">
                            {Math.round(stats.convergenceIndex)}%
                        </p>
                    </div>
                    <div className="bg-[var(--action-purple)]/10 px-4 py-2 border-4 border-[var(--action-purple)]">
                        <p className="text-xs font-bold text-[var(--action-purple)] uppercase mb-1 text-center">
                            PRIMA VALOR
                        </p>
                        <p className="text-2xl font-bold text-[var(--action-purple)] text-center">
                            {stats.marketPremium > 0 ? '+' : ''}{Math.round(stats.marketPremium)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="py-8 relative">
                <div className="relative h-10 bg-[var(--background-dots)] border-4 border-black mb-16">
                    {/* Base Price Bar - Azul (más al fondo) */}
                    <div
                        className="absolute top-0 left-0 h-full bg-[var(--action-blue)] border-r-4 border-black z-10"
                        style={{ width: `${(stats.ownerPriceInMain / maxValue) * 100}%` }}
                    >
                        {/* Label encima de la barra azul */}
                        <div className="absolute -top-8 left-2 text-xs font-bold text-[var(--action-blue)] uppercase whitespace-nowrap bg-white/80 px-2 py-0.5 border-2 border-[var(--action-blue)]">
                            BASE DEL DUEÑO
                        </div>
                    </div>

                    {/* Sentiment Bar - Violeta (overlay sobre azul) */}
                    <div
                        className="absolute top-0 left-0 h-full bg-[var(--action-purple)]/60 border-r-4 border-[var(--action-purple)] z-20 transition-all duration-1000"
                        style={{ width: `${(stats.avgSentiment / maxValue) * 100}%` }}
                    >
                        {/* Label encima de la barra violeta */}
                        {stats.avgSentiment > 0 && (
                            <div className="absolute -top-8 right-2 text-xs font-bold text-[var(--action-purple)] uppercase whitespace-nowrap bg-white/80 px-2 py-0.5 border-2 border-[var(--action-purple)]">
                                EXPECTATIVA SOCIAL
                            </div>
                        )}
                    </div>

                    {/* Average Offer Bar - Cyan/Verde claro (barra horizontal visible) */}
                    {stats.avgOffer > 0 && (
                        <div
                            className="absolute top-0 left-0 h-full bg-cyan-400/40 border-r-4 border-cyan-500 z-25 transition-all duration-1000"
                            style={{ width: `${(stats.avgOffer / maxValue) * 100}%` }}
                        >
                            {/* Label encima de la barra cyan */}
                            <div className="absolute -top-8 right-2 text-xs font-bold text-cyan-600 uppercase whitespace-nowrap bg-white/80 px-2 py-0.5 border-2 border-cyan-500">
                                EXPECTATIVA OFERTAS
                            </div>
                            {/* Línea vertical al final */}
                            <div className="absolute right-0 top-0 h-full w-1 bg-cyan-600 border-l-2 border-dashed border-cyan-700" />
                        </div>
                    )}

                    {/* Best Offer Marker - Naranja */}
                    {stats.maxOffer > 0 && (
                        <div
                            className="absolute top-0 h-full w-3 bg-[var(--action-orange)] z-40 shadow-[0_0_10px_rgba(255,152,0,0.8)] transition-all duration-1000"
                            style={{ left: `${(stats.maxOffer / maxValue) * 100}%` }}
                        >
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[var(--action-orange)] text-black px-3 py-2 border-4 border-black shadow-[4px_4px_0px_black] whitespace-nowrap animate-pixel-bounce flex flex-col items-center">
                                <span className="text-xs font-bold opacity-70">MEJOR OFERTA</span>
                                <span className="font-bold">{formatCurrency(stats.maxOffer, mainCurrency)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col border-l-8 border-[var(--action-blue)] pl-4 py-2 bg-[var(--action-blue)]/10">
                        <span className="text-sm font-bold text-[var(--action-blue)] uppercase tracking-widest">
                            BASE DUEÑO
                        </span>
                        <span className="text-2xl font-bold tracking-tight mt-1">
                            {formatCurrency(stats.ownerPriceInMain, mainCurrency)}
                        </span>
                    </div>
                    <div className="flex flex-col border-l-8 border-[var(--action-purple)] pl-4 py-2 bg-[var(--action-purple)]/10">
                        <span className="text-sm font-bold text-[var(--action-purple)] uppercase tracking-widest">
                            EXPECTATIVA SOCIAL
                        </span>
                        <span className="text-2xl font-bold tracking-tight mt-1">
                            {formatCurrency(stats.avgSentiment, mainCurrency)}
                        </span>
                    </div>
                    <div className="flex flex-col border-l-8 border-cyan-500 pl-4 py-2 bg-cyan-500/10">
                        <span className="text-sm font-bold text-cyan-600 uppercase tracking-widest">
                            EXPECTATIVA OFERTAS
                        </span>
                        <span className="text-2xl font-bold tracking-tight mt-1">
                            {formatCurrency(stats.avgOffer, mainCurrency)}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
