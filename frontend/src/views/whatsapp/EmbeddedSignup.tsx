import { useEffect, useRef, useState } from 'react'
import { Alert, Button } from 'reactstrap'
import httpConfig from '../../utility/http/httpConfig'

export default function EmbeddedSignup({ onConnected }: { onConnected: () => Promise<void> }) {
    const [session, setSession] = useState<any>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
    const cleanup = useRef<() => void>(() => {})
    useEffect(() => () => cleanup.current(), [])
    async function api(path: string, body: any) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}whatsapp/onboarding/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Onboarding failed')
        return result.data
    }
    async function prepare() {
        setBusy(true); setError(''); setNotice(''); setSession(null)
        try {
            const result = await api('begin', {})
            if (!result.simulated) {
                if (!(window as any).FB) await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://connect.facebook.net/en_US/sdk.js'; script.async = true
                    script.onload = () => resolve(); script.onerror = () => { script.remove(); reject(new Error('Meta SDK could not load. Check browser restrictions.')) }
                    document.head.appendChild(script)
                })
                ;(window as any).FB.init({ appId: result.app_id, version: result.graph_version, autoLogAppEvents: false, xfbml: false })
            }
            setSession(result)
        } catch (e: any) { setError(e.message) } finally { setBusy(false) }
    }
    async function complete(code: string, assets: any) {
        try {
            await api('complete', { state: session.state, code, name: 'WhatsApp business', waba_id: assets.waba_id, phone_number_id: assets.phone_number_id })
            await onConnected(); setNotice('Business connected. Subscribe, register if required, and sync templates below.')
        } catch (e: any) { setError(e.message) } finally { cleanup.current(); setSession(null); setBusy(false) }
    }
    function launch() {
        setBusy(true); setError('')
        if (session.simulated) { void complete('local-test-code', { waba_id: '900000001', phone_number_id: '900000002' }); return }
        let code = '', assets: any = null, submitted = false
        const finish = () => { if (!submitted && code && assets?.phone_number_id && assets?.waba_id) { submitted = true; void complete(code, assets) } }
        const fail = (message: string) => { submitted = true; cleanup.current(); setBusy(false); setSession(null); setError(message) }
        const listener = (event: MessageEvent) => {
            if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return
            let data: any
            try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data } catch { return }
            if (data?.type !== 'WA_EMBEDDED_SIGNUP') return
            if (data.event === 'FINISH') { assets = data.data; finish() } else if (data.event === 'CANCEL' || data.event === 'ERROR') fail('Meta signup did not complete. Prepare a new signup session and try again.')
        }
        window.addEventListener('message', listener)
        const timer = setTimeout(() => fail('Signup timed out. Prepare a new session and try again.'), 600000)
        cleanup.current = () => { clearTimeout(timer); window.removeEventListener('message', listener) }
        try {
            ;(window as any).FB.login((response: any) => {
                if (submitted) return
                if (!response?.authResponse?.code) { fail('Meta did not return an authorization code.'); return }
                code = response.authResponse.code; finish()
            }, { config_id: session.config_id, response_type: 'code', override_default_response_type: true, extras: { setup: {}, sessionInfoVersion: '2' } })
        } catch { fail('Meta signup could not open. Allow the signup popup and try again.') }
    }
    return <div className='mb-2'>
        <h4>Connect with Meta Embedded Signup</h4>
        {error && <Alert color='danger'>{error}</Alert>}{notice && <Alert color='success'>{notice}</Alert>}
        <Button disabled={busy} onClick={() => void prepare()}>Prepare signup</Button>
        {session && <Button className='ms-1' color='primary' disabled={busy} onClick={launch}>{session.simulated ? 'Simulate Embedded Signup' : 'Continue with Meta'}</Button>}
    </div>
}
