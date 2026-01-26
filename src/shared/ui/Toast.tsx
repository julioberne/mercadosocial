import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={24} className="text-[var(--success-green)]" />,
        error: <XCircle size={24} className="text-[var(--heart-red)]" />,
        warning: <AlertTriangle size={24} className="text-[var(--action-orange)]" />,
    };

    const bgColors = {
        success: 'border-l-[var(--success-green)] bg-[var(--success-green)]/10',
        error: 'border-l-[var(--heart-red)] bg-[var(--heart-red)]/10',
        warning: 'border-l-[var(--action-orange)] bg-[var(--action-orange)]/10',
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ${isVisible ? 'animate-slide-in-right opacity-100' : 'opacity-0 translate-x-full'
                }`}
        >
            <div className={`pixel-panel border-l-8 ${bgColors[type]} p-4`}>
                <div className="flex items-start gap-3">
                    {icons[type]}
                    <div className="flex-1">
                        <p className="font-bold text-sm uppercase">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Toast Container for multiple toasts
interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContainerProps {
    toasts: ToastItem[];
    onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ transform: `translateY(${index * 10}px)` }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => onRemove(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
}

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return { toasts, showToast, removeToast };
}
