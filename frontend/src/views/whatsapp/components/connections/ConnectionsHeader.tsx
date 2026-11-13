import React from 'react'
import { Plus, Sliders, RefreshCw, Search } from 'react-feather'

interface ConnectionsHeaderProps {
    search: string
    onSearchChange: (value: string) => void
    onOpenAddModal: () => void
    showManual: boolean
    onToggleManual: () => void
    onRefresh: () => void
    refreshing: boolean
}

export function ConnectionsHeader({
    search,
    onSearchChange,
    onOpenAddModal,
    showManual,
    onToggleManual,
    onRefresh,
    refreshing
}: ConnectionsHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-orange-500 tracking-tight">
                        WhatsApp Configuration
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Manage your connected phone numbers, Meta Embedded Signups, and messaging limit tiers.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium text-xs shadow-sm shadow-orange-500/20 transition-all"
                    >
                        <Plus size={15} />
                        <span>Add Whatsapp</span>
                    </button>

                    <button
                        type="button"
                        onClick={onToggleManual}
                        title="Toggle Manual Credentials Form"
                        className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                            showManual
                                ? 'bg-slate-700 text-white border-slate-700'
                                : 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <Sliders size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        title="Refresh Connections"
                        className="p-2 rounded-xl border bg-slate-700 text-white border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-end">
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search phone numbers or WABA..."
                        className="w-full text-xs pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                        <div className="p-1 rounded-lg bg-orange-500 text-white">
                            <Search size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
