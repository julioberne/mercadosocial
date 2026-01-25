import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface PriceCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    subtitle: string;
    highlight?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    borderColor?: string;
}

export function PriceCard({
    title,
    value,
    icon,
    subtitle,
    highlight = false,
    trend,
    trendValue,
    borderColor,
}: PriceCardProps) {
    return (
        <div
            className={clsx(
                'pixel-panel p-5 flex flex-col justify-between min-h-[140px]',
                highlight && 'border-l-[12px]',
                borderColor
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold opacity-80 uppercase">{title}</span>
                <div
                    className={clsx(
                        'p-2 border-4 border-black',
                        highlight ? 'bg-[var(--action-purple)]/20' : 'bg-[var(--background-dots)]'
                    )}
                >
                    {icon}
                </div>
            </div>

            <div className="mb-2 w-full overflow-hidden">
                <div className="text-3xl md:text-4xl font-bold tracking-tight leading-none break-words">
                    {value}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm font-bold opacity-60 uppercase">{subtitle}</p>
                {trend && trendValue && (
                    <span
                        className={clsx(
                            'text-sm font-bold uppercase',
                            trend === 'up' && 'text-[var(--success-green)]',
                            trend === 'down' && 'text-[var(--heart-red)]',
                            trend === 'neutral' && 'opacity-60'
                        )}
                    >
                        {trend === 'up' && '▲ '}
                        {trend === 'down' && '▼ '}
                        {trendValue}
                    </span>
                )}
            </div>

            <div className="h-2 bg-black w-full mt-3" />
        </div>
    );
}
