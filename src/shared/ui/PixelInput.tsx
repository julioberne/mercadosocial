import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InputHTMLAttributes } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
    dark?: boolean;
}

export function PixelInput({
    fullWidth = false,
    dark = false,
    className,
    ...props
}: PixelInputProps) {
    return (
        <input
            className={twMerge(
                clsx(
                    'pixel-input',
                    fullWidth && 'w-full',
                    dark && 'bg-white/5 border-white/20 text-white placeholder:text-white/30',
                    className
                )
            )}
            {...props}
        />
    );
}

interface PixelSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
    dark?: boolean;
}

export function PixelSelect({
    options,
    dark = false,
    className,
    ...props
}: PixelSelectProps) {
    return (
        <select
            className={twMerge(
                clsx(
                    'pixel-input cursor-pointer',
                    dark && 'bg-white/10 border-white/20 text-white',
                    className
                )
            )}
            {...props}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

interface PixelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    dark?: boolean;
}

export function PixelTextarea({
    dark = false,
    className,
    ...props
}: PixelTextareaProps) {
    return (
        <textarea
            className={twMerge(
                clsx(
                    'pixel-input resize-none',
                    dark && 'bg-white/5 border-white/20 text-white placeholder:text-white/30',
                    className
                )
            )}
            {...props}
        />
    );
}
