import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardBody, CardTitle, Input, Label, Table } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'

export default function Broadcasts() {
    const [senders, setSenders] = useState<any[]>([]), [campaigns, setCampaigns] = useState<any[]>([]), [policy, setPolicy] = useState<any>(null)
    const [sender, setSender] = useState(''), [template, setTemplate] = useState(''), [name, setName] = useState(''), [recipients, setRecipients] = useState(''), [parameters, setParameters] = useState(''), [schedule, setSchedule] = useState(''), [segment, setSegment] = useState('')
    const [consentPhone, setConsentPhone] = useState(''), [source, setSource] = useState(''), [evidence, setEvidence] = useState(''), [optedIn, setOptedIn] = useState(true)
    const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
    const [detail, setDetail] = useState<any>(null)
    async function api(path: string, method = 'GET', body?: any, idempotencyKey?: string) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }
    async function refresh() {
        const [s, c, p] = await Promise.all([api('whatsapp/senders'), api('wa-campaigns'), api('whatsapp/broadcast-policy')])
        setSenders(s); setCampaigns((c.data || []).filter((item: any) => !item.payload.internal_chat)); setPolicy(p)
    }
    async function act(work: () => Promise<void>) {
        setBusy(true); setError(''); setNotice('')
        try { await work() } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    useEffect(() => { void act(refresh) }, [])
    const templates = senders.find(s => String(s.id) === sender)?.templates || []
    async function savePolicy(next: any) { await api('whatsapp/broadcast-policy', 'POST', { daily_limit: Number(next.daily_limit), require_approval: next.require_approval, paused: next.paused }); await refresh() }
    return <><Card><CardBody><CardTitle tag='h2'>WhatsApp broadcasts</CardTitle>
        {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
        <p>Send approved templates to customers with recorded opt-in. Platform wallet charges are application fees; Meta bills its messaging charges separately.</p>
        <Label for='broadcast-name'>Campaign name</Label><Input id='broadcast-name' value={name} onChange={e => setName(e.target.value)} />
        <Label for='broadcast-sender' className='mt-1'>Business sender</Label><Input id='broadcast-sender' type='select' value={sender} onChange={e => { setSender(e.target.value); setTemplate('') }}><option value=''>Select sender</option>{senders.map(s => <option key={s.id} value={s.id}>{s.name} · {s.phone_number_id} · quality {s.quality_rating}</option>)}</Input>
        <Label for='broadcast-template' className='mt-1'>Approved template</Label><Input id='broadcast-template' type='select' value={template} onChange={e => setTemplate(e.target.value)}><option value=''>Select template</option>{templates.map((t: any, i: number) => <option key={`${t.id}-${t.language}`} value={String(i)}>{t.name} ({t.language})</option>)}</Input>
        <Label for='broadcast-values' className='mt-1'>Text body values, one per line</Label><Input id='broadcast-values' type='textarea' value={parameters} onChange={e => setParameters(e.target.value)} />
        <Label for='broadcast-recipients' className='mt-1'>Customer numbers (comma or newline separated)</Label><Input id='broadcast-recipients' type='textarea' value={recipients} onChange={e => setRecipients(e.target.value)} />
        <div className='d-flex gap-1 mt-1'><Input aria-label='Segment label' placeholder='Conversation label' value={segment} onChange={e => setSegment(e.target.value)} /><Button disabled={busy || !segment.trim()} onClick={() => void act(async () => { const phones = await api(`whatsapp/segments?label=${encodeURIComponent(segment)}`); setRecipients(phones.join('\n')); setNotice(`${phones.length} opted-in customers selected.`) })}>Load opted-in segment</Button></div>
        <Label for='broadcast-schedule' className='mt-1'>Schedule (optional, your local time)</Label><Input id='broadcast-schedule' type='datetime-local' value={schedule} onChange={e => setSchedule(e.target.value)} />
        <Button className='mt-1' color='primary' disabled={busy || !name.trim() || !sender || template === '' || !recipients.trim()} onClick={() => void act(async () => {
            const chosen = templates[Number(template)], values = parameters.trim() ? parameters.split('\n').map(text => ({ type: 'text', text })) : []
            const result = await api('wa-send-message', 'POST', { name, recipients: recipients.split(/[,\n]/).map(v => v.trim()).filter(Boolean), ...(schedule ? { schedule_at: new Date(schedule).toISOString() } : {}), payload: { phone_number_id: senders.find(s => String(s.id) === sender).phone_number_id, template: { name: chosen.name, language: { code: chosen.language }, ...(values.length ? { components: [{ type: 'body', parameters: values }] } : {}) } } }, crypto.randomUUID())
            await refresh(); setNotice(`Campaign ${result.id}: ${result.status}.`)
        })}>Create broadcast</Button>
    </CardBody></Card>
    <Card><CardBody><CardTitle tag='h3'>Consent records</CardTitle><p>Record the source and evidence of the customer's permission. A normal incoming message does not automatically grant marketing consent.</p>
        <Label for='consent-phone'>Customer number</Label><Input id='consent-phone' value={consentPhone} onChange={e => setConsentPhone(e.target.value)} />
        <Label for='consent-source' className='mt-1'>Source</Label><Input id='consent-source' placeholder='For example, checkout opt-in form' value={source} onChange={e => setSource(e.target.value)} />
        <Label for='consent-evidence' className='mt-1'>Evidence / reference</Label><Input id='consent-evidence' value={evidence} onChange={e => setEvidence(e.target.value)} />
        <Label for='consent-choice' className='mt-1'>Customer choice</Label><Input id='consent-choice' type='select' value={String(optedIn)} onChange={e => setOptedIn(e.target.value === 'true')}><option value='true'>Opted in</option><option value='false'>Opted out</option></Input>
        <Button className='mt-1' disabled={busy || !consentPhone || source.length < 3 || evidence.length < 3} onClick={() => void act(async () => { await api('whatsapp/consents', 'POST', { phone: consentPhone, opted_in: optedIn, source, evidence }); setNotice('Consent recorded with an immutable history event.') })}>Record consent</Button>
    </CardBody></Card>
    {policy && <Card><CardBody><CardTitle tag='h3'>Dispatch controls</CardTitle><p>{policy.dispatches_today} dispatch slots used today. Counter resets at midnight UTC. Red sender quality pauses its broadcasts.</p>
        <Label for='broadcast-cap'>Daily dispatch limit</Label><Input id='broadcast-cap' type='number' min={1} max={1000000} value={policy.daily_limit} onChange={e => setPolicy({ ...policy, daily_limit: e.target.value })} />
        <label className='mt-1 d-block'><input type='checkbox' checked={policy.require_approval} onChange={e => setPolicy({ ...policy, require_approval: e.target.checked })} /> Require administrator approval</label>
        <Button className='mt-1 me-1' disabled={busy} onClick={() => void act(() => savePolicy(policy))}>Save controls</Button><Button className='mt-1' color={policy.paused ? 'success' : 'danger'} disabled={busy} onClick={() => void act(() => savePolicy({ ...policy, paused: !policy.paused }))}>{policy.paused ? 'Resume broadcasts' : 'Emergency pause broadcasts'}</Button>
        <p className='mt-1'>Pausing stops queued dispatches. Messages already submitted to the provider cannot be recalled.</p>
    </CardBody></Card>}
    <Card><CardBody><CardTitle tag='h3'>Campaigns</CardTitle><Button disabled={busy} onClick={() => void act(refresh)}>Refresh</Button><Table responsive><thead><tr><th>Name</th><th>Status</th><th>Recipients</th><th>Actions</th></tr></thead><tbody>{campaigns.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.status}</td><td>{c.total}</td><td>
        <Button size='sm' className='me-1' onClick={() => void act(async () => setDetail(await api(`wa-send-message/${c.id}`)))}>Delivery counts</Button>
        {c.status === 'pending_approval' && <Button size='sm' className='me-1' color='primary' disabled={busy} onClick={() => void act(async () => { await api(`whatsapp/broadcasts/${c.id}/approve`, 'POST', {}); await refresh() })}>Approve</Button>}
        {['pending_approval', 'queued', 'processing'].includes(c.status) && <Button size='sm' color='danger' outline disabled={busy} onClick={() => void act(async () => { await api('change-campaign-status-to-stop', 'POST', { campaign_id: c.id }); await refresh() })}>Cancel unsent</Button>}
    </td></tr>)}</tbody></Table>{detail && <Alert color='info'>{detail.name}: {Object.entries(detail.counts).map(([status, count]) => `${status}: ${count}`).join(' · ')}</Alert>}</CardBody></Card></>
}
