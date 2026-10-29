import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardBody, CardTitle, Table } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'

export default function WebhookEvents() {
    const [rows, setRows] = useState<any[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(false)
    async function request(path: string, method = 'GET') {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${token}` } })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }
    async function refresh(retry?: number) {
        setBusy(true); setError('')
        try { if (retry) await request(`whatsapp/webhook-events/${retry}/retry`, 'POST'); setRows(await request('whatsapp/webhook-events')) } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    useEffect(() => { void refresh() }, [])
    return <Card><CardBody><CardTitle tag='h2'>WhatsApp webhook events</CardTitle>
        <p>Incoming provider events for your business. Failed events can be retried after correcting the connection. Customer message content is excluded from this view.</p>
        {error && <Alert color='danger'>{error}</Alert>}
        <Button color='primary' disabled={busy} onClick={() => void refresh()}>Refresh</Button>
        <Table responsive className='mt-2'><thead><tr><th>Event</th><th>Phone ID</th><th>Status</th><th>Attempts</th><th>Received</th><th>Details</th></tr></thead>
            <tbody>{rows.map(row => <tr key={row.id}><td>{row.id}</td><td>{row.phone_number_id}</td><td>{row.status}</td><td>{row.attempts}</td><td>{new Date(row.created_at).toLocaleString()}</td><td>{row.error}{row.status === 'failed' && <Button size='sm' disabled={busy} onClick={() => void refresh(row.id)}>Retry</Button>}</td></tr>)}</tbody>
        </Table>{!rows.length && !busy && <p>No provider events received for this business yet.</p>}
    </CardBody></Card>
}
