import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardBody, CardTitle, Input, Label, Table } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'
import EmbeddedSignup from './EmbeddedSignup'
import TemplateEditor from './TemplateEditor'

export default function Connections() {
    const [connections, setConnections] = useState<any[]>([])
    const [name, setName] = useState(''), [waba, setWaba] = useState(''), [phone, setPhone] = useState(''), [secret, setSecret] = useState('')
    const [pins, setPins] = useState<Record<string, string>>({}), [selected, setSelected] = useState<any>(null)
    const [mode, setMode] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
    async function api(path: string, method = 'GET', body?: any) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }
    async function refresh() { setConnections(await api('whatsapp/connections')) }
    async function act(work: () => Promise<void>) {
        setBusy(true); setError(''); setNotice('')
        try { await work() } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    useEffect(() => { void act(async () => { setMode((await api('me')).provider_mode); await refresh() }) }, [])
    async function connectionAction(id: string, action: string, body = {}) {
        await api(`whatsapp/connections/${id}/${action}`, 'POST', body)
        setPins({ ...pins, [id]: '' }); await refresh(); setNotice(`${action} completed`)
    }
    return <><Card><CardBody><CardTitle tag='h2'>WhatsApp business connections</CardTitle>
        {mode === 'mock' && <Alert color='info'>Local testing mode. Connections, registration and templates are simulated. You do not need to enter a real token.</Alert>}
        {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
        <EmbeddedSignup onConnected={refresh} />
        <p>Connect each business number separately. Access tokens are encrypted on the server and never returned to this screen.</p>
        <Label for='connection-name'>Connection name</Label><Input id='connection-name' value={name} onChange={e => setName(e.target.value)} />
        <Label for='connection-waba' className='mt-1'>WhatsApp Business Account ID</Label><Input id='connection-waba' value={waba} onChange={e => setWaba(e.target.value)} />
        <Label for='connection-phone' className='mt-1'>Phone number ID</Label><Input id='connection-phone' value={phone} onChange={e => setPhone(e.target.value)} />
        {mode === 'live' && <><Label for='connection-token' className='mt-1'>Meta access token</Label><Input id='connection-token' type='password' autoComplete='new-password' value={secret} onChange={e => setSecret(e.target.value)} /></>}
        <Button color='primary' className='mt-1' disabled={busy || !name.trim() || !/^\d+$/.test(waba) || !/^\d+$/.test(phone)} onClick={() => void act(async () => {
            await api('whatsapp/connections', 'POST', { name, waba_id: waba, phone_number_id: phone, ...(secret ? { access_token: secret } : {}) })
            setSecret(''); await refresh(); setNotice('Connection saved. Subscribe to webhooks and synchronize templates below.')
        })}>Connect / replace credentials</Button>
    </CardBody></Card>
    <Card><CardBody><CardTitle tag='h3'>Connected numbers</CardTitle><Button disabled={busy} onClick={() => void act(refresh)}>Refresh</Button>
        <Table responsive><thead><tr><th>Name / number</th><th>Status</th><th>Quality</th><th>Setup and recovery</th></tr></thead><tbody>{connections.map(item => <tr key={item.id}>
            <td>{item.name}<br />{item.display_phone_number}<br />ID: {item.phone_number_id}</td>
            <td>{item.status}{item.simulated && ' (simulation)'}<br />Webhooks: {item.subscribed ? 'subscribed' : 'not subscribed'}<br />Registration: {item.registered ? 'confirmed' : 'not confirmed'}</td>
            <td>{item.quality_rating || 'Unknown'}{item.last_sync_at && <p>Last sync: {new Date(item.last_sync_at).toLocaleString()}</p>}</td>
            <td>{item.last_error && <Alert color='warning'>{item.last_error}</Alert>}
                <Button size='sm' className='me-1 mb-1' disabled={busy || item.status !== 'connected'} onClick={() => void act(() => connectionAction(item.id, 'subscribe'))}>Subscribe</Button>
                <Button size='sm' className='me-1 mb-1' disabled={busy || item.status !== 'connected'} onClick={() => void act(() => connectionAction(item.id, 'sync'))}>Sync templates / quality</Button>
                <Button size='sm' className='me-1 mb-1' onClick={() => setSelected(item)}>View templates</Button>
                <Button size='sm' className='me-1 mb-1' color='danger' outline disabled={busy || item.status !== 'connected'} onClick={() => void act(() => connectionAction(item.id, 'disconnect'))}>Disconnect locally</Button>
                <Label for={`pin-${item.id}`}>Registration PIN (keep a secure copy)</Label><Input id={`pin-${item.id}`} type='password' inputMode='numeric' maxLength={6} autoComplete='new-password' value={pins[item.id] || ''} onChange={e => setPins({ ...pins, [item.id]: e.target.value })} />
                <Button size='sm' className='mt-1' disabled={busy || item.status !== 'connected' || !/^\d{6}$/.test(pins[item.id] || '')} onClick={() => void act(() => connectionAction(item.id, 'register', { pin: pins[item.id] }))}>Register number</Button>
            </td>
        </tr>)}</tbody></Table>{!connections.length && <p>No numbers connected yet.</p>}
        {selected && <><h4>Templates: {selected.name}</h4><Table responsive><thead><tr><th>Name</th><th>Language</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>{(connections.find(item => item.id === selected.id)?.templates || []).map((template: any) => <tr key={`${template.id}-${template.language}`}><td>{template.name}</td><td>{template.language}</td><td>{template.category}</td><td>{template.status}</td><td><Button size='sm' color='danger' outline disabled={busy} onClick={() => { if (window.confirm(`Delete template ${template.name} (${template.language}) from this WhatsApp Business Account?`)) void act(async () => { await api(`whatsapp/connections/${selected.id}/templates/delete`, 'POST', { id: String(template.id), name: template.name }); await refresh(); setNotice('Template deleted') }) }}>Delete</Button></td></tr>)}</tbody></Table><TemplateEditor key={selected.id} connection={connections.find(item => item.id === selected.id) || selected} api={api} refresh={refresh} simulated={mode === 'mock'} /></>}
    </CardBody></Card></>
}
