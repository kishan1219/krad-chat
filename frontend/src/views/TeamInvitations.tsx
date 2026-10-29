import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, CardBody, CardTitle, Form, Input, Label, Table } from 'reactstrap'
import httpConfig from '../utility/http/httpConfig'

export default function TeamInvitations({ acceptance = false }: { acceptance?: boolean }) {
    const [rows, setRows] = useState<any[]>([])
    const [email, setEmail] = useState(''), [name, setName] = useState(''), [role, setRole] = useState('viewer')
    const [password, setPassword] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
    const [inviteToken] = useState(() => window.location.hash.slice(1))
    async function api(path: string, method = 'GET', body?: any) {
        const token = acceptance ? null : JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }
    async function refresh() { setRows(await api('invitations')) }
    async function action(work: () => Promise<void>) {
        setBusy(true); setError(''); setNotice('')
        try { await work() } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    useEffect(() => { if (!acceptance) void action(refresh) }, [acceptance])
    return <Card className='mx-auto mt-2' style={{ maxWidth: 1000 }}><CardBody>
        <CardTitle tag='h2'>{acceptance ? 'Accept team invitation' : 'Team invitations'}</CardTitle>
        {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
        {acceptance ? <Form onSubmit={e => { e.preventDefault(); void action(async () => { await api('invitations/accept', 'POST', { token: inviteToken, password }); setPassword(''); setNotice('Your account is ready. Sign in using the invited email address.') }) }}>
            <Label for='invite-password'>Choose a password (at least 12 characters)</Label>
            <Input id='invite-password' type='password' autoComplete='new-password' minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} />
            <Button className='mt-1 me-1' color='primary' disabled={busy || !inviteToken || !!notice}>Accept invitation</Button>
            <Link to='/authentication'>Sign in</Link>
        </Form> : <>
            <p>Invite a team member. Links expire after 72 hours. Operators can reply to chats; viewers receive no write permissions.</p>
            <Form onSubmit={e => { e.preventDefault(); void action(async () => { await api('invitations', 'POST', { email, name, role }); setEmail(''); setName(''); await refresh(); setNotice('Invitation sent. Local mock mode stores email in the development mailbox.') }) }}>
                <Label for='invite-name'>Name</Label><Input id='invite-name' required value={name} onChange={e => setName(e.target.value)} />
                <Label for='invite-email' className='mt-1'>Email</Label><Input id='invite-email' type='email' required value={email} onChange={e => setEmail(e.target.value)} />
                <Label for='invite-role' className='mt-1'>Role</Label><Input id='invite-role' type='select' value={role} onChange={e => setRole(e.target.value)}><option value='viewer'>Viewer</option><option value='operator'>Chat operator</option></Input>
                <Button color='primary' className='mt-1' disabled={busy}>Send invitation</Button>
            </Form>
            <Table responsive className='mt-2'><thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(row => {
                const status = row.accepted_at ? 'Accepted' : row.revoked_at ? 'Revoked' : new Date(row.expires_at) < new Date() ? 'Expired' : 'Pending'
                return <tr key={row.id}><td>{row.email}</td><td>{row.role}</td><td>{status}</td><td>{status === 'Pending' && <Button size='sm' color='danger' outline disabled={busy} onClick={() => void action(async () => { await api(`invitations/${row.id}/revoke`, 'POST', {}); await refresh() })}>Revoke</Button>}</td></tr>
            })}</tbody></Table>{!rows.length && <p>No invitations yet.</p>}
        </>}
    </CardBody></Card>
}
