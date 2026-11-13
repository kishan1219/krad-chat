import React from 'react'
import { PhoneMockup } from './PhoneMockup'
import { MetaOnboardingConfig } from '../../../../services/whatsappService'

interface StepMetaAuthorizeProps {
    name?: string
    config?: MetaOnboardingConfig | null
    busy: boolean
    onBack: () => void
    onConnectLive: () => void
    onConnectSandbox?: () => void
}

export const StepMetaAuthorize: React.FC<StepMetaAuthorizeProps> = ({
    name = '',
    config,
    busy,
    onBack,
    onConnectLive,
    onConnectSandbox
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left instructions matching user screenshot */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">
                        Create your WhatsApp Business Account
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        To continue you need to access your Facebook business account, as well as:
                    </p>
                    <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pl-1 leading-relaxed">
                        <li>Your company's legal name and address</li>
                        <li>A display name and short description</li>
                        <li>
                            A phone number you have access to, own by your business. Don't have one?{' '}
                            <span className="text-orange-500 font-semibold cursor-pointer">
                                Contact Support
                            </span>
                        </li>
                    </ol>

                    {config?.simulated && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                            Development mode detected: Sandbox simulation is available.
                            {onConnectSandbox && (
                                <button
                                    type="button"
                                    onClick={onConnectSandbox}
                                    className="block mt-2 font-semibold text-amber-700 underline"
                                >
                                    Launch Sandbox Simulation
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right phone mockup preview */}
                <div className="flex justify-center">
                    <PhoneMockup
                        name={name}
                        enableAutoResponse={true}
                        autoResponseMessage="Hello! Welcome to our WhatsApp service."
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={onConnectLive}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm transition-all disabled:opacity-50"
                >
                    {busy ? (
                        <span>Connecting...</span>
                    ) : (
                        <span>Continue With Facebook</span>
                    )}
                </button>
            </div>
        </div>
    )
}
