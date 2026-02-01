import { useState } from 'react';
import { Lock, TrendingUp, MapPin, Activity, BarChart3, Eye } from 'lucide-react';

interface MarketIntelligenceProps {
    productId: number;
    productName: string;
}

export function MarketIntelligence({ productId, productName }: MarketIntelligenceProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Mock data for the map (dots)
    const mapPoints = [
        { top: '40%', left: '45%', city: 'Bogotá', value: 85 },
        { top: '30%', left: '40%', city: 'Medellín', value: 65 },
        { top: '20%', left: '48%', city: 'Bucaramanga', value: 30 },
        { top: '50%', left: '30%', city: 'Cali', value: 55 },
        { top: '15%', left: '42%', city: 'Cartagena', value: 40 },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Inteligencia de Mercado: {productName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Análisis predictivo y profundidad de mercado para producto #{productId}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    Tendencia Alcista
                </div>
            </div>

            <div className="relative">
                {/* Content (Blurred if locked) */}
                <div className={`p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${!isUnlocked ? 'filter blur-sm opacity-60 pointer-events-none select-none' : ''}`}>

                    {/* Card 1: Sentimiento Social */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm col-span-1">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Expectativa Social de Precio
                        </h3>
                        <div className="h-40 flex items-end gap-2 justify-between">
                            {/* Mock bars */}
                            {[40, 65, 85, 45, 30, 60, 90, 55, 40, 70].map((h, i) => (
                                <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group">
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-sm transition-all duration-1000"
                                        style={{ height: `${h}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-gray-500">
                            <span>$45.000</span>
                            <span className="font-bold text-blue-700">Fair Value: $62.500</span>
                            <span>$85.000</span>
                        </div>
                    </div>

                    {/* Card 2: Mapa Demográfico */}
                    <div className="bg-gray-900 p-0 rounded-lg border border-gray-800 shadow-sm col-span-1 overflow-hidden relative h-64">
                        <div className="absolute top-4 left-4 z-10">
                            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                Mapa de Demanda
                            </h3>
                            <p className="text-xs text-gray-400">Origen de votos y ofertas</p>
                        </div>

                        {/* Map Background */}
                        <div className="absolute inset-0 opacity-50">
                            <img
                                src="/images/colombia-map-dark.png"
                                alt="Mapa Colombia"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Dots */}
                        {mapPoints.map((point, i) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 animate-pulse"
                                style={{ top: point.top, left: point.left }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                    {point.city}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Card 3: Profundidad de Mercado */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm col-span-1 md:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Profundidad de Mercado (Order Book)
                        </h3>
                        <div className="space-y-2">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono">BID</span>
                                        <span className="text-gray-600">Usuario anónimo ({Math.floor(Math.random() * 1000)} pts)</span>
                                    </div>
                                    <div className="flex gap-4 font-mono">
                                        <span className="text-gray-400">Hace {i * 5 + 2}m</span>
                                        <span className="font-bold text-gray-900">$ {60000 - (i * 1500)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lock Overlay */}
                {!isUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-gray-200 shadow-xl max-w-sm text-center transform transition-all hover:scale-105">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Desbloquear Market Intelligence</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Accede al mapa de demanda en tiempo real, análisis de precios y el libro de órdenes completo.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsUnlocked(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    Desbloquear Demo (Gratis)
                                </button>
                                <p className="text-xs text-center text-gray-400">
                                    Solo para Seller PRO members
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
