import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'blue' | 'purple' | 'orange' | 'teal' | 'white' | 'dark';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: ReactNode;
    fullWidth?: boolean;
    icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    blue: 'bg-[var(--action-blue)] text-white',
    purple: 'bg-[var(--action-purple)] text-white',
    orange: 'bg-[var(--action-orange)] text-black',
    teal: 'bg-[var(--cool-teal)] text-white',
    white: 'bg-white text-black',
    dark: 'bg-black text-white',
};

export function PixelButton({
    variant = 'blue',
    children,
    fullWidth = false,
    icon,
    className,
    ...props
}: PixelButtonProps) {
    return (
        <button
            className={twMerge(
                clsx(
                    'pixel-button',
                    'flex items-center justify-center gap-2',
                    'shadow-[4px_4px_0px_black]',
                    'hover:brightness-110 transition-all',
                    variantClasses[variant],
                    fullWidth && 'w-full',
                    className
                )
            )}
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
}
