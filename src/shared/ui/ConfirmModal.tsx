import { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { PixelButton } from './PixelButton';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'success' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'CONFIRMAR',
    cancelText = 'CANCELAR',
    variant = 'warning',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    // Focus trap and prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const icons = {
        warning: <AlertTriangle size={48} className="text-[var(--action-orange)]" />,
        success: <CheckCircle size={48} className="text-[var(--success-green)]" />,
        danger: <AlertTriangle size={48} className="text-[var(--heart-red)]" />,
    };

    const confirmColors = {
        warning: 'orange',
        success: 'blue',
        danger: 'orange',
    } as const;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            ref={modalRef}
            tabIndex={-1}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative pixel-panel p-0 max-w-md w-full animate-scale-in bg-white">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        {icons[variant]}
                    </div>

                    <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
                        {title}
                    </h3>

                    <p className="text-gray-600 mb-8">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <PixelButton
                            variant="white"
                            onClick={onCancel}
                            className="min-w-[120px]"
                        >
                            {cancelText}
                        </PixelButton>
                        <PixelButton
                            variant={confirmColors[variant]}
                            onClick={onConfirm}
                            className="min-w-[120px]"
                        >
                            {confirmText}
                        </PixelButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
