import { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Button,
    Card,
    CardBody,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input,
    Badge,
    Spinner
} from 'reactstrap'
import { CheckCircle, Settings, Shield, Zap, RefreshCw, AlertTriangle } from 'react-feather'
import httpConfig from '../../utility/http/httpConfig'

interface EmbeddedSignupProps {
    onConnected: () => Promise<void>
}

export default function EmbeddedSignup({ onConnected }: EmbeddedSignupProps) {
    const [config, setConfig] = useState<{ configured: boolean; app_id: string | null; config_id: string | null; graph_version: string | null; simulated: boolean } | null>(null)
    const [session, setSession] = useState<any>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [configModal, setConfigModal] = useState(false)

    // Config form inputs
    const [appId, setAppId] = useState('')
    const [configId, setConfigId] = useState('')
    const [graphVersion, setGraphVersion] = useState('v22.0')
    const [appSecret, setAppSecret] = useState('')
    const [savingConfig, setSavingConfig] = useState(false)

    const cleanup = useRef<() => void>(() => {})

    useEffect(() => {
        void fetchConfig()
        return () => cleanup.current()
    }, [])

    async function api(path: string, method = 'POST', body?: any) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}whatsapp/onboarding/${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
            if (data.app_id) setAppId(data.app_id)
            if (data.config_id) setConfigId(data.config_id)
            if (data.graph_version) setGraphVersion(data.graph_version)
        } catch {
            // Non-blocking fallback
            setConfig({ configured: false, app_id: null, config_id: null, graph_version: 'v22.0', simulated: true })
        }
    }

    async function saveCredentials(e: React.FormEvent) {
        e.preventDefault()
        setSavingConfig(true)
        setError('')
        try {
            await api('config', 'POST', { app_id: appId, config_id: configId, graph_version: graphVersion, app_secret: appSecret })
            setNotice('Meta Developer App credentials saved successfully.')
            setConfigModal(false)
            await fetchConfig()
        } catch (err: any) {
            setError(err.message || 'Could not save Meta configuration.')
        } finally {
            setSavingConfig(false)
        }
    }

    async function handleConnectWithFacebook(mode: 'live' | 'sandbox' = 'live') {
        setBusy(true)
        setError('')
        setNotice('')

        try {
            const sess = await api('begin', 'POST', { mode })
            setSession(sess)

            // If simulated or sandbox requested, complete immediately with mock credentials
            if (sess.simulated || mode === 'sandbox') {
                const simulatedAssets = {
                    waba_id: `1099${Math.floor(100000 + Math.random() * 900000)}`,
                    phone_number_id: `1055${Math.floor(100000 + Math.random() * 900000)}`
                }
                await completeSignup(sess.state, 'simulated_oauth_code_' + Date.now(), simulatedAssets)
                return
            }

            // Live Meta SDK Popup flow
            if (!(window as any).FB) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://connect.facebook.net/en_US/sdk.js'
                    script.async = true
                    script.onload = () => resolve()
                    script.onerror = () => {
                        script.remove()
                        reject(new Error('Meta Facebook SDK could not load. Check network or ad-blocker restrictions.'))
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

            const fail = (message: string) => {
                submitted = true
                cleanup.current()
                setBusy(false)
                setSession(null)
                setError(message)
            }

            const listener = (event: MessageEvent) => {
                if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return
                let data: any
                try {
                    data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
                } catch {
                    return
                }
                if (data?.type !== 'WA_EMBEDDED_SIGNUP') return
                if (data.event === 'FINISH') {
                    assets = data.data
                    void finish()
                } else if (data.event === 'CANCEL' || data.event === 'ERROR') {
                    fail('Meta signup was cancelled or encountered an error. Please try again.')
                }
            }

            window.addEventListener('message', listener)
            const timer = setTimeout(() => fail('Meta Embedded Signup timed out after 10 minutes.'), 600000)
            cleanup.current = () => {
                clearTimeout(timer)
                window.removeEventListener('message', listener)
            }

            ;(window as any).FB.login((response: any) => {
                if (submitted) return
                if (!response?.authResponse?.code) {
                    fail('Meta authorization code was not returned by popup.')
                    return
                }
                code = response.authResponse.code
                void finish()
            }, {
                config_id: sess.config_id,
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    setup: {},
                    sessionInfoVersion: '2'
                }
            })
        } catch (err: any) {
            setError(err.message || 'Meta Embedded Signup failed to initialize.')
            setBusy(false)
        }
    }

    async function completeSignup(state: string, code: string, assets: any) {
        try {
            await api('complete', 'POST', {
                state,
                code,
                name: `WhatsApp Business (${assets.phone_number_id.slice(-4)})`,
                waba_id: assets.waba_id,
                phone_number_id: assets.phone_number_id
            })
            await onConnected()
            setNotice(`WhatsApp Business number linked successfully! WABA: ${assets.waba_id}, Phone ID: ${assets.phone_number_id}`)
        } catch (err: any) {
            setError(err.message || 'Failed to complete Meta token exchange.')
        } finally {
            cleanup.current()
            setSession(null)
            setBusy(false)
        }
    }

    return (
        <Card className='border-0 shadow-sm mb-2' style={{ background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.04) 0%, rgba(37, 211, 102, 0.05) 100%)', borderRadius: '16px' }}>
            <CardBody className='p-2 p-md-3'>
                <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2'>
                    <div>
                        <div className='d-flex align-items-center gap-1 mb-50'>
                            <h4 className='mb-0 fw-bold text-dark'>Meta Cloud API Embedded Signup</h4>
                            <Badge color='light-primary' pill className='px-1'>1-Click Onboarding</Badge>
                        </div>
                        <p className='text-muted small mb-0' style={{ maxWidth: '600px' }}>
                            Connect your official WhatsApp Business numbers directly via Meta Facebook Login for Business. Automatically provisions WABA, exchanges encrypted tokens, and synchronizes templates.
                        </p>
                    </div>

                    <div className='d-flex align-items-center gap-1'>
                        <Button
                            size='sm'
                            color='flat-secondary'
                            className='btn-icon'
                            title='Configure Meta App ID & Secrets'
                            onClick={() => setConfigModal(true)}
                        >
                            <Settings size={16} className='me-50' />
                            Meta App Settings
                        </Button>
                    </div>
                </div>

                {error && (
                    <Alert color='danger' className='p-1 d-flex align-items-center gap-1' toggle={() => setError('')}>
                        <AlertTriangle size={18} />
                        <span className='small'>{error}</span>
                    </Alert>
                )}

                {notice && (
                    <Alert color='success' className='p-1 d-flex align-items-center gap-1' toggle={() => setNotice('')}>
                        <CheckCircle size={18} />
                        <span className='small'>{notice}</span>
                    </Alert>
                )}

                <div className='d-flex flex-wrap align-items-center gap-2 mt-1'>
                    {/* Official Facebook Login Button */}
                    <button
                        type='button'
                        disabled={busy}
                        onClick={() => void handleConnectWithFacebook('live')}
                        style={{
                            background: '#1877F2',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 22px',
                            fontWeight: 600,
                            fontSize: '15px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: busy ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.28)',
                            transition: 'all 0.2s ease',
                            opacity: busy ? 0.7 : 1
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#166FE5')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1877F2')}
                    >
                        {busy ? (
                            <Spinner size='sm' color='light' />
                        ) : (
                            <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
                                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                            </svg>
                        )}
                        <span>{busy ? 'Connecting to Meta...' : 'Connect with Facebook'}</span>
                    </button>

                    {/* Instant Sandbox Simulation Button */}
                    <Button
                        color='outline-success'
                        disabled={busy}
                        onClick={() => void handleConnectWithFacebook('sandbox')}
                        className='d-inline-flex align-items-center gap-1'
                        style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 600 }}
                    >
                        <Zap size={16} />
                        Instant Sandbox Demo
                    </Button>

                    <div className='text-muted small ms-md-auto d-flex align-items-center gap-1'>
                        <Shield size={16} className='text-success' />
                        <span>256-bit AES Token Encryption · Graph API v22.0</span>
                    </div>
                </div>

                {config && !config.configured && (
                    <div className='mt-2 p-1 border rounded bg-white small text-muted d-flex align-items-center justify-content-between'>
                        <span>
                            <strong>Note:</strong> Meta Developer App credentials are not yet saved on this server. Click &quot;Meta App Settings&quot; to configure your App ID and Secrets, or test with &quot;Instant Sandbox Demo&quot;.
                        </span>
                        <Button color='flat-primary' size='sm' onClick={() => setConfigModal(true)}>Configure Now</Button>
                    </div>
                )}
            </CardBody>

            {/* Meta App Configuration Modal */}
            <Modal isOpen={configModal} toggle={() => setConfigModal(!configModal)} centered className='modal-dialog-centered'>
                <ModalHeader toggle={() => setConfigModal(!configModal)}>
                    <div className='d-flex align-items-center gap-1'>
                        <Settings size={20} className='text-primary' />
                        <span className='fw-bold'>Meta Developer App Configuration</span>
                    </div>
                </ModalHeader>
                <Form onSubmit={saveCredentials}>
                    <ModalBody>
                        <p className='text-muted small mb-2'>
                            Enter your Meta App credentials from your <a href='https://developers.facebook.com/apps/' target='_blank' rel='noreferrer'>Meta for Developers</a> console to enable live 1-Click Embedded Signup for all users.
                        </p>

                        <FormGroup className='mb-1'>
                            <Label for='meta-app-id' className='fw-bold'>Meta App ID *</Label>
                            <Input
                                id='meta-app-id'
                                placeholder='e.g. 109283746501928'
                                value={appId}
                                onChange={e => setAppId(e.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup className='mb-1'>
                            <Label for='meta-config-id' className='fw-bold'>WhatsApp Configuration ID *</Label>
                            <Input
                                id='meta-config-id'
                                placeholder='From WhatsApp Embedded Signup Configuration'
                                value={configId}
                                onChange={e => setConfigId(e.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup className='mb-1'>
                            <Label for='meta-app-secret' className='fw-bold'>Meta App Secret *</Label>
                            <Input
                                id='meta-app-secret'
                                type='password'
                                placeholder='Meta Developer App Secret'
                                value={appSecret}
                                onChange={e => setAppSecret(e.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup className='mb-1'>
                            <Label for='meta-graph-version' className='fw-bold'>Graph API Version</Label>
                            <Input
                                id='meta-graph-version'
                                value={graphVersion}
                                onChange={e => setGraphVersion(e.target.value)}
                                placeholder='v22.0'
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='secondary' outline onClick={() => setConfigModal(false)}>Cancel</Button>
                        <Button color='primary' type='submit' disabled={savingConfig || !appId || !configId || !appSecret}>
                            {savingConfig ? 'Saving...' : 'Save Credentials'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </Card>
    )
}
