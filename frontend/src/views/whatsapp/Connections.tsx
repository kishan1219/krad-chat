// @ts-nocheck
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row,
    Table,
    Badge,
    Spinner
} from 'reactstrap'
import {
    Smartphone,
    RefreshCw,
    Key,
    Shield,
    CheckCircle,
    Trash2,
    Eye,
    Plus,
    AlertCircle,
    Layers,
    Info
} from 'react-feather'
import httpConfig from '../../utility/http/httpConfig'
import EmbeddedSignup from './EmbeddedSignup'
import TemplateEditor from './TemplateEditor'

function formatTier(tier?: string) {
    switch (tier) {
        case 'TIER_50': return '50 msgs / 24 hrs (Trial)'
        case 'TIER_250': return '250 msgs / 24 hrs'
        case 'TIER_1K': return '1,000 msgs / 24 hrs (Tier 1)'
        case 'TIER_10K': return '10,000 msgs / 24 hrs (Tier 2)'
        case 'TIER_100K': return '100,000 msgs / 24 hrs (Tier 3)'
        case 'TIER_UNLIMITED': return 'Unlimited'
        default: return tier || '1,000 msgs / 24 hrs'
    }
}

function getTierBadgeColor(tier?: string) {
    switch (tier) {
        case 'TIER_50': return 'light-warning'
        case 'TIER_250': return 'light-info'
        case 'TIER_1K': return 'light-primary'
        case 'TIER_10K': return 'light-success'
        case 'TIER_100K': return 'success'
        case 'TIER_UNLIMITED': return 'primary'
        default: return 'light-secondary'
    }
}

