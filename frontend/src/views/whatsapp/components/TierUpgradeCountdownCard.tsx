import React, { useEffect, useState } from 'react'
import {
    TrendingUp,
    Shield,
    Clock,
    AlertTriangle,
    CheckCircle,
    Award
} from 'react-feather'
import { whatsappService, TierUpgradeForecastResult } from '../../../services/whatsappService'

interface TierUpgradeCountdownCardProps {
    connectionId: number
    onClose?: () => void
}

export const TierUpgradeCountdownCard: React.FC<TierUpgradeCountdownCardProps> = ({
    connectionId
}) => {
    const [data, setData] = useState<TierUpgradeForecastResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        whatsappService.getTierUpgradeForecast(connectionId)
            .then(res => {
                if (mounted) {
                    setData(res)
                    setError(null)
                }
            })
            .catch(err => {
                if (mounted) {
                    setError(err?.message || 'Failed to calculate tier upgrade countdown.')
                }
            })
            .finally(() => {
                if (mounted) setLoading(false)
            })
        return () => { mounted = false }
    }, [connectionId])

    if (loading) {
        return (
            <div className="p-6 text-center text-slate-500 animate-pulse">
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500 animate-spin" />
                <span className="text-xs">Analyzing Meta tier progression telemetry...</span>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs">
                {error || 'No forecasting data available.'}
            </div>
        )
    }

    const isMax = data.status === 'max_tier'
    const isAtRisk = data.status === 'at_risk_quality'
    const isNeedsVolume = data.status === 'needs_volume'

    return (
        <div className="space-y-4 text-xs">
            {/* Header / Tier Transition Bar */}
            <div className="p-3.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 rounded-2xl border border-orange-200/50 dark:border-orange-800/30 flex items-center justify-between">
                <div>
                    <span className="text-[11px] text-slate-500 font-medium">Current Tier</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.current_tier}</div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">Meta Upgrade</span>
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-medium">Target Tier</span>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data.target_tier}</div>
                </div>
            </div>

            {/* Countdown Banner */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isMax
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 text-blue-800'
                    : isAtRisk
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-800'
                    : isNeedsVolume
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800'
            }`}>
                <div className="flex items-center gap-2">
                    {isMax ? <Award size={20} className="text-blue-500" /> :
                     isAtRisk ? <AlertTriangle size={20} className="text-rose-500" /> :
                     <Shield size={20} className="text-emerald-500" />}
                    <div>
                        <div className="font-bold">
                            {isMax ? 'Maximum Tier Active (Unlimited Messages)' :
                             isAtRisk ? 'Upgrade Paused: Quality Rating Degraded' :
                             data.estimated_days_remaining !== null
                                ? `~${data.estimated_days_remaining} Days Remaining to Auto-Promotion`
                                : 'Promotion In Progress'}
                        </div>
                        <div className="text-[11px] opacity-80">
                            {isMax ? 'No further tier caps apply to this WhatsApp phone number.' :
                             isAtRisk ? 'Restore GREEN quality rating to resume promotion counter.' :
                             `Readiness Index: ${data.readiness_score}% towards ${data.target_tier}`}
                        </div>
                    </div>
                </div>
                <div className="text-lg font-black font-mono">
                    {data.readiness_score}%
                </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
                {/* 7-Day Volume Progress */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700 dark:text-slate-200">
                        <span>7-Day Broadcast Volume</span>
                        <span>{data.volume_7d.toLocaleString()} / {data.volume_target_7d.toLocaleString()} msgs</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, data.volume_progress_percent)}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        Meta requires reaching &ge; 50%–100% of current limit in a rolling 7-day period.
                    </div>
                </div>

                {/* GREEN Quality Streak */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700 dark:text-slate-200">
                        <span>Consecutive GREEN Quality Streak</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {data.green_streak_days} / {data.required_green_days} Days
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (data.green_streak_days / data.required_green_days) * 100)}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        Meta enforces 7 continuous days of GREEN quality with zero high-spam spikes.
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {data.recommendations && data.recommendations.length > 0 && (
                <div className="p-3 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl">
                    <div className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <CheckCircle size={14} className="text-orange-500" />
                        <span>Actionable Recommendations</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        {data.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default TierUpgradeCountdownCard
