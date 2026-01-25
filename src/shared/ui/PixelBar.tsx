import { clsx } from 'clsx';

interface PixelBarProps {
    value: number; // 0-100
    color?: 'blue' | 'purple' | 'orange' | 'teal' | 'green' | 'black';
    label?: string;
    showValue?: string;
}

const colorClasses = {
    blue: 'bg-[var(--action-blue)]',
    purple: 'bg-[var(--action-purple)]',
    orange: 'bg-[var(--action-orange)]',
    teal: 'bg-[var(--cool-teal)]',
    green: 'bg-[var(--success-green)]',
    black: 'bg-black',
};

export function PixelBar({
    value,
    color = 'blue',
    label,
    showValue,
}: PixelBarProps) {
    return (
        <div>
            {(label || showValue) && (
                <div className="flex justify-between text-lg mb-1 font-bold uppercase">
                    {label && <span>{label}</span>}
                    {showValue && <span>{showValue}</span>}
                </div>
            )}
            <div className="pixel-bar">
                <div
                    className={clsx('pixel-bar-inner', colorClasses[color])}
                    style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
                />
            </div>
        </div>
    );
}
