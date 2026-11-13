import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, CardTitle, Col, Input, Label, Row, Table } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'

function formatTier(tier?: string) {
    switch (tier) {
        case 'TIER_50': return '50 msgs / 24 hrs (Trial)'
        case 'TIER_250': return '250 msgs / 24 hrs'
        case 'TIER_1K': return '1,000 msgs / 24 hrs (Tier 1)'
        case 'TIER_10K': return '10,000 msgs / 24 hrs (Tier 2)'
        case 'TIER_100K': return '100,000 msgs / 24 hrs (Tier 3)'
        case 'TIER_UNLIMITED': return 'Unlimited messages'
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

export default function Broadcasts() {
    const [senders, setSenders] = useState<any[]>([])
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [policy, setPolicy] = useState<any>(null)
    const [sender, setSender] = useState('')
    const [template, setTemplate] = useState('')
    const [name, setName] = useState('')
    const [recipients, setRecipients] = useState('')
    const [parameters, setParameters] = useState('')
    const [schedule, setSchedule] = useState('')
    const [segment, setSegment] = useState('')
    const [consentPhone, setConsentPhone] = useState('')
    const [source, setSource] = useState('')
    const [evidence, setEvidence] = useState('')
    const [optedIn, setOptedIn] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [busy, setBusy] = useState(false)
    const [detail, setDetail] = useState<any>(null)

    function getAuthToken(): string {
        const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
        try {
            if (token.startsWith('"') || token.startsWith('{')) {
                const parsed = JSON.parse(token)
                return typeof parsed === 'string' ? parsed : (parsed?.accessToken || parsed?.token || token)
            }
        } catch {
            return token
        }
        return token
    }

    async function api(path: string, method = 'GET', body?: any, idempotencyKey?: string) {
        const token = getAuthToken()
        const response = await fetch(`${httpConfig.baseUrl}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
            },
            ...(body ? { body: JSON.stringify(body) } : {})
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }

    async function refresh() {
        const [s, c, p] = await Promise.all([
            api('whatsapp/senders'),
            api('wa-campaigns'),
            api('whatsapp/broadcast-policy').catch(() => null)
        ])
        setSenders(Array.isArray(s) ? s : [])
        setCampaigns(((c && c.data) || []).filter((item: any) => !item.payload?.internal_chat))
        if (p) setPolicy(p)
    }

    async function act(work: () => Promise<void>) {
        setBusy(true)
        setError('')
        setNotice('')
        try {
            await work()
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred')
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        void act(refresh)
    }, [])

    const selectedSender = senders.find(s => String(s.id) === sender)
    const templates = selectedSender?.templates || []
    const selectedTemplate = template !== '' ? templates[Number(template)] : null

    async function savePolicy(next: any) {
        await api('whatsapp/broadcast-policy', 'POST', {
            daily_limit: Number(next.daily_limit),
            require_approval: next.require_approval,
            paused: next.paused
        })
        await refresh()
    }

    return (
        <div className='p-2'>
            <Card>
                <CardBody>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                        <div>
                            <CardTitle tag='h3' className='mb-0'>WhatsApp Broadcast Campaigns</CardTitle>
                            <p className='text-muted small mb-0'>
                                Send approved Meta WhatsApp templates to customers with recorded opt-in.
                            </p>
                        </div>
                        <Button color='flat-primary' size='sm' disabled={busy} onClick={() => void act(refresh)}>
                            Refresh Senders & Data
                        </Button>
                    </div>

                    {error && <Alert color='danger'>{error}</Alert>}
                    {notice && <Alert color='success'>{notice}</Alert>}

                    <Row className='gy-1'>
                        <Col md={12}>
                            <Label for='broadcast-name' className='fw-bold'>Campaign Name</Label>
                            <Input
                                id='broadcast-name'
                                placeholder='e.g. November Product Launch'
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </Col>

                        <Col md={6}>
                            <Label for='broadcast-sender' className='fw-bold'>Business Sender</Label>
                            <Input
                                id='broadcast-sender'
                                type='select'
                                value={sender}
                                onChange={e => {
                                    setSender(e.target.value)
                                    setTemplate('')
                                }}
                            >
                                <option value=''>Select sender phone number</option>
                                {senders.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.display_phone_number || s.phone_number_id}) · Quality: {s.quality_rating} · Limit: {s.messaging_limit_tier || 'TIER_1K'}
                                    </option>
                                ))}
                            </Input>
                        </Col>

                        <Col md={6}>
                            <Label for='broadcast-template' className='fw-bold'>Approved Template</Label>
                            <Input
                                id='broadcast-template'
                                type='select'
                                value={template}
                                disabled={!sender || templates.length === 0}
                                onChange={e => setTemplate(e.target.value)}
                            >
                                <option value=''>
                                    {!sender
                                        ? 'Select a sender first'
                                        : templates.length === 0
                                        ? 'No approved templates found for this sender'
                                        : 'Select an approved template'}
                                </option>
                                {templates.map((t: any, i: number) => (
                                    <option key={`${t.id || t.name}-${t.language}`} value={String(i)}>
                                        {t.name} ({t.language}) [{t.category || 'MARKETING'}]
                                    </option>
                                ))}
                            </Input>
                        </Col>

                        {selectedSender && (
                            <Col md={12}>
                                <div className='d-flex flex-wrap gap-2 p-1 border rounded bg-light'>
                                    <div>
                                        <span className='text-muted small d-block'>Sender Verified Name</span>
                                        <strong>{selectedSender.verified_name || selectedSender.name || 'WhatsApp Business'}</strong>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Phone Number</span>
                                        <code>{selectedSender.display_phone_number || selectedSender.phone_number_id}</code>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Messaging Limit Tier</span>
                                        <Badge color={getTierBadgeColor(selectedSender.messaging_limit_tier)}>
                                            {formatTier(selectedSender.messaging_limit_tier)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Quality Rating</span>
                                        <Badge color={selectedSender.quality_rating === 'GREEN' ? 'success' : selectedSender.quality_rating === 'YELLOW' ? 'warning' : 'secondary'}>
                                            {selectedSender.quality_rating || 'UNKNOWN'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Available Templates</span>
                                        <Badge color='info'>{templates.length} Approved</Badge>
                                    </div>
                                </div>
                            </Col>
                        )}

                        {selectedTemplate && (
                            <Col md={12}>
                                <div className='p-2 border rounded bg-light border-primary'>
                                    <div className='d-flex justify-content-between align-items-center mb-1'>
                                        <div className='fw-bold text-primary'>
                                            Template Preview: <code>{selectedTemplate.name}</code> ({selectedTemplate.language})
                                        </div>
                                        <Badge color='success'>{selectedTemplate.status || 'APPROVED'}</Badge>
                                    </div>
                                    <div className='p-2 bg-white rounded border small' style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedTemplate.components?.find((c: any) => c.type === 'BODY')?.text ||
                                         selectedTemplate.body ||
                                         'Template has no body text or components preview.'}
                                    </div>
                                </div>
                            </Col>
                        )}

                        <Col md={12}>
                            <Label for='broadcast-values' className='fw-bold'>
                                Template Body Variable Values (one value per line, e.g. for &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125;)
                            </Label>
                            <Input
                                id='broadcast-values'
                                type='textarea'
                                rows={2}
                                placeholder='John&#10;Order #1234'
                                value={parameters}
                                onChange={e => setParameters(e.target.value)}
                            />
                        </Col>

                        <Col md={12}>
                            <Label for='broadcast-recipients' className='fw-bold'>
                                Customer Recipient Numbers (E.164 format with country code, comma or newline separated)
                            </Label>
                            <Input
                                id='broadcast-recipients'
                                type='textarea'
                                rows={3}
                                placeholder='+919876543210&#10;+14155552671'
                                value={recipients}
                                onChange={e => setRecipients(e.target.value)}
                            />
                        </Col>

                        <Col md={12}>
                            <div className='d-flex gap-1 align-items-center'>
                                <Input
                                    aria-label='Segment label'
                                    placeholder='Or load from segment label (e.g. VIP, Leads)'
                                    value={segment}
                                    onChange={e => setSegment(e.target.value)}
                                />
                                <Button
                                    disabled={busy || !segment.trim()}
                                    color='outline-secondary'
                                    onClick={() =>
                                        void act(async () => {
                                            const phones = await api(`whatsapp/segments?label=${encodeURIComponent(segment)}`)
                                            setRecipients(phones.join('\n'))
                                            setNotice(`${phones.length} opted-in customers selected from segment.`)
                                        })
                                    }
                                >
                                    Load Segment
                                </Button>
                            </div>
                        </Col>

                        <Col md={6}>
                            <Label for='broadcast-schedule' className='fw-bold'>Schedule Dispatch (Optional)</Label>
                            <Input
                                id='broadcast-schedule'
                                type='datetime-local'
                                value={schedule}
                                onChange={e => setSchedule(e.target.value)}
                            />
                        </Col>

                        <Col md={12} className='mt-2'>
                            <Button
                                color='primary'
                                size='lg'
                                disabled={busy || !name.trim() || !sender || template === '' || !recipients.trim()}
                                onClick={() =>
                                    void act(async () => {
                                        const chosen = templates[Number(template)]
                                        const values = parameters.trim()
                                            ? parameters.split('\n').map(text => ({ type: 'text', text: text.trim() })).filter(p => p.text)
                                            : []
                                        const recipientList = recipients
                                            .split(/[,\n]/)
                                            .map(v => v.trim())
                                            .filter(Boolean)

                                        const result = await api(
                                            'wa-send-message',
                                            'POST',
                                            {
                                                name,
                                                recipients: recipientList,
                                                ...(schedule ? { schedule_at: new Date(schedule).toISOString() } : {}),
                                                payload: {
                                                    phone_number_id: senders.find(s => String(s.id) === sender).phone_number_id,
                                                    template: {
                                                        name: chosen.name,
                                                        language: { code: chosen.language },
                                                        ...(values.length ? { components: [{ type: 'body', parameters: values }] } : {})
                                                    }
                                                }
                                            },
                                            crypto.randomUUID()
                                        )
                                        await refresh()
                                        setNotice(`Campaign "${name}" (${result.id}) dispatched: status ${result.status}.`)
                                        setName('')
                                        setRecipients('')
                                        setParameters('')
                                    })
                                }
                            >
                                {busy ? 'Dispatching Campaign...' : 'Launch Broadcast Campaign'}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <CardTitle tag='h4'>Opt-In & Marketing Consent Records</CardTitle>
                    <p className='text-muted small'>
                        Record opt-in proof for compliance with Meta WhatsApp Business messaging policy.
                    </p>
                    <Row className='gy-1'>
                        <Col md={4}>
                            <Label for='consent-phone'>Customer Phone (E.164)</Label>
                            <Input
                                id='consent-phone'
                                placeholder='+919876543210'
                                value={consentPhone}
                                onChange={e => setConsentPhone(e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Label for='consent-source'>Consent Source</Label>
                            <Input
                                id='consent-source'
                                placeholder='Website Checkout / In-store form'
                                value={source}
                                onChange={e => setSource(e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Label for='consent-choice'>Consent Status</Label>
                            <Input
                                id='consent-choice'
                                type='select'
                                value={String(optedIn)}
                                onChange={e => setOptedIn(e.target.value === 'true')}
                            >
                                <option value='true'>Opted In</option>
                                <option value='false'>Opted Out</option>
                            </Input>
                        </Col>
                        <Col md={12}>
                            <Label for='consent-evidence'>Evidence / Audit Reference</Label>
                            <Input
                                id='consent-evidence'
                                placeholder='Order #9823 checkbox timestamp or sign-up link'
                                value={evidence}
                                onChange={e => setEvidence(e.target.value)}
                            />
                        </Col>
                        <Col md={12}>
                            <Button
                                color='outline-primary'
                                disabled={busy || !consentPhone || source.length < 3 || evidence.length < 3}
                                onClick={() =>
                                    void act(async () => {
                                        await api('whatsapp/consents', 'POST', {
                                            phone: consentPhone,
                                            opted_in: optedIn,
                                            source,
                                            evidence
                                        })
                                        setNotice('Consent recorded with immutable audit history.')
                                        setConsentPhone('')
                                        setSource('')
                                        setEvidence('')
                                    })
                                }
                            >
                                Record Customer Consent
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {policy && (
                <Card>
                    <CardBody>
                        <CardTitle tag='h4'>Broadcast Dispatch Controls</CardTitle>
                        <p className='text-muted small'>
                            {policy.dispatches_today} dispatch slots consumed today. Counter resets at midnight UTC.
                        </p>
                        <Row className='gy-1 align-items-center'>
                            <Col md={4}>
                                <Label for='broadcast-cap'>Daily Dispatch Limit</Label>
                                <Input
                                    id='broadcast-cap'
                                    type='number'
                                    min={1}
                                    max={1000000}
                                    value={policy.daily_limit}
                                    onChange={e => setPolicy({ ...policy, daily_limit: e.target.value })}
                                />
                            </Col>
                            <Col md={4} className='pt-2'>
                                <div className='form-check form-switch'>
                                    <Input
                                        type='switch'
                                        id='approval-switch'
                                        checked={policy.require_approval}
                                        onChange={e => setPolicy({ ...policy, require_approval: e.target.checked })}
                                    />
                                    <Label for='approval-switch' className='form-check-label ms-1'>
                                        Require Administrator Approval
                                    </Label>
                                </div>
                            </Col>
                            <Col md={4} className='d-flex gap-1 pt-2'>
                                <Button color='primary' disabled={busy} onClick={() => void act(() => savePolicy(policy))}>
                                    Save Controls
                                </Button>
                                <Button
                                    color={policy.paused ? 'success' : 'danger'}
                                    disabled={busy}
                                    onClick={() => void act(() => savePolicy({ ...policy, paused: !policy.paused }))}
                                >
                                    {policy.paused ? 'Resume Dispatches' : 'Emergency Pause'}
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            )}

            <Card>
                <CardBody>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                        <CardTitle tag='h4' className='mb-0'>Campaign History & Analytics</CardTitle>
                        <Button size='sm' color='outline-secondary' disabled={busy} onClick={() => void act(refresh)}>
                            Refresh Campaigns
                        </Button>
                    </div>

                    <Table responsive hover className='align-middle'>
                        <thead>
                            <tr>
                                <th>Campaign Name</th>
                                <th>Status</th>
                                <th>Recipients</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className='text-center text-muted py-2'>
                                        No broadcast campaigns found. Create your first campaign above.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map(c => (
                                    <tr key={c.id}>
                                        <td className='fw-bold'>{c.name}</td>
                                        <td>
                                            <Badge
                                                color={
                                                    c.status === 'completed'
                                                        ? 'success'
                                                        : c.status === 'processing'
                                                        ? 'primary'
                                                        : c.status === 'pending_approval'
                                                        ? 'warning'
                                                        : c.status === 'cancelled'
                                                        ? 'secondary'
                                                        : 'info'
                                                }
                                            >
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td>{c.total}</td>
                                        <td>
                                            <Button
                                                size='sm'
                                                color='outline-primary'
                                                className='me-1'
                                                onClick={() => void act(async () => setDetail(await api(`wa-send-message/${c.id}`)))}
                                            >
                                                Delivery Counts
                                            </Button>
                                            {c.status === 'pending_approval' && (
                                                <Button
                                                    size='sm'
                                                    className='me-1'
                                                    color='primary'
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void act(async () => {
                                                            await api(`whatsapp/broadcasts/${c.id}/approve`, 'POST', {})
                                                            await refresh()
                                                        })
                                                    }
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {['pending_approval', 'queued', 'processing'].includes(c.status) && (
                                                <Button
                                                    size='sm'
                                                    color='danger'
                                                    outline
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void act(async () => {
                                                            await api('change-campaign-status-to-stop', 'POST', { campaign_id: c.id })
                                                            await refresh()
                                                        })
                                                    }
                                                >
                                                    Cancel Unsent
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {detail && (
                        <Alert color='info' className='mt-2 d-flex justify-content-between align-items-center'>
                            <div>
                                <strong>{detail.name} Status Breakdown:</strong>{' '}
                                {detail.counts &&
                                    Object.entries(detail.counts)
                                        .map(([status, count]) => `${status}: ${count}`)
                                        .join(' · ')}
                            </div>
                            <Button size='sm' color='close' onClick={() => setDetail(null)} />
                        </Alert>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
