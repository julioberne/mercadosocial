import { CheckCircle, Star, Award, Verified, Lock } from 'lucide-react';

interface TrustBadgesProps {
    totalVotes: number;
    totalOffers: number;
    isVerifiedSeller?: boolean;
    hasEscrow?: boolean;
}

/**
 * @TrustBadges
 * Sellos de confianza dinámicos que aparecen según el comportamiento del mercado.
 * Diseñados para aumentar la conversión mostrando prueba social.
 */
export function TrustBadges({
    totalVotes,
    totalOffers,
    isVerifiedSeller = true,
    hasEscrow = true
}: TrustBadgesProps) {

    const badges = [
        {
            id: 'verified',
            show: isVerifiedSeller,
            icon: Verified,
            label: 'Vendedor Verificado',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            id: 'popular',
            show: totalVotes >= 10,
            icon: Star,
            label: 'Popular',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
        },
        {
            id: 'trusted',
            show: totalVotes >= 50,
            icon: Award,
            label: 'Confianza Alta',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            id: 'active',
            show: totalOffers >= 3,
            icon: CheckCircle,
            label: 'Mercado Activo',
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            id: 'escrow',
            show: hasEscrow,
            icon: Lock,
            label: 'Pago Seguro',
            color: 'text-gray-700',
            bg: 'bg-gray-100'
        }
    ];

    const visibleBadges = badges.filter(b => b.show);

    if (visibleBadges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {visibleBadges.map(badge => {
                const Icon = badge.icon;
                return (
                    <div
                        key={badge.id}
                        className={`${badge.bg} ${badge.color} px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide border border-current/20`}
                    >
                        <Icon size={14} />
                        <span>{badge.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
