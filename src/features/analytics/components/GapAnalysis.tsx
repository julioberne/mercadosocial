import { Activity } from 'lucide-react';
import type { CurrencyCode, MarketStats } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';

interface GapAnalysisProps {
    stats: MarketStats;
    mainCurrency: CurrencyCode;
}

export function GapAnalysis({ stats, mainCurrency }: GapAnalysisProps) {
    // Valores absolutos
    const baseValue = stats.ownerPriceInMain;
    const socialValue = stats.avgSentiment;
    const offerValue = stats.avgOffer;
    const bestOfferValue = stats.maxOffer;

    // ESCALA: 
    // Máximo = Mayor valor entre (Base, Mejor Oferta, Promedio Social, Promedio Ofertas) + 15% margen
    const maxValue = Math.max(baseValue, bestOfferValue, socialValue, offerValue, 1);
    const scaleMax = maxValue * 1.15;

    // Función para calcular altura porcentaje segura
    const getPct = (val: number) => {
        if (!val || val <= 0) return 0;
        return Math.min(Math.round((val / scaleMax) * 100), 100);
    };

    const baseHeight = getPct(baseValue);
    const socialHeight = getPct(socialValue);
    const offerHeight = getPct(offerValue);

    // Calcular diferencia vs base (para badges)
    const socialDiff = baseValue > 0 && socialValue > 0
        ? Math.round(((socialValue - baseValue) / baseValue) * 100)
        : 0;
    const offerDiff = baseValue > 0 && offerValue > 0
        ? Math.round(((offerValue - baseValue) / baseValue) * 100)
        : 0;

    // Formatear diferencia con signo
    const formatDiff = (diff: number) => diff >= 0 ? `+${diff}%` : `${diff}%`;

    // Generar 5 marcas del eje Y (0%, 25%, 50%, 75%, 100% del scaleMax)
    const yAxisMarks = [0, 0.25, 0.5, 0.75, 1].map(pct => Math.round(scaleMax * pct));

    // Formato corto para eje Y
    const formatShort = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
    };

    return (
        <section className="pixel-panel p-4 md:p-6">
            {/* Header Compacto */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-[var(--action-blue)] p-1.5 border-2 border-black relative">
                        <Activity size={18} className="text-white" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white border border-[var(--action-blue)]"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm md:text-lg font-bold uppercase tracking-tight leading-none flex items-center gap-2">
                            ANÁLISIS DE BRECHA
                            <span className="bg-black text-white text-[7px] px-1 font-bold animate-pulse">LIVE</span>
                        </h3>
                    </div>
                </div>

                {/* Badges Compactos */}
                <div className="flex flex-wrap gap-1.5">
                    <div className="bg-[var(--success-green)]/10 px-2 py-0.5 border-2 border-[var(--success-green)]">
                        <span className="text-[9px] font-bold text-[var(--success-green)]">CONFIANZA: {Math.round(stats.convergenceIndex)}%</span>
                    </div>
                    {bestOfferValue > 0 && (
                        <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-2 py-0.5 border-2 border-black">
                            <span className="text-[9px] font-bold text-black">🏆 MEJOR: {formatCurrency(bestOfferValue, mainCurrency)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Histograma Compacto - Barras Juntas */}
            <div className="bg-white border-4 border-black p-3">
                <div className="flex h-40 md:h-52">

                    {/* EJE Y - Valores Absolutos */}
                    {/* Usamos flex-col justify-between para distribuir las marcas exactamente igual que las líneas */}
                    <div className="flex flex-col justify-between text-right pr-1.5 min-w-[35px] md:min-w-[45px] pb-6">
                        {/* pb-6 deja espacio para la leyenda del eje X */}
                        {yAxisMarks.slice().reverse().map((mark) => (
                            <div key={mark} className="flex items-center justify-end h-0">
                                {/* h-0 para centrar la marca en la línea */}
                                <span className="text-[8px] md:text-[9px] font-bold text-gray-500 -translate-y-1/2 block">{formatShort(mark)}</span>
                                <div className="w-1 h-[1px] bg-gray-300 ml-0.5 -translate-y-1/2"></div>
                            </div>
                        ))}
                    </div>

                    {/* Área del Gráfico */}
                    <div className="flex-1 relative border-l border-gray-200">
                        {/* Líneas de guía horizontales */}
                        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                            {yAxisMarks.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-full border-t ${idx === 0 ? 'border-gray-400' : 'border-gray-100'}`}
                                ></div>
                            ))}
                        </div>

                        {/* Línea de referencia BASE (Dashed) */}
                        {baseValue > 0 && (
                            <div
                                className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500 z-10 transition-all duration-500 ease-out"
                                style={{ bottom: `calc(${baseHeight}% + 1.5rem)` }} // +1.5rem offset por el padding bottom del contenedor
                            >
                                <span className="absolute -right-1 -top-3 text-[7px] font-bold text-emerald-600 bg-white px-0.5">100%</span>
                            </div>
                        )}

                        {/* Contenedor de Barras */}
                        {/* pb-6 deja espacio para las etiquetas del eje X */}
                        <div className="absolute inset-0 pb-6 flex items-end justify-center gap-2 md:gap-4 px-2">

                            {/* Barra 1: BASE DUEÑO */}
                            <div className="relative w-16 md:w-24 flex items-end justify-center h-full">
                                <div
                                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 border-2 border-emerald-700 rounded-t transition-all duration-300 ease-out shadow-lg group relative"
                                    style={{ height: `${Math.max(baseHeight, 2)}%` }} // Min 2% para visibilidad
                                >
                                    {/* Tooltip con valor */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold whitespace-nowrap opacity-100 transition-opacity">
                                        {formatCurrency(baseValue, mainCurrency)}
                                    </div>
                                </div>
                            </div>

                            {/* Barra 2: SOCIAL */}
                            <div className="relative w-16 md:w-24 flex items-end justify-center h-full">
                                {socialValue > 0 ? (
                                    <div
                                        className="w-full bg-gradient-to-t from-pink-600 to-pink-400 border-2 border-pink-700 rounded-t transition-all duration-300 ease-out shadow-lg relative"
                                        style={{ height: `${Math.max(socialHeight, 2)}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold whitespace-nowrap">
                                            {formatCurrency(socialValue, mainCurrency)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-1 bg-gray-200" />
                                )}
                            </div>

                            {/* Barra 3: OFERTAS */}
                            <div className="relative w-16 md:w-24 flex items-end justify-center h-full">
                                {offerValue > 0 ? (
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 border-2 border-blue-700 rounded-t transition-all duration-300 ease-out shadow-lg relative"
                                        style={{ height: `${Math.max(offerHeight, 2)}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold whitespace-nowrap">
                                            {formatCurrency(offerValue, mainCurrency)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-1 bg-gray-200" />
                                )}
                            </div>
                        </div>

                        {/* Etiquetas Eje X (Abajo absoluto) */}
                        <div className="absolute bottom-0 inset-x-0 h-6 flex justify-center gap-2 md:gap-4 items-center">

                            {/* Label BASE */}
                            <div className="w-16 md:w-24 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-[9px] font-bold text-emerald-700">BASE</span>
                                </div>
                            </div>

                            {/* Label SOCIAL */}
                            <div className="w-16 md:w-24 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                    <span className="text-[9px] font-bold text-pink-700">SOCIAL</span>
                                    {socialValue > 0 && <span className={`text-[8px] font-bold px-1 rounded ${socialDiff >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{formatDiff(socialDiff)}</span>}
                                </div>
                            </div>

                            {/* Label OFERTAS */}
                            <div className="w-16 md:w-24 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-[9px] font-bold text-blue-700">OFERTAS</span>
                                    {offerValue > 0 && <span className={`text-[8px] font-bold px-1 rounded ${offerDiff >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{formatDiff(offerDiff)}</span>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
