import httpConfig from '../utility/http/httpConfig'

export interface MetaOnboardingConfig {
    configured: boolean
    app_id: string | null
    config_id: string | null
    graph_version: string | null
    simulated: boolean
}

export interface MetaOnboardingSession {
    app_id: string
    config_id: string
    graph_version: string
    state: string
    simulated: boolean
    expires_in: number
    configured: boolean
}

export interface MetaWabaPhoneNumber {
    id: string
    display_phone_number: string
    verified_name?: string
    quality_rating?: string
    messaging_limit_tier?: string
    code_verification_status?: string
}

export interface MetaConnection {
    id: number
    tenant_id: number
    name: string
    display_phone_number?: string
    phone_number_id: string
    waba_id: string
    quality_rating?: string
    messaging_limit_tier?: string
    verified_name?: string
    code_verification_status?: string
    status: 'connected' | 'disconnected' | 'verified' | string
    simulated?: boolean
    subscribed?: boolean
    registered?: boolean
    last_sync_at?: string
    last_error?: string | null
    templates?: Array<Record<string, unknown>>
    created_at?: string
}

export type WhatsAppConnection = MetaConnection

export interface SaveMetaConfigPayload {
    app_id: string
    config_id: string
    graph_version?: string
    app_secret: string
}

export interface CreateConnectionPayload {
    name: string
    waba_id: string
    phone_number_id: string
    display_phone_number?: string
    access_token?: string
}

export interface CompleteOnboardingPayload {
    state: string
    code: string
    name: string
    waba_id: string
    phone_number_id: string
}

export interface BatchConnectPayload {
    waba_id: string
    access_token?: string
    numbers: Array<{
        phone_number_id: string
        name: string
    }>
}

export interface RequestCodePayload {
    code_method: 'SMS' | 'VOICE'
    language?: string
}

function getAuthToken(): string {
    let token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
    try {
        if (token.startsWith('"') || token.startsWith('{')) {
            const parsed = JSON.parse(token)
            token = typeof parsed === 'string' ? parsed : (parsed?.accessToken || parsed?.token || token)
        }
    } catch {
        // use raw token if json parse fails
    }
    return token
}

async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken()
    const url = `${httpConfig.baseUrl}${endpoint.replace(/^\/+/, '')}`

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {})
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        })

        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
            const errorMessage = json?.message || `Request failed with status ${response.status}`
            throw new Error(errorMessage)
        }

        return (json?.data !== undefined ? json.data : json) as T
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err
        }
        throw new Error('An unexpected network error occurred.')
    }
}

export const whatsappService = {
    async getOnboardingConfig(): Promise<MetaOnboardingConfig> {
        return requestApi<MetaOnboardingConfig>('whatsapp/onboarding/config', {
            method: 'GET'
        })
    },

    async saveOnboardingConfig(payload: SaveMetaConfigPayload): Promise<{ success: boolean; configured: boolean }> {
        return requestApi<{ success: boolean; configured: boolean }>('whatsapp/onboarding/config', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async beginOnboarding(mode: 'live' | 'sandbox' = 'live'): Promise<MetaOnboardingSession> {
        return requestApi<MetaOnboardingSession>('whatsapp/onboarding/begin', {
            method: 'POST',
            body: JSON.stringify({ mode })
        })
    },

    async completeOnboarding(payload: CompleteOnboardingPayload): Promise<MetaConnection> {
        return requestApi<MetaConnection>('whatsapp/onboarding/complete', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async fetchWabaPhoneNumbers(wabaId: string, code?: string, accessToken?: string): Promise<{
        waba_id: string
        access_token: string
        numbers: MetaWabaPhoneNumber[]
    }> {
        return requestApi<{
            waba_id: string
            access_token: string
            numbers: MetaWabaPhoneNumber[]
        }>('whatsapp/onboarding/waba-numbers', {
            method: 'POST',
            body: JSON.stringify({ waba_id: wabaId, code, access_token: accessToken })
        })
    },

    async getConnections(): Promise<MetaConnection[]> {
        return requestApi<MetaConnection[]>('whatsapp/connections', {
            method: 'GET'
        })
    },

    async createConnection(payload: CreateConnectionPayload): Promise<MetaConnection> {
        return requestApi<MetaConnection>('whatsapp/connections', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async batchConnect(payload: BatchConnectPayload): Promise<{ connected: MetaConnection[]; count: number }> {
        return requestApi<{ connected: MetaConnection[]; count: number }>('whatsapp/connections/batch', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async connectionAction<T = unknown>(
        id: string | number,
        action: 'subscribe' | 'register' | 'sync' | 'disconnect' | 'request-code',
        body: Record<string, unknown> = {}
    ): Promise<T> {
        return requestApi<T>(`whatsapp/connections/${id}/${action}`, {
            method: 'POST',
            body: JSON.stringify(body)
        })
    },

    async requestCode(
        id: string | number,
        payload: RequestCodePayload
    ): Promise<{ success: boolean; method: string; simulated?: boolean }> {
        return requestApi<{ success: boolean; method: string; simulated?: boolean }>(
            `whatsapp/connections/${id}/request-code`,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        )
    },

    async deleteTemplate(connectionId: string | number, templateId: string, name: string): Promise<void> {
        await requestApi(`whatsapp/connections/${connectionId}/templates/delete`, {
            method: 'POST',
            body: JSON.stringify({ id: templateId, name })
        })
    }
}
