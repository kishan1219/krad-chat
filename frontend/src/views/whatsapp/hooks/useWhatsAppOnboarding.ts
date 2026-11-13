import { useEffect, useState, useRef, useCallback } from 'react'
import {
    whatsappService,
    MetaOnboardingConfig,
    MetaWabaPhoneNumber,
    SaveMetaConfigPayload
} from '../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../utility/Utils'

export function useWhatsAppOnboarding(isOpen: boolean, onSuccess?: () => void, onClose?: () => void) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Pre-reqs, 2: Profile, 3: Connect/FB, 4: Multi-Number
    const [name, setName] = useState('')
    const [category, setCategory] = useState('OTHER')
    const [enableAutoResponse, setEnableAutoResponse] = useState(false)
    const [autoResponseMessage, setAutoResponseMessage] = useState(
        'Hello! Thank you for reaching out to us. We have received your message and will respond shortly.'
    )

    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [config, setConfig] = useState<MetaOnboardingConfig | null>(null)

    // Quick Meta Config Drawer
    const [showQuickConfig, setShowQuickConfig] = useState(false)
    const [quickAppId, setQuickAppId] = useState('')
    const [quickConfigId, setQuickConfigId] = useState('')
    const [quickAppSecret, setQuickAppSecret] = useState('')
    const [quickGraphVersion, setQuickGraphVersion] = useState('v22.0')
    const [savingQuickConfig, setSavingQuickConfig] = useState(false)

    // Multi-number selection state
    const [wabaPhoneNumbers, setWabaPhoneNumbers] = useState<MetaWabaPhoneNumber[]>([])
    const [selectedNumberIds, setSelectedNumberIds] = useState<string[]>([])
    const [numberLabels, setNumberLabels] = useState<Record<string, string>>({})
    const [currentWabaId, setCurrentWabaId] = useState('')
    const [currentTokenOrCode, setCurrentTokenOrCode] = useState('')

    const cleanup = useRef<() => void>(() => {})

    const fetchConfig = useCallback(async () => {
        try {
            const data = await whatsappService.getOnboardingConfig()
            setConfig(data)
            if (data.app_id) setQuickAppId(data.app_id)
            if (data.config_id) setQuickConfigId(data.config_id)
            if (data.graph_version) setQuickGraphVersion(data.graph_version)
        } catch {
            setConfig({ configured: false, app_id: null, config_id: null, graph_version: 'v22.0', simulated: true })
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            void fetchConfig()
        } else {
            setStep(1)
            setError('')
            setNotice('')
            setShowQuickConfig(false)
            setWabaPhoneNumbers([])
            setSelectedNumberIds([])
        }
        return () => cleanup.current()
    }, [isOpen, fetchConfig])

    const saveQuickConfig = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingQuickConfig(true)
        setError('')
        try {
            const payload: SaveMetaConfigPayload = {
                app_id: quickAppId.trim(),
                config_id: quickConfigId.trim(),
                graph_version: quickGraphVersion.trim() || 'v22.0',
                app_secret: quickAppSecret.trim()
            }
            await whatsappService.saveOnboardingConfig(payload)
            SuccessToast('Meta App credentials saved to server successfully!')
            setShowQuickConfig(false)
            await fetchConfig()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not save Meta configuration'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setSavingQuickConfig(false)
        }
    }, [quickAppId, quickConfigId, quickGraphVersion, quickAppSecret, fetchConfig])

    const completeSingleSignup = useCallback(async (
        state: string,
        code: string,
        assets: { waba_id: string; phone_number_id: string }
    ) => {
        setBusy(true)
        setError('')
        try {
            const conn = await whatsappService.completeOnboarding({
                state,
                code,
                name: name.trim() || 'WhatsApp Business Line',
                waba_id: assets.waba_id,
                phone_number_id: assets.phone_number_id
            })
            SuccessToast(`Connected! WhatsApp number ${conn.display_phone_number || assets.phone_number_id} is active.`)
            if (onSuccess) onSuccess()
            if (onClose) onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to complete WhatsApp onboarding'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }, [name, onSuccess, onClose])

    const handleConnectWithFacebook = useCallback(async (mode: 'live' | 'sandbox' = 'live') => {
        if (mode === 'live' && config && !config.configured) {
            setShowQuickConfig(true)
            setError('Meta Embedded Signup is not configured yet. Enter App ID and credentials below.')
            return
        }

        setBusy(true)
        setError('')
        setNotice('')

        try {
            const sess = await whatsappService.beginOnboarding(mode)

            if (sess.simulated || mode === 'sandbox') {
                const simulatedWaba = `1099${Math.floor(100000 + Math.random() * 900000)}`
                // Fetch numbers to give user choice if multi-number is enabled
                const wabaRes = await whatsappService.fetchWabaPhoneNumbers(simulatedWaba, 'simulated_code')
                if (wabaRes.numbers && wabaRes.numbers.length > 1) {
                    setCurrentWabaId(simulatedWaba)
                    setCurrentTokenOrCode('simulated_code')
                    setWabaPhoneNumbers(wabaRes.numbers)
                    setSelectedNumberIds(wabaRes.numbers.map(n => n.id))
                    setStep(4) // Move to multi-number selection
                    setBusy(false)
                    return
                }

                const simulatedAssets = {
                    waba_id: simulatedWaba,
                    phone_number_id: `1055${Math.floor(100000 + Math.random() * 900000)}`
                }
                await completeSingleSignup(sess.state, 'simulated_oauth_code_' + Date.now(), simulatedAssets)
                return
            }

            // Load Meta Facebook SDK
            if (!(window as any).FB) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://connect.facebook.net/en_US/sdk.js'
                    script.async = true
                    script.onload = () => resolve()
                    script.onerror = () => {
                        script.remove()
                        reject(new Error('Meta Facebook SDK failed to load.'))
                    }
                    document.head.appendChild(script)
                })
            }

            ;(window as any).FB.init({
                appId: sess.app_id,
                version: sess.graph_version || 'v22.0',
                autoLogAppEvents: false,
                xfbml: false
            })

            let code = ''
            let assets: { waba_id: string; phone_number_id: string } | null = null
            let submitted = false

            const finish = async () => {
                if (!submitted && code && assets?.phone_number_id && assets?.waba_id) {
                    submitted = true
                    try {
                        const wabaRes = await whatsappService.fetchWabaPhoneNumbers(assets.waba_id, code)
                        if (wabaRes.numbers && wabaRes.numbers.length > 1) {
                            setCurrentWabaId(assets.waba_id)
                            setCurrentTokenOrCode(code)
                            setWabaPhoneNumbers(wabaRes.numbers)
                            setSelectedNumberIds(wabaRes.numbers.map(n => n.id))
                            setStep(4) // Multi-number selection
                            setBusy(false)
                            return
                        }
                    } catch {
                        // fallback to single connect
                    }
                    await completeSingleSignup(sess.state, code, assets)
                }
            }

            const messageHandler = (event: MessageEvent) => {
                if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
                    if (data?.type === 'WA_EMBEDDED_SIGNUP') {
                        if (data.event === 'FINISH') {
                            assets = {
                                phone_number_id: String(data.data?.phone_number_id || ''),
                                waba_id: String(data.data?.waba_id || '')
                            }
                            void finish()
                        } else if (data.event === 'CANCEL') {
                            setBusy(false)
                            setError('Onboarding was cancelled in Facebook.')
                        }
                    }
                } catch {
                    /* ignore */
                }
            }

            window.addEventListener('message', messageHandler)
            cleanup.current = () => window.removeEventListener('message', messageHandler)

            ;(window as any).FB.login(
                (response: any) => {
                    if (response.authResponse?.code) {
                        code = response.authResponse.code
                        void finish()
                    } else if (response.status !== 'connected') {
                        setBusy(false)
                        setError('Facebook Login was closed without authorization.')
                    }
                },
                {
                    config_id: sess.config_id,
                    response_type: 'code',
                    override_default_response_type: true,
                    extras: { setup: {}, featureType: '', sessionInfoVersion: '2' }
                }
            )
        } catch (err: unknown) {
            setBusy(false)
            const msg = err instanceof Error ? err.message : 'Could not launch Facebook Login.'
            setError(msg)
            ErrorToast(msg)
        }
    }, [config, completeSingleSignup])

    const handleBatchConnect = useCallback(async () => {
        if (!selectedNumberIds.length || !currentWabaId) return
        setBusy(true)
        setError('')
        try {
            const numbers = selectedNumberIds.map(id => ({
                phone_number_id: id,
                name: numberLabels[id]?.trim() || `${name || 'WhatsApp'} (${id.slice(-4)})`
            }))
            const res = await whatsappService.batchConnect({
                waba_id: currentWabaId,
                access_token: currentTokenOrCode,
                numbers
            })
            SuccessToast(`Successfully connected ${res.count} phone numbers!`)
            if (onSuccess) onSuccess()
            if (onClose) onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Batch connect failed'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }, [selectedNumberIds, currentWabaId, currentTokenOrCode, numberLabels, name, onSuccess, onClose])

    return {
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
        setError,
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
        // Multi-number
        wabaPhoneNumbers,
        selectedNumberIds,
        setSelectedNumberIds,
        numberLabels,
        setNumberLabels,
        handleBatchConnect
    }
}