export default function Connections() {
    const [connections, setConnections] = useState<any[]>([])
    const [name, setName] = useState('')
    const [waba, setWaba] = useState('')
    const [phone, setPhone] = useState('')
    const [secret, setSecret] = useState('')
    const [pins, setPins] = useState<Record<string, string>>({})
    const [selected, setSelected] = useState<any>(null)
    const [mode, setMode] = useState('')
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [busy, setBusy] = useState(false)
    const [showManualForm, setShowManualForm] = useState(false)

    async function api(path: string, method = 'GET', body?: any) {
        let token = localStorage.getItem('access_token') || ''
        try {
            if (token.startsWith('"') || token.startsWith('{')) token = JSON.parse(token)
        } catch {
            /* ignore */
        }
        const response = await fetch(`${httpConfig.baseUrl}${path}`, {
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

    async function refresh() {
        setConnections(await api('whatsapp/connections'))
    }

    async function act(work: () => Promise<void>) {
        setBusy(true)
        setError('')
        setNotice('')
        try {
            await work()
        } catch (e: any) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        void act(async () => {
            setMode((await api('me')).provider_mode)
            await refresh()
        })
    }, [])

    async function connectionAction(id: string, action: string, body = {}) {
        await api(`whatsapp/connections/${id}/${action}`, 'POST', body)
        setPins({ ...pins, [id]: '' })
        await refresh()
        setNotice(`${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully.`)
    }

    return (
        <div className='whatsapp-connections-wrapper'>
            {/* Header Card */}
            <Card className='border-0 shadow-sm rounded-2xl mb-3'>
                <CardBody className='p-3'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
                        <div className='d-flex align-items-center gap-2'>
                            <div
                                className='p-2 rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center'
                                style={{ width: 44, height: 44 }}
                            >
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h4 className='fw-bolder mb-0 text-dark'>WhatsApp Cloud API Setup</h4>
                                <p className='text-muted mb-0 small'>
                                    Connect your Meta WhatsApp Business Account (WABA) and phone numbers to send broadcasts, manage templates, and run chatbots.
                                </p>
                            </div>
                        </div>

                        <div className='d-flex align-items-center gap-2'>
                            <Button
                                color='light-secondary'
                                size='sm'
                                className='d-flex align-items-center gap-1'
                                disabled={busy}
                                onClick={() => void act(refresh)}
                            >
                                <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
                                <span>Sync All</span>
                            </Button>
                        </div>
                    </div>

                    {mode === 'mock' && (
                        <Alert color='info' className='mt-3 mb-0 p-2'>
                            <strong>Local Testing Simulation Active:</strong> WhatsApp connections, template sync, and message delivery are running in simulated sandbox mode. Real Meta credentials are not required.
                        </Alert>
                    )}

                    {error && (
                        <Alert color='danger' className='mt-3 mb-0 p-2' toggle={() => setError('')}>
                            <AlertCircle size={15} className='me-1' />
                            {error}
                        </Alert>
                    )}

                    {notice && (
                        <Alert color='success' className='mt-3 mb-0 p-2' toggle={() => setNotice('')}>
                            <CheckCircle size={15} className='me-1' />
                            {notice}
                        </Alert>
                    )}
                </CardBody>
            </Card>

            {/* Embedded 1-Click Signup Section */}
            <div className='mb-3'>
                <EmbeddedSignup onConnected={refresh} />
            </div>

            {/* Manual Credentials Toggle & Card */}
            <Card className='border-0 shadow-sm rounded-2xl mb-3'>
                <CardHeader className='pb-0 pt-3 px-3 d-flex align-items-center justify-content-between border-0'>
                    <div className='d-flex align-items-center gap-2'>
                        <Key size={18} className='text-primary' />
                        <div>
                            <h5 className='fw-bolder mb-0 text-dark'>Manual API Credentials</h5>
                            <small className='text-muted'>Alternative connection method via direct Meta App tokens</small>
                        </div>
                    </div>
                    <Button
                        color='light-primary'
                        size='sm'
                        onClick={() => setShowManualForm(!showManualForm)}
                    >
                        {showManualForm ? 'Hide Form' : 'Configure Manually'}
                    </Button>
                </CardHeader>
                {showManualForm && (
                    <CardBody className='p-3 pt-2'>
                        <p className='text-muted small mb-3'>
                            Enter your credentials from Meta Developer Portal (App Dashboard &gt; WhatsApp &gt; API Setup). Tokens are securely encrypted on the server.
                        </p>
                        <Row className='g-2'>
                            <Col md='6' sm='12'>
                                <Label for='connection-name' className='fw-semibold text-dark small'>
                                    Connection Nickname / Label
                                </Label>
                                <Input
                                    id='connection-name'
                                    placeholder='e.g., Primary Support WhatsApp'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </Col>
                            <Col md='6' sm='12'>
                                <Label for='connection-waba' className='fw-semibold text-dark small'>
                                    WhatsApp Business Account (WABA) ID
                                </Label>
                                <Input
                                    id='connection-waba'
                                    placeholder='e.g., 100293847561928'
                                    value={waba}
                                    onChange={e => setWaba(e.target.value)}
                                />
                            </Col>
                            <Col md='6' sm='12'>
                                <Label for='connection-phone' className='fw-semibold text-dark small'>
                                    Phone Number ID
                                </Label>
                                <Input
                                    id='connection-phone'
                                    placeholder='e.g., 109283746519283'
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </Col>
                            {mode !== 'mock' && (
                                <Col md='6' sm='12'>
                                    <Label for='connection-token' className='fw-semibold text-dark small'>
                                        System User Access Token
                                    </Label>
                                    <Input
                                        id='connection-token'
                                        type='password'
                                        autoComplete='new-password'
                                        placeholder='EAAG...'
                                        value={secret}
                                        onChange={e => setSecret(e.target.value)}
                                    />
                                </Col>
                            )}
                        </Row>
                        <div className='mt-3 d-flex justify-content-end'>
                            <Button
                                color='primary'
                                disabled={busy || !name.trim() || !/^\d+$/.test(waba) || !/^\d+$/.test(phone)}
                                onClick={() =>
                                    void act(async () => {
                                        await api('whatsapp/connections', 'POST', {
                                            name,
                                            waba_id: waba,
                                            phone_number_id: phone,
                                            ...(secret ? { access_token: secret } : {})
                                        })
                                        setSecret('')
                                        await refresh()
                                        setNotice('Connection saved! Subscribed to webhooks and synchronized templates.')
                                    })
                                }
                            >
                                {busy ? <Spinner size='sm' className='me-1' /> : <CheckCircle size={15} className='me-1' />}
                                Save & Connect Account
                            </Button>
                        </div>
                    </CardBody>
                )}
            </Card>

            {/* Connected Numbers List */}
            <Card className='border-0 shadow-sm rounded-2xl mb-3'>
                <CardHeader className='pb-2 pt-3 px-3 d-flex align-items-center justify-content-between border-bottom'>
                    <div className='d-flex align-items-center gap-2'>
                        <Layers size={18} className='text-success' />
                        <div>
                            <h5 className='fw-bolder mb-0 text-dark'>Active Connected Numbers</h5>
                            <small className='text-muted'>Numbers currently registered and configured on this account</small>
                        </div>
                    </div>
                    <Badge color='light-primary' pill className='px-2 py-1'>
                        {connections.length} {connections.length === 1 ? 'Number' : 'Numbers'}
                    </Badge>
                </CardHeader>
                <CardBody className='p-0'>
                    <Table responsive hover className='mb-0 align-middle'>
                        <thead className='table-light'>
                            <tr>
                                <th className='px-3 py-2'>Phone / Business</th>
                                <th className='py-2'>Status</th>
                                <th className='py-2'>Messaging Limit (Meta)</th>
                                <th className='py-2'>Quality Rating</th>
                                <th className='py-2'>Actions & Recovery</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className='text-center py-4 text-muted'>
                                        No WhatsApp phone numbers connected yet. Use 1-Click Embedded Signup or Manual Credentials above to connect.
                                    </td>
                                </tr>
                            ) : (
                                connections.map(item => (
                                    <tr key={item.id}>
                                        <td className='px-3 py-3'>
                                            <div className='d-flex align-items-center gap-1'>
                                                <span className='fw-bolder text-dark'>{item.verified_name || item.name}</span>
                                                {item.code_verification_status === 'VERIFIED' && (
                                                    <Badge color='light-success' pill className='px-1 py-0' style={{ fontSize: '0.65rem' }}>
                                                        ✓ Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            {item.verified_name && item.name !== item.verified_name && (
                                                <div className='text-muted small'>Label: {item.name}</div>
                                            )}
                                            <div className='text-muted small'>{item.display_phone_number || 'No display number'}</div>
                                            <div className='text-muted small'>ID: <code>{item.phone_number_id}</code></div>
                                        </td>
                                        <td>
                                            <Badge
                                                color={item.status === 'connected' ? 'light-success' : 'light-danger'}
                                                pill
                                                className='text-capitalize me-1'
                                            >
                                                {item.status}
                                            </Badge>
                                            {item.simulated && (
                                                <Badge color='light-secondary' pill>
                                                    Simulation
                                                </Badge>
                                            )}
                                            <div className='small text-muted mt-1'>
                                                Webhooks: {item.subscribed ? <span className='text-success fw-semibold'>Active</span> : <span className='text-danger'>Inactive</span>}
                                            </div>
                                            <div className='small text-muted'>
                                                Registration: {item.registered ? <span className='text-success fw-semibold'>Confirmed</span> : <span className='text-warning'>Pending</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge color={getTierBadgeColor(item.messaging_limit_tier)} pill className='px-2 py-1'>
                                                {formatTier(item.messaging_limit_tier)}
                                            </Badge>
                                            <div className='small text-muted mt-1'>
                                                Meta Tier: <code>{item.messaging_limit_tier || 'TIER_1K'}</code>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge
                                                color={
                                                    item.quality_rating === 'GREEN' || item.quality_rating === 'HIGH'
                                                        ? 'light-success'
                                                        : item.quality_rating === 'YELLOW' || item.quality_rating === 'MEDIUM'
                                                        ? 'light-warning'
                                                        : item.quality_rating === 'RED' || item.quality_rating === 'LOW'
                                                        ? 'light-danger'
                                                        : 'light-secondary'
                                                }
                                                pill
                                            >
                                                {item.quality_rating || 'UNKNOWN'}
                                            </Badge>
                                            {item.last_sync_at && (
                                                <div className='small text-muted mt-1'>
                                                    Synced: {new Date(item.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {item.last_error && (
                                                <Alert color='warning' className='p-1 small mb-2'>
                                                    {item.last_error}
                                                </Alert>
                                            )}
                                            <div className='d-flex flex-wrap gap-1'>
                                                <Button
                                                    size='sm'
                                                    color='light-primary'
                                                    disabled={busy || item.status !== 'connected'}
                                                    onClick={() => void act(() => connectionAction(item.id, 'subscribe'))}
                                                >
                                                    Subscribe Webhooks
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    color='light-info'
                                                    disabled={busy || item.status !== 'connected'}
                                                    onClick={() => void act(() => connectionAction(item.id, 'sync'))}
                                                    title='Sync messaging limits and approved templates from Meta Cloud API'
                                                >
                                                    <RefreshCw size={13} className='me-1' />
                                                    Sync Limits & Templates
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    color='light-secondary'
                                                    onClick={() => setSelected(item)}
                                                >
                                                    <Eye size={13} className='me-1' />
                                                    View Templates
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    color='light-danger'
                                                    outline
                                                    disabled={busy || item.status !== 'connected'}
                                                    onClick={() => void act(() => connectionAction(item.id, 'disconnect'))}
                                                >
                                                    Disconnect
                                                </Button>
                                            </div>

                                            {!item.registered && (
                                                <div className='mt-2 p-2 border rounded bg-light-secondary'>
                                                    <Label for={`pin-${item.id}`} className='small fw-bold text-dark mb-1'>
                                                        Registration 6-Digit PIN
                                                    </Label>
                                                    <div className='d-flex gap-1'>
                                                        <Input
                                                            id={`pin-${item.id}`}
                                                            type='password'
                                                            inputMode='numeric'
                                                            maxLength={6}
                                                            placeholder='6-digit PIN'
                                                            className='form-control-sm'
                                                            style={{ maxWidth: 140 }}
                                                            value={pins[item.id] || ''}
                                                            onChange={e => setPins({ ...pins, [item.id]: e.target.value })}
                                                        />
                                                        <Button
                                                            size='sm'
                                                            color='success'
                                                            disabled={busy || item.status !== 'connected' || !/^\d{6}$/.test(pins[item.id] || '')}
                                                            onClick={() => void act(() => connectionAction(item.id, 'register', { pin: pins[item.id] }))}
                                                        >
                                                            Confirm Registration
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* Meta Cloud API Messaging Tiers & Upgrade Guide */}
            <Card className='border-0 shadow-sm rounded-2xl mb-3 bg-light-secondary'>
                <CardBody className='p-3'>
                    <div className='d-flex align-items-center gap-2 mb-2'>
                        <Info size={18} className='text-primary' />
                        <h6 className='fw-bolder mb-0 text-dark'>Understanding Meta WhatsApp Cloud API Messaging Limit Tiers</h6>
                    </div>
                    <p className='text-muted small mb-2'>
                        Messaging limits determine how many unique customers (phone numbers) your business can initiate conversations with in a rolling 24-hour period. Limits do not apply to user-initiated responses.
                    </p>
                    <Row className='gy-2 small'>
                        <Col md={4}>
                            <div className='p-2 bg-white rounded border'>
                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                    <span className='fw-bold text-dark'>Trial / Tier 50</span>
                                    <Badge color='light-warning' pill>50 / 24h</Badge>
                                </div>
                                <div className='text-muted'>
                                    Unverified business accounts or sandbox tests. Allowed up to 50 unique customer conversations per 24 hours.
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className='p-2 bg-white rounded border'>
                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                    <span className='fw-bold text-dark'>Standard / Tier 1K</span>
                                    <Badge color='light-primary' pill>1,000 / 24h</Badge>
                                </div>
                                <div className='text-muted'>
                                    Official verified businesses. Send templates to up to 1,000 unique recipients in any rolling 24-hour window.
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className='p-2 bg-white rounded border'>
                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                    <span className='fw-bold text-dark'>Tier 10K & Above</span>
                                    <Badge color='light-success' pill>10K → 100K → ∞</Badge>
                                </div>
                                <div className='text-muted'>
                                    Meta automatically upgrades your tier when phone quality is Medium/High and you send 50%+ of your tier limit over 7 days.
                                </div>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Selected Connection Templates & Editor */}
            {selected && (
                <Card className='border-0 shadow-sm rounded-2xl mb-3'>
                    <CardHeader className='pb-2 pt-3 px-3 d-flex align-items-center justify-content-between border-bottom'>
                        <h5 className='fw-bolder mb-0 text-dark'>
                            Message Templates: {selected.name}
                        </h5>
                        <Button size='sm' color='light-secondary' onClick={() => setSelected(null)}>
                            Close Templates
                        </Button>
                    </CardHeader>
                    <CardBody className='p-3'>
                        <Table responsive hover className='mb-3 align-middle'>
                            <thead className='table-light'>
                                <tr>
                                    <th>Template Name</th>
                                    <th>Language</th>
                                    <th>Category</th>
                                    <th>Meta Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(connections.find(item => item.id === selected.id)?.templates || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className='text-center py-3 text-muted'>
                                            No templates found for this account. Create one below or sync with Meta.
                                        </td>
                                    </tr>
                                ) : (
                                    (connections.find(item => item.id === selected.id)?.templates || []).map((template: any) => (
                                        <tr key={`${template.id}-${template.language}`}>
                                            <td className='fw-semibold text-dark'>{template.name}</td>
                                            <td>{template.language}</td>
                                            <td>
                                                <Badge color='light-info' pill>
                                                    {template.category}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge
                                                    color={
                                                        template.status === 'APPROVED'
                                                            ? 'light-success'
                                                            : template.status === 'REJECTED'
                                                            ? 'light-danger'
                                                            : 'light-warning'
                                                    }
                                                    pill
                                                >
                                                    {template.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    size='sm'
                                                    color='danger'
                                                    outline
                                                    disabled={busy}
                                                    onClick={() => {
                                                        if (window.confirm(`Delete template "${template.name}" (${template.language}) from this WhatsApp Business Account?`)) {
                                                            void act(async () => {
                                                                await api(`whatsapp/connections/${selected.id}/templates/delete`, 'POST', {
                                                                    id: String(template.id),
                                                                    name: template.name
                                                                })
                                                                await refresh()
                                                                setNotice('Template deleted successfully.')
                                                            })
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>

                        <TemplateEditor
                            key={selected.id}
                            connection={connections.find(item => item.id === selected.id) || selected}
                            api={api}
                            refresh={refresh}
                            simulated={mode === 'mock'}
                        />
                    </CardBody>
                </Card>
            )}
        </div>
    )
}
