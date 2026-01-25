import { useState, useCallback, useEffect } from 'react';
import type { Product, CurrencyCode } from '../../../shared/types';
import { SAMPLE_PRODUCTS } from '../../../shared/types';
import { supabase } from '../../../shared/lib/supabase';

export function useProduct(initialProductId: number = 1) {
    // Inicializamos con el producto estático para evitar "flash" de carga vacía,
    // luego hidratamos con DB si es posible.
    const [product, setProduct] = useState<Product>(
        SAMPLE_PRODUCTS.find(p => p.id === initialProductId) || SAMPLE_PRODUCTS[0]
    );
    const [isEditing, setIsEditing] = useState(false);
    const [tempProduct, setTempProduct] = useState<Product>({ ...product });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Cargar producto real y suscribirse a cambios
    useEffect(() => {
        async function loadProduct() {
            const { data, error } = await supabase
                .from('products')
                .select('*, sellers(*)')
                .eq('id', initialProductId)
                .single();

            if (error) {
                console.error('Error loading product:', error);
            }

            if (data && !error) {
                console.log('Product loaded:', data);
                const mappedProduct: Product = {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    ownerPrice: data.owner_price,
                    ownerCurrency: data.owner_currency,
                    status: data.status,
                    finalPrice: data.final_price,
                    finalCurrency: data.final_currency,
                    images: data.images,
                    videoUrl: data.video_url,
                    seller: {
                        name: data.sellers.name,
                        avatar: data.sellers.avatar,
                        level: data.sellers.level,
                        verified: data.sellers.verified
                    }
                };
                setProduct(mappedProduct);
                setTempProduct(mappedProduct);
            }
        }

        loadProduct();

        // Suscripción Realtime para detectar cambios remotos
        const channel = supabase
            .channel(`public:products:id=eq.${initialProductId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${initialProductId}` },
                () => {
                    // Recargamos el producto completo para obtener la relación con sellers
                    loadProduct();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [initialProductId]);

    const updateProduct = useCallback((updates: Partial<Product>) => {
        setProduct(prev => ({ ...prev, ...updates }));
        setTempProduct(prev => ({ ...prev, ...updates }));
    }, []);

    const saveProduct = useCallback(async (updatedData?: Partial<Product>) => {
        // Combinar tempProduct con los datos actualizados (si se pasan)
        const dataToSave = updatedData
            ? { ...tempProduct, ...updatedData }
            : tempProduct;

        // Optimistic UI update
        setProduct({ ...dataToSave, status: 'open', finalPrice: null });
        setTempProduct(dataToSave);
        setIsEditing(false);

        // Save to DB
        const { error } = await supabase
            .from('products')
            .update({
                name: dataToSave.name,
                description: dataToSave.description,
                owner_price: dataToSave.ownerPrice,
                owner_currency: dataToSave.ownerCurrency,
                images: dataToSave.images,
                video_url: dataToSave.videoUrl,
                status: 'open'
            })
            .eq('id', product.id);

        if (error) console.error("Error guardando producto:", error);

    }, [tempProduct, product.id]);

    const toggleLock = useCallback(async () => {
        const newStatus = product.status === 'open' ? 'locked' : 'open';
        setProduct(prev => ({ ...prev, status: newStatus })); // Optimistic

        const { error } = await supabase
            .from('products')
            .update({ status: newStatus })
            .eq('id', product.id);

        if (error) console.error("Error cambiando lock:", error);
    }, [product.id, product.status]);

    const sellProduct = useCallback(async (finalPrice: number, finalCurrency: CurrencyCode) => {
        setProduct(prev => ({
            ...prev,
            status: 'sold',
            finalPrice,
            finalCurrency
        }));

        const { error } = await supabase
            .from('products')
            .update({ status: 'sold', final_price: finalPrice, final_currency: finalCurrency })
            .eq('id', product.id);

        if (error) console.error("Error vendiendo producto:", error);
    }, [product.id]);

    const nextImage = useCallback(() => {
        const maxIndex = product.videoUrl ? product.images.length : product.images.length - 1;
        setCurrentImageIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    }, [product.images.length, product.videoUrl]);

    const prevImage = useCallback(() => {
        const maxIndex = product.videoUrl ? product.images.length : product.images.length - 1;
        setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    }, [product.images.length, product.videoUrl]);

    const selectImage = useCallback((index: number) => {
        setCurrentImageIndex(index);
    }, []);

    return {
        product,
        tempProduct,
        isEditing,
        currentImageIndex,
        setIsEditing,
        setTempProduct,
        updateProduct,
        saveProduct,
        toggleLock,
        sellProduct,
        nextImage,
        prevImage,
        selectImage,
    };
}
