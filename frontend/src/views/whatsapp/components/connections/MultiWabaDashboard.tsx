import React, { useEffect, useState } from 'react'
import {
    Activity,
    Server,
    Smartphone,
    Shield,
    TrendingUp,
    RefreshCw,
    AlertTriangle
} from 'react-feather'
import {
    whatsappService,
    MultiWabaDashboardData
} from '../../../../services/whatsappService'
import { ErrorToast } from '../../../../utility/Utils'

interface MultiWabaDashboardProps {
    onSwitchToLines: () => void
}

export function MultiWabaDashboard({ onSwitchToLines }: MultiWabaDashboardProps) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<MultiWabaDashboardData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await whatsappService.getMultiWabaDashboard()
            setData(res)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load enterprise dashboard'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                <RefreshCw size={28} className="animate-spin text-orange-500 mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aggregating enterprise metrics across WhatsApp Business Accounts...
                </p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center">
                <AlertTriangle size={28} className="text-rose-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    Failed to Load Multi-WABA Dashboard
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 mb-4">{error}</p>
                <button
                    onClick={fetchDashboard}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Top Aggregate Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total WABAs</span>
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Server size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {data.total_wabas}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Enterprise Business Accounts
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Numbers</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Smartphone size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {data.total_phone_numbers}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {data.active_connections} operational lines
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">7-Day Volume</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {data.total_messages_7d.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Aggregated messages dispatched
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quality Health</span>
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Shield size={16} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            {data.quality_summary.green} High
                        </span>
                        {data.quality_summary.yellow > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                                {data.quality_summary.yellow} Med
                            </span>
                        )}
                        {data.quality_summary.red > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                                {data.quality_summary.red} Low
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        Meta quality ratings distribution
                    </div>
                </div>
            </div>

            {/* 7-Day Aggregate Volume Activity */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Activity size={16} className="text-orange-500" />
                            <span>Enterprise 7-Day Message Throughput</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Aggregated volume across all connected WhatsApp Business Accounts
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboard}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
                        title="Refresh"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2">
                    {data.time_series.map((day, idx) => {
                        const maxVal = Math.max(...data.time_series.map(t => t.sent), 1)
                        const heightPct = Math.min(100, Math.max(15, Math.round((day.sent / maxVal) * 100)))
                        return (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="text-[11px] font-mono text-slate-500 mb-1">
                                    {day.sent}
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-24 flex items-end p-1">
                                    <div
                                        style={{ height: `${heightPct}%` }}
                                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-lg transition-all"
                                    />
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                    {day.date.slice(5)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Accounts Breakdown Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                            Connected WhatsApp Business Accounts
                        </h4>
                        <p className="text-xs text-slate-500">
                            {data.wabas.length} WABA portfolios managed
                        </p>
                    </div>
                    <button
                        onClick={onSwitchToLines}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                    >
                        View Individual Lines →
                    </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.wabas.map((waba, idx) => (
                        <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-slate-800 dark:text-white">
                                        {waba.name}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        ID: {waba.waba_id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <span>{waba.phone_count} Phone Numbers</span>
                                    <span>•</span>
                                    <span>Messaging Tier: <strong className="text-orange-600">{waba.messaging_limit}</strong></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {waba.phone_numbers.map((p, pIdx) => (
                                    <span
                                        key={pIdx}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
                                    >
                                        <Smartphone size={12} className="text-emerald-500" />
                                        <span>{p.display_phone_number || p.name}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

