import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HTMLAttributes, ReactNode } from 'react';

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    header?: ReactNode;
    noPadding?: boolean;
    variant?: 'default' | 'dark' | 'teal' | 'cool';
}

const variantClasses = {
    default: 'bg-white',
    dark: 'bg-slate-900 text-white',
    teal: 'bg-[var(--cool-teal)] text-white shadow-[8px_8px_0px_black]',
    cool: 'bg-[var(--surface-muted)]',
};

export function PixelPanel({
    children,
    header,
    noPadding = false,
    variant = 'default',
    className,
    ...props
}: PixelPanelProps) {
    return (
        <div
            className={twMerge(
                clsx(
                    'pixel-panel overflow-hidden',
                    variantClasses[variant],
                    className
                )
            )}
            {...props}
        >
            {header && (
                <div className="pixel-panel-header p-3 font-bold text-xl uppercase">
                    {header}
                </div>
            )}
            <div className={clsx(!noPadding && 'p-6')}>
                {children}
            </div>
        </div>
    );
}
