import React from 'react'
import { X, Settings } from 'react-feather'
import { useWhatsAppOnboarding } from './hooks/useWhatsAppOnboarding'
import { StepPrerequisites } from './components/onboarding/StepPrerequisites'
import { StepBusinessProfile } from './components/onboarding/StepBusinessProfile'
import { StepMetaAuthorize } from './components/onboarding/StepMetaAuthorize'
import { WabaMultiNumberSelector } from './components/onboarding/WabaMultiNumberSelector'

interface AddWhatsappConfigModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export default function AddWhatsappConfigModal({
    isOpen,
    onClose,
    onSuccess
}: AddWhatsappConfigModalProps) {
    const {
        step,
        setStep,
        name,
        setName,
        category,
        setCategory,
        enableAutoResponse,
        setEnableAutoResponse,
        autoResponseMessage,
        setAutoResponseMessage,
        busy,
        error,
        notice,
        config,
        showQuickConfig,
        setShowQuickConfig,
        quickAppId,
        setQuickAppId,
        quickConfigId,
        setQuickConfigId,
        quickAppSecret,
        setQuickAppSecret,
        quickGraphVersion,
        setQuickGraphVersion,
        savingQuickConfig,
        saveQuickConfig,
        handleConnectWithFacebook,
        wabaPhoneNumbers,
        selectedNumberIds,
        setSelectedNumberIds,
        numberLabels,
        setNumberLabels,
        handleBatchConnect
    } = useWhatsAppOnboarding(isOpen, onSuccess, onClose)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            Add WhatsApp Configuration
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Step {step} of 4: {step === 1 ? 'Prerequisites' : step === 2 ? 'Business Profile' : step === 3 ? 'Meta Authorization' : 'Select Phone Numbers'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowQuickConfig(!showQuickConfig)}
                            title="Meta App Config"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Quick Meta Config Drawer */}
                {showQuickConfig && (
                    <div className="px-6 py-4 bg-orange-50/50 dark:bg-slate-800/80 border-b border-orange-200 dark:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-400">
                                Meta Embedded Signup Credentials
                            </h4>
                            <span className="text-xs text-slate-500">Self-hosted Meta App IDs</span>
                        </div>
                        <form onSubmit={saveQuickConfig} className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Meta App ID</label>
                                <input
                                    type="text"
                                    value={quickAppId}
                                    onChange={(e) => setQuickAppId(e.target.value)}
                                    placeholder="e.g. 598395012455883"
                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Config ID</label>
                                <input
                                    type="text"
                                    value={quickConfigId}
                                    onChange={(e) => setQuickConfigId(e.target.value)}
                                    placeholder="Embedded Signup Configuration ID"
                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">App Secret (optional)</label>
                                <input
                                    type="password"
                                    value={quickAppSecret}
                                    onChange={(e) => setQuickAppSecret(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Graph Version</label>
                                <input
                                    type="text"
                                    value={quickGraphVersion}
                                    onChange={(e) => setQuickGraphVersion(e.target.value)}
                                    placeholder="v22.0"
                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickConfig(false)}
                                    className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingQuickConfig}
                                    className="px-3 py-1 text-xs rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium disabled:opacity-50"
                                >
                                    {savingQuickConfig ? 'Saving...' : 'Save Meta Config'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                        {error}
                    </div>
                )}
                {notice && (
                    <div className="mx-6 mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
                        {notice}
                    </div>
                )}

                {/* Body Content based on Step */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {step === 1 && (
                        <StepPrerequisites
                            onNext={() => setStep(2)}
                            onClose={onClose}
                        />
                    )}

                    {step === 2 && (
                        <StepBusinessProfile
                            name={name}
                            setName={setName}
                            category={category}
                            setCategory={setCategory}
                            enableAutoResponse={enableAutoResponse}
                            setEnableAutoResponse={setEnableAutoResponse}
                            autoResponseMessage={autoResponseMessage}
                            setAutoResponseMessage={setAutoResponseMessage}
                            onBack={() => setStep(1)}
                            onNext={() => setStep(3)}
                        />
                    )}

                    {step === 3 && (
                        <StepMetaAuthorize
                            name={name}
                            config={config}
                            busy={busy}
                            onBack={() => setStep(2)}
                            onConnectLive={() => handleConnectWithFacebook('live')}
                            onConnectSandbox={() => handleConnectWithFacebook('sandbox')}
                        />
                    )}

                    {step === 4 && (
                        <WabaMultiNumberSelector
                            numbers={wabaPhoneNumbers}
                            selectedIds={selectedNumberIds}
                            onToggleSelection={(id) => {
                                setSelectedNumberIds(prev =>
                                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                                )
                            }}
                            numberLabels={numberLabels}
                            onUpdateLabel={(id, label) => {
                                setNumberLabels(prev => ({ ...prev, [id]: label }))
                            }}
                            busy={busy}
                            onBack={() => setStep(3)}
                            onBatchConnect={handleBatchConnect}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
