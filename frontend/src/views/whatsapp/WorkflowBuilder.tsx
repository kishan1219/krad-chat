import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardBody, CardTitle, Input, Label, Table } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'

type Step = { kind: string; [key: string]: any }
const defaults: Record<string, Step> = {
    text: { kind: 'text', text: '' },
    template: { kind: 'template', template: { name: '', language: { code: 'en_US' } } },
    contact_update: { kind: 'contact_update', field: 'city', value: '' },
    business_hours: { kind: 'business_hours', timezone: 'Asia/Kolkata', days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' },
    condition: { kind: 'condition', field: 'message', equals: '' },
    label: { kind: 'label', label: '' },
    assign: { kind: 'assign', user_id: '' },
    note: { kind: 'note', text: '' },
    notify: { kind: 'notify', title: '', text: '' },
    wait: { kind: 'wait', seconds: 60 },
    handoff: { kind: 'handoff' }
}
export default function WorkflowBuilder() {
    const [editing, setEditing] = useState<number | null>(null), [detail, setDetail] = useState<any>(null)
    const [name, setName] = useState(''), [trigger, setTrigger] = useState('keyword'), [keyword, setKeyword] = useState('help')
    const [steps, setSteps] = useState<Step[]>([{ ...defaults.text }]), [kind, setKind] = useState('text')
    const [flows, setFlows] = useState<any[]>([]), [runs, setRuns] = useState<any[]>([]), [preview, setPreview] = useState<any[]>([])
    const [sample, setSample] = useState('help'), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
    async function api(path: string, method = 'GET', body?: any) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }
    async function refresh() { const [f, r] = await Promise.all([api('workflows'), api('workflows/runs')]); setFlows(f); setRuns(r) }
    async function action(work: () => Promise<void>) {
        setBusy(true); setError(''); setNotice('')
        try { await work() } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    useEffect(() => { void action(refresh) }, [])
    const change = (index: number, values: any) => setSteps(steps.map((step, i) => (i === index ? { ...step, ...values } : step)))
    const move = (index: number, direction: number) => {
        const next = steps.slice(); [next[index], next[index + direction]] = [next[index + direction], next[index]]; setSteps(next)
    }
    return <><Card><CardBody><CardTitle tag='h2'>WhatsApp workflow builder</CardTitle>
        <p>Build up to 30 ordered steps. A false condition stops the run. Human handoff stops the bot. Published structured workflows take priority over basic reply rules when both match.</p>
        {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
        <Label for='workflow-name'>Workflow name</Label><Input id='workflow-name' value={name} onChange={e => setName(e.target.value)} />
        <Label for='workflow-trigger' className='mt-1'>Trigger</Label><Input id='workflow-trigger' disabled={editing !== null} type='select' value={trigger} onChange={e => setTrigger(e.target.value)}><option value='keyword'>Exact keyword</option><option value='new_contact'>First message from a new contact</option><option value='incoming'>Any incoming message</option></Input>
        {trigger === 'keyword' && <><Label for='workflow-keyword' className='mt-1'>Keyword</Label><Input id='workflow-keyword' disabled={editing !== null} value={keyword} onChange={e => setKeyword(e.target.value)} /></>}
        {steps.map((step, index) => <div key={index} className='border rounded p-1 mt-1'>
            <h5>Step {index + 1}: {step.kind}</h5>
            {['text', 'note'].includes(step.kind) && <Input aria-label={`Step ${index + 1} text`} type='textarea' value={step.text} onChange={e => change(index, { text: e.target.value })} />}
            {step.kind === 'notify' && <><p>Post an internal notification visible to this business's staff.</p><Label>Title</Label><Input value={step.title} onChange={e => change(index, { title: e.target.value })} /><Label>Message</Label><Input type='textarea' value={step.text} onChange={e => change(index, { text: e.target.value })} /></>}
            {step.kind === 'template' && <><Label>Approved template name</Label><Input value={step.template.name} onChange={e => change(index, { template: { ...step.template, name: e.target.value } })} /><Label className='mt-1'>Language code</Label><Input value={step.template.language.code} onChange={e => change(index, { template: { ...step.template, language: { code: e.target.value } } })} /><Label className='mt-1'>Body values, one per line</Label><Input type='textarea' value={step.template.components?.[0]?.parameters?.map((p: any) => p.text).join('\n') || ''} onChange={e => change(index, { template: { ...step.template, components: e.target.value ? [{ type: 'body', parameters: e.target.value.split('\n').map(text => ({ type: 'text', text })) }] : [] } })} /></>}
            {step.kind === 'contact_update' && <><Label>Custom field name</Label><Input value={step.field} onChange={e => change(index, { field: e.target.value })} /><Label className='mt-1'>Value</Label><Input value={step.value} onChange={e => change(index, { value: e.target.value })} /></>}
            {step.kind === 'business_hours' && <><Label>Timezone</Label><Input value={step.timezone} onChange={e => change(index, { timezone: e.target.value })} /><Label className='mt-1'>Days: 0 Sunday to 6 Saturday, comma separated</Label><Input value={step.days.join(',')} onChange={e => change(index, { days: e.target.value.split(',').map(Number) })} /><Label className='mt-1'>Start</Label><Input type='time' value={step.start} onChange={e => change(index, { start: e.target.value })} /><Label className='mt-1'>End</Label><Input type='time' value={step.end} onChange={e => change(index, { end: e.target.value })} /></>}
            {step.kind === 'label' && <Input aria-label={`Step ${index + 1} label`} value={step.label} onChange={e => change(index, { label: e.target.value })} />}
            {step.kind === 'assign' && <><Label>Agent user ID</Label><Input aria-label={`Step ${index + 1} agent ID`} type='number' min={1} value={step.user_id} onChange={e => change(index, { user_id: Number(e.target.value) })} /></>}
            {step.kind === 'wait' && <><Label>Wait in seconds (1 to 86400)</Label><Input aria-label={`Step ${index + 1} seconds`} type='number' min={1} max={86400} value={step.seconds} onChange={e => change(index, { seconds: Number(e.target.value) })} /></>}
            {step.kind === 'condition' && <><Input aria-label={`Step ${index + 1} condition field`} type='select' value={step.field} onChange={e => change(index, { field: e.target.value })}><option value='message'>Incoming message equals</option><option value='label'>Conversation has label</option><option value='state'>Conversation state equals</option><option value='custom_field'>Custom field equals</option></Input>{step.field === 'custom_field' && <Input aria-label='Custom field key' placeholder='Custom field name' value={step.key || ''} onChange={e => change(index, { key: e.target.value })} />}<Input aria-label={`Step ${index + 1} condition value`} className='mt-1' value={step.equals} onChange={e => change(index, { equals: e.target.value })} /></>}
            <div className='mt-1'><Button size='sm' className='me-1' disabled={index === 0} onClick={() => move(index, -1)}>Move up</Button><Button size='sm' className='me-1' disabled={index === steps.length - 1} onClick={() => move(index, 1)}>Move down</Button><Button size='sm' color='danger' outline disabled={steps.length === 1} onClick={() => setSteps(steps.filter((_, i) => i !== index))}>Remove</Button></div>
        </div>)}
        <div className='d-flex gap-1 mt-1'><Input aria-label='New step type' type='select' value={kind} onChange={e => setKind(e.target.value)}>{Object.keys(defaults).map(value => <option key={value}>{value}</option>)}</Input><Button disabled={steps.length >= 30} onClick={() => setSteps([...steps, { ...defaults[kind] }])}>Add step</Button></div>
        <Button color='primary' className='mt-1' disabled={busy || !name.trim()} onClick={() => void action(async () => { await api(editing ? `workflows/${editing}` : 'workflows', editing ? 'PATCH' : 'POST', { name, trigger_kind: trigger, keyword, definition: { steps } }); await refresh(); setNotice('Draft saved. Publish below to apply this version.') })}>{editing ? 'Save draft changes' : 'Save new draft'}</Button>
        {editing && <Button className='mt-1 ms-1' onClick={() => { setEditing(null); setName(''); setSteps([{ ...defaults.text }]) }}>New workflow</Button>}
        <h4 className='mt-2'>Dry run</h4><p>Preview the step sequence without sending messages or changing data. Service availability, permissions and the live messaging window are checked during actual execution.</p>
        <Label for='workflow-sample'>Sample incoming message</Label><Input id='workflow-sample' value={sample} onChange={e => setSample(e.target.value)} />
        <Button className='mt-1' disabled={busy} onClick={() => void action(async () => { const result = await api('workflows/dry-run', 'POST', { definition: { steps }, message: sample }); setPreview(result.steps) })}>Run preview</Button>
        {preview.map(item => <p key={item.step} className='mt-1'>{item.step}. {item.kind}: {item.result}</p>)}
    </CardBody></Card>
    <Card><CardBody><CardTitle tag='h3'>Saved workflows</CardTitle><Button disabled={busy} onClick={() => void action(refresh)}>Refresh</Button>
        <Table responsive><thead><tr><th>Name</th><th>Trigger</th><th>Version / status</th><th>Actions</th></tr></thead><tbody>{flows.map(flow => <tr key={flow.id}><td>{flow.name}</td><td>{flow.trigger_kind} {flow.keyword}</td><td>{flow.version} / {flow.enabled ? 'Enabled' : 'Disabled'}</td><td><Button size='sm' disabled={busy} onClick={() => void action(async () => { await api(`workflows/${flow.id}/publish`, 'POST', { enabled: !flow.enabled }); await refresh() })}>{flow.enabled ? 'Disable' : 'Publish and enable'}</Button><Button size='sm' className='ms-1' onClick={() => { setEditing(null); setName(`${flow.name} copy`); setTrigger(flow.trigger_kind); setKeyword(flow.keyword); setSteps(flow.draft.steps); setPreview([]) }}>Copy to builder</Button></td></tr>)}</tbody></Table>
        {!flows.length && <p>No workflows saved.</p>}
        {flows.map(flow => <Button key={flow.id} className='me-1 mb-1' size='sm' outline onClick={() => { setEditing(flow.id); setName(flow.name); setTrigger(flow.trigger_kind); setKeyword(flow.keyword); setSteps(flow.draft.steps); setPreview([]) }}>Edit {flow.name}</Button>)}
        {flows.filter(flow => flow.enabled).map(flow => <Button key={flow.id} className='me-1 mb-1' size='sm' color='primary' disabled={busy} onClick={() => void action(async () => { await api(`workflows/${flow.id}/publish`, 'POST', { enabled: true }); await refresh(); setNotice('New version published. Existing runs keep their original version.') })}>Publish new version: {flow.name}</Button>)}
        <CardTitle tag='h3'>Run history</CardTitle><Table responsive><thead><tr><th>Run</th><th>Workflow</th><th>Status</th><th>Steps completed</th><th>Details</th></tr></thead><tbody>{runs.map(run => <tr key={run.id}><td>{run.id}</td><td>{run.name} v{run.version}</td><td>{run.status}</td><td>{run.step}</td><td>{run.error || (run.status === 'queued' ? `Next eligible: ${new Date(run.available_at).toLocaleString()}` : '')}</td></tr>)}</tbody></Table>{!runs.length && <p>No workflow runs yet.</p>}
        {runs.map(run => <span key={run.id}><Button size='sm' className='me-1 mb-1' onClick={() => void action(async () => setDetail(await api(`workflows/runs/${run.id}`)))}>Inspect run {run.id}</Button>{run.status === 'failed' && <Button size='sm' color='warning' className='me-1 mb-1' disabled={busy} onClick={() => void action(async () => { await api(`workflows/runs/${run.id}/retry`, 'POST', {}); await refresh() })}>Retry run {run.id}</Button>}</span>)}
        {detail && <><h4>Run {detail.id}: step history</h4>{detail.steps.map((step: any) => <p key={step.step}>{step.step + 1}. {step.kind}: {step.result} {step.delivery_status && `(${step.delivery_status})`}</p>)}</>}
    </CardBody></Card></>
}
