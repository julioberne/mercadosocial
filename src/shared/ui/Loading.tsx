interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizes[size]} border-black border-t-transparent rounded-full animate-spin`}
            />
            {text && (
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}

// Skeleton loading for cards
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`bg-gray-200 animate-pulse rounded ${className}`}
        />
    );
}

// Skeleton for a card
export function CardSkeleton() {
    return (
        <div className="pixel-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4 mt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}

// Full page loading
export function PageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background-dots)]">
            <div className="pixel-panel p-12 text-center">
                <LoadingSpinner size="lg" />
                <h2 className="mt-6 text-2xl font-bold uppercase tracking-tight">
                    CARGANDO MERCADO
                </h2>
                <p className="mt-2 text-sm font-bold text-gray-500 uppercase">
                    Sincronizando datos...
                </p>
            </div>
        </div>
    );
}
