import type { CurrencyCode } from '../types';
import { convertAmount, formatCurrency } from './currency';

interface TripleLimitResult {
    valid: boolean;
    message?: string;
    limit?: number;
}

/**
 * Valida que un valor no exceda el triple del precio base.
 * Esta es una regla de seguridad crítica del sistema (Triple Limit).
 */
export function validateTripleLimit(
    amount: number,
    amountCurrency: CurrencyCode,
    basePrice: number,
    baseCurrency: CurrencyCode
): TripleLimitResult {
    // Convertir el monto a la moneda base para comparar
    const amountInBaseCurrency = convertAmount(amount, amountCurrency, baseCurrency);
    const limitInBaseCurrency = basePrice * 3;

    if (Math.abs(amountInBaseCurrency) > limitInBaseCurrency) {
        // Convertir el límite a la moneda del usuario para el mensaje
        const localLimit = convertAmount(limitInBaseCurrency, baseCurrency, amountCurrency);

        return {
            valid: false,
            message: `ALERTA DE SEGURIDAD: El valor excede el triple permitido (±${formatCurrency(localLimit, amountCurrency)}). El máximo se basa en el precio original.`,
            limit: localLimit
        };
    }

    return { valid: true };
}

/**
 * Valida que un campo no esté vacío
 */
export function validateRequired(value: string, fieldName: string): string | null {
    if (!value || value.trim() === '') {
        return `${fieldName} es requerido`;
    }
    return null;
}

/**
 * Valida que un valor numérico sea positivo
 */
export function validatePositiveNumber(value: number): boolean {
    return !isNaN(value) && value > 0;
}
