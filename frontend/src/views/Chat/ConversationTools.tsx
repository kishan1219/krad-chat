import { useEffect, useState } from 'react'
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
    return <><Button size='sm' color='primary' outline disabled={!conversationId} onClick={() => setOpen(true)}>Manage / templates</Button>
        <Modal isOpen={open} toggle={() => setOpen(!open)} size='lg'><ModalHeader toggle={() => setOpen(false)}>Conversation tools</ModalHeader><ModalBody>
            {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
            {conversation && <><p>{conversation.phone} · {conversation.state} · {conversation.bot_paused ? 'Bot paused' : 'Bot active'}</p>
                <div className='d-flex gap-1 mb-1'><Button disabled={busy} onClick={() => void action(() => manage({ bot_paused: !conversation.bot_paused }))}>{conversation.bot_paused ? 'Resume bot' : 'Human takeover'}</Button><Button disabled={busy} onClick={() => void action(() => manage({ state: conversation.state === 'open' ? 'closed' : 'open' }))}>{conversation.state === 'open' ? 'Close conversation' : 'Reopen conversation'}</Button></div>
                <Label for='tools-agent'>Assigned agent</Label><Input id='tools-agent' type='select' value={conversation.assigned_to || ''} disabled={busy} onChange={e => void action(() => manage({ assigned_to: e.target.value ? Number(e.target.value) : null }))}><option value=''>Unassigned</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</Input>
                <Label for='tools-labels' className='mt-1'>Labels (comma separated)</Label><Input id='tools-labels' value={labels} onChange={e => setLabels(e.target.value)} />
                <Label className='mt-1'>Custom fields</Label><KeyValueFields value={fields} onChange={setFields} label='field' />
                <Button className='mt-1' disabled={busy} onClick={() => void action(() => manage({ labels: labels.split(',').map(v => v.trim()).filter(Boolean), custom_fields: Object.fromEntries(fields) }))}>Save contact details</Button>
                <h4 className='mt-2'>Approved template reply</h4><p>Use an approved template when the customer service window is closed. This picker supports text body parameters.</p>
                <Input aria-label='Approved template' type='select' value={template} onChange={e => setTemplate(e.target.value)}><option value=''>Select template</option>{templates.map((t, i) => <option key={`${t.id}-${t.language}`} value={String(i)}>{t.name} ({t.language})</option>)}</Input>
                {template !== '' && <p className='mt-1'>{templates[Number(template)]?.components?.find((c: any) => c.type === 'BODY')?.text}</p>}
                <Label for='template-parameters' className='mt-1'>Body values, one per line, in placeholder order</Label><Input id='template-parameters' type='textarea' value={parameters} onChange={e => setParameters(e.target.value)} />
                <Button className='mt-1' disabled={busy || template === ''} onClick={() => void action(async () => {
                    const chosen = templates[Number(template)], values = parameters.trim() ? parameters.split('\n').map(text => ({ type: 'text', text })) : []
                    await api('wa-send-reply-message', 'POST', { conversation_id: conversationId, template: { name: chosen.name, language: { code: chosen.language }, ...(values.length ? { components: [{ type: 'body', parameters: values }] } : {}) } })
                    setNotice('Template queued. Delivery status appears in the conversation.'); setParameters('')
                })}>Send approved template</Button>
                {!templates.length && <p className='mt-1'>No approved templates for this sender. Synchronize in Business Connections.</p>}
                <h4 className='mt-2'>Internal notes</h4>{notes.map(n => <p key={n.id}>{n.body}</p>)}
                <Input aria-label='Internal note' type='textarea' value={note} onChange={e => setNote(e.target.value)} />
                <Button className='mt-1' disabled={busy || !note.trim()} onClick={() => void action(async () => { await api(`inbox/conversations/${conversationId}/notes`, 'POST', { body: note }); setNote(''); await refresh() })}>Add note</Button>
            </>}
        </ModalBody></Modal>
    </>
}
