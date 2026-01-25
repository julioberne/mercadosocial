import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Offer, CurrencyCode, OfferStatus, HistoryPoint } from '../../../shared/types';
import { supabase } from '../../../shared/lib/supabase';

export function useOffers(mainCurrency: CurrencyCode, productId: number = 1, rates: Record<CurrencyCode, number> = { USD: 1, COP: 4000, MXN: 18 }) {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [offerHistory, setOfferHistory] = useState<HistoryPoint[]>([]);

    // Función de carga de ofertas - ahora es reutilizable
    const loadOffers = useCallback(async () => {
        console.log('🔄 Loading offers from DB...');
        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: true }); // Cambiado a ascending para historial cronológico

        if (error) {
            console.error('❌ Error loading offers:', error);
            return;
        }

        if (data) {
            console.log('✅ Offers loaded:', data.length);
            const mappedOffers: Offer[] = data.map(o => ({
                id: o.id,
                bidder: o.bidder_name,
                amount: Number(o.amount),
                cur: o.currency as CurrencyCode,
                status: o.status as OfferStatus,
                date: new Date(o.created_at).toLocaleDateString('es-ES'),
                createdAt: new Date(o.created_at) // Guardar timestamp para historial
            }));

            // Invertir para mostrar más recientes primero en la lista
            setOffers([...mappedOffers].reverse());

            // Generar historial basado en timestamps REALES de la DB
            if (mappedOffers.length > 0) {
                const historyMap = new Map<string, { values: number[], time: string, date: string }>();

                mappedOffers.forEach((o: any) => {
                    const ts = o.createdAt;
                    const timeKey = ts.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    const dateKey = ts.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                    const key = `${dateKey}-${timeKey}`;

                    // Convertir a moneda principal
                    const inMain = (o.amount / (rates[o.cur as CurrencyCode] || 1)) * (rates[mainCurrency] || 1);

                    if (!historyMap.has(key)) {
                        historyMap.set(key, { values: [], time: timeKey, date: dateKey });
                    }
                    historyMap.get(key)!.values.push(inMain);
                });

                // Calcular máxima oferta acumulativa para cada punto
                const historyPoints: HistoryPoint[] = [];
                let maxOffer = 0;

                Array.from(historyMap.values()).forEach(point => {
                    const pointMax = Math.max(...point.values);
                    maxOffer = Math.max(maxOffer, pointMax);
                    historyPoints.push({
                        value: maxOffer,
                        time: point.time,
                        date: point.date
                    });
                });

                // Limitar a últimos 15 puntos
                setOfferHistory(historyPoints.slice(-15));
                console.log('📊 Offer history generated:', historyPoints.length, 'points');
            } else {
                setOfferHistory([]);
            }
        }
    }, [productId, rates, mainCurrency]);

    // Cargar ofertas iniciales y suscribirse
    useEffect(() => {
        loadOffers();

        // Suscripción Realtime (INSERT y UPDATE)
        const channel = supabase
            .channel('public:offers')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'offers', filter: `product_id=eq.${productId}` },
                (payload) => {
                    console.log('📡 Realtime Offer received:', payload);
                    if (payload.eventType === 'INSERT') {
                        const newOfferRaw = payload.new;
                        const newOffer: Offer = {
                            id: newOfferRaw.id,
                            bidder: newOfferRaw.bidder_name,
                            amount: Number(newOfferRaw.amount),
                            cur: newOfferRaw.currency as CurrencyCode,
                            status: newOfferRaw.status as OfferStatus,
                            date: new Date(newOfferRaw.created_at).toLocaleDateString('es-ES')
                        };
                        // Solo agregar si no existe ya (evitar duplicados con optimistic update)
                        setOffers(prev => {
                            const exists = prev.some(o => o.id === newOffer.id);
                            if (exists) return prev;
                            return [newOffer, ...prev];
                        });

                        // Actualizar historial con la nueva oferta
                        const inMain = (newOffer.amount / (rates[newOffer.cur] || 1)) * (rates[mainCurrency] || 1);
                        setOfferHistory(prev => {
                            const now = new Date();
                            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

                            // Obtener máxima oferta actual del historial
                            const currentMax = prev.length > 0 ? Math.max(...prev.map(p => p.value)) : 0;
                            const newMax = Math.max(currentMax, inMain);

                            const newPoint = { value: newMax, time, date };
                            return [...prev.slice(-14), newPoint];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new;
                        setOffers(prev => prev.map(o =>
                            o.id === updated.id ? { ...o, status: updated.status as OfferStatus } : o
                        ));
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Offers Realtime CONNECTED - Listening for new offers');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Offers Realtime FAILED - Check Supabase Realtime settings');
                } else if (status === 'TIMED_OUT') {
                    console.error('⏱️ Offers Realtime TIMEOUT');
                } else {
                    console.log('🔄 Offers Channel Status:', status);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId, loadOffers]);



    const addOffer = useCallback(async (bidder: string, amount: number, cur: CurrencyCode) => {
        // OPTIMISTIC UPDATE: Agregar inmediatamente al estado local
        const optimisticOffer: Offer = {
            id: Date.now(), // Temporal ID
            bidder,
            amount,
            cur,
            status: 'pending',
            date: new Date().toLocaleDateString('es-ES')
        };
        setOffers(prev => [optimisticOffer, ...prev]);
        console.log('📝 Offer added optimistically:', optimisticOffer);

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('offers')
            .insert({
                bidder_name: bidder,
                amount: amount,
                currency: cur,
                product_id: productId
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error enviando oferta:', error);
            // Revertir si hay error
            setOffers(prev => prev.filter(o => o.id !== optimisticOffer.id));
        } else if (data) {
            console.log('✅ Offer saved to DB:', data.id);
            // Actualizar el ID temporal con el real
            setOffers(prev => prev.map(o =>
                o.id === optimisticOffer.id
                    ? { ...o, id: data.id }
                    : o
            ));
        }
    }, [productId]);

    const updateOfferStatus = useCallback(async (offerId: number, status: OfferStatus) => {
        // Esto debería estar protegido en backend, pero para demo sirve
        const { error } = await supabase
            .from('offers')
            .update({ status })
            .eq('id', offerId);

        if (error) {
            console.error('Error actualizando oferta:', error);
        }
    }, []);

    const acceptOffer = useCallback((offerId: number) => {
        // Aceptar una, rechazar las demás pendientes
        // Esto es lógica compleja, para demo simplificamos:
        // Update de la aceptada. (Las demás quedarían pendientes o habría que hacer batch update)
        updateOfferStatus(offerId, 'accepted');
    }, [updateOfferStatus]);

    const clearOffers = useCallback(() => {
        setOffers([]);
        setOfferHistory([]);
    }, []);

    // Calcular estadísticas de ofertas
    const stats = useMemo(() => {
        const convertedOffers = offers.map(o => ({
            ...o,
            amountInMain: (o.amount / (rates[o.cur] || 1)) * (rates[mainCurrency] || 1)
        }));

        const maxOffer = convertedOffers.length
            ? Math.max(...convertedOffers.map(o => o.amountInMain))
            : 0;

        const avgOffer = convertedOffers.length
            ? convertedOffers.reduce((a, b) => a + b.amountInMain, 0) / convertedOffers.length
            : 0;

        const pendingCount = offers.filter(o => o.status === 'pending').length;
        const acceptedOffer = offers.find(o => o.status === 'accepted');

        return {
            totalOffers: offers.length,
            filteredOffers: offers.length,
            maxOffer,
            avgOffer,
            pendingCount,
            acceptedOffer,
        };
    }, [offers, mainCurrency, rates]);

    // Actualizar historial cuando cambia el promedio
    useEffect(() => {
        if (stats.avgOffer > 0) {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            setOfferHistory(prev => {
                const newPoint = { value: stats.avgOffer, time, date };
                const last = prev[prev.length - 1];
                if (last && last.time === time && last.value === newPoint.value) return prev;
                return [...prev.slice(-14), newPoint];
            });
        }
    }, [stats.avgOffer]);

    return {
        offers,
        offerHistory,
        stats,
        addOffer,
        updateOfferStatus,
        acceptOffer,
        clearOffers,
        reloadOffers: loadOffers,
    };
}
