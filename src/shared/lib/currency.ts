import type { CurrencyCode, CurrencyOption } from '../types';

// ===== TASAS DE CAMBIO =====
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    COP: 3800,
    MXN: 18
};

// ===== OPCIONES DE MONEDA =====
export const CURRENCY_OPTIONS: CurrencyOption[] = [
    { code: 'USD', symbol: '$', label: 'Dólar (USD)' },
    { code: 'COP', symbol: '$', label: 'Peso Col (COP)' },
    { code: 'MXN', symbol: '$', label: 'Peso Mex (MXN)' }
];

// ===== CONVERSIÓN DE MONTOS =====
export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const inUSD = amount / EXCHANGE_RATES[from];
    return inUSD * EXCHANGE_RATES[to];
}

// ===== FORMATO DE MONEDA =====
export function formatCurrency(value: number | null | undefined, currencyCode: CurrencyCode): string {
    if (value === null || value === undefined || isNaN(value)) return '$ 0';

    // Para valores grandes (>1000), usar sin decimales a menos que sean necesarios
    const maximumFractionDigits = value % 1 === 0 ? 0 : 2;
    const minimumFractionDigits = value % 1 === 0 ? 0 : 2;

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
}

// ===== FORMATO DE INPUT EN TIEMPO REAL =====
export function formatInputRealTime(val: string): string {
    if (!val) return "";

    // Eliminar todo excepto números
    const numericValue = val.replace(/\D/g, "");

    if (!numericValue) return "";

    // Limitar longitud para evitar overflow (ej. 15 dígitos)
    if (numericValue.length > 15) return formatInputRealTime(numericValue.slice(0, 15));

    // Formatear con puntos de mil
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ===== DESFORMATEAR VALOR =====
export function unformatValue(val: string): number {
    if (!val || val === '-') return 0;
    const cleanValue = val.toString().replace(/\./g, "");
    return parseFloat(cleanValue);
}

// ===== OBTENER SÍMBOLO DE MONEDA =====
export function getCurrencySymbol(code: CurrencyCode): string {
    const option = CURRENCY_OPTIONS.find(c => c.code === code);
    return option?.symbol || '$';
}
