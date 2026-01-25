import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { CurrencyCode } from '../../../shared/types';
import { CURRENCY_OPTIONS, formatInputRealTime, unformatValue } from '../../../shared/lib/currency';
import { PixelButton, PixelInput, PixelSelect } from '../../../shared/ui';

interface VoteInputProps {
    mainCurrency: CurrencyCode;
    onVote: (val: number, cur: CurrencyCode) => void;
    onValidationError?: (message: string) => void;
    validateFn?: (val: number, cur: CurrencyCode) => { valid: boolean; message?: string };
}

export function VoteInput({
    mainCurrency,
    onVote,
    onValidationError,
    validateFn,
}: VoteInputProps) {
    const [voteDisplay, setVoteDisplay] = useState('');
    const [voteCurrency, setVoteCurrency] = useState<CurrencyCode>(mainCurrency);

    const handleSubmit = () => {
        const val = unformatValue(voteDisplay);
        if (isNaN(val) || val <= 0) {
            onValidationError?.('Por favor ingresa un valor válido');
            return;
        }

        if (validateFn) {
            const result = validateFn(val, voteCurrency);
            if (!result.valid) {
                onValidationError?.(result.message || 'Valor inválido');
                return;
            }
        }

        onVote(val, voteCurrency);
        setVoteDisplay('');
    };

    return (
        <section className="pixel-panel p-8 bg-white text-black shadow-[8px_8px_0px_black]">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-[var(--cool-teal)] p-3 border-4 border-black">
                    <BarChart3 size={28} className="text-white" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold uppercase text-black">VOTAR VALOR</h3>
                    <p className="text-sm opacity-70 uppercase text-black">Ayuda a establecer el promedio social</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block mb-2 text-lg font-bold uppercase text-black">
                        TU ESTIMACIÓN
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <PixelSelect
                            value={voteCurrency}
                            onChange={(e) => setVoteCurrency(e.target.value as CurrencyCode)}
                            options={CURRENCY_OPTIONS.map((o) => ({ value: o.code, label: o.code }))}
                            className="bg-white border-black text-black font-bold"
                        />
                        <PixelInput
                            type="text"
                            placeholder="0"
                            value={voteDisplay}
                            onChange={(e) => setVoteDisplay(formatInputRealTime(e.target.value))}
                            className="flex-1 text-right text-2xl bg-white border-black text-black placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <PixelButton
                    variant="orange"
                    fullWidth
                    onClick={handleSubmit}
                    className="text-xl py-4"
                >
                    ENVIAR VOTO
                </PixelButton>

                <p className="text-center text-xs opacity-50 uppercase text-black">
                    Tu voto influye en el índice de sentimiento social
                </p>
            </div>
        </section>
    );
}
