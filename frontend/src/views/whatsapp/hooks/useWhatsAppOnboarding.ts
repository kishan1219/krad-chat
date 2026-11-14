import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
    whatsappService,
    MetaOnboardingConfig,
    MetaWabaPhoneNumber,
    SaveMetaConfigPayload
} from '../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../utility/Utils'

export function useWhatsAppOnboarding(isOpen: boolean, onSuccess?: () => void, onClose?: () => void) {
    const user = useSelector((state: any) => state.auth?.userData)
    const clientName = user?.company_name || user?.name || user?.username || 'KRAD Technology'

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Mode & Checklist, 2: Profile, 3: Authorize & Save, 4: Multi-Number
    const [signupMode, setSignupMode] = useState<'standard' | 'coexistence'>('standard')
    const [name, setName] = useState(clientName)
    const [category, setCategory] = useState('PROF_SERVICES')
    const [enableAutoResponse, setEnableAutoResponse] = useState(false)
    const [autoResponseMessage, setAutoResponseMessage] = useState(
        'Hello! Welcome to our WhatsApp service. How can we assist you today?'
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

    // Authorization & Captured Assets State (Ensures user has explicit save button)
    const [capturedCode, setCapturedCode] = useState<string>('')
    const [capturedAssets, setCapturedAssets] = useState<{ waba_id: string; phone_number_id: string } | null>(null)
    const [activeState, setActiveState] = useState<string>('')

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
            if (!name) setName(clientName)
        } else {
            setStep(1)
            setError('')
            setNotice('')
            setShowQuickConfig(false)
            setCapturedCode('')
            setCapturedAssets(null)
            setActiveState('')
            setWabaPhoneNumbers([])
            setSelectedNumberIds([])
        }
        return () => cleanup.current()
    }, [isOpen, fetchConfig, clientName])

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
                name: name.trim() || clientName,
                waba_id: assets.waba_id,
                phone_number_id: assets.phone_number_id
            })

            // If user checked "Enable Auto Response", create initial welcome auto-response rule
            if (enableAutoResponse && autoResponseMessage.trim() && conn.phone_number_id) {
                try {
                    await whatsappService.createRoutingRule({
                        name: `Welcome Auto-Reply (${conn.name || 'WhatsApp Line'})`,
                        rule_type: 'fallback',
                        match_pattern: '*',
                        target_phone_number_id: conn.phone_number_id,
                        target_waba_id: conn.waba_id || assets.waba_id,
                        department: category || 'general',
                        priority: 50,
                        active: true
                    })
                } catch {
                    // Ignore auto-reply provision failure gracefully
                }
            }

            SuccessToast(`Connected! WhatsApp line ${conn.display_phone_number || assets.phone_number_id} is now saved & active!`)
            if (onSuccess) onSuccess()
            if (onClose) onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to save WhatsApp connection to KradChat'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }, [name, clientName, enableAutoResponse, autoResponseMessage, category, onSuccess, onClose])

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
            setActiveState(sess.state)

            if (sess.simulated || mode === 'sandbox') {
                const simulatedWaba = `1099${Math.floor(100000 + Math.random() * 900000)}`
                const simulatedPhoneId = `1055${Math.floor(100000 + Math.random() * 900000)}`
                const simulatedAssets = { waba_id: simulatedWaba, phone_number_id: simulatedPhoneId }
                setCapturedCode('simulated_code_' + Date.now())
                setCapturedAssets(simulatedAssets)
                await completeSingleSignup(sess.state, 'simulated_oauth_code_' + Date.now(), simulatedAssets)
                return
            }

            // Load Meta Facebook SDK if missing
            if (!(window as any).FB) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://connect.facebook.net/en_US/sdk.js'
                    script.async = true
                    script.onload = () => resolve()
                    script.onerror = () => {
                        script.remove()
                        reject(new Error('Meta Facebook SDK failed to load. Check ad-blocker or network.'))
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

            let authCode = ''
            let captured: { waba_id: string; phone_number_id: string } | null = null
            let isFinalizing = false

            const finish = async (codeToUse: string, assetsToUse: { waba_id: string; phone_number_id: string }) => {
                if (isFinalizing) return
                if (!codeToUse || !assetsToUse.phone_number_id || !assetsToUse.waba_id) return
                isFinalizing = true
                setBusy(true)

                try {
                    const wabaRes = await whatsappService.fetchWabaPhoneNumbers(assetsToUse.waba_id, codeToUse)
                    if (wabaRes.numbers && wabaRes.numbers.length > 1) {
                        setCurrentWabaId(assetsToUse.waba_id)
                        setCurrentTokenOrCode(codeToUse)
                        setWabaPhoneNumbers(wabaRes.numbers)
                        setSelectedNumberIds(wabaRes.numbers.map(n => n.id))
                        setStep(4) // Multi-number selection
                        setBusy(false)
                        return
                    }
                } catch {
                    // Fallback to single connect
                }
                await completeSingleSignup(sess.state, codeToUse, assetsToUse)
            }

            // PostMessage listener supporting all Facebook origins
            const messageHandler = (event: MessageEvent) => {
                const origin = event.origin || ''
                if (!origin.endsWith('facebook.com') && !origin.includes('facebook.com')) return
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
                    if (data?.type === 'WA_EMBEDDED_SIGNUP') {
                        if (data.event === 'FINISH') {
                            const wabaId = String(data.data?.waba_id || data.data?.wabaId || '')
                            const phoneId = String(
                                data.data?.phone_number_id ||
                                data.data?.phone_numbers?.[0]?.id ||
                                data.data?.phoneNumberId ||
                                ''
                            )
                            if (wabaId && phoneId) {
                                captured = { waba_id: wabaId, phone_number_id: phoneId }
                                setCapturedAssets(captured)
                                if (authCode) {
                                    void finish(authCode, captured)
                                }
                            }
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

            // Configure extras for Coexistence vs Standard mode
            const sessionExtras: Record<string, unknown> = {
                setup: {},
                featureType: signupMode === 'coexistence' ? 'coexistence' : '',
                sessionInfoVersion: '2'
            }

            ;(window as any).FB.login(
                (response: any) => {
                    if (response.authResponse?.code) {
                        authCode = response.authResponse.code
                        setCapturedCode(authCode)
                        if (captured?.phone_number_id && captured?.waba_id) {
                            void finish(authCode, captured)
                        } else {
                            setBusy(false)
                            setNotice('Meta authorization code received! Enter Phone Number ID to complete saving.')
                        }
                    } else if (response.status !== 'connected') {
                        setBusy(false)
                        setError('Facebook Login was closed without completing authorization.')
                    }
                },
                {
                    config_id: sess.config_id,
                    response_type: 'code',
                    override_default_response_type: true,
                    extras: sessionExtras
                }
            )
        } catch (err: unknown) {
            setBusy(false)
            const msg = err instanceof Error ? err.message : 'Could not launch Facebook Login.'
            setError(msg)
            ErrorToast(msg)
        }
    }, [config, signupMode, completeSingleSignup])

    // Explicit manual save trigger when popup completes
    const handleManualSave = useCallback(async (customWabaId?: string, customPhoneId?: string) => {
        const finalWaba = customWabaId || capturedAssets?.waba_id || currentWabaId
        const finalPhone = customPhoneId || capturedAssets?.phone_number_id
        const finalCode = capturedCode || currentTokenOrCode

        if (!finalWaba || !finalPhone || !finalCode || !activeState) {
            setError('Missing required Meta authorization parameters. Please launch Facebook Login again.')
            return
        }

        await completeSingleSignup(activeState, finalCode, { waba_id: finalWaba, phone_number_id: finalPhone })
    }, [capturedAssets, currentWabaId, capturedCode, currentTokenOrCode, activeState, completeSingleSignup])

    const handleBatchConnect = useCallback(async () => {
        if (!selectedNumberIds.length || !currentWabaId) return
        setBusy(true)
        setError('')
        try {
            const numbers = selectedNumberIds.map(id => ({
                phone_number_id: id,
                name: numberLabels[id]?.trim() || `${name || clientName} (${id.slice(-4)})`
            }))
            const res = await whatsappService.batchConnect({
                waba_id: currentWabaId,
                access_token: currentTokenOrCode || capturedCode,
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
    }, [selectedNumberIds, currentWabaId, currentTokenOrCode, capturedCode, numberLabels, name, clientName, onSuccess, onClose])

    return {
        step,
        setStep,
        signupMode,
        setSignupMode,
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
        capturedCode,
        capturedAssets,
        handleManualSave,
        // Multi-number
        wabaPhoneNumbers,
        selectedNumberIds,
        setSelectedNumberIds,
        numberLabels,
        setNumberLabels,
        handleBatchConnect
    }
}
