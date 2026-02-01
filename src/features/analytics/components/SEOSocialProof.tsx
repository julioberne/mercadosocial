import { TrendingUp, Users, Award, Shield } from 'lucide-react';
import type { Product, CurrencyCode } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';

interface SEOSocialProofProps {
    product: Product;
    totalVotes: number;
    totalOffers: number;
    socialAverage: number;
    mainCurrency: CurrencyCode;
}

/**
 * @SEOSocialProof
 * Componente de prueba social optimizado para SEO.
 * Genera contenido dinámico basado en votos y ofertas que Google indexará.
 * Objetivo: Crear landing pages tipo "Precio justo del [Producto] en Colombia 2026"
 */
export function SEOSocialProof({
    product,
    totalVotes,
    totalOffers,
    socialAverage,
    mainCurrency
}: SEOSocialProofProps) {
    const ownerPrice = product.ownerPrice;

    // Determinar sentimiento
    const priceDiff = socialAverage - ownerPrice;
    const priceDiffPercent = ownerPrice > 0 ? Math.round((priceDiff / ownerPrice) * 100) : 0;
    const isUndervalued = priceDiff > 0;

    // Generar titular SEO dinámico
    const seoHeadline = isUndervalued
        ? `${totalVotes} expertos creen que este producto vale más de lo que cuesta`
        : `Precio validado por ${totalVotes} usuarios de la comunidad`;

    const seoSubheadline = isUndervalued
        ? `El valor percibido es ${Math.abs(priceDiffPercent)}% superior al precio actual`
        : `El precio está alineado con la expectativa del mercado`;

    return (
        <section
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-black p-6 md:p-8"
            // Schema.org markup para SEO
            itemScope
            itemType="https://schema.org/Product"
        >
            {/* Hidden SEO Content */}
            <meta itemProp="name" content={product.name} />
            <meta itemProp="description" content={product.description} />

            {/* Visual Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-600 p-3 border-4 border-black">
                    <Award size={28} className="text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold uppercase text-gray-900 leading-tight">
                        {seoHeadline}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {seoSubheadline}
                    </p>
                </div>
            </div>

            {/* Stats Grid - SEO Rich Content */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
                <div className="bg-white border-2 md:border-4 border-black p-2 md:p-4 text-center">
                    <Users className="mx-auto text-blue-600 mb-1" size={20} />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{totalVotes}</div>
                    <div className="text-[10px] md:text-xs uppercase text-gray-500 font-bold truncate">Validaciones</div>
                </div>

                <div className="bg-white border-2 md:border-4 border-black p-2 md:p-4 text-center">
                    <TrendingUp className="mx-auto text-green-600 mb-1" size={20} />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{totalOffers}</div>
                    <div className="text-[10px] md:text-xs uppercase text-gray-500 font-bold truncate">Propuestas</div>
                </div>

                <div className="bg-white border-2 md:border-4 border-black p-2 md:p-4 text-center overflow-hidden">
                    <Award className="mx-auto text-yellow-600 mb-1" size={20} />
                    <div className="text-sm md:text-2xl font-bold text-gray-900 truncate">
                        {formatCurrency(socialAverage, mainCurrency)}
                    </div>
                    <div className="text-[10px] md:text-xs uppercase text-gray-500 font-bold truncate">Valor Social</div>
                </div>

                <div className="bg-white border-2 md:border-4 border-black p-2 md:p-4 text-center">
                    <Shield className="mx-auto text-purple-600 mb-1" size={20} />
                    <div className={`text-lg md:text-2xl font-bold ${isUndervalued ? 'text-green-600' : 'text-gray-900'}`}>
                        {isUndervalued ? '+' : ''}{priceDiffPercent}%
                    </div>
                    <div className="text-[10px] md:text-xs uppercase text-gray-500 font-bold truncate">vs Base</div>
                </div>
            </div>

            {/* SEO Rich Snippet Content */}
            <div className="bg-white border-4 border-black p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Precio Justo de {product.name} en Colombia 2026:</strong>{' '}
                    Basado en la opinión de <strong>{totalVotes} expertos de la comunidad</strong>,
                    el valor de mercado estimado es de{' '}
                    <strong>{formatCurrency(socialAverage, mainCurrency)}</strong>.
                    {isUndervalued && (
                        <span className="text-green-700">
                            {' '}Actualmente el producto está <strong>subvalorado</strong> respecto
                            a la percepción del mercado.
                        </span>
                    )}
                    {totalOffers > 0 && (
                        <span>
                            {' '}Hay <strong>{totalOffers} propuestas de compra activas</strong> en este momento.
                        </span>
                    )}
                </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-500 uppercase">
                <span className="flex items-center gap-1">
                    <Shield size={14} /> Datos verificados en tiempo real
                </span>
                <span className="flex items-center gap-1">
                    <Users size={14} /> Comunidad activa
                </span>
            </div>
        </section>
    );
}
