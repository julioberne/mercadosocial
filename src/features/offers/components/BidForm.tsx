import { useState } from 'react';
import { TrendingUp, Lock } from 'lucide-react';
import type { CurrencyCode, ProductStatus } from '../../../shared/types';
import { CURRENCY_OPTIONS, formatInputRealTime, unformatValue } from '../../../shared/lib/currency';
import { PixelButton, PixelInput, PixelSelect } from '../../../shared/ui';

interface BidFormProps {
    productStatus: ProductStatus;
    mainCurrency: CurrencyCode;
    onBid: (bidder: string, amount: number, cur: CurrencyCode) => void;
    onValidationError?: (message: string) => void;
    validateFn?: (val: number, cur: CurrencyCode) => { valid: boolean; message?: string };
}

export function BidForm({
    productStatus,
    mainCurrency,
    onBid,
    onValidationError,
    validateFn,
}: BidFormProps) {
    const [bidderName, setBidderName] = useState('');
    const [offerDisplay, setOfferDisplay] = useState('');
    const [offerCurrency, setOfferCurrency] = useState<CurrencyCode>(mainCurrency);

    const handleSubmit = () => {
        if (productStatus !== 'open') return;

        const val = unformatValue(offerDisplay);
        if (!bidderName.trim()) {
            onValidationError?.('Por favor ingresa tu nombre');
            return;
        }
        if (isNaN(val) || val <= 0) {
            onValidationError?.('Por favor ingresa un monto válido');
            return;
        }

        if (validateFn) {
            const result = validateFn(val, offerCurrency);
            if (!result.valid) {
                onValidationError?.(result.message || 'Monto inválido');
                return;
            }
        }

        onBid(bidderName, val, offerCurrency);
        setBidderName('');
        setOfferDisplay('');
    };

    if (productStatus !== 'open') {
        return (
            <section className="pixel-panel p-8 bg-white text-black shadow-[8px_8px_0px_black]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[var(--action-orange)]/10 p-3 border-4 border-black">
                        <TrendingUp size={28} className="text-[var(--action-orange)]" />
                    </div>
                    <h3 className="text-3xl font-bold uppercase text-black">OFERTA DIRECTA</h3>
                </div>

                <div className="py-12 text-center bg-gray-50 border-4 border-black border-dashed">
                    <Lock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 font-bold uppercase text-sm tracking-widest">
                        NEGOCIACIÓN {productStatus === 'locked' ? 'BLOQUEADA' : 'FINALIZADA'}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="pixel-panel p-8 bg-white text-black shadow-[8px_8px_0px_black]">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-[var(--action-orange)]/10 p-3 border-4 border-black">
                    <TrendingUp size={28} className="text-[var(--action-orange)]" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold uppercase text-black">OFERTA DIRECTA</h3>
                    <p className="text-sm opacity-70 uppercase text-black">Negocia directamente con el vendedor</p>
                </div>
            </div>

            <div className="space-y-4">
                <PixelInput
                    type="text"
                    placeholder="TU NOMBRE / EMPRESA"
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    fullWidth
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <PixelSelect
                        value={offerCurrency}
                        onChange={(e) => setOfferCurrency(e.target.value as CurrencyCode)}
                        options={CURRENCY_OPTIONS.map((o) => ({ value: o.code, label: o.code }))}
                    />
                    <PixelInput
                        type="text"
                        placeholder="MONTO"
                        value={offerDisplay}
                        onChange={(e) => setOfferDisplay(formatInputRealTime(e.target.value))}
                        className="flex-1 text-right text-2xl"
                    />
                </div>

                <PixelButton
                    variant="orange"
                    fullWidth
                    onClick={handleSubmit}
                    className="text-xl py-4"
                >
                    ENVIAR PROPUESTA FORMAL
                </PixelButton>

                <div className="flex items-center justify-center gap-2 text-xs opacity-50 uppercase pt-2 text-black">
                    <span>🔒</span>
                    GARANTÍA ESCROW ACTIVADA
                </div>
            </div>
        </section>
    );
}
