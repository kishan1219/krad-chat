import React, { useState } from 'react'
import {
    X,
    Smartphone,
    MessageSquare,
    Phone,
    CheckCircle
} from 'react-feather'
import { whatsappService, WhatsAppConnection } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface CoExistenceMigrationModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CoExistenceMigrationModal({
    connection,
    isOpen,
    onClose,
    onSuccess
}: CoExistenceMigrationModalProps) {
    const [step, setStep] = useState<1 | 2>(1)
    const [codeMethod, setCodeMethod] = useState<'SMS' | 'VOICE'>('SMS')
    const [otpCode, setOtpCode] = useState('')
    const [requestingCode, setRequestingCode] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen || !connection) return null

    const handleRequestCode = async () => {
        setRequestingCode(true)
        setError('')
        try {
            await whatsappService.requestCode(connection.id, { code_method: codeMethod })
            SuccessToast(`6-digit verification code sent via ${codeMethod}!`)
            setStep(2)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to request verification code'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setRequestingCode(false)
        }
    }

    const handleVerifyPin = async () => {
        if (!otpCode || otpCode.trim().length !== 6) {
            setError('Please enter the 6-digit verification code.')
            return
        }
        setVerifying(true)
        setError('')
        try {
            await whatsappService.connectionAction(connection.id, 'register', { pin: otpCode.trim() })
            SuccessToast('Number successfully verified and migrated to Cloud API!')
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'PIN verification failed'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setVerifying(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                Migrate WhatsApp Business App
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Co-Existence: Connect {connection.display_phone_number || connection.phone_number_id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Pre-migration Checklist
                                </h4>
                                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Back up existing chats in your WhatsApp Business app (Settings → Chats → Chat backup).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Ensure this SIM card is active to receive an SMS or voice verification call.</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Choose Verification Method
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCodeMethod('SMS')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                                            codeMethod === 'SMS'
                                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <MessageSquare size={16} />
                                        <span>SMS Text Code</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCodeMethod('VOICE')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                                            codeMethod === 'VOICE'
                                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <Phone size={16} />
                                        <span>Voice Call</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Enter the 6-digit registration code sent to{' '}
                                <span className="font-semibold text-slate-800 dark:text-white">
                                    {connection.display_phone_number || connection.phone_number_id}
                                </span>{' '}
                                via {codeMethod}:
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="w-full text-center text-2xl tracking-widest font-mono py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>Didn't receive code?</span>
                                <button
                                    type="button"
                                    onClick={handleRequestCode}
                                    disabled={requestingCode}
                                    className="text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={handleRequestCode}
                            disabled={requestingCode}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all disabled:opacity-50"
                        >
                            {requestingCode ? 'Requesting Code...' : `Request ${codeMethod} Code`}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleVerifyPin}
                            disabled={verifying || otpCode.length !== 6}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
                        >
                            {verifying ? 'Verifying PIN...' : 'Complete Migration'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
