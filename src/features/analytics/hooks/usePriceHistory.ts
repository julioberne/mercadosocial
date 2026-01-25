import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import type { HistoryPoint, CurrencyCode } from '../../../shared/types';

interface UsePriceHistoryReturn {
    priceHistory: HistoryPoint[];
    loading: boolean;
    addPricePoint: (price: number, currency: CurrencyCode) => Promise<void>;
    reloadHistory: () => Promise<void>;
}

export function usePriceHistory(
    productId: number,
    mainCurrency: CurrencyCode,
    rates: Record<string, number>
): UsePriceHistoryReturn {
    const [priceHistory, setPriceHistory] = useState<HistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);

    // Función de conversión dinámica
    const convertToMain = useCallback((amount: number, from: CurrencyCode) => {
        if (from === mainCurrency) return amount;
        const inUSD = amount / (rates[from] || 1);
        return inUSD * (rates[mainCurrency] || 1);
    }, [mainCurrency, rates]);

    // Cargar historial desde la DB
    const loadHistory = useCallback(async () => {
        console.log('📊 Cargando historial de precios...');
        const { data, error } = await supabase
            .from('price_history')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: true })
            .limit(50); // Últimos 50 puntos

        if (error) {
            console.error('❌ Error cargando historial de precios:', error.message);
            setLoading(false);
            return;
        }

        if (data && data.length > 0) {
            const mapped: HistoryPoint[] = data.map((p: any) => {
                const date = new Date(p.created_at);
                // Convertir a moneda principal
                const valueInMain = convertToMain(p.price, p.currency as CurrencyCode);
                return {
                    value: valueInMain,
                    time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
                };
            });
            setPriceHistory(mapped);
            console.log('✅ Historial de precios cargado:', mapped.length, 'puntos');
        }
        setLoading(false);
    }, [productId, convertToMain]);

    // Cargar al inicio
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Suscripción Realtime para actualizaciones
    useEffect(() => {
        const channel = supabase
            .channel(`price_history_product_${productId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'price_history', filter: `product_id=eq.${productId}` },
                (payload) => {
                    console.log('📊 Nuevo precio recibido via Realtime');
                    const p = payload.new as any;
                    const date = new Date(p.created_at);
                    const valueInMain = convertToMain(p.price, p.currency as CurrencyCode);

                    const newPoint: HistoryPoint = {
                        value: valueInMain,
                        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
                    };

                    setPriceHistory(prev => [...prev.slice(-49), newPoint]);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('🟢 Realtime price_history: CONNECTED');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId, convertToMain]);

    // Agregar nuevo punto de precio
    const addPricePoint = useCallback(async (price: number, currency: CurrencyCode) => {
        const now = new Date();
        const valueInMain = convertToMain(price, currency);

        // Optimistic update
        const tempPoint: HistoryPoint = {
            value: valueInMain,
            time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
        };
        setPriceHistory(prev => [...prev.slice(-49), tempPoint]);

        // Guardar en DB
        const { error } = await supabase
            .from('price_history')
            .insert({
                product_id: productId,
                price,
                currency
            });

        if (error) {
            console.error('❌ Error guardando precio en historial:', error.message);
            // En caso de error, recargar desde DB
            loadHistory();
        }
    }, [productId, convertToMain, loadHistory]);

    return {
        priceHistory,
        loading,
        addPricePoint,
        reloadHistory: loadHistory
    };
}
