import React, { useState } from 'react'
import { Key } from 'react-feather'
import { whatsappService, CreateConnectionPayload } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface ManualCredentialsCardProps {
    onSuccess: () => void
    onClose: () => void
}

export function ManualCredentialsCard({ onSuccess, onClose }: ManualCredentialsCardProps) {
    const [name, setName] = useState('')
    const [wabaId, setWabaId] = useState('')
    const [phoneNumberId, setPhoneNumberId] = useState('')
    const [displayNumber, setDisplayNumber] = useState('')
    const [token, setToken] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!wabaId.trim() || !phoneNumberId.trim() || !token.trim()) {
            setError('WABA ID, Phone Number ID, and System User Token are required.')
            return
        }

        setBusy(true)
        setError('')
        try {
            const payload: CreateConnectionPayload = {
                name: name.trim() || 'WhatsApp Line',
                waba_id: wabaId.trim(),
                phone_number_id: phoneNumberId.trim(),
                display_phone_number: displayNumber.trim() || undefined,
                access_token: token.trim()
            }
            await whatsappService.createConnection(payload)
            SuccessToast('WhatsApp manual connection established!')
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to connect WhatsApp line'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
                        <Key size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                            Manual Meta Cloud API Credentials
                        </h3>
                        <p className="text-xs text-slate-400">
                            Direct connection using permanent System User Access Token
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    Hide
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sales Support"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Display Phone Number
                    </label>
                    <input
                        type="text"
                        value={displayNumber}
                        onChange={(e) => setDisplayNumber(e.target.value)}
                        placeholder="e.g. +1 555 123 4567"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        WhatsApp Business Account (WABA) ID *
                    </label>
                    <input
                        type="text"
                        required
                        value={wabaId}
                        onChange={(e) => setWabaId(e.target.value)}
                        placeholder="e.g. 1099234827382"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Phone Number ID *
                    </label>
                    <input
                        type="text"
                        required
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                        placeholder="e.g. 105592837482"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Meta Permanent Access Token *
                    </label>
                    <input
                        type="password"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="EAAB..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm disabled:opacity-50"
                    >
                        {busy ? 'Connecting...' : 'Establish Connection'}
                    </button>
                </div>
            </form>
        </div>
    )
}
