import React from 'react'
import {
    RefreshCw,
    Trash2,
    Smartphone,
    LogOut,
    LogIn,
    CheckCircle,
    AlertCircle
} from 'react-feather'
import { WhatsAppConnection } from '../../../../services/whatsappService'
import { ConnectionMobileCard } from './ConnectionMobileCard'

interface ConnectionsTableProps {
    connections: WhatsAppConnection[]
    search: string
    actionBusyId: number | null
    onSync: (id: number) => void
    onToggleStatus: (conn: WhatsAppConnection) => void
    onDelete: (id: number) => void
    onOpenCoExistence: (conn: WhatsAppConnection) => void
    onOpenForecast?: (conn: WhatsAppConnection) => void
    onOpenTierUpgrade?: (conn: WhatsAppConnection) => void
    onOpenIncrementalSync?: (conn: WhatsAppConnection) => void
    onOpenAddModal: () => void
}

export function ConnectionsTable({
    connections,
    search,
    actionBusyId,
    onSync,
    onToggleStatus,
    onDelete,
    onOpenCoExistence,
    onOpenForecast,
    onOpenTierUpgrade,
    onOpenIncrementalSync,
    onOpenAddModal
}: ConnectionsTableProps) {
    const filtered = connections.filter(c => {
        const query = search.toLowerCase()
        return (
            (c.name && c.name.toLowerCase().includes(query)) ||
            (c.display_phone_number && c.display_phone_number.toLowerCase().includes(query)) ||
            (c.phone_number_id && c.phone_number_id.toLowerCase().includes(query)) ||
            (c.waba_id && c.waba_id.toLowerCase().includes(query))
        )
    })

    if (filtered.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Smartphone size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    {search ? 'No matching phone numbers found' : 'No WhatsApp Connections Yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                    {search
                        ? 'Try refining your search query.'
                        : 'Connect your Meta WhatsApp Business line using Meta Embedded Signup or manual credentials.'}
                </p>
                {!search && (
                    <button
                        onClick={onOpenAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs shadow-sm shadow-orange-500/20"
                    >
                        <span>Add Your First Number</span>
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Mobile Cards View (Visible on screens < 768px) */}
            <div className="block md:hidden space-y-3">
                {filtered.map(conn => (
                    <ConnectionMobileCard
                        key={conn.id}
                        conn={conn}
                        isBusy={actionBusyId === conn.id}
                        onSync={onSync}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                        onOpenCoExistence={onOpenCoExistence}
                        onOpenForecast={onOpenForecast}
                        onOpenTierUpgrade={onOpenTierUpgrade}
                        onOpenIncrementalSync={onOpenIncrementalSync}
                    />
                ))}
            </div>

            {/* Desktop Table View (Visible on screens >= 768px) */}
            <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                                <th className="py-3 px-4">Line & Number</th>
                                <th className="py-3 px-4">Meta Identifiers</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Quality Rating</th>
                                <th className="py-3 px-4">Daily Limit Tier</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filtered.map((conn) => {
                                const isBusy = actionBusyId === conn.id
                                const isConnected = conn.status === 'connected' || conn.status === 'verified'
                                const quality = (conn.quality_rating || 'GREEN').toUpperCase()

                                return (
                                    <tr key={conn.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                    <Smartphone size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                                                        <span>{conn.name || 'WhatsApp Line'}</span>
                                                        {conn.name_status === 'APPROVED' || conn.name_status === 'AVAILABLE_WITHOUT_REVIEW' ? (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold" title="Display Name Approved by Meta">
                                                                ✓ Approved
                                                            </span>
                                                        ) : conn.name_status === 'PENDING_REVIEW' ? (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold animate-pulse" title="Meta reviewing display name">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Review Pending
                                                            </span>
                                                        ) : conn.name_status === 'DECLINED' || conn.name_status === 'REJECTED' ? (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold" title="Display Name Rejected by Meta">
                                                                ✕ Rejected
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                                                        {conn.display_phone_number || 'No display number'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                            <div><span className="text-slate-400">WABA:</span> {conn.waba_id || 'N/A'}</div>
                                            <div><span className="text-slate-400">Phone ID:</span> {conn.phone_number_id}</div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                                                    isConnected
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {isConnected ? (
                                                    <CheckCircle size={12} className="text-emerald-500" />
                                                ) : (
                                                    <AlertCircle size={12} className="text-slate-400" />
                                                )}
                                                <span>{conn.status}</span>
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                                                    quality === 'GREEN'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : quality === 'YELLOW'
                                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        quality === 'GREEN'
                                                            ? 'bg-emerald-500'
                                                            : quality === 'YELLOW'
                                                            ? 'bg-amber-500'
                                                            : 'bg-rose-500'
                                                    }`}
                                                />
                                                <span>{quality}</span>
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                                {conn.messaging_limit_tier || 'TIER_1K'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {onOpenForecast && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenForecast(conn)}
                                                        title="Proactive Quality Health Forecast"
                                                        className="px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100 text-[11px] text-orange-600 dark:text-orange-400 font-medium transition-colors"
                                                    >
                                                        Forecast
                                                    </button>
                                                )}

                                                {onOpenTierUpgrade && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenTierUpgrade(conn)}
                                                        title="Predictive Tier Upgrade Countdown"
                                                        className="px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 text-[11px] text-amber-600 dark:text-amber-400 font-medium transition-colors"
                                                    >
                                                        Tier Upgrade
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => onOpenCoExistence(conn)}
                                                    title="Migrate WhatsApp Business Mobile App (Co-Existence)"
                                                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 transition-colors"
                                                >
                                                    Migrate App
                                                </button>

                                                {onOpenIncrementalSync && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenIncrementalSync(conn)}
                                                        title="Co-Existence Incremental Sync & Polling"
                                                        className="px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium transition-colors"
                                                    >
                                                        Sync Chats
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => onSync(conn.id)}
                                                    disabled={isBusy}
                                                    title="Sync Quality & Limit with Meta"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                >
                                                    <RefreshCw size={14} className={`${isBusy ? 'animate-spin' : ''}`} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onToggleStatus(conn)}
                                                    disabled={isBusy}
                                                    title={isConnected ? 'Disconnect Line' : 'Reconnect Line'}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                >
                                                    {isConnected ? <LogOut size={14} /> : <LogIn size={14} />}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(conn.id)}
                                                    disabled={isBusy}
                                                    title="Delete Connection"
                                                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ConnectionsTable
