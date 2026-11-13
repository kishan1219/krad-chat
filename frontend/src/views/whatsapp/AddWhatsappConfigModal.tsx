// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap'
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle,
    Info,
    Key,
    Phone,
    Shield,
    Smartphone,
    Video,
    MoreVertical,
    Send,
    Settings,
    X,
    Zap
} from 'react-feather'
import httpConfig from '../../utility/http/httpConfig'
import { SuccessToast, ErrorToast } from '../../utility/Utils'

const BUSINESS_CATEGORIES = [
    { value: 'OTHER', label: 'Other / General Business' },
    { value: 'AUTO', label: 'Automotive & Vehicles' },
    { value: 'BEAUTY', label: 'Beauty, Cosmetics & Salon' },
    { value: 'APPAREL', label: 'Clothing, Apparel & Accessories' },
    { value: 'EDU', label: 'Education & Training' },
    { value: 'ENTERTAIN', label: 'Entertainment & Media' },
    { value: 'EVENT_PLAN', label: 'Event Planning & Venues' },
    { value: 'FINANCE', label: 'Finance, Banking & Insurance' },
    { value: 'FOOD_GROCERY', label: 'Food & Grocery' },
    { value: 'GOV', label: 'Government & Public Services' },
    { value: 'HOTEL', label: 'Hotel & Lodging' },
    { value: 'HEALTH', label: 'Medical & Healthcare' },
    { value: 'NONPROFIT', label: 'Non-profit & Community' },
    { value: 'PROF_SERVICES', label: 'Professional Services & Consulting' },
    { value: 'RETAIL', label: 'Retail & E-commerce' },
    { value: 'TRAVEL', label: 'Travel & Transportation' },
    { value: 'RESTAURANT', label: 'Restaurant & Dining' }
]

interface AddWhatsappConfigModalProps {
    isOpen: boolean
    toggle: () => void
    onSuccess?: () => void
}

export default function AddWhatsappConfigModal({ isOpen, toggle, onSuccess }: AddWhatsappConfigModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [name, setName] = useState('')
    const [category, setCategory] = useState('OTHER')
    const [enableAutoResponse, setEnableAutoResponse] = useState(false)
    const [autoResponseMessage, setAutoResponseMessage] = useState(
        'Hello! Thank you for reaching out to us. We have received your message and will respond shortly.'
    )
    const [otpSecret, setOtpSecret] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [config, setConfig] = useState<any>(null)
    const [showQuickConfig, setShowQuickConfig] = useState(false)
    const [quickAppId, setQuickAppId] = useState('')
    const [quickConfigId, setQuickConfigId] = useState('')
    const [quickAppSecret, setQuickAppSecret] = useState('')
    const [quickGraphVersion, setQuickGraphVersion] = useState('v22.0')
    const [savingQuickConfig, setSavingQuickConfig] = useState(false)

    const cleanup = useRef<() => void>(() => {})

    useEffect(() => {
        if (isOpen) {
            void fetchConfig()
        } else {
            setStep(1)
            setError('')
            setNotice('')
            setShowQuickConfig(false)
        }
        return () => cleanup.current()
    }, [isOpen])

    async function api(path: string, method = 'POST', body?: any) {
        let token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
        try {
            if (token.startsWith('"') || token.startsWith('{')) {
                const parsed = JSON.parse(token)
                token = typeof parsed === 'string' ? parsed : (parsed?.accessToken || parsed?.token || token)
            }
        } catch {
            /* ignore */
        }
        const response = await fetch(`${httpConfig.baseUrl}whatsapp/onboarding/${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            ...(body ? { body: JSON.stringify(body) } : {})
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }

    async function fetchConfig() {
        try {
            const data = await api('config', 'GET')
            setConfig(data)
            if (data.app_id) setQuickAppId(data.app_id)
            if (data.config_id) setQuickConfigId(data.config_id)
            if (data.graph_version) setQuickGraphVersion(data.graph_version)
        } catch {
            setConfig({ configured: false, app_id: null, config_id: null, simulated: true })
        }
    }

    async function handleSaveQuickConfig(e: React.FormEvent) {
        e.preventDefault()
        setSavingQuickConfig(true)
        setError('')
        try {
            await api('config', 'POST', {
                app_id: quickAppId.trim(),
                config_id: quickConfigId.trim(),
                graph_version: quickGraphVersion.trim() || 'v22.0',
                app_secret: quickAppSecret.trim()
            })
            SuccessToast('Meta App credentials saved to server successfully!')
            setShowQuickConfig(false)
            await fetchConfig()
        } catch (err: any) {
            setError(err.message || 'Could not save Meta configuration.')
        } finally {
            setSavingQuickConfig(false)
        }
    }

    async function completeSignup(state: string, code: string, assets: { waba_id: string; phone_number_id: string }) {
        setBusy(true)
        setError('')
        try {
            const conn = await api('complete', 'POST', {
                state,
                code,
                name: name.trim() || 'WhatsApp Business Line',
                waba_id: assets.waba_id,
                phone_number_id: assets.phone_number_id
            })
            SuccessToast(
                `Connected! WhatsApp number ${conn.display_phone_number || assets.phone_number_id} is active.`
            )
            if (onSuccess) onSuccess()
            toggle()
        } catch (err: any) {
            setError(err.message || 'Failed to complete WhatsApp onboarding.')
        } finally {
            setBusy(false)
        }
    }

    async function handleConnectWithFacebook(mode: 'live' | 'sandbox' = 'live') {
        setBusy(true)
        setError('')
        setNotice('')

        try {
            const sess = await api('begin', 'POST', { mode })

            if (sess.simulated || mode === 'sandbox') {
                const simulatedAssets = {
                    waba_id: `1099${Math.floor(100000 + Math.random() * 900000)}`,
                    phone_number_id: `1055${Math.floor(100000 + Math.random() * 900000)}`
                }
                await completeSignup(sess.state, 'simulated_oauth_code_' + Date.now(), simulatedAssets)
                return
            }

            if (!(window as any).FB) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://connect.facebook.net/en_US/sdk.js'
                    script.async = true
                    script.onload = () => resolve()
                    script.onerror = () => {
                        script.remove()
                        reject(new Error('Meta Facebook SDK could not load. Check your network or ad-blocker settings.'))
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
            let assets: any = null
            let submitted = false

            const finish = async () => {
                if (!submitted && code && assets?.phone_number_id && assets?.waba_id) {
                    submitted = true
                    await completeSignup(sess.state, code, assets)
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
                        } else if (data.event === 'ERROR') {
                            setBusy(false)
                            setError(data.data?.error_message || 'Facebook onboarding reported an error.')
                        }
                    }
                } catch {
                    /* ignore non-json messages */
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
                        setError('Facebook Login did not return an authorization code.')
                    }
                },
                {
                    config_id: sess.config_id,
                    response_type: 'code',
                    override_default_response_type: true,
                    extras: {
                        setup: {},
                        featureType: '',
                        sessionInfoVersion: '2'
                    }
                }
            )
        } catch (err: any) {
            setBusy(false)
            setError(err.message || 'Could not initiate Facebook login.')
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            className='modal-dialog-centered modal-lg'
            backdrop='static'
            contentClassName='rounded-2xl border-0 shadow-lg'
        >
            <ModalHeader toggle={toggle} className='bg-light px-3 py-2 border-bottom'>
                <div className='d-flex align-items-center gap-2'>
                    <div
                        className='d-flex align-items-center justify-content-center rounded-circle'
                        style={{ width: 34, height: 34, backgroundColor: '#d1fae5', color: '#00b074' }}
                    >
                        <Smartphone size={18} />
                    </div>
                    <div>
                        <h5 className='mb-0 fw-bolder text-dark'>Add WhatsApp Configuration</h5>
                        <small className='text-muted'>Meta Cloud API Onboarding Wizard</small>
                    </div>
                </div>
            </ModalHeader>

            {/* Stepper Progress Bar */}
            <div className='px-4 pt-3 pb-2 bg-light border-bottom'>
                <div className='d-flex align-items-center justify-content-between position-relative'>
                    <div
                        className='position-absolute'
                        style={{
                            height: '2px',
                            backgroundColor: '#e2e8f0',
                            top: '50%',
                            left: '5%',
                            right: '5%',
                            zIndex: 1
                        }}
                    />
                    <div
                        className='position-absolute'
                        style={{
                            height: '2px',
                            backgroundColor: '#00b074',
                            top: '50%',
                            left: '5%',
                            width: step === 1 ? '0%' : step === 2 ? '50%' : '90%',
                            transition: 'width 0.3s ease',
                            zIndex: 1
                        }}
                    />

                    {/* Step 1 Circle */}
                    <div
                        className='d-flex flex-column align-items-center position-relative'
                        style={{ zIndex: 2, cursor: 'pointer' }}
                        onClick={() => setStep(1)}
                    >
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs ${
                                step >= 1 ? 'text-white' : 'text-muted bg-white border'
                            }`}
                            style={{
                                width: 32,
                                height: 32,
                                backgroundColor: step >= 1 ? '#00b074' : '#ffffff',
                                border: step >= 1 ? 'none' : '1px solid #cbd5e1'
                            }}
                        >
                            {step > 1 ? <Check size={16} /> : 1}
                        </div>
                        <span className={`small mt-1 ${step === 1 ? 'fw-bold text-dark' : 'text-muted'}`}>
                            Prerequisites
                        </span>
                    </div>

                    {/* Step 2 Circle */}
                    <div
                        className='d-flex flex-column align-items-center position-relative'
                        style={{ zIndex: 2, cursor: 'pointer' }}
                        onClick={() => name.trim() && setStep(2)}
                    >
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs ${
                                step >= 2 ? 'text-white' : 'text-muted bg-white border'
                            }`}
                            style={{
                                width: 32,
                                height: 32,
                                backgroundColor: step >= 2 ? '#00b074' : '#ffffff',
                                border: step >= 2 ? 'none' : '1px solid #cbd5e1'
                            }}
                        >
                            {step > 2 ? <Check size={16} /> : 2}
                        </div>
                        <span className={`small mt-1 ${step === 2 ? 'fw-bold text-dark' : 'text-muted'}`}>
                            Business Profile
                        </span>
                    </div>

                    {/* Step 3 Circle */}
                    <div
                        className='d-flex flex-column align-items-center position-relative'
                        style={{ zIndex: 2 }}
                    >
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs ${
                                step === 3 ? 'text-white' : 'text-muted bg-white border'
                            }`}
                            style={{
                                width: 32,
                                height: 32,
                                backgroundColor: step === 3 ? '#00b074' : '#ffffff',
                                border: step === 3 ? 'none' : '1px solid #cbd5e1'
                            }}
                        >
                            3
                        </div>
                        <span className={`small mt-1 ${step === 3 ? 'fw-bold text-dark' : 'text-muted'}`}>
                            Authorize Meta
                        </span>
                    </div>
                </div>
            </div>

            <ModalBody className='p-4'>
                {error && (
                    <Alert color='danger' className='p-2 mb-3 d-flex align-items-center gap-2' toggle={() => setError('')}>
                        <AlertCircle size={18} className='flex-shrink-0' />
                        <span className='small'>{error}</span>
                    </Alert>
                )}

                {notice && (
                    <Alert color='success' className='p-2 mb-3 d-flex align-items-center gap-2' toggle={() => setNotice('')}>
                        <CheckCircle size={18} className='flex-shrink-0' />
                        <span className='small'>{notice}</span>
                    </Alert>
                )}

                {/* STEP 1: PREREQUISITES & CHECKLIST */}
                {step === 1 && (
                    <div>
                        <div className='mb-3'>
                            <h4 className='fw-bolder text-dark mb-1' style={{ color: '#1e293b' }}>
                                Get started with WhatsApp's Business API
                            </h4>
                            <p className='text-muted small'>
                                WhatsApp is one of the most popular communication applications in the world. Connect your Meta WhatsApp Business Account to send verified broadcasts, automate customer communications, and manage dynamic templates.
                            </p>
                        </div>

                        <div className='p-3 mb-3 rounded-2xl bg-light border'>
                            <h6 className='fw-bold text-dark mb-2 d-flex align-items-center gap-1'>
                                <Shield size={16} style={{ color: '#00b074' }} />
                                What you will Need :-
                            </h6>
                            <ol className='small text-secondary mb-0 ps-3' style={{ lineHeight: '1.8' }}>
                                <li>Access to <strong>Facebook Business Manager</strong> (Admin access).</li>
                                <li>A viable <strong>Phone Number for WhatsApp</strong> (not registered on standard WhatsApp).</li>
                                <li>Your business's legal name, registered address and verification documents.</li>
                                <li>Verification access to your Facebook Business account.</li>
                                <li>Full access to manage the WhatsApp Business account (WABA).</li>
                                <li>Ensure the Meta User ID belongs to the authorized business entity.</li>
                                <li>Ensure permissions to manage templates, phone numbers, and webhook events.</li>
                            </ol>
                        </div>

                        <div className='p-3 rounded-2xl border' style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                            <h6 className='fw-bold mb-1' style={{ color: '#166534' }}>
                                Ready to Connect Your Official Business Number
                            </h6>
                            <p className='small text-muted mb-0' style={{ color: '#15803d' }}>
                                In the next steps, provide your business display name and choose your operational category to launch the Facebook authorization dialog.
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 2: BUSINESS DETAILS */}
                {step === 2 && (
                    <Form onSubmit={e => { e.preventDefault(); if (name.trim()) setStep(3); }}>
                        <div className='mb-3'>
                            <h4 className='fw-bolder text-dark mb-1'>Business Profile Details</h4>
                            <p className='text-muted small'>
                                Configure how your business appears to customers and set automated messaging preferences.
                            </p>
                        </div>

                        <Row className='gy-2'>
                            <Col md={12}>
                                <Label for='config-biz-name' className='fw-bold small text-dark'>
                                    Business Display Name <span className='text-danger'>*</span>
                                </Label>
                                <Input
                                    id='config-biz-name'
                                    placeholder='e.g. Acme Health Support or Dr Syed Majid Ali'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className='form-control-lg'
                                    style={{ borderRadius: '10px' }}
                                />
                                <small className='text-muted d-block mt-1'>
                                    This name will appear on your verified Meta WhatsApp Business profile.
                                </small>
                            </Col>

                            <Col md={12}>
                                <Label for='config-biz-category' className='fw-bold small text-dark mt-1'>
                                    Business Category <span className='text-danger'>*</span>
                                </Label>
                                <Input
                                    id='config-biz-category'
                                    type='select'
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className='form-select-lg'
                                    style={{ borderRadius: '10px' }}
                                >
                                    {BUSINESS_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label} ({cat.value})
                                        </option>
                                    ))}
                                </Input>
                            </Col>

                            <Col md={12} className='mt-2'>
                                <div className='p-3 bg-light rounded-2xl border'>
                                    <div className='form-check form-switch d-flex align-items-center gap-2 mb-2'>
                                        <Input
                                            type='switch'
                                            id='enable-auto-resp-toggle'
                                            checked={enableAutoResponse}
                                            onChange={e => setEnableAutoResponse(e.target.checked)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <Label for='enable-auto-resp-toggle' className='fw-bold text-dark mb-0' style={{ cursor: 'pointer' }}>
                                            Enable Automated Welcome Response
                                        </Label>
                                    </div>

                                    {enableAutoResponse && (
                                        <div className='mt-2'>
                                            <Label for='auto-resp-msg' className='small fw-semibold text-secondary'>
                                                Default Auto-Response Message:
                                            </Label>
                                            <Input
                                                id='auto-resp-msg'
                                                type='textarea'
                                                rows={3}
                                                value={autoResponseMessage}
                                                onChange={e => setAutoResponseMessage(e.target.value)}
                                                placeholder='Enter the message customers receive when they initiate contact...'
                                                style={{ borderRadius: '8px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form>
                )}

                {/* STEP 3: AUTHORIZE META & CONNECT */}
                {step === 3 && (
                    <div>
                        <div className='mb-3'>
                            <h4 className='fw-bolder text-dark mb-1'>Authorize with Facebook</h4>
                            <p className='text-muted small'>
                                Complete 1-Click Embedded Signup via Meta Facebook Login for Business to link your WABA account and phone number.
                            </p>
                        </div>

                        <Row className='align-items-start gy-3'>
                            {/* Left Column: Summary & Meta Actions */}
                            <Col md={7}>
                                <div className='p-3 rounded-2xl bg-light border mb-3'>
                                    <h6 className='fw-bold text-dark mb-2'>Configuration Summary</h6>
                                    <div className='mb-2 small'>
                                        <span className='text-muted d-block'>Business Display Name:</span>
                                        <strong className='text-dark'>{name || 'WhatsApp Business Line'}</strong>
                                    </div>
                                    <div className='mb-2 small'>
                                        <span className='text-muted d-block'>Category:</span>
                                        <Badge color='light-primary'>
                                            {BUSINESS_CATEGORIES.find(c => c.value === category)?.label || category}
                                        </Badge>
                                    </div>
                                    <div className='small'>
                                        <span className='text-muted d-block'>Auto-Response:</span>
                                        <span className={enableAutoResponse ? 'text-success fw-bold' : 'text-muted'}>
                                            {enableAutoResponse ? '✓ Active' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Meta App Credentials Card if not configured or expanded */}
                                {(!config?.configured || showQuickConfig) && (
                                    <div className='p-3 rounded-2xl border mb-3' style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                                        <div className='d-flex align-items-center justify-content-between mb-2'>
                                            <div className='d-flex align-items-center gap-1'>
                                                <Key size={16} className='text-warning' />
                                                <h6 className='fw-bold text-dark mb-0'>Meta Developer App Credentials</h6>
                                            </div>
                                            <Badge color={config?.configured ? 'light-success' : 'light-warning'} pill>
                                                {config?.configured ? 'Server Configured' : 'Setup Required'}
                                            </Badge>
                                        </div>
                                        <p className='small text-muted mb-2'>
                                            Enter your Meta credentials from your <a href='https://developers.facebook.com/apps/' target='_blank' rel='noreferrer'>Meta Developer Console</a> to enable 1-Click Embedded Signup.
                                        </p>
                                        <Form onSubmit={handleSaveQuickConfig}>
                                            <div className='mb-1'>
                                                <Label for='quick-app-id' className='small fw-semibold text-dark'>Meta App ID *</Label>
                                                <Input
                                                    id='quick-app-id'
                                                    size='sm'
                                                    placeholder='e.g. 598395012455883'
                                                    value={quickAppId}
                                                    onChange={e => setQuickAppId(e.target.value)}
                                                    required
                                                    style={{ borderRadius: '8px' }}
                                                />
                                            </div>
                                            <div className='mb-1'>
                                                <Label for='quick-config-id' className='small fw-semibold text-dark'>WhatsApp Configuration ID *</Label>
                                                <Input
                                                    id='quick-config-id'
                                                    size='sm'
                                                    placeholder='From WhatsApp > Configuration in Meta Dashboard'
                                                    value={quickConfigId}
                                                    onChange={e => setQuickConfigId(e.target.value)}
                                                    required
                                                    style={{ borderRadius: '8px' }}
                                                />
                                            </div>
                                            <div className='mb-2'>
                                                <Label for='quick-app-secret' className='small fw-semibold text-dark'>Meta App Secret *</Label>
                                                <Input
                                                    id='quick-app-secret'
                                                    size='sm'
                                                    type='password'
                                                    autoComplete='new-password'
                                                    placeholder='From App settings > Basic > App secret'
                                                    value={quickAppSecret}
                                                    onChange={e => setQuickAppSecret(e.target.value)}
                                                    required
                                                    style={{ borderRadius: '8px' }}
                                                />
                                            </div>
                                            <div className='d-flex justify-content-end gap-1'>
                                                {config?.configured && (
                                                    <Button size='sm' color='light-secondary' type='button' onClick={() => setShowQuickConfig(false)}>
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button size='sm' color='primary' type='submit' disabled={savingQuickConfig} style={{ backgroundColor: '#00b074', borderColor: '#00b074' }}>
                                                    {savingQuickConfig ? <Spinner size='sm' /> : 'Save & Enable Live Signup'}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                )}

                                <div className='d-grid gap-2'>
                                    <Button
                                        color='primary'
                                        size='lg'
                                        className='d-flex align-items-center justify-content-center gap-2 fw-bold text-white shadow-sm'
                                        style={{ backgroundColor: '#00b074', borderColor: '#00b074', borderRadius: '12px' }}
                                        disabled={busy}
                                        onClick={() => void handleConnectWithFacebook('live')}
                                    >
                                        {busy ? (
                                            <>
                                                <Spinner size='sm' />
                                                <span>Connecting with Meta...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                                <span>Continue with Facebook</span>
                                            </>
                                        )}
                                    </Button>

                                    {/* Action button row: configure credentials & sandbox test */}
                                    <div className='d-flex gap-2 mt-1'>
                                        <Button
                                            color='light-primary'
                                            size='sm'
                                            className='flex-fill d-flex align-items-center justify-content-center gap-1'
                                            onClick={() => setShowQuickConfig(!showQuickConfig)}
                                        >
                                            <Settings size={14} />
                                            <span>{showQuickConfig ? 'Hide Settings' : 'Meta App Settings'}</span>
                                        </Button>

                                        <Button
                                            color='light-secondary'
                                            size='sm'
                                            className='flex-fill d-flex align-items-center justify-content-center gap-1'
                                            disabled={busy}
                                            onClick={() => void handleConnectWithFacebook('sandbox')}
                                        >
                                            <Zap size={14} className='text-warning' />
                                            <span>Sandbox Simulation</span>
                                        </Button>
                                    </div>
                                </div>
                            </Col>

                            {/* Right Column: Realistic WhatsApp Phone Mockup matching Image 6 */}
                            <Col md={5} className='text-center'>
                                <div
                                    className='mx-auto shadow-lg text-start'
                                    style={{
                                        maxWidth: '260px',
                                        borderRadius: '34px',
                                        border: '8px solid #1e293b',
                                        backgroundColor: '#111827',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Phone speaker & camera notch */}
                                    <div className='d-flex justify-content-center align-items-center py-1 bg-dark'>
                                        <div style={{ width: 44, height: 4, backgroundColor: '#374151', borderRadius: 4 }} />
                                        <div className='ms-1 rounded-circle' style={{ width: 6, height: 6, backgroundColor: '#1f2937' }} />
                                    </div>

                                    {/* WhatsApp Top Bar */}
                                    <div
                                        className='p-2 text-white d-flex align-items-center justify-content-between'
                                        style={{ backgroundColor: '#075E54' }}
                                    >
                                        <div className='d-flex align-items-center gap-1 overflow-hidden'>
                                            <div
                                                className='rounded-circle bg-white text-dark d-flex align-items-center justify-content-center flex-shrink-0'
                                                style={{ width: 26, height: 26, fontWeight: 'bold', fontSize: '11px', color: '#075E54' }}
                                            >
                                                {(name || 'Brand').charAt(0).toUpperCase()}
                                            </div>
                                            <div className='overflow-hidden text-truncate'>
                                                <div className='d-flex align-items-center gap-50'>
                                                    <span className='fw-bold small text-truncate text-white' style={{ fontSize: '0.75rem' }}>
                                                        {name || 'Your Brand'}
                                                    </span>
                                                    <span className='badge bg-success rounded-circle p-0 d-inline-flex align-items-center justify-content-center' style={{ width: 12, height: 12 }}>
                                                        ✓
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.62rem', color: '#bbf7d0', lineHeight: 1 }}>Active Now</div>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center gap-1 text-white opacity-75' style={{ fontSize: '12px' }}>
                                            <Video size={13} />
                                            <Phone size={12} />
                                            <MoreVertical size={13} />
                                        </div>
                                    </div>

                                    {/* WhatsApp Chat Canvas */}
                                    <div
                                        className='p-2'
                                        style={{
                                            backgroundColor: '#efeae2',
                                            minHeight: '230px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            {/* Date pill */}
                                            <div className='text-center my-1'>
                                                <span
                                                    className='px-2 py-50 rounded shadow-2xs text-muted'
                                                    style={{ backgroundColor: '#ffffff', fontSize: '0.58rem' }}
                                                >
                                                    TODAY
                                                </span>
                                            </div>

                                            {/* Incoming client bubble */}
                                            <div
                                                className='p-2 rounded-2xl bg-white shadow-xs mb-1 text-dark'
                                                style={{
                                                    maxWidth: '85%',
                                                    fontSize: '0.68rem',
                                                    borderTopLeftRadius: '2px',
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                Hello! Could I get more information about your official services?
                                                <div className='text-muted text-end' style={{ fontSize: '0.55rem', marginTop: '2px' }}>
                                                    10:30 AM
                                                </div>
                                            </div>

                                            {/* Business response bubble */}
                                            <div
                                                className='p-2 rounded-2xl shadow-xs ms-auto mb-1 text-dark'
                                                style={{
                                                    maxWidth: '88%',
                                                    backgroundColor: '#dcf8c6',
                                                    fontSize: '0.68rem',
                                                    borderTopRightRadius: '2px',
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {enableAutoResponse
                                                    ? autoResponseMessage
                                                    : `Welcome to ${name || 'our official business line'}! We are ready to assist you.`}
                                                <div className='text-muted text-end d-flex align-items-center justify-content-end gap-50' style={{ fontSize: '0.55rem', marginTop: '2px' }}>
                                                    <span>10:30 AM</span>
                                                    <span style={{ color: '#34B7F1', fontWeight: 'bold' }}>✓✓</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat input mockup */}
                                        <div
                                            className='d-flex align-items-center gap-1 px-2 py-1 bg-white rounded-pill shadow-xs'
                                            style={{ fontSize: '0.65rem' }}
                                        >
                                            <span className='text-muted'>🙂</span>
                                            <span className='text-muted flex-fill'>Type a message</span>
                                            <span className='text-muted'>📎</span>
                                            <div
                                                className='rounded-circle d-flex align-items-center justify-content-center text-white'
                                                style={{ width: 18, height: 18, backgroundColor: '#00b074' }}
                                            >
                                                <Send size={9} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Badge color='light-success' pill className='mt-2 px-2 py-50'>
                                    <Check size={12} className='me-50 text-success' />
                                    <span>Verified Cloud API</span>
                                </Badge>
                            </Col>
                        </Row>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className='bg-light px-3 py-2 border-top d-flex justify-content-between'>
                {step === 1 ? (
                    <>
                        <Button color='light-secondary' size='sm' onClick={toggle}>
                            Cancel
                        </Button>
                        <Button
                            color='primary'
                            size='sm'
                            className='d-flex align-items-center gap-1 text-white'
                            style={{ backgroundColor: '#00b074', borderColor: '#00b074' }}
                            onClick={() => setStep(2)}
                        >
                            <span>Next: Business Profile</span>
                            <ArrowRight size={14} />
                        </Button>
                    </>
                ) : step === 2 ? (
                    <>
                        <Button
                            color='light-secondary'
                            size='sm'
                            className='d-flex align-items-center gap-1'
                            onClick={() => setStep(1)}
                        >
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </Button>
                        <Button
                            color='primary'
                            size='sm'
                            className='d-flex align-items-center gap-1 text-white'
                            style={{ backgroundColor: '#00b074', borderColor: '#00b074' }}
                            disabled={!name.trim()}
                            onClick={() => setStep(3)}
                        >
                            <span>Continue: Connect Meta</span>
                            <ArrowRight size={14} />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            color='light-secondary'
                            size='sm'
                            className='d-flex align-items-center gap-1'
                            disabled={busy}
                            onClick={() => setStep(2)}
                        >
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </Button>
                        <Button color='light-secondary' size='sm' disabled={busy} onClick={toggle}>
                            Close
                        </Button>
                    </>
                )}
            </ModalFooter>
        </Modal>
    )
}

