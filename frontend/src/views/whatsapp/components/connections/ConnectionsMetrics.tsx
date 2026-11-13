import React from 'react'
import {
    Smartphone,
    Activity,
    Shield,
    Zap
} from 'react-feather'
import { WhatsAppConnection } from '../../../../services/whatsappService'

interface ConnectionsMetricsProps {
    connections: WhatsAppConnection[]
}

export function ConnectionsMetrics({ connections }: ConnectionsMetricsProps) {
    const total = connections.length
    const active = connections.filter(c => c.status === 'connected' || c.status === 'verified').length
    const highQuality = connections.filter(c => (c.quality_rating || 'GREEN').toUpperCase() === 'GREEN').length
    const highTier = connections.filter(c => {
        const tier = (c.messaging_limit_tier || '').toUpperCase()
        return tier.includes('10K') || tier.includes('100K') || tier.includes('UNLIMITED')
    }).length

    const cards = [
        {
            label: 'Total Numbers',
            value: total,
            subtext: `${active} active lines`,
            icon: Smartphone,
            color: 'text-blue-500 bg-blue-500/10'
        },
        {
            label: 'Connected Status',
            value: total > 0 ? `${Math.round((active / total) * 100)}%` : '0%',
            subtext: 'Operational uptime',
            icon: Activity,
            color: 'text-emerald-500 bg-emerald-500/10'
        },
        {
            label: 'Quality Health',
            value: total > 0 ? `${Math.round((highQuality / total) * 100)}%` : '100%',
            subtext: `${highQuality} rated High / Green`,
            icon: Shield,
            color: 'text-indigo-500 bg-indigo-500/10'
        },
        {
            label: 'High-Tier Scalability',
            value: highTier,
            subtext: 'Tier 10K+ or Unlimited',
            icon: Zap,
            color: 'text-orange-500 bg-orange-500/10'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => {
                const Icon = card.icon
                return (
                    <div
                        key={idx}
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                            <div className={`p-2 rounded-xl ${card.color}`}>
                                <Icon size={16} />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                            {card.value}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {card.subtext}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
