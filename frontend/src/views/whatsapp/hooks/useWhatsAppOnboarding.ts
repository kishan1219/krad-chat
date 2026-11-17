import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
    whatsappService,
    MetaOnboardingConfig,
    MetaWabaPhoneNumber,
    SaveMetaConfigPayload
} from '../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../utility/Utils'
import { ensureFreshToken } from '../../../utility/auth/tokenManager'

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
    const [capturedAssets, setCapturedAssets] = useState<{
        waba_id: string
        phone_number_id: string
        business_id?: string
        is_on_biz_app?: boolean
    } | null>(null)
    const [activeState, setActiveState] = useState<string>('')

    const capturedAssetsRef = useRef(capturedAssets)
    capturedAssetsRef.current = capturedAssets
    const capturedCodeRef = useRef(capturedCode)
    capturedCodeRef.current = capturedCode

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
            void ensureFreshToken(15 * 60 * 1000)
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

    // Top-level permanent message listener for Meta Embedded Signup popup
    useEffect(() => {
        if (!isOpen) return

        const handleMetaMessage = (event: MessageEvent) => {
            const origin = event.origin || ''
            if (!origin.endsWith('facebook.com') && !origin.includes('facebook.com')) return
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
                console.info('[Meta Embedded Signup Event]', origin, data)
                if (data?.type === 'WA_EMBEDDED_SIGNUP' || data?.event?.toString().toUpperCase().startsWith('FINISH')) {
                    const raw = data.data || data
                    const eventName = String(data.event || raw.event || '').toUpperCase()

                    if (eventName === 'CANCEL') {
                        setBusy(false)
                        setError('Onboarding was cancelled in Facebook.')
                        return
                    }

                    if (eventName === 'ERROR') {
                        setBusy(false)
                        setError(raw.error_message || 'Meta Embedded Signup returned an error.')
                        return
                    }

                    // WABA ID extraction across v4, v5, and Coexistence
                    const wabaId = String(
                        raw.waba_id ||
                        raw.messaging_account_ids?.[0] ||
                        raw.primary_waac_ids?.[0] ||
                        raw.wabaId ||
                        raw.target_id ||
                        raw.waba?.id ||
                        data.waba_id ||
                        data.messaging_account_ids?.[0] ||
                        ''
                    ).trim()

                    // Phone Number ID extraction
                    const phoneId = String(
                        raw.phone_number_id ||
                        raw.phoneNumberId ||
                        raw.phone_numbers?.[0]?.id ||
                        raw.phone_numbers?.[0] ||
                        raw.phone_number_ids?.[0] ||
                        raw.phoneId ||
                        data.phone_number_id ||
                        data.phone_numbers?.[0] ||
                        ''
                    ).trim()

                    const bizId = raw.business_id ? String(raw.business_id).trim() : undefined
                    const isOnBizApp = Boolean(
                        raw.is_on_biz_app ||
                        eventName === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' ||
                        signupMode === 'coexistence'
                    )

                    if (wabaId || phoneId) {
                        const captured = {
                            waba_id: wabaId,
                            phone_number_id: phoneId,
                            business_id: bizId,
                            is_on_biz_app: isOnBizApp
                        }
                        setCapturedAssets(captured)
                        capturedAssetsRef.current = captured
                    }
                }
            } catch {
                /* ignore non-json messages */
            }
        }

        window.addEventListener('message', handleMetaMessage)
        return () => window.removeEventListener('message', handleMetaMessage)
    }, [isOpen, signupMode])

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
        assets?: { waba_id?: string; phone_number_id?: string; is_on_biz_app?: boolean; business_id?: string }
    ) => {
        setBusy(true)
        setError('')
        try {
            const cleanName = (typeof name === 'string' ? name.trim() : '') || clientName
            const conn = await whatsappService.completeOnboarding({
                state,
                code,
                name: cleanName,
                waba_id: assets?.waba_id ? String(assets.waba_id).trim() : undefined,
                phone_number_id: assets?.phone_number_id ? String(assets.phone_number_id).trim() : undefined,
                connection_mode: assets?.is_on_biz_app || signupMode === 'coexistence' ? 'coexistence' : 'dedicated',
                is_on_biz_app: Boolean(assets?.is_on_biz_app || signupMode === 'coexistence'),
                business_id: assets?.business_id
            })

            // If user checked "Enable Auto Response", create initial welcome auto-response rule
            const autoMsg = typeof autoResponseMessage === 'string' ? autoResponseMessage.trim() : ''
            if (enableAutoResponse && autoMsg && conn?.phone_number_id) {
                try {
                    await whatsappService.createRoutingRule({
                        name: `Welcome Auto-Reply (${conn.name || 'WhatsApp Line'})`,
                        rule_type: 'fallback',
                        match_pattern: '*',
                        target_phone_number_id: conn.phone_number_id,
                        target_waba_id: conn.waba_id || assets?.waba_id,
                        department: category || 'general',
                        priority: 50,
                        active: true
                    })
                } catch {
                    // Ignore auto-reply provision failure gracefully
                }
            }

            SuccessToast(`Connected! WhatsApp line ${conn?.display_phone_number || assets?.phone_number_id || conn?.phone_number_id} is now saved & active!`)
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
        // Guarantee refreshed JWT session before opening Meta popup
        await ensureFreshToken(15 * 60 * 1000)

        if (mode === 'live' && config && !config.configured) {
            setShowQuickConfig(true)
            setError('Meta Embedded Signup is not configured yet. Enter App ID and credentials below.')
            return
        }

        setBusy(true)
        setError('')
        setNotice('')

        // Safety timeout so the button never gets permanently stuck
        const safetyTimer = setTimeout(() => {
            setBusy(false)
            setNotice('If the Meta login window did not appear, check for pop-up blocker in your address bar or save directly below.')
        }, 12000)

        try {
            const sess = await whatsappService.beginOnboarding(mode)
            setActiveState(sess.state)

            if (sess.simulated || mode === 'sandbox') {
                clearTimeout(safetyTimer)
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
            let captured: { waba_id: string; phone_number_id: string; business_id?: string; is_on_biz_app?: boolean } | null = null
            let isFinalizing = false

            const finish = async (codeToUse: string, assetsToUse?: { waba_id?: string; phone_number_id?: string; business_id?: string; is_on_biz_app?: boolean } | null) => {
                if (isFinalizing) return
                if (!codeToUse) return
                isFinalizing = true
                setBusy(true)

                try {
                    await completeSingleSignup(sess.state, codeToUse, assetsToUse || undefined)
                } catch {
                    isFinalizing = false
                    setBusy(false)
                }
            }

            // Normalization layer handling FINISH, FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING, CANCEL, and ERROR
            const messageHandler = (event: MessageEvent) => {
                const origin = event.origin || ''
                if (!origin.endsWith('facebook.com') && !origin.includes('facebook.com')) return
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
                    if (data?.type === 'WA_EMBEDDED_SIGNUP' || data?.event?.toString().toUpperCase().startsWith('FINISH')) {
                        const raw = data.data || data
                        const eventName = String(data.event || raw.event || '').toUpperCase()

                        if (eventName === 'CANCEL') {
                            clearTimeout(safetyTimer)
                            setBusy(false)
                            setError('Onboarding was cancelled in Facebook.')
                            return
                        }

                        if (eventName === 'ERROR') {
                            clearTimeout(safetyTimer)
                            setBusy(false)
                            setError(raw.error_message || 'Meta Embedded Signup returned an error.')
                            return
                        }

                        // WABA ID extraction across v4, v5, and Coexistence
                        const wabaId = String(
                            raw.waba_id ||
                            raw.messaging_account_ids?.[0] ||
                            raw.primary_waac_ids?.[0] ||
                            raw.wabaId ||
                            raw.target_id ||
                            raw.waba?.id ||
                            data.waba_id ||
                            data.messaging_account_ids?.[0] ||
                            ''
                        ).trim()

                        // Phone Number ID extraction
                        const phoneId = String(
                            raw.phone_number_id ||
                            raw.phoneNumberId ||
                            raw.phone_numbers?.[0]?.id ||
                            raw.phone_numbers?.[0] ||
                            raw.phone_number_ids?.[0] ||
                            raw.phoneId ||
                            data.phone_number_id ||
                            data.phone_numbers?.[0] ||
                            ''
                        ).trim()

                        const bizId = raw.business_id ? String(raw.business_id).trim() : undefined
                        const isOnBizApp = Boolean(
                            raw.is_on_biz_app ||
                            eventName === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' ||
                            signupMode === 'coexistence'
                        )

                        if (wabaId || phoneId) {
                            captured = {
                                waba_id: wabaId,
                                phone_number_id: phoneId,
                                business_id: bizId,
                                is_on_biz_app: isOnBizApp
                            }
                            setCapturedAssets(captured)
                            capturedAssetsRef.current = captured
                            if (authCode) {
                                clearTimeout(safetyTimer)
                                void finish(authCode, captured)
                            }
                        }
                    }
                } catch {
                    /* ignore */
                }
            }

            window.addEventListener('message', messageHandler)
            cleanup.current = () => window.removeEventListener('message', messageHandler)

            // Configure extras for Coexistence vs Standard mode with sessionInfoVersion '3'
            const sessionExtras: Record<string, unknown> = {
                setup: {},
                featureType: signupMode === 'coexistence' ? 'whatsapp_business_app_onboarding' : '',
                sessionInfoVersion: '3'
            }

            ;(window as any).FB.login(
                (response: any) => {
                    clearTimeout(safetyTimer)
                    const auth = response?.authResponse
                    const codeOrToken = auth?.code || auth?.accessToken
                    if (codeOrToken) {
                        authCode = codeOrToken
                        setCapturedCode(codeOrToken)
                        setBusy(false) // Ready for manual save or auto-finish on popup close
                        if (captured?.waba_id && captured?.phone_number_id) {
                            void finish(codeOrToken, captured)
                        } else {
                            setBusy(false)
                            setTimeout(() => {
                                if (authCode && !isFinalizing && captured?.waba_id && captured?.phone_number_id) {
                                    void finish(authCode, captured)
                                }
                            }, 2500)
                        }
                    } else if (response?.status !== 'connected') {
                        setBusy(false)
                        setError('Facebook Login was closed without completing authorization.')
                    } else {
                        setBusy(false)
                        setError('Facebook connected, but no authorization code was returned. Please try again.')
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
            clearTimeout(safetyTimer)
            setBusy(false)
            const msg = err instanceof Error ? err.message : 'Could not launch Facebook Login.'
            setError(msg)
            ErrorToast(msg)
        }
    }, [config, signupMode, completeSingleSignup])

    // Explicit save trigger when popup completes or direct save is requested
    const handleManualSave = useCallback(async (customWabaId?: unknown, customPhoneId?: unknown, customToken?: unknown) => {
        const safeStr = (v: unknown): string => {
            if (typeof v === 'string') return v.trim()
            if (typeof v === 'number') return String(v).trim()
            return ''
        }

        const finalWaba = safeStr(customWabaId) || safeStr(capturedAssets?.waba_id) || safeStr(capturedAssetsRef.current?.waba_id) || safeStr(currentWabaId)
        const finalPhone = safeStr(customPhoneId) || safeStr(capturedAssets?.phone_number_id) || safeStr(capturedAssetsRef.current?.phone_number_id)
        const finalToken = safeStr(customToken)

        setBusy(true)
        setError('')
        try {
            // If direct access token is provided, connect directly via createConnection
            if (finalToken && finalWaba && finalPhone) {
                await whatsappService.createConnection({
                    name: (typeof name === 'string' ? name.trim() : '') || clientName,
                    waba_id: finalWaba,
                    phone_number_id: finalPhone,
                    access_token: finalToken,
                    connection_mode: capturedAssets?.is_on_biz_app || signupMode === 'coexistence' ? 'coexistence' : 'dedicated',
                    is_on_biz_app: Boolean(capturedAssets?.is_on_biz_app || signupMode === 'coexistence')
                })
                SuccessToast('WhatsApp connection saved successfully!')
                if (onSuccess) onSuccess()
                if (onClose) onClose()
                return
            }

            let stateToUse = activeState
            if (!stateToUse) {
                try {
                    const sess = await whatsappService.beginOnboarding('live')
                    stateToUse = sess.state
                    setActiveState(sess.state)
                } catch {
                    // keep stateToUse
                }
            }

            const codeToUse = finalToken || capturedCode || capturedCodeRef.current || currentTokenOrCode || 'meta_direct_onboarding_token'

            await completeSingleSignup(stateToUse, codeToUse, {
                waba_id: finalWaba || undefined,
                phone_number_id: finalPhone || undefined,
                is_on_biz_app: Boolean(capturedAssets?.is_on_biz_app || signupMode === 'coexistence'),
                business_id: capturedAssets?.business_id
            })
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not complete WhatsApp connection'
            if (msg.includes('expired') || msg.includes('another login') || msg.includes('Start again')) {
                try {
                    const freshSess = await whatsappService.beginOnboarding('live')
                    setActiveState(freshSess.state)
                } catch {}
            }
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }, [name, clientName, capturedAssets, currentWabaId, capturedCode, currentTokenOrCode, activeState, completeSingleSignup, onSuccess, onClose])

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
