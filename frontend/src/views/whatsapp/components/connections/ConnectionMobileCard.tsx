import React from 'react'
import {
    Smartphone,
    RefreshCw,
    Trash2,
    LogIn,
    LogOut,
    CheckCircle,
    AlertCircle
} from 'react-feather'
import { WhatsAppConnection } from '../../../../services/whatsappService'

interface ConnectionMobileCardProps {
    conn: WhatsAppConnection
    isBusy: boolean
    onSync: (id: number) => void
    onToggleStatus: (conn: WhatsAppConnection) => void
    onDelete: (id: number) => void
    onOpenCoExistence: (conn: WhatsAppConnection) => void
    onOpenForecast?: (conn: WhatsAppConnection) => void
    onOpenTierUpgrade?: (conn: WhatsAppConnection) => void
    onOpenIncrementalSync?: (conn: WhatsAppConnection) => void
}

export const ConnectionMobileCard: React.FC<ConnectionMobileCardProps> = ({
    conn,
    isBusy,
    onSync,
    onToggleStatus,
    onDelete,
    onOpenCoExistence,
    onOpenForecast,
    onOpenTierUpgrade,
    onOpenIncrementalSync
}) => {
    const isConnected = conn.status === 'connected' || conn.status === 'verified'
    const quality = (conn.quality_rating || 'GREEN').toUpperCase()

    return (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            {/* Header: Name, Status & Primary Icon */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Smartphone size={18} />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span>{conn.name || 'WhatsApp Line'}</span>
                            {conn.name_status === 'APPROVED' || conn.name_status === 'AVAILABLE_WITHOUT_REVIEW' ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                                    ✓ Approved
                                </span>
                            ) : conn.name_status === 'PENDING_REVIEW' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Review Pending
                                </span>
                            ) : conn.name_status === 'DECLINED' || conn.name_status === 'REJECTED' ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold">
                                    ✕ Rejected
                                </span>
                            ) : null}
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {conn.display_phone_number || 'No number'}
                        </div>
                    </div>
                </div>

                <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                        isConnected
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                    {isConnected ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    <span>{conn.status}</span>
                </span>
            </div>

            {/* Quality & Limit Tier Badges */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
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
                            quality === 'GREEN' ? 'bg-emerald-500' : quality === 'YELLOW' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                    />
                    <span>{quality} Quality</span>
                </span>

                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    {conn.messaging_limit_tier || 'TIER_1K'}
                </span>
            </div>

            {/* Identifiers */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                <div><span className="text-slate-400">Phone ID:</span> {conn.phone_number_id}</div>
                <div><span className="text-slate-400">WABA ID:</span> {conn.waba_id || 'N/A'}</div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                {onOpenForecast && (
                    <button
                        type="button"
                        onClick={() => onOpenForecast(conn)}
                        className="py-1.5 px-2 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 text-xs text-orange-600 dark:text-orange-400 font-semibold"
                    >
                        Health Forecast
                    </button>
                )}
                {onOpenTierUpgrade && (
                    <button
                        type="button"
                        onClick={() => onOpenTierUpgrade(conn)}
                        className="py-1.5 px-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-600 dark:text-amber-400 font-semibold"
                    >
                        Tier Upgrade
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onOpenCoExistence(conn)}
                    className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium"
                >
                    Migrate App
                </button>
                {onOpenIncrementalSync && (
                    <button
                        type="button"
                        onClick={() => onOpenIncrementalSync(conn)}
                        className="py-1.5 px-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                    >
                        Sync Chats
                    </button>
                )}
            </div>

            {/* Footer Control Strip */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                    type="button"
                    onClick={() => onSync(conn.id)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                    <RefreshCw size={13} className={isBusy ? 'animate-spin' : ''} />
                    <span>Sync Meta</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onToggleStatus(conn)}
                        disabled={isBusy}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isConnected ? <LogOut size={14} /> : <LogIn size={14} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(conn.id)}
                        disabled={isBusy}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConnectionMobileCard

