import { useState, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CurrencyCode, HistoryPoint } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';

interface EvolutionChartProps {
    label: string;
    data: HistoryPoint[];
    color: string;
    mainCurrency: CurrencyCode;
    icon: ReactNode;
}

export function EvolutionChart({
    label,
    data,
    color,
    mainCurrency,
    icon,
}: EvolutionChartProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const values = useMemo(() => data.map(d => d.value), [data]);
    const currentVal = values[values.length - 1] || 0;
    const prevVal = values.length > 1 ? values[values.length - 2] : currentVal;
    const isUp = currentVal >= prevVal;

    const stats = useMemo(() => {
        if (values.length === 0) return { min: 0, max: 0, range: 0 };
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { min, max: max === min ? max + 1 : max, range: Math.max(max - min, 1) };
    }, [values]);

    const width = 300;
    const height = 100;
    const padding = { top: 10, right: 10, bottom: 20, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const generateStaircasePath = () => {
        if (data.length < 2) return "";
        const step = chartWidth / (data.length - 1);

        let path = '';
        data.forEach((d, i) => {
            const x = padding.left + i * step;
            const y = padding.top + chartHeight - ((d.value - stats.min) / stats.range) * chartHeight;

            if (i === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${padding.top + chartHeight - ((data[i - 1].value - stats.min) / stats.range) * chartHeight}`;
                path += ` L ${x} ${y}`;
            }
        });
        return path;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!svgRef.current || data.length < 2) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - padding.left;
        const step = chartWidth / (data.length - 1);
        const index = Math.round(mouseX / step);
        if (index >= 0 && index < data.length) {
            setHoverIndex(index);
        } else {
            setHoverIndex(null);
        }
    };

    return (
        <div className="flex flex-col space-y-4 bg-white p-4 md:p-6 border-4 border-black hover:bg-gray-50 transition-all group overflow-hidden min-h-[200px]">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {icon}
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {label}
                        </p>
                    </div>
                    <p className="text-2xl font-bold text-black tracking-tight font-mono-space">
                        {formatCurrency(hoverIndex !== null ? data[hoverIndex].value : currentVal, mainCurrency)}
                    </p>
                    {hoverIndex !== null && (
                        <p className="text-[10px] font-bold text-[var(--action-blue)] uppercase">
                            {data[hoverIndex].date} • {data[hoverIndex].time}
                        </p>
                    )}
                </div>
                <div
                    className={`px-3 py-1 border-2 text-[10px] font-bold uppercase transition-colors ${isUp
                        ? 'bg-[var(--success-green)]/10 border-[var(--success-green)] text-[var(--success-green)]'
                        : 'bg-[var(--heart-red)]/10 border-[var(--heart-red)] text-[var(--heart-red)]'
                        }`}
                >
                    {isUp ? '↑ ALCISTA' : '↓ BAJISTA'}
                </div>
            </div>

            {/* Staircase Chart with Axes */}
            <div className="relative w-full h-24 md:h-32 mt-4">
                {data.length < 2 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm font-bold uppercase">
                        <span>⏳ Esperando datos...</span>
                    </div>
                ) : (
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <defs>
                            <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Y-Axis Labels */}
                        <text x={padding.left - 5} y={padding.top + 5} textAnchor="end" className="text-[8px] font-bold fill-gray-400">
                            {formatCurrency(stats.max, mainCurrency).split(',')[0]}
                        </text>
                        <text x={padding.left - 5} y={padding.top + chartHeight} textAnchor="end" className="text-[8px] font-bold fill-gray-400">
                            {formatCurrency(stats.min, mainCurrency).split(',')[0]}
                        </text>

                        {/* Grid Lines */}
                        <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="#eee" strokeWidth="1" />
                        <line x1={padding.left} y1={padding.top + chartHeight} x2={width - padding.right} y2={padding.top + chartHeight} stroke="#ddd" strokeWidth="2" />
                        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#ddd" strokeWidth="2" />

                        {/* Area under line */}
                        {data.length >= 2 && (
                            <path
                                d={`${generateStaircasePath()} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
                                fill={`url(#grad-${label.replace(/\s/g, '')})`}
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Staircase line */}
                        {data.length >= 2 && (
                            <path
                                d={generateStaircasePath()}
                                fill="none"
                                stroke={color}
                                strokeWidth="2.5"
                                strokeLinecap="square"
                                strokeLinejoin="miter"
                                className="transition-all duration-300"
                            />
                        )}

                        {/* X-Axis Labels */}
                        {data.length > 0 && (
                            <>
                                <text x={padding.left} y={height - 5} textAnchor="start" className="text-[8px] font-bold fill-gray-400">
                                    {data[0].time}
                                </text>
                                <text x={padding.left + chartWidth} y={height - 5} textAnchor="end" className="text-[8px] font-bold fill-gray-400">
                                    {data[data.length - 1].time}
                                </text>
                            </>
                        )}

                        {/* Interaction Line & Point */}
                        {hoverIndex !== null && (
                            <>
                                <line
                                    x1={padding.left + (hoverIndex * chartWidth) / (data.length - 1)}
                                    y1={padding.top}
                                    x2={padding.left + (hoverIndex * chartWidth) / (data.length - 1)}
                                    y2={padding.top + chartHeight}
                                    stroke={color}
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                />
                                <rect
                                    x={padding.left + (hoverIndex * chartWidth) / (data.length - 1) - 3}
                                    y={padding.top + chartHeight - ((data[hoverIndex].value - stats.min) / stats.range) * chartHeight - 3}
                                    width="6"
                                    height="6"
                                    fill={color}
                                    stroke="white"
                                    strokeWidth="1"
                                />
                            </>
                        )}
                    </svg>
                )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-tight pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--action-blue)] animate-pixel-pulse rounded-full" />
                    TIEMPO REAL
                </span>
                <span className="text-gray-300 italic">TRACKING EN VIVO</span>
            </div>
        </div>
    );
}
