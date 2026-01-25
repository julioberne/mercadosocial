import { Target, Users, Gavel } from 'lucide-react';
import type { CurrencyCode, MarketStats } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/currency';
import { PriceCard } from '../../../shared/ui';

interface MetricsGridProps {
    stats: MarketStats;
    ownerPrice: number;
    mainCurrency: CurrencyCode;
}

export function MetricsGrid({ stats, ownerPrice, mainCurrency }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PriceCard
                title="PRECIO REFERENCIA"
                value={formatCurrency(ownerPrice, mainCurrency)}
                icon={<Target size={24} className="text-[var(--action-blue)]" />}
                subtitle="BASE VENDEDOR"
            />

            <PriceCard
                title="EXPECTATIVA SOCIAL"
                value={formatCurrency(stats.avgSentiment, mainCurrency)}
                icon={<Users size={24} className="text-[var(--action-purple)]" />}
                subtitle="SENTIMIENTO MERCADO"
                highlight
                borderColor="border-l-[var(--action-purple)]"
                trend={stats.marketPremium >= 0 ? 'up' : 'down'}
                trendValue={`${stats.marketPremium >= 0 ? '+' : ''}${Math.round(stats.marketPremium)}% VS LISTA`}
            />

            <PriceCard
                title="MEJOR OFERTA"
                value={formatCurrency(stats.maxOffer, mainCurrency)}
                icon={<Gavel size={24} className="text-[var(--action-orange)]" />}
                subtitle="PROPUESTA MÁXIMA"
                borderColor="border-l-[var(--action-orange)]"
            />
        </div>
    );
}
