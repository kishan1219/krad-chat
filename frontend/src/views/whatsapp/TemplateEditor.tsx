import { useState } from 'react'
import { Alert, Button, Input, Label } from 'reactstrap'

export default function TemplateEditor({ connection, api, refresh, simulated }: { connection: any, api: (path: string, method?: string, body?: any) => Promise<any>, refresh: () => Promise<void>, simulated: boolean }) {
    const [name, setName] = useState(''), [language, setLanguage] = useState('en_US'), [category, setCategory] = useState('UTILITY')
    const [text, setText] = useState(''), [examples, setExamples] = useState(''), [header, setHeader] = useState(''), [footer, setFooter] = useState('')
    const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
    async function submit() {
        setBusy(true); setError(''); setNotice('')
        try {
            const result = await api(`whatsapp/connections/${connection.id}/templates`, 'POST', { name, language, category, text, header, footer, examples: examples.trim() ? examples.split('\n').map(value => value.trim()) : [] })
            await refresh(); setNotice(`Template saved. Status: ${result.status}${simulated ? ' (local simulation)' : ''}`)
            setName(''); setText(''); setExamples(''); setHeader(''); setFooter('')
        } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    return <div className='border rounded p-2 mt-2'><h4>Create a text template</h4>
        <p>Templates are shared by numbers in the same WhatsApp Business Account. Live templates require Meta approval before sending.</p>
        {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
        <Label>Template name</Label><Input value={name} placeholder='order_confirmation' onChange={e => setName(e.target.value)} />
        <Label className='mt-1'>Language code</Label><Input value={language} placeholder='en_US' onChange={e => setLanguage(e.target.value)} />
        <Label className='mt-1'>Category</Label><Input type='select' value={category} onChange={e => setCategory(e.target.value)}><option value='UTILITY'>Utility</option><option value='MARKETING'>Marketing</option></Input>
        <Label className='mt-1'>Header (optional)</Label><Input maxLength={60} value={header} onChange={e => setHeader(e.target.value)} />
        <Label className='mt-1'>Message body</Label><Input type='textarea' maxLength={1024} value={text} placeholder='Your order {{1}} is confirmed.' onChange={e => setText(e.target.value)} />
        <Label className='mt-1'>Placeholder examples, one per line in numeric order</Label><Input type='textarea' value={examples} placeholder='ORDER-1001' onChange={e => setExamples(e.target.value)} />
        <Label className='mt-1'>Footer (optional)</Label><Input maxLength={60} value={footer} onChange={e => setFooter(e.target.value)} />
        <Button className='mt-1' color='primary' disabled={busy || !name || !text || connection.status !== 'connected'} onClick={() => void submit()}>{busy ? 'Submitting…' : simulated ? 'Create simulated template' : 'Submit to Meta'}</Button>
    </div>
}
