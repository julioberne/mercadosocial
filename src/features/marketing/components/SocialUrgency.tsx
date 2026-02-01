import { Flame, Users, Clock, TrendingUp, Zap } from 'lucide-react';

interface SocialUrgencyProps {
    totalOffers: number;
    totalVotes: number;
    recentActivityCount?: number; // Actividad en últimas 24h
}

/**
 * @SocialUrgency
 * Componente de urgencia social (FOMO).
 * Muestra presión de compra y actividad reciente para incentivar decisiones rápidas.
 */
export function SocialUrgency({
    totalOffers,
    totalVotes,
    recentActivityCount = 0
}: SocialUrgencyProps) {

    // Determinar nivel de urgencia
    const urgencyLevel = totalOffers >= 10 ? 'high' : totalOffers >= 5 ? 'medium' : 'low';

    const urgencyConfig = {
        high: {
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: Flame,
            message: '¡Alta demanda!',
            subtext: `${totalOffers} personas compitiendo por este producto`
        },
        medium: {
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            icon: TrendingUp,
            message: 'Demanda creciente',
            subtext: `${totalOffers} propuestas activas`
        },
        low: {
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: Users,
            message: 'Oportunidad abierta',
            subtext: 'Sé el primero en proponer tu precio'
        }
    };

    const config = urgencyConfig[urgencyLevel];
    const Icon = config.icon;

    return (
        <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-3 md:p-4 mb-6`}>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* Indicador pulsante */}
                <div className="relative shrink-0">
                    <div className={`${config.color} w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center`}>
                        <Icon className="text-white" size={16} />
                    </div>
                    {urgencyLevel === 'high' && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`font-bold uppercase text-xs md:text-sm ${config.textColor} truncate`}>
                        {config.message}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-600 truncate">
                        {config.subtext}
                    </p>
                </div>

                {/* Contador de actividad */}
                <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-gray-500 text-[10px] md:text-xs">
                        <Clock size={10} />
                        <span>{totalVotes + totalOffers}</span>
                    </div>
                    {recentActivityCount > 0 && (
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                            <Zap size={10} />
                            <span>+{recentActivityCount}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de presión visual */}
            {urgencyLevel !== 'low' && (
                <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${config.color} transition-all duration-1000`}
                            style={{ width: `${Math.min(totalOffers * 10, 100)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-right uppercase">
                        Presión de compra: {Math.min(totalOffers * 10, 100)}%
                    </p>
                </div>
            )}
        </div>
    );
}
