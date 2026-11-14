import httpConfig from '../http/httpConfig'

interface JwtPayload {
    sub?: string
    sid?: string
    exp?: number
    iat?: number
    [key: string]: any
}

let renewalPromise: Promise<string | null> | null = null
let heartbeatTimer: NodeJS.Timeout | null = null

export function getRawAccessToken(): string {
    let token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
    try {
        if (token.startsWith('"') || token.startsWith('{')) {
            const parsed = JSON.parse(token)
            token = typeof parsed === 'string' ? parsed : (parsed?.accessToken || parsed?.token || token)
        }
    } catch {
        // fallback to raw string
    }
    return token
}

export function parseJwtPayload(token: string): JwtPayload | null {
    if (!token || !token.includes('.')) return null
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch {
        return null
    }
}

export function getTokenRemainingLifetimeMs(): number {
    const token = getRawAccessToken()
    if (!token) return 0
    const payload = parseJwtPayload(token)
    if (!payload?.exp) return 0
    const expiresAtMs = payload.exp * 1000
    return Math.max(0, expiresAtMs - Date.now())
}

export async function renewTokenSilently(): Promise<string | null> {
    if (renewalPromise) return renewalPromise

    renewalPromise = (async () => {
        try {
            let refreshToken = localStorage.getItem('refresh_token') || ''
            if (refreshToken.startsWith('"')) {
                try {
                    refreshToken = JSON.parse(refreshToken)
                } catch {}
            }
            if (!refreshToken) return null

            const res = await fetch(`${httpConfig.baseUrl}auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            })

            if (!res.ok) return null
            const data = await res.json()
            const newAccess = data?.data?.access_token || data?.access_token
            const newRefresh = data?.data?.refresh_token || data?.refresh_token

            if (newAccess) {
                localStorage.setItem('access_token', JSON.stringify(newAccess))
                localStorage.setItem('accessToken', JSON.stringify(newAccess))
                if (newRefresh) {
                    localStorage.setItem('refresh_token', JSON.stringify(newRefresh))
                }
                window.dispatchEvent(new CustomEvent('auth:token_renewed', { detail: { token: newAccess } }))
                return newAccess
            }
            return null
        } catch {
            return null
        } finally {
            renewalPromise = null
        }
    })()

    return renewalPromise
}

export async function ensureFreshToken(minRemainingMs: number = 5 * 60 * 1000): Promise<string | null> {
    const remaining = getTokenRemainingLifetimeMs()
    if (remaining <= minRemainingMs) {
        return await renewTokenSilently()
    }
    return getRawAccessToken()
}

export function startSilentRenewalHeartbeat(): () => void {
    if (heartbeatTimer) clearInterval(heartbeatTimer)

    const checkAndRenew = async () => {
        const token = getRawAccessToken()
        if (!token) return

        const remainingMs = getTokenRemainingLifetimeMs()
        // If 5 minutes (300,000 ms) or less remain before JWT expiry, renew silently
        if (remainingMs > 0 && remainingMs <= 5 * 60 * 1000) {
            await renewTokenSilently()
        }
    }

    void checkAndRenew()
    heartbeatTimer = setInterval(() => {
        void checkAndRenew()
    }, 60 * 1000) // Heartbeat checks every 60 seconds

    return () => {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer)
            heartbeatTimer = null
        }
    }
}
