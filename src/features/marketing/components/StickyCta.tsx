import { useState, useEffect } from 'react';
import { TrendingUp, ChevronUp } from 'lucide-react';

interface StickyCtaProps {
    onCtaClick: () => void;
    ctaText?: string;
    showAfterScroll?: number; // px después de los cuales aparece
}

/**
 * @StickyCta
 * Botón flotante de CTA que aparece al hacer scroll.
 * Siempre visible para capturar la intención de compra.
 */
export function StickyCta({
    onCtaClick,
    ctaText = "PROPONER MI PRECIO",
    showAfterScroll = 300
}: StickyCtaProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsVisible(scrollY > showAfterScroll);
            setShowScrollTop(scrollY > 800);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showAfterScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
            <div className="max-w-lg mx-auto flex items-center gap-3 pointer-events-auto">
                {/* Main CTA Button */}
                <button
                    onClick={onCtaClick}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-200 border-2 border-white/20"
                >
                    <TrendingUp size={20} />
                    <span className="uppercase tracking-wide">{ctaText}</span>
                </button>

                {/* Scroll to top button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="bg-white/20 backdrop-blur hover:bg-white/30 text-white p-4 rounded-xl transition-all"
                        aria-label="Volver arriba"
                    >
                        <ChevronUp size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}
