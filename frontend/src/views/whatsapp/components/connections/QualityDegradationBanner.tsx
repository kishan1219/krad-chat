import React from 'react'
import { AlertTriangle, X, ExternalLink } from 'react-feather'

interface DegradationAlert {
    phoneNumber: string
    previousQuality: string
    newQuality: string
    reason?: string
}

interface QualityDegradationBannerProps {
    alerts: DegradationAlert[]
    onDismiss: () => void
}

export function QualityDegradationBanner({ alerts, onDismiss }: QualityDegradationBannerProps) {
    if (!alerts || alerts.length === 0) return null

    return (
        <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-900 dark:text-amber-200">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 mt-0.5">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span>Phone Number Quality Rating Degraded</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                Meta Alert
                            </span>
                        </h4>
                        <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 max-w-2xl">
                            Meta detected elevated customer block/report rates. Your messaging limit may be throttled
                            if quality is not restored within 7 days.
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                            {alerts.map((alert, idx) => (
                                <div
                                    key={idx}
                                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs bg-amber-500/20 border border-amber-500/30 font-medium"
                                >
                                    <span>{alert.phoneNumber}</span>
                                    <span className="text-slate-400 dark:text-slate-500 font-normal">→</span>
                                    <span
                                        className={`font-bold uppercase ${
                                            alert.newQuality === 'RED'
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}
                                    >
                                        {alert.newQuality} Quality
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs">
                            <span className="text-amber-800 dark:text-amber-300/80 font-medium">Recommended actions:</span>
                            <span className="text-amber-900/90 dark:text-amber-200">• Pause non-critical broadcasts</span>
                            <span className="text-amber-900/90 dark:text-amber-200">• Ensure opt-in compliance</span>
                            <a
                                href="https://business.facebook.com/wa/manage/phone-numbers/"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                            >
                                Open Meta Manager <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="p-1 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    )
}
