import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import type { Opinion, CurrencyCode } from '../../../shared/types';

interface UseOpinionsReturn {
    opinions: Opinion[];
    loading: boolean;
    addOpinion: (author: string, content: string, value: number, currency: CurrencyCode) => Promise<void>;
    reloadOpinions: () => Promise<void>;
}

export function useOpinions(productId: number): UseOpinionsReturn {
    const [opinions, setOpinions] = useState<Opinion[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar opiniones desde la DB
    const loadOpinions = useCallback(async () => {
        console.log('📝 Cargando opiniones...');
        const { data, error } = await supabase
            .from('opinions')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error cargando opiniones:', error.message);
            return;
        }

        if (data) {
            const mapped: Opinion[] = data.map((o: any) => ({
                id: o.id,
                author: o.author_name || 'Anónimo',
                content: o.content,
                value: o.value,
                currency: o.currency as CurrencyCode,
                sentiment: o.sentiment || 'neutral',
                timestamp: new Date(o.created_at)
            }));
            setOpinions(mapped);
            console.log('✅ Opiniones cargadas:', mapped.length);
        }
        setLoading(false);
    }, [productId]);

    // Cargar al inicio y suscribirse a cambios
    useEffect(() => {
        loadOpinions();

        // Suscripción Realtime
        const channel = supabase
            .channel(`opinions_product_${productId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'opinions', filter: `product_id=eq.${productId}` },
                (payload) => {
                    console.log('📝 Nueva opinión recibida via Realtime');
                    const o = payload.new as any;
                    const newOpinion: Opinion = {
                        id: o.id,
                        author: o.author_name || 'Anónimo',
                        content: o.content,
                        value: o.value,
                        currency: o.currency as CurrencyCode,
                        sentiment: o.sentiment || 'neutral',
                        timestamp: new Date(o.created_at)
                    };

                    // Evitar duplicados
                    setOpinions(prev => {
                        if (prev.some(op => op.id === newOpinion.id)) return prev;
                        return [newOpinion, ...prev];
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('🟢 Realtime opinions: CONNECTED');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId, loadOpinions]);

    // Agregar nueva opinión
    const addOpinion = useCallback(async (author: string, content: string, value: number, currency: CurrencyCode) => {
        // Determinar sentimiento basado en contenido
        const lowerContent = content.toLowerCase();
        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

        const positiveWords = ['excelente', 'bueno', 'genial', 'recomiendo', 'vale', 'calidad', 'premium', 'justifica', 'clave'];
        const negativeWords = ['caro', 'alto', 'mucho', 'no vale', 'costoso', 'excesivo'];

        if (positiveWords.some(w => lowerContent.includes(w))) sentiment = 'positive';
        if (negativeWords.some(w => lowerContent.includes(w))) sentiment = 'negative';

        const tempOpinion: Opinion = {
            id: Date.now(), // Temporal
            author: author || 'Anónimo',
            content,
            value,
            currency,
            sentiment,
            timestamp: new Date()
        };

        // Actualización optimista
        setOpinions(prev => [tempOpinion, ...prev]);

        // Guardar en DB
        const { error } = await supabase
            .from('opinions')
            .insert({
                product_id: productId,
                author_name: author || 'Anónimo',
                content,
                value,
                currency,
                sentiment
            });

        if (error) {
            console.error('❌ Error guardando opinión:', error.message);
            // Revertir en caso de error
            setOpinions(prev => prev.filter(o => o.id !== tempOpinion.id));
        }
    }, [productId]);

    return {
        opinions,
        loading,
        addOpinion,
        reloadOpinions: loadOpinions
    };
}
