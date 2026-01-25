import { useState, useEffect } from 'react';
import type { CurrencyCode } from '../../../shared/types';

// Fallback rates in case API fails
const FALLBACK_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    COP: 4000,
    MXN: 18
};

export function useExchangeRates() {
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRates() {
            try {
                // Usamos ExchangeRate-API (Gratuita, no requiere API Key para rates base USD)
                // Documentación: https://www.exchangerate-api.com/docs/free
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();

                if (data && data.rates) {
                    setRates({
                        USD: 1,
                        COP: data.rates.COP || FALLBACK_RATES.COP,
                        MXN: data.rates.MXN || FALLBACK_RATES.MXN
                    });
                }
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRates();

        // Auto-update cada 1 hora para mantener precisión sin saturar la red
        const interval = setInterval(fetchRates, 3600000);
        return () => clearInterval(interval);
    }, []);

    return { rates, loading };
}
