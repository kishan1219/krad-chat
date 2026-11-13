import React from 'react'
import { Check, Smartphone } from 'react-feather'
import { MetaWabaPhoneNumber } from '../../../../services/whatsappService'

interface WabaMultiNumberSelectorProps {
    numbers: MetaWabaPhoneNumber[]
    selectedIds: string[]
    onToggleSelection: (id: string) => void
    numberLabels: Record<string, string>
    onUpdateLabel: (id: string, label: string) => void
    busy: boolean
    onBack: () => void
    onBatchConnect: () => void
}

export const WabaMultiNumberSelector: React.FC<WabaMultiNumberSelectorProps> = ({
    numbers,
    selectedIds,
    onToggleSelection,
    numberLabels,
    onUpdateLabel,
    busy,
    onBack,
    onBatchConnect
}) => {
    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Smartphone size={20} className="text-orange-500" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Multiple Phone Numbers Detected
                    </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your WhatsApp Business Account contains multiple registered phone lines.
                    Select the numbers you want to connect simultaneously to this workspace.
                </p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {numbers.map((num) => {
                    const isSelected = selectedIds.includes(num.id)
                    const label = numberLabels[num.id] ?? num.verified_name ?? ''

                    return (
                        <div
                            key={num.id}
                            onClick={() => onToggleSelection(num.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-1 ring-orange-500/50'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                                            isSelected
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                        }`}
                                    >
                                        {isSelected && <Check size={12} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800 dark:text-white font-mono">
                                            {num.display_phone_number || num.id}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Quality: <span className="font-semibold">{num.quality_rating || 'GREEN'}</span>
                                            {num.code_verification_status && (
                                                <span> • {num.code_verification_status}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => onUpdateLabel(num.id, e.target.value)}
                                        placeholder="Custom label / department..."
                                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedIds.length} of {numbers.length} numbers selected
                </span>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        disabled={busy || selectedIds.length === 0}
                        onClick={onBatchConnect}
                        className="px-6 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm disabled:opacity-50 transition-all"
                    >
                        {busy ? 'Connecting...' : `Connect ${selectedIds.length} Numbers`}
                    </button>
                </div>
            </div>
        </div>
    )
}
