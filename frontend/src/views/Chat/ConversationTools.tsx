import { useEffect, useState } from 'react'
import { Sliders } from 'react-feather'
import { Alert, Button, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'
import KeyValueFields from '../components/KeyValueFields'

export default function ConversationTools({ conversationId }: { conversationId?: number }) {
    const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
    const [conversation, setConversation] = useState<any>(null), [agents, setAgents] = useState<any[]>([]), [notes, setNotes] = useState<any[]>([]), [templates, setTemplates] = useState<any[]>([])
    const [labels, setLabels] = useState(''), [fields, setFields] = useState<[string, string][]>([]), [note, setNote] = useState(''), [template, setTemplate] = useState(''), [parameters, setParameters] = useState('')
    async function api(path: string, method = 'GET', body?: any) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }
    async function refresh() {
        const [c, a, n, t] = await Promise.all([api(`inbox/conversations/${conversationId}`), api('inbox/agents'), api(`inbox/conversations/${conversationId}/notes`), api(`inbox/conversations/${conversationId}/templates`)])
        setConversation(c); setAgents(a); setNotes(n); setTemplates(t); setLabels(c.labels.join(', ')); setFields(Object.entries(c.custom_fields))
    }
    async function action(work: () => Promise<void>) {
        setBusy(true); setError(''); setNotice('')
        try { await work() } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    useEffect(() => { if (open && conversationId) void action(refresh) }, [open, conversationId])
    async function manage(body: any) { await api(`inbox/conversations/${conversationId}/manage`, 'POST', { version: conversation.version, ...body }); await refresh() }
    return (
        <>
            <Button
                size='sm'
                color='success'
                outline
                className='d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-bold'
                disabled={!conversationId}
                onClick={() => setOpen(true)}
            >
                <Sliders size={14} className='me-1' />
                <span>Tools & Templates</span>
            </Button>
            <Modal isOpen={open} toggle={() => setOpen(!open)} size='lg' centered>
                <ModalHeader toggle={() => setOpen(false)} className='border-bottom pb-2'>
                    <div className='d-flex align-items-center gap-2'>
                        <Sliders size={18} className='text-success me-1' />
                        <span className='fw-bolder'>Conversation Operations & Templates</span>
                    </div>
                </ModalHeader>
                <ModalBody className='p-3'>
                    {error && <Alert color='danger' className='p-2 mb-2'>{error}</Alert>}
                    {notice && <Alert color='success' className='p-2 mb-2'>{notice}</Alert>}
                    {conversation && (
                        <div className='d-flex flex-column gap-3'>
                            {/* Status Header Bar */}
                            <div className='p-3 bg-light rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border'>
                                <div>
                                    <h6 className='mb-0 fw-bold'>+{conversation.phone}</h6>
                                    <div className='d-flex align-items-center gap-2 mt-1'>
                                        <span className={`badge ${conversation.state === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                                            State: {conversation.state?.toUpperCase()}
                                        </span>
                                        <span className={`badge ${conversation.bot_paused ? 'bg-warning text-dark' : 'bg-info'}`}>
                                            {conversation.bot_paused ? 'Human Takeover (Bot Paused)' : 'Bot Active'}
                                        </span>
                                    </div>
                                </div>
                                <div className='d-flex gap-2'>
                                    <Button
                                        size='sm'
                                        color={conversation.bot_paused ? 'success' : 'warning'}
                                        disabled={busy}
                                        onClick={() => void action(() => manage({ bot_paused: !conversation.bot_paused }))}
                                    >
                                        {conversation.bot_paused ? 'Resume AI Bot' : 'Takeover (Pause Bot)'}
                                    </Button>
                                    <Button
                                        size='sm'
                                        color={conversation.state === 'open' ? 'secondary' : 'primary'}
                                        disabled={busy}
                                        onClick={() => void action(() => manage({ state: conversation.state === 'open' ? 'closed' : 'open' }))}
                                    >
                                        {conversation.state === 'open' ? 'Close Chat' : 'Reopen Chat'}
                                    </Button>
                                </div>
                            </div>

                            {/* Assignment & Labels */}
                            <div className='card border p-3 shadow-none mb-0'>
                                <h6 className='fw-bold text-dark mb-2'>Agent Assignment & Tags</h6>
                                <div className='row g-2'>
                                    <div className='col-md-6'>
                                        <Label for='tools-agent' className='form-label small text-muted'>Assigned Agent</Label>
                                        <Input
                                            id='tools-agent'
                                            type='select'
                                            value={conversation.assigned_to || ''}
                                            disabled={busy}
                                            onChange={e => void action(() => manage({ assigned_to: e.target.value ? Number(e.target.value) : null }))}
                                        >
                                            <option value=''>Unassigned</option>
                                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </Input>
                                    </div>
                                    <div className='col-md-6'>
                                        <Label for='tools-labels' className='form-label small text-muted'>Labels (comma separated)</Label>
                                        <Input
                                            id='tools-labels'
                                            placeholder='e.g. VIP, support, urgent'
                                            value={labels}
                                            onChange={e => setLabels(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='mt-2'>
                                    <Label className='form-label small text-muted'>Custom Contact Fields</Label>
                                    <KeyValueFields value={fields} onChange={setFields} label='field' />
                                </div>
                                <div className='mt-2 text-end'>
                                    <Button
                                        color='primary'
                                        size='sm'
                                        disabled={busy}
                                        onClick={() => void action(() => manage({ labels: labels.split(',').map(v => v.trim()).filter(Boolean), custom_fields: Object.fromEntries(fields) }))}
                                    >
                                        Save Details
                                    </Button>
                                </div>
                            </div>

                            {/* Approved Templates */}
                            <div className='card border p-3 shadow-none mb-0'>
                                <h6 className='fw-bold text-dark mb-1'>Send Approved WhatsApp Template</h6>
                                <p className='text-muted small mb-2'>
                                    Required when messaging outside the 24-hour customer service window.
                                </p>
                                <Input
                                    aria-label='Approved template'
                                    type='select'
                                    value={template}
                                    onChange={e => setTemplate(e.target.value)}
                                >
                                    <option value=''>-- Select Approved Template --</option>
                                    {templates.map((t, i) => (
                                        <option key={`${t.id}-${t.language}`} value={String(i)}>
                                            {t.name} ({t.language})
                                        </option>
                                    ))}
                                </Input>
                                {template !== '' && (
                                    <div className='p-2 bg-light rounded mt-2 border'>
                                        <small className='text-dark fw-bold'>Template Body Preview:</small>
                                        <p className='small mb-0 text-secondary'>
                                            {templates[Number(template)]?.components?.find((c: any) => c.type === 'BODY')?.text}
                                        </p>
                                    </div>
                                )}
                                <div className='mt-2'>
                                    <Label for='template-parameters' className='form-label small text-muted'>
                                        Body Parameters (one value per line in placeholder order)
                                    </Label>
                                    <Input
                                        id='template-parameters'
                                        type='textarea'
                                        rows={2}
                                        value={parameters}
                                        placeholder='Param 1&#10;Param 2'
                                        onChange={e => setParameters(e.target.value)}
                                    />
                                </div>
                                <div className='mt-2 text-end'>
                                    <Button
                                        color='success'
                                        size='sm'
                                        disabled={busy || template === ''}
                                        onClick={() => void action(async () => {
                                            const chosen = templates[Number(template)], values = parameters.trim() ? parameters.split('\n').map(text => ({ type: 'text', text })) : []
                                            await api('wa-send-reply-message', 'POST', {
                                                conversation_id: conversationId,
                                                template: {
                                                    name: chosen.name,
                                                    language: { code: chosen.language },
                                                    ...(values.length ? { components: [{ type: 'body', parameters: values }] } : {})
                                                }
                                            })
                                            setNotice('Approved WhatsApp template queued successfully.')
                                            setParameters('')
                                        })}
                                    >
                                        Send Template
                                    </Button>
                                </div>
                            </div>

                            {/* Internal Agent Notes */}
                            <div className='card border p-3 shadow-none mb-0'>
                                <h6 className='fw-bold text-dark mb-1'>Internal Notes</h6>
                                {notes.length > 0 ? (
                                    <div className='d-flex flex-column gap-1 mb-2'>
                                        {notes.map(n => (
                                            <div key={n.id} className='p-2 bg-light rounded border-start border-3 border-primary'>
                                                <small className='text-dark'>{n.body}</small>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-muted small mb-2'>No internal notes yet.</p>
                                )}
                                <Input
                                    aria-label='Internal note'
                                    type='textarea'
                                    rows={2}
                                    placeholder='Write a private note for other agents...'
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                                <div className='mt-2 text-end'>
                                    <Button
                                        color='secondary'
                                        size='sm'
                                        outline
                                        disabled={busy || !note.trim()}
                                        onClick={() => void action(async () => {
                                            await api(`inbox/conversations/${conversationId}/notes`, 'POST', { body: note })
                                            setNote('')
                                            await refresh()
                                        })}
                                    >
                                        Add Note
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </>
    )
}
