import { useState, useCallback } from 'react';
import { Bot, Code, Palette, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Package, Vote, BadgeCheck, Sigma, Shuffle, Star } from 'lucide-react';
import { PixelButton } from '../../../shared/ui';
import type { Product } from '../../../shared/types';

interface PriceStandard {
    id: number;
    name: string;
    category: string;
    subcategory: string;
    icon: 'ai' | 'code' | 'design' | 'marketing';
    samples: number;
    price: string;
    priceRange: string;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    isCurrentProduct?: boolean;
}

interface PriceStandardsIndexProps {
    currentProduct?: Product;
    currentProductStats?: {
        samples: number;
        confidence: number;
        trend: 'up' | 'down' | 'stable';
    };
}

const INITIAL_DATA: PriceStandard[] = [
    {
        id: 1,
        name: 'Consultoría AI',
        category: 'Tech',
        subcategory: 'Dev',
        icon: 'ai',
        samples: 142,
        price: '$150/hr',
        priceRange: '$120-$180',
        trend: 'up',
        confidence: 92
    },
    {
        id: 2,
        name: 'Desarrollo Web',
        category: 'Tech',
        subcategory: 'Frontend',
        icon: 'code',
        samples: 320,
        price: '$80/hr',
        priceRange: '$60-$110',
        trend: 'stable',
        confidence: 88
    },
    {
        id: 3,
        name: 'Diseño UX/UI',
        category: 'Creativo',
        subcategory: '',
        icon: 'design',
        samples: 215,
        price: '$95/hr',
        priceRange: '$75-$125',
        trend: 'down',
        confidence: 75
    }
];

const PRODUCT_NAMES = [
    'Consultoría AI', 'Desarrollo Web', 'Diseño UX/UI', 'Marketing Digital',
    'Data Science', 'DevOps', 'App Móvil', 'Branding', 'SEO Avanzado',
    'Automatización', 'Cloud Setup', 'Seguridad IT'
];

const CATEGORIES = ['Todos', 'Tecnología', 'Servicios', 'Creativo', 'Marketing'];

const IconMap = {
    ai: Bot,
    code: Code,
    design: Palette,
    marketing: TrendingUp
};

const ICON_KEYS: ('ai' | 'code' | 'design' | 'marketing')[] = ['ai', 'code', 'design', 'marketing'];

/**
 * @PriceStandardsIndex
 * Módulo de Índice de Precios Estándar - Estandarización de precios
 * basada en el valor social agregado por taxonomía.
 */
