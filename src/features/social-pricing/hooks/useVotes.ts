import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Vote, CurrencyCode, HistoryPoint } from '../../../shared/types';
import { supabase } from '../../../shared/lib/supabase';

export function useVotes(mainCurrency: CurrencyCode, productId: number = 1, rates: Record<CurrencyCode, number> = { USD: 1, COP: 4000, MXN: 18 }) {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [voteHistory, setVoteHistory] = useState<HistoryPoint[]>([]);

    // Función de carga de votos - ahora es reutilizable
    const loadVotes = useCallback(async () => {
        console.log('🔄 Loading votes from DB...');
        const { data, error } = await supabase
            .from('votes')
            .select('*')
            .eq('product_id', productId)
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('❌ Error loading votes:', error);
            return;
        }

        if (data) {
            console.log('✅ Votes loaded:', data.length);
            const mappedVotes = data.map(v => ({
                ...v,
                cur: v.currency,
                val: Number(v.value),
                timestamp: new Date(v.timestamp)
            }));
            setVotes(mappedVotes);

            // Generar historial basado en timestamps REALES de la DB
            if (mappedVotes.length > 0) {
                // Agrupar votos por hora para crear puntos de historial
                const historyMap = new Map<string, { values: number[], time: string, date: string }>();

                mappedVotes.forEach(v => {
                    const ts = v.timestamp;
                    const timeKey = ts.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    const dateKey = ts.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                    const key = `${dateKey}-${timeKey}`;

                    // Convertir a moneda principal
                    const inMain = (v.val / (rates[v.cur as CurrencyCode] || 1)) * (rates[mainCurrency] || 1);

                    if (!historyMap.has(key)) {
                        historyMap.set(key, { values: [], time: timeKey, date: dateKey });
                    }
                    historyMap.get(key)!.values.push(inMain);
                });

                // Calcular promedio acumulativo para cada punto
                const historyPoints: HistoryPoint[] = [];
                let allValues: number[] = [];

                Array.from(historyMap.values()).forEach(point => {
                    allValues = [...allValues, ...point.values];
                    const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
                    historyPoints.push({
                        value: avg,
                        time: point.time,
                        date: point.date
                    });
                });

                // Limitar a últimos 15 puntos
                setVoteHistory(historyPoints.slice(-15));
                console.log('📊 Vote history generated:', historyPoints.length, 'points');
            } else {
                setVoteHistory([]);
            }
        }
    }, [productId, rates, mainCurrency]);

    // Cargar votos iniciales y suscribirse
    useEffect(() => {
        loadVotes();

        const channel = supabase
            .channel('public:votes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'votes', filter: `product_id=eq.${productId}` },
                (payload) => {
                    console.log('📡 Realtime Vote received:', payload);
                    const newVoteRaw = payload.new;
                    const newVote: Vote = {
                        id: newVoteRaw.id,
                        val: Number(newVoteRaw.value),
                        cur: newVoteRaw.currency as CurrencyCode,
                        timestamp: new Date(newVoteRaw.timestamp)
                    };
                    // Solo agregar si no existe ya (evitar duplicados con optimistic update)
                    setVotes(prev => {
                        const exists = prev.some(v => v.id === newVote.id);
                        if (exists) return prev;
                        return [...prev, newVote];
                    });

                    // Actualizar historial con el nuevo voto
                    const inMain = (newVote.val / (rates[newVote.cur] || 1)) * (rates[mainCurrency] || 1);
                    setVoteHistory(prev => {
                        const now = newVote.timestamp;
                        const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

                        // Calcular nuevo promedio incluyendo todos los votos anteriores
                        const allValues = prev.map(p => p.value);
                        allValues.push(inMain);
                        const newAvg = allValues.reduce((a, b) => a + b, 0) / allValues.length;

                        const newPoint = { value: newAvg, time, date };
                        return [...prev.slice(-14), newPoint];
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Votes Realtime CONNECTED - Listening for new votes');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Votes Realtime FAILED - Check Supabase Realtime settings');
                } else if (status === 'TIMED_OUT') {
                    console.error('⏱️ Votes Realtime TIMEOUT');
                } else {
                    console.log('🔄 Votes Channel Status:', status);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId, loadVotes]);

    const addVote = useCallback(async (val: number, cur: CurrencyCode) => {
        // OPTIMISTIC UPDATE: Agregar inmediatamente al estado local
        const optimisticVote: Vote = {
            id: Date.now(), // Temporal ID
            val,
            cur,
            timestamp: new Date()
        };
        setVotes(prev => [...prev, optimisticVote]);
        console.log('📝 Vote added optimistically:', optimisticVote);

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('votes')
            .insert({
                value: val,
                currency: cur,
                product_id: productId
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error enviando voto:', error);
            // Revertir si hay error
            setVotes(prev => prev.filter(v => v.id !== optimisticVote.id));
        } else if (data) {
            console.log('✅ Vote saved to DB:', data.id);
            // Actualizar el ID temporal con el real
            setVotes(prev => prev.map(v =>
                v.id === optimisticVote.id
                    ? { ...v, id: data.id }
                    : v
            ));
        }
    }, [productId]);

    const clearVotes = useCallback(() => {
        // En un escenario real, esto tal vez no debería permitirse o requeriría permisos de admin
        setVotes([]);
        setVoteHistory([]);
    }, []);

    // Calcular estadísticas de votos
    const stats = useMemo(() => {
        const convertedVotes = votes.map(v => {
            const inUSD = v.val / (rates[v.cur] || 1);
            return inUSD * (rates[mainCurrency] || 1);
        });

        const avgSentiment = convertedVotes.length
            ? convertedVotes.reduce((a, b) => a + b, 0) / convertedVotes.length
            : 0;

        return {
            totalVotes: votes.length,
            filteredVotes: votes.length, // Ahora incluimos todos convertidos
            avgSentiment,
        };
    }, [votes, mainCurrency, rates]);

    // Actualizar historial cuando cambia el promedio
    useEffect(() => {
        if (stats.avgSentiment > 0) {
            const now = new Date();
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            setVoteHistory(prev => {
                // Evitar duplicados si el valor no cambia o es muy frecuente
                const newPoint = { value: stats.avgSentiment, time, date };
                // Simple optimización para no llenar el historial idéntico
                const last = prev[prev.length - 1];
                if (last && last.time === time && last.value === newPoint.value) return prev;
                return [...prev.slice(-14), newPoint];
            });
        }
    }, [stats.avgSentiment]);

    // Obtener votos recientes (últimos 15)
    const recentVotes = useMemo(() => {
        return [...votes].reverse().slice(0, 15);
    }, [votes]);

    return {
        votes,
        recentVotes,
        voteHistory,
        stats,
        addVote,
        clearVotes,
        reloadVotes: loadVotes,
    };
}
