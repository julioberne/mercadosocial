import { useState, useCallback, useMemo, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import type { Opinion, CurrencyCode } from '../../../shared/types';
import { formatCurrency, CURRENCY_OPTIONS, formatInputRealTime, unformatValue } from '../../../shared/lib/currency';
import { validateTripleLimit } from '../../../shared/lib/validators';
import { PixelButton } from '../../../shared/ui';

const COLLAPSED_ITEMS = 5;
const EXPANDED_ITEMS = 15;

// Colores por sentimiento
const SENTIMENT_COLORS = {
    positive: 'text-[var(--success-green)]',
    neutral: 'text-[var(--action-blue)]',
    negative: 'text-[var(--action-orange)]'
};

const SENTIMENT_BG = {
    positive: 'bg-[var(--success-green)]/5 border-l-4 border-[var(--success-green)]',
    neutral: 'bg-[var(--action-blue)]/5 border-l-4 border-[var(--action-blue)]',
    negative: 'bg-[var(--action-orange)]/5 border-l-4 border-[var(--action-orange)]'
};

interface OpinionsWallProps {
    opinions: Opinion[];
    onAddOpinion: (author: string, content: string, value: number, currency: CurrencyCode) => Promise<void>;
    mainCurrency: CurrencyCode;
    ownerPrice: number;
    ownerCurrency: CurrencyCode;
    rates: Record<string, number>;
}

export function OpinionsWall({ opinions, onAddOpinion, mainCurrency, ownerPrice, ownerCurrency, rates }: OpinionsWallProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newAuthor, setNewAuthor] = useState('');
    const [newContent, setNewContent] = useState('');
    const [valueDisplay, setValueDisplay] = useState(''); // Formateado con separadores
    const [newCurrency, setNewCurrency] = useState<CurrencyCode>(mainCurrency);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [valueError, setValueError] = useState('');

    // Función de conversión dinámica
    const convertDynamic = useCallback((amount: number, from: CurrencyCode, to: CurrencyCode) => {
        if (from === to) return amount;
        const inUSD = amount / (rates[from] || 1);
        return inUSD * (rates[to] || 1);
    }, [rates]);

    // Validar tope triple
    const validateValue = useCallback((val: number, cur: CurrencyCode) => {
        return validateTripleLimit(val, cur, ownerPrice, ownerCurrency);
    }, [ownerPrice, ownerCurrency]);

    // Handler para cambio de valor con formateo
    const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatInputRealTime(rawValue);
        setValueDisplay(formatted);

        // Validar
        const numValue = unformatValue(formatted);
        if (numValue > 0) {
            const validation = validateValue(numValue, newCurrency);
            setValueError(validation.valid ? '' : validation.message || 'Valor inválido');
        } else {
            setValueError('');
        }
    }, [newCurrency, validateValue]);

    // Handler para cambio de moneda con conversión
    const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCur = e.target.value as CurrencyCode;
        const oldCur = newCurrency;

        // Convertir el valor actual a la nueva moneda
        const currentValue = unformatValue(valueDisplay);
        if (currentValue > 0) {
            const convertedValue = convertDynamic(currentValue, oldCur, newCur);
            const formatted = formatInputRealTime(Math.round(convertedValue).toString());
            setValueDisplay(formatted);

            // Revalidar con nueva moneda
            const validation = validateValue(unformatValue(formatted), newCur);
            setValueError(validation.valid ? '' : validation.message || 'Valor inválido');
        }

        setNewCurrency(newCur);
    }, [newCurrency, valueDisplay, convertDynamic, validateValue]);

    const sortedOpinions = useMemo(() => {
        return [...opinions].sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
            return timeB - timeA;
        });
    }, [opinions]);

    const visibleOpinions = isExpanded
        ? sortedOpinions.slice(0, EXPANDED_ITEMS)
        : sortedOpinions.slice(0, COLLAPSED_ITEMS);

    const showToggle = sortedOpinions.length > COLLAPSED_ITEMS;
    const remainingCount = sortedOpinions.length - COLLAPSED_ITEMS;

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = unformatValue(valueDisplay);
        if (!newContent.trim() || value <= 0 || valueError) return;

        setIsSubmitting(true);
        await onAddOpinion(newAuthor.trim(), newContent.trim(), value, newCurrency);

        // Limpiar formulario
        setNewAuthor('');
        setNewContent('');
        setValueDisplay('');
        setValueError('');
        setIsSubmitting(false);
    };

    const getTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const time = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const diff = now.getTime() - time.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'AHORA';
        if (minutes < 60) return `HACE ${minutes}M`;
        if (hours < 24) return `HACE ${hours}H`;
        if (days < 7) return `HACE ${days}D`;
        return time.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    };

    return (
        <section className="pixel-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle size={18} className="text-[var(--action-purple)]" />
                    HISTORIAL DE OPINIONES
                    <span className="text-[var(--action-purple)] ml-1">
                        [{sortedOpinions.length} OPINIONES]
                    </span>
                </h3>
                <span className="text-xs font-bold text-[var(--success-green)] flex items-center gap-1">
                    <span className="w-2 h-2 bg-[var(--success-green)] animate-pixel-pulse rounded-full" />
                    SOCIAL FEED
                </span>
            </div>

            {/* Formulario para agregar opinión */}
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[var(--background-dots)] border-4 border-black">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Tu nombre (opcional)"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="pixel-input p-3 border-4 border-black font-bold uppercase text-sm"
                    />
                    <div className="md:col-span-3">
                        <textarea
                            placeholder="Escribe tu opinión sobre el precio..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="pixel-input w-full p-3 border-4 border-black font-bold text-sm min-h-[60px] resize-none"
                            rows={2}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <select
                                value={newCurrency}
                                onChange={handleCurrencyChange}
                                className="pixel-input p-3 border-4 border-black font-bold text-sm uppercase"
                            >
                                {CURRENCY_OPTIONS.map(opt => (
                                    <option key={opt.code} value={opt.code}>{opt.symbol} {opt.code}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Valor"
                                value={valueDisplay}
                                onChange={handleValueChange}
                                className={`pixel-input w-32 p-3 border-4 font-bold text-sm text-right ${valueError ? 'border-red-500 bg-red-50' : 'border-black'
                                    }`}
                            />
                        </div>
                        {valueError && (
                            <span className="text-xs font-bold text-red-500 uppercase">{valueError}</span>
                        )}
                    </div>
                    <PixelButton
                        type="submit"
                        variant="purple"
                        disabled={isSubmitting || !newContent.trim() || !valueDisplay || !!valueError}
                        className="flex items-center gap-2"
                    >
                        <Send size={16} />
                        {isSubmitting ? 'ENVIANDO...' : 'PUBLICAR OPINIÓN'}
                    </PixelButton>
                </div>
            </form>

            {/* Lista de opiniones */}
            {sortedOpinions.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-sm font-bold opacity-40 uppercase">SIN OPINIONES AÚN</p>
                    <p className="text-xs opacity-30 mt-2">¡Sé el primero en opinar!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {visibleOpinions.map((opinion) => (
                            <div
                                key={opinion.id}
                                className={`p-4 border-4 border-black ${SENTIMENT_BG[opinion.sentiment]} hover:shadow-[4px_4px_0px_black] transition-all`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold uppercase ${SENTIMENT_COLORS[opinion.sentiment]}`}>
                                        VALORADO EN {formatCurrency(opinion.value, opinion.currency)}
                                    </span>
                                    <span className="text-[10px] font-bold opacity-40 uppercase">
                                        {getTimeAgo(opinion.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed mb-3">
                                    "{opinion.content}"
                                </p>
                                <div className="flex justify-between items-center pt-2 border-t border-black/10">
                                    <span className="text-xs font-bold opacity-50 uppercase">
                                        — {opinion.author}
                                    </span>
                                    <span className={`text-sm font-bold ${SENTIMENT_COLORS[opinion.sentiment]}`}>
                                        {formatCurrency(opinion.value, opinion.currency)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showToggle && (
                        <PixelButton
                            variant="purple"
                            fullWidth
                            onClick={toggleExpanded}
                            className="mt-4 flex items-center justify-center gap-2"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp size={18} />
                                    COLAPSAR OPINIONES
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={18} />
                                    VER MÁS OPINIONES ({remainingCount} más)
                                </>
                            )}
                        </PixelButton>
                    )}
                </>
            )}
        </section>
    );
}