export function PriceStandardsIndex({ currentProduct, currentProductStats }: PriceStandardsIndexProps) {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<PriceStandard[]>(INITIAL_DATA);
    const [stats, setStats] = useState({
        products: 1240,
        votes: 85432,
        confidence: 94
    });

    // Generar datos aleatorios
    const simulateData = useCallback(() => {
        const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
        const subcategories = ['Dev', 'Frontend', 'Backend', 'Full-Stack', 'Mobile', ''];

        const newData: PriceStandard[] = Array.from({ length: 4 }, (_, i) => {
            const basePrice = Math.floor(Math.random() * 200) + 50;
            const rangeMin = Math.floor(basePrice * 0.8);
            const rangeMax = Math.floor(basePrice * 1.3);

            return {
                id: i + 1,
                name: PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)],
                category: CATEGORIES[1 + Math.floor(Math.random() * (CATEGORIES.length - 1))],
                subcategory: subcategories[Math.floor(Math.random() * subcategories.length)],
                icon: ICON_KEYS[Math.floor(Math.random() * ICON_KEYS.length)],
                samples: Math.floor(Math.random() * 400) + 50,
                price: `$${basePrice}/hr`,
                priceRange: `$${rangeMin}-$${rangeMax}`,
                trend: trends[Math.floor(Math.random() * trends.length)],
                confidence: Math.floor(Math.random() * 30) + 70
            };
        });

        setData(newData);
        setStats({
            products: Math.floor(Math.random() * 2000) + 500,
            votes: Math.floor(Math.random() * 100000) + 50000,
            confidence: Math.floor(Math.random() * 15) + 85
        });
    }, []);

    const getTrendConfig = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return {
                    icon: TrendingUp,
                    label: 'ALCISTA',
                    borderColor: 'border-green-600',
                    textColor: 'text-green-700',
                    bg: 'bg-green-50'
                };
            case 'down':
                return {
                    icon: TrendingDown,
                    label: 'BAJISTA',
                    borderColor: 'border-red-600',
                    textColor: 'text-red-600',
                    bg: 'bg-red-50'
                };
            default:
                return {
                    icon: Minus,
                    label: 'ESTABLE',
                    borderColor: 'border-zinc-600',
                    textColor: 'text-zinc-600',
                    bg: 'bg-zinc-50'
                };
        }
    };

    // Construir lista con producto actual si existe
    const displayData = currentProduct ? [
        {
            id: 0,
            name: currentProduct.name,
            category: 'General',
            subcategory: '',
            icon: 'ai' as const,
            samples: currentProductStats?.samples || 1,
            price: `$${currentProduct.ownerPrice.toLocaleString()}`,
            priceRange: `$${Math.floor(currentProduct.ownerPrice * 0.8).toLocaleString()}-$${Math.floor(currentProduct.ownerPrice * 1.2).toLocaleString()}`,
            trend: currentProductStats?.trend || 'stable' as const,
            confidence: currentProductStats?.confidence || 85,
            isCurrentProduct: true
        },
        ...data
    ] : data;

    return (
        <section className="pixel-panel p-4 md:p-6">
            {/* HEADER COMPACTO */}
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-black p-2 border-2 border-black">
                        <Package className="text-[#aafa33]" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base md:text-lg font-bold uppercase text-black tracking-tight leading-tight">
                            Índice de Precios Estándar
                        </h2>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide">
                            Referencia por valor social
                        </p>
                    </div>
                </div>
                {/* Botón SIMULAR DATOS */}
                <PixelButton
                    variant="blue"
                    onClick={simulateData}
                    className="flex items-center justify-center gap-2 text-xs py-2"
                >
                    <Shuffle size={14} />
                    SIMULAR DATOS
                </PixelButton>
            </div>

            {/* STATS COMPACTOS - Grid horizontal en móvil */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_black]">
                    <Package className="text-zinc-600 shrink-0" size={16} />
                    <div className="flex flex-col min-w-0">
                        <span className="text-zinc-500 text-[8px] font-bold uppercase leading-tight">Productos</span>
                        <span className="text-black text-sm font-bold font-mono">{stats.products.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_black]">
                    <Vote className="text-zinc-600 shrink-0" size={16} />
                    <div className="flex flex-col min-w-0">
                        <span className="text-zinc-500 text-[8px] font-bold uppercase leading-tight">Votos</span>
                        <span className="text-black text-sm font-bold font-mono">{(stats.votes / 1000).toFixed(0)}K</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_black]">
                    <BadgeCheck className="text-zinc-600 shrink-0" size={16} />
                    <div className="flex flex-col min-w-0">
                        <span className="text-zinc-500 text-[8px] font-bold uppercase leading-tight">Confianza</span>
                        <span className="text-black text-sm font-bold font-mono">{stats.confidence}%</span>
                    </div>
                </div>
            </div>

            {/* FILTROS - Compactos en móvil, grandes en desktop */}
            <div className="flex flex-wrap gap-1.5 md:gap-3 mb-4 md:mb-6">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1.5 md:px-6 md:py-3 text-[10px] md:text-sm font-bold uppercase tracking-wide md:tracking-widest border-2 md:border-4 border-black shadow-[2px_2px_0px_black] md:shadow-[4px_4px_0px_black] transition-all active:translate-y-0.5 active:shadow-none
                            ${activeCategory === cat
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-zinc-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* TABLA DESKTOP */}
            <div className="hidden md:block w-full overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_black]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-900 border-b-2 border-black">
                                <th className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase">Producto</th>
                                <th className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase">Muestra</th>
                                <th className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase">Precio</th>
                                <th className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase text-center">Tend.</th>
                                <th className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase">Confianza</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {displayData.map(item => {
                                const Icon = IconMap[item.icon];
                                const trendConfig = getTrendConfig(item.trend);
                                const TrendIcon = trendConfig.icon;

                                return (
                                    <tr key={item.id} className={`hover:bg-zinc-50 transition-colors ${item.isCurrentProduct ? 'bg-yellow-50 border-l-4 border-l-[#aafa33]' : ''}`}>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 flex items-center justify-center border border-black shrink-0 ${item.isCurrentProduct ? 'bg-[#aafa33]' : 'bg-black'}`}>
                                                    {item.isCurrentProduct ? <Star className="text-black" size={16} /> : <Icon className="text-[#aafa33]" size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs leading-tight truncate flex items-center gap-1">
                                                        {item.name}
                                                        {item.isCurrentProduct && <span className="text-[8px] bg-black text-white px-1">TU PRODUCTO</span>}
                                                    </p>
                                                    <p className="text-zinc-500 text-[9px] uppercase font-bold">
                                                        {item.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="px-1.5 py-0.5 bg-white text-blue-600 text-[10px] font-bold border border-blue-600">
                                                {item.samples}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-green-600 text-sm font-bold font-mono">
                                                {item.price}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 border ${trendConfig.borderColor} ${trendConfig.bg}`}>
                                                <TrendIcon className={trendConfig.textColor} size={12} />
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2 w-24">
                                                <div className="flex-1 h-2 bg-zinc-200 border border-black">
                                                    <div
                                                        className="h-full bg-[#39ff14] transition-all"
                                                        style={{ width: `${item.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold w-8">{item.confidence}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER PAGINACIÓN */}
                <div className="bg-zinc-50 border-t-2 border-black px-3 py-2 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase">
                        {displayData.length} de 120
                    </span>
                    <div className="flex gap-0.5">
                        <button className="w-6 h-6 flex items-center justify-center bg-white border border-black shadow-[1px_1px_0px_black]">
                            <ChevronLeft size={12} />
                        </button>
                        <button
                            className={`w-6 h-6 flex items-center justify-center border border-black shadow-[1px_1px_0px_black] font-bold text-[10px]
                                ${currentPage === 1 ? 'bg-[#aafa33]' : 'bg-white'}`}
                            onClick={() => setCurrentPage(1)}
                        >
                            1
                        </button>
                        <button
                            className={`w-6 h-6 flex items-center justify-center border border-black shadow-[1px_1px_0px_black] font-bold text-[10px]
                                ${currentPage === 2 ? 'bg-[#aafa33]' : 'bg-white'}`}
                            onClick={() => setCurrentPage(2)}
                        >
                            2
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center bg-white border border-black shadow-[1px_1px_0px_black]">
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* CARDS MÓVIL - Más compactas */}
            <div className="md:hidden space-y-2">
                {displayData.map(item => {
                    const Icon = IconMap[item.icon];
                    const trendConfig = getTrendConfig(item.trend);
                    const TrendIcon = trendConfig.icon;

                    return (
                        <div key={item.id} className={`border-2 border-black bg-white p-3 shadow-[3px_3px_0px_black] ${item.isCurrentProduct ? 'border-l-4 border-l-[#aafa33] bg-yellow-50' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 flex items-center justify-center border border-black shrink-0 ${item.isCurrentProduct ? 'bg-[#aafa33]' : 'bg-black'}`}>
                                    {item.isCurrentProduct ? <Star className="text-black" size={16} /> : <Icon className="text-[#aafa33]" size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs leading-tight truncate">
                                        {item.name}
                                        {item.isCurrentProduct && <span className="ml-1 text-[8px] bg-black text-white px-1">TÚ</span>}
                                    </p>
                                    <p className="text-zinc-500 text-[9px] uppercase font-bold">{item.category}</p>
                                </div>
                                <div className={`inline-flex items-center px-1.5 py-0.5 border ${trendConfig.borderColor} ${trendConfig.bg}`}>
                                    <TrendIcon className={trendConfig.textColor} size={12} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <span className="text-[8px] text-zinc-500 font-bold uppercase block">Precio</span>
                                    <span className="text-green-600 text-sm font-bold font-mono">{item.price}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] text-zinc-500 font-bold uppercase block">Muestras</span>
                                    <span className="text-blue-600 text-sm font-bold">{item.samples}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] text-zinc-500 font-bold uppercase block">Score</span>
                                    <span className="text-black text-sm font-bold">{item.confidence}%</span>
                                </div>
                            </div>

                            <div className="mt-2 w-full h-1.5 bg-zinc-200 border border-black">
                                <div
                                    className="h-full bg-[#39ff14] transition-all"
                                    style={{ width: `${item.confidence}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* METODOLOGÍA COMPACTA */}
            <div className="mt-4 bg-[#fef3c7] p-3 border-2 border-black shadow-[3px_3px_0px_black]">
                <div className="flex flex-col md:flex-row gap-3 items-start">
                    <div className="flex-1">
                        <h3 className="text-black text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Sigma size={14} />
                            Metodología
                        </h3>
                        <p className="text-zinc-700 text-[10px] leading-relaxed">
                            Consenso ponderado. Precios atípicos filtrados por desviación estándar.
                        </p>
                    </div>
                    <div className="w-full md:w-auto md:min-w-[200px]">
                        <div className="bg-black p-2 font-mono text-[10px]">
                            <p className="text-white">
                                <span className="text-blue-400">P</span> = <span className="text-[#aafa33]">Median</span>(P)*w + <span className="text-[#aafa33]">Mean</span>(P)*t
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
